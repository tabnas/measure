import { execFile } from 'node:child_process'
import { access, cp, mkdir, rename, rm, writeFile } from 'node:fs/promises'
import { hostname } from 'node:os'
import { join, relative, resolve } from 'node:path'
import { promisify } from 'node:util'

import { aggregateRun } from './aggregate.mjs'
import { rebuildCatalog } from './lib/catalog.mjs'
import {
  generateInput,
  loadConfig,
  loadManifests,
  repositoryRoot,
  validateSchema,
  writeJson,
} from './lib/common.mjs'
import { buildSite } from './build-site.mjs'

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
  const host = resolveHostIdentity()

  await runVisible('npm', ['run', 'build'])

  const commit = (await git(['rev-parse', 'HEAD'])).trim()
  const status = await git(['status', '--porcelain'])
  const dirty = status.length > 0
  if (options.record && dirty) {
    throw new Error('Historical measurements require a clean working tree; commit the harness first')
  }

  const generatedAt = new Date().toISOString()
  const runID = makeRunID(generatedAt, host.id, config.suiteVersion, commit)
  process.stdout.write(`Measurement host: ${host.label} [${host.id}]\n`)
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
      `--host-id=${host.id}`,
      `--host-label=${host.label}`,
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

  await aggregateRun(runDirectory)
  if (options.record) {
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

function makeRunID(generatedAt, hostID, suiteVersion, commit) {
  const timestamp = generatedAt.replaceAll(/[-:.]/g, '').replace('000Z', 'Z')
  const hostSegment = hostID
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-|-$/g, '')
    .slice(0, 32) || 'host'
  return `${timestamp}-${hostSegment}-suite-${suiteVersion}-${commit.slice(0, 8)}`
}

function resolveHostIdentity() {
  const observedHostname = hostname()
  const hostID = process.env.TABNAS_MEASURE_HOST_ID?.trim() || observedHostname
  const hostLabel = process.env.TABNAS_MEASURE_HOST_LABEL?.trim() || hostID
  if (!/^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$/.test(hostID)) {
    throw new Error(
      'TABNAS_MEASURE_HOST_ID must be 1–64 characters using letters, numbers, dot, underscore, colon, or hyphen',
    )
  }
  if (hostLabel.length > 100 || /[\u0000-\u001f\u007f]/.test(hostLabel)) {
    throw new Error('TABNAS_MEASURE_HOST_LABEL must be 1–100 printable characters')
  }
  return { id: hostID, label: hostLabel }
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
  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index]
    if (argument === '--record') {
      record = true
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
  return { profile, output, record }
}

main().catch((cause) => {
  process.stderr.write(`${cause instanceof Error ? cause.stack : String(cause)}\n`)
  process.exitCode = 1
})
