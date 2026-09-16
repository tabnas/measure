import { execFile } from 'node:child_process'
import { access, cp, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { promisify } from 'node:util'

import { aggregateRun } from './aggregate.mjs'
import { rebuildCatalog, scanRunMatrices } from './lib/catalog.mjs'
import { toolchainWarning } from './lib/toolchain.mjs'
import {
  generateInput,
  loadConfig,
  loadManifests,
  repositoryRoot,
  sha256,
  validateSchema,
  writeJson,
} from './lib/common.mjs'
import { buildSite } from './build-site.mjs'
import { parseCase, recordDeterministic, valgrindVersion } from './lib/deterministic.mjs'

const execute = promisify(execFile)

async function main() {
  const options = parseArguments(process.argv.slice(2))
  const config = await loadConfig()
  const manifests = await loadManifests()
  await validateSchema('config.schema.json', config, 'measure.config.json')
  for (const manifest of manifests) {
    await validateSchema('benchmark.schema.json', manifest, `benchmark ${manifest.id}`)
  }
  if (config.profiles[options.profile] === undefined) {
    throw new Error(`Unknown profile: ${options.profile}`)
  }
  if (options.record && options.profile !== 'full') {
    throw new Error('Only the full profile can be committed to historical results')
  }
  const hostFingerprint = await resolveHostFingerprint()

  // Checked before the build and the timed run, not after them: a host
  // without valgrind should learn so in the first second, in one sentence.
  let valgrind
  if (options.deterministic) {
    if (config.deterministic === undefined) {
      throw new Error('measure.config.json has no deterministic section')
    }
    for (const reference of config.deterministic.cases) {
      const { benchmarkId, caseId } = parseCase(reference)
      const manifest = manifests.find((candidate) => candidate.id === benchmarkId)
      if (manifest?.performanceCases.some((candidate) => candidate.id === caseId) !== true) {
        throw new Error(`deterministic case ${reference} is not a performance case of any benchmark`)
      }
    }
    valgrind = await valgrindVersion()
    if (!valgrind.available) {
      process.stderr.write(`${valgrind.message}\n`)
      process.exitCode = 1
      return
    }
    process.stdout.write(`Deterministic metrics: ${valgrind.version}\n`)
  }

  await runVisible('npm', ['run', 'build'])

  const commit = (await git(['rev-parse', 'HEAD'])).trim()
  const status = await git(['status', '--porcelain'])
  const dirty = status.length > 0
  if (options.record && dirty) {
    throw new Error('Historical measurements require a clean working tree; commit the harness first')
  }

  const generatedAt = new Date().toISOString()
  const runID = makeRunID(generatedAt, hostFingerprint, config.suiteVersion, commit)
  process.stdout.write(`Measurement host fingerprint: ${hostFingerprint}\n`)
  let runDirectory
  let finalDirectory
  if (options.record) {
    finalDirectory = join(repositoryRoot, 'results', 'runs', runID)
    runDirectory = join(repositoryRoot, '.build', `record-${runID}`)
    await mkdir(join(repositoryRoot, 'results', 'runs'), { recursive: true })
    await ensureAbsent(finalDirectory)
    await rm(runDirectory, { recursive: true, force: true })
  } else {
    if (options.output === undefined) throw new Error('--output is required unless --record is used')
    runDirectory = resolve(repositoryRoot, options.output)
    assertEphemeralOutput(runDirectory)
    await rm(runDirectory, { recursive: true, force: true })
  }
  await mkdir(join(runDirectory, 'raw'), { recursive: true })
  const definitionsDirectory = await snapshotDefinitions(runDirectory, config, manifests)

  for (const port of config.ports) {
    process.stdout.write(`Measuring ${port.label} (${options.profile})…\n`)
    const runnerArguments = [
      ...port.arguments,
      `--config=${join(definitionsDirectory, 'measure.config.json')}`,
      `--benchmarks=${join(definitionsDirectory, 'benchmarks')}`,
      `--profile=${options.profile}`,
      `--run-id=${runID}`,
      `--generated-at=${generatedAt}`,
      `--commit=${commit}`,
      `--dirty=${dirty}`,
      `--host-fingerprint=${hostFingerprint}`,
    ]
    const { stdout, stderr } = await execute(port.command, runnerArguments, {
      cwd: repositoryRoot,
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024,
    })
    if (stderr) process.stderr.write(stderr)
    let raw
    try {
      raw = JSON.parse(stdout)
    } catch (cause) {
      throw new Error(`${port.id} emitted invalid JSON: ${cause.message}`)
    }
    await validateSchema('port-result.schema.json', raw, `${port.id} raw result`)
    await writeJson(join(runDirectory, 'raw', `${port.id}.json`), raw)
  }

  if (options.deterministic) {
    await recordDeterministic({
      config,
      manifests,
      runDirectory,
      definitionsDirectory,
      run: {
        id: runID,
        generatedAt,
        profile: options.profile,
        suiteVersion: config.suiteVersion,
        repositoryCommit: commit,
        repositoryDirty: dirty,
      },
      valgrind,
    })
  }

  await aggregateRun(runDirectory)
  if (options.record) {
    process.stderr.write(
      toolchainWarning(
        JSON.parse(await readFile(join(runDirectory, 'matrix.json'), 'utf8')),
        await scanRunMatrices(),
      ),
    )
    await mkdir(join(repositoryRoot, 'results', 'runs'), { recursive: true })
    await rename(runDirectory, finalDirectory)
    await rebuildCatalog()
    await buildSite()
    process.stdout.write(`Recorded immutable run ${relative(repositoryRoot, finalDirectory)}\n`)
  } else {
    process.stdout.write(`Validated ephemeral run ${relative(repositoryRoot, runDirectory)}\n`)
  }
}

async function snapshotDefinitions(runDirectory, config, manifests) {
  const definitionsDirectory = join(runDirectory, 'definitions')
  await mkdir(join(definitionsDirectory, 'benchmarks'), { recursive: true })
  await mkdir(join(definitionsDirectory, 'inputs'), { recursive: true })
  await cp(join(repositoryRoot, 'schemas'), join(definitionsDirectory, 'schemas'), { recursive: true })
  await writeJson(join(definitionsDirectory, 'measure.config.json'), config)

  // Invariant 11 says a run carries the manifests used to produce it, and
  // these were the ones it did not. A run named its parsers only by the
  // version each port reports, and the Rust crate is unpublished, so every
  // revision on a branch reports the same in-tree version: twenty-three
  // pinned revisions all calling themselves 0.9.7. That left the measured
  // git revision recoverable only through the run's `repositoryCommit`,
  // and a branch that is rebased or squashed takes that commit with it.
  // Codex caught a run in this repository already naming an object no
  // longer in its own history.
  //
  // Copying each port's pinning manifests in makes the run answer the
  // question by itself. The list comes from the config rather than from
  // here, so a port added later cannot skip it unnoticed.
  for (const port of config.ports) {
    for (const pinned of port.manifests) {
      const destination = join(definitionsDirectory, 'manifests', port.id, pinned)
      await mkdir(dirname(destination), { recursive: true })
      await cp(join(repositoryRoot, pinned), destination)
    }
  }
  for (const manifest of manifests) {
    const benchmarkDirectory = join(definitionsDirectory, 'benchmarks', manifest.id)
    const inputsDirectory = join(definitionsDirectory, 'inputs', manifest.id)
    await mkdir(benchmarkDirectory, { recursive: true })
    await mkdir(inputsDirectory, { recursive: true })
    await writeJson(join(benchmarkDirectory, 'benchmark.json'), manifest)
    for (const performanceCase of manifest.performanceCases) {
      await writeFile(join(inputsDirectory, `${performanceCase.id}.txt`), generateInput(performanceCase))
    }
  }
  return definitionsDirectory
}

async function runVisible(command, arguments_) {
  await new Promise((resolvePromise, reject) => {
    const child = execFile(command, arguments_, { cwd: repositoryRoot }, (error) => {
      if (error) reject(error)
      else resolvePromise()
    })
    child.stdout?.pipe(process.stdout)
    child.stderr?.pipe(process.stderr)
  })
}

async function git(arguments_) {
  const { stdout } = await execute('git', arguments_, { cwd: repositoryRoot, encoding: 'utf8' })
  return stdout
}

function makeRunID(generatedAt, hostFingerprint, suiteVersion, commit) {
  const timestamp = generatedAt.replaceAll(/[-:.]/g, '').replace('000Z', 'Z')
  return `${timestamp}-${hostFingerprint}-suite-${suiteVersion}-${commit.slice(0, 8)}`
}

async function resolveHostFingerprint() {
  let hostKey = process.env.TABNAS_MEASURE_HOST_KEY?.trim()
  delete process.env.TABNAS_MEASURE_HOST_KEY
  if (!hostKey) {
    for (const path of ['/etc/machine-id', '/var/lib/dbus/machine-id']) {
      try {
        hostKey = (await readFile(path, 'utf8')).trim()
        if (hostKey) break
      } catch (cause) {
        if (cause?.code !== 'ENOENT') throw cause
      }
    }
  }
  // The two paths above are systemd/dbus files: linux only. macOS has
  // neither, so without this branch no Mac could derive a fingerprint at all
  // and every run there needed the key passed by hand — the exact chore the
  // automatic fingerprint exists to remove. IOPlatformUUID is the platform's
  // own stable hardware identifier and is the right analogue: constant across
  // reboots and reinstalls, distinct per machine.
  if (!hostKey && process.platform === 'darwin') {
    try {
      const { stdout } = await execute('ioreg', ['-rd1', '-c', 'IOPlatformExpertDevice'], {
        encoding: 'utf8',
      })
      hostKey = /"IOPlatformUUID"\s*=\s*"([^"]+)"/.exec(stdout)?.[1]?.trim()
    } catch {
      // Leave hostKey unset and fall through to the explicit-key error.
    }
  }
  if (!hostKey) {
    throw new Error(
      'Unable to derive a host fingerprint; set TABNAS_MEASURE_HOST_KEY to a stable per-host value',
    )
  }
  return sha256(`tabnas-measure-host-v1\0${hostKey}`).slice(0, 12)
}

async function ensureAbsent(path) {
  try {
    await access(path)
  } catch (cause) {
    if (cause?.code === 'ENOENT') return
    throw cause
  }
  throw new Error(`Immutable run already exists: ${path}`)
}

function assertEphemeralOutput(path) {
  const buildRoot = join(repositoryRoot, '.build')
  if (path !== buildRoot && !path.startsWith(`${buildRoot}/`)) {
    throw new Error('Ephemeral --output must be inside .build/')
  }
}

function parseArguments(arguments_) {
  let profile
  let output
  let record = false
  let deterministic = false
  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index]
    if (argument === '--record') {
      record = true
    } else if (argument === '--deterministic') {
      deterministic = true
    } else if (argument === '--profile') {
      profile = arguments_[++index]
    } else if (argument === '--output') {
      output = arguments_[++index]
    } else {
      throw new Error(`Unknown argument: ${argument}`)
    }
  }
  if (profile === undefined) throw new Error('--profile is required')
  if (record && output !== undefined) throw new Error('--record and --output are mutually exclusive')
  return { profile, output, record, deterministic }
}

main().catch((cause) => {
  process.stderr.write(`${cause instanceof Error ? cause.stack : String(cause)}\n`)
  process.exitCode = 1
})
