/* Copyright (c) 2026 Richard Rodger and other contributors, MIT License */

// The deterministic mode: instruction and cache-event counts from
// callgrind, recorded next to the wall-clock samples of the same run.
//
// Wall clock has a floor this harness cannot lower. A null change to the
// Rust engine (one function marked never-inline, displacing code and
// changing nothing) moved the suite by -2.49% to +2.92%, and reproduced
// the "palindrome regression" that four real changes had appeared to
// show. Interleaving two builds controls for drift over time, not for
// where the linker put the code. A change worth less than that band
// needs a count that does not depend on layout, and callgrind's
// instruction count is one: two runs of one binary here differed by
// 0.16% in Ir. Its cache counters are noisier (12% between the same two
// runs, on D1 read misses), so they are recorded as secondary evidence.
//
// The runner is not asked to count anything. It is run twice under
// valgrind in its `--deterministic` mode, once at the configured
// iteration count and once at zero, and the difference is what the
// parses cost. Reading the config, building the parser and generating
// the input are in both runs and cancel, so the per-parse figure carries
// no share of process startup and no symbol name the tool has to find.

import { execFile } from 'node:child_process'
import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'

import { assert, inputIdentity, repositoryRoot, round, writeJson } from './common.mjs'

const execute = promisify(execFile)

export const SCHEMA = 'https://tabnas.github.io/measure/schemas/deterministic-result.schema.json'
export const SCHEMA_VERSION = 1

// The tool's arguments are the harness's, the way the timing loop is:
// they are recorded in every result, and a change to them is a new
// measurement rather than a new reading of an old one.
export const CALLGRIND_ARGUMENTS = ['--tool=callgrind', '--cache-sim=yes', '--branch-sim=yes']

// The headline metrics, each a sum over the callgrind events that make
// it up. `Ir` is the one that clears the wall-clock floor; the rest are
// there so a change that trades instructions for misses is visible.
export const HEADLINE = {
  instructions: ['Ir'],
  d1ReadMisses: ['D1mr'],
  d1WriteMisses: ['D1mw'],
  llDataMisses: ['DLmr', 'DLmw'],
  branches: ['Bc', 'Bi'],
  mispredicts: ['Bcm', 'Bim'],
}

// Whether valgrind is on this host, without throwing: a host without it
// gets one sentence saying what to install, not a stack trace from
// `execFile`.
export async function valgrindVersion({ command = 'valgrind' } = {}) {
  try {
    const { stdout } = await execute(command, ['--version'], { encoding: 'utf8' })
    const version = stdout.trim()
    if (!/^valgrind-\d/.test(version)) {
      return { available: false, message: unavailable(`\`${command} --version\` printed "${version}"`) }
    }
    return { available: true, version }
  } catch (cause) {
    const reason = cause?.code === 'ENOENT' ? `no \`${command}\` on PATH` : cause.message
    return { available: false, message: unavailable(reason) }
  }
}

function unavailable(reason) {
  return [
    `Deterministic mode needs valgrind (${CALLGRIND_ARGUMENTS[0]}), and this host has none: ${reason}.`,
    'Install valgrind, or run without --deterministic.',
  ].join('\n')
}

// The header and the totals of a callgrind profile. The per-function
// body is left to `callgrind_annotate`; what the harness records is the
// event vector the process cost in total.
//
// A profile carries the totals twice: `summary:` near the top, written
// when the dump starts, and `totals:` at the end. They can differ by a
// few instructions (the dump itself runs in between), and `totals:` is
// the one callgrind_annotate reports, so it is the one read here. It is
// also the last line the tool writes, so a profile without it was cut
// off, and is refused rather than read from its summary.
export function parseCallgrind(text) {
  const lines = text.split('\n')
  const field = (name) => {
    const line = lines.find((candidate) => candidate.startsWith(`${name}:`))
    return line === undefined ? undefined : line.slice(name.length + 1).trim()
  }
  const events = field('events')?.split(/\s+/)
  assert(events !== undefined && events.length > 0, 'callgrind profile has no events: line')
  const totalsLine = field('totals')
  assert(totalsLine !== undefined, 'callgrind profile has no totals: line; the dump did not finish')
  const values = totalsLine.split(/\s+/).map(Number)
  assert(
    values.length === events.length && values.every((value) => Number.isInteger(value) && value >= 0),
    `callgrind totals line does not match its events line: ${totalsLine}`,
  )
  const totals = Object.fromEntries(events.map((event, index) => [event, values[index]]))
  const caches = lines
    .filter((line) => /^desc: (I1|D1|LL) cache:/.test(line))
    .map((line) => line.slice('desc: '.length))
  return { command: field('cmd'), events, totals, caches }
}

// The cost of the parses alone, per parse.
export function perParse(measured, baseline, iterations) {
  assert(iterations > 0, 'per-parse figures need at least one iteration')
  const result = {}
  for (const [metric, events] of Object.entries(HEADLINE)) {
    let total = 0
    for (const event of events) {
      assert(
        Number.isInteger(measured[event]) && Number.isInteger(baseline[event]),
        `callgrind did not record ${event}; the profile was taken without ${CALLGRIND_ARGUMENTS.join(' ')}`,
      )
      total += measured[event] - baseline[event]
    }
    result[metric] = round(total / iterations, 1)
  }
  return result
}

// A recorded run must not carry the working directory or the home
// directory it was made in. Callgrind writes both into `cmd:`, `ob=` and
// `fl=` lines, so they are replaced before the profile is stored.
export function redactPaths(text, { repository = repositoryRoot, home = homedir() } = {}) {
  let redacted = text
  if (repository) redacted = redacted.replaceAll(repository, '<repository>')
  if (home && home !== '/') redacted = redacted.replaceAll(home, '<home>')
  return redacted
}

export function parseCase(reference) {
  const [benchmarkId, caseId, ...rest] = reference.split('/')
  assert(
    benchmarkId && caseId && rest.length === 0,
    `deterministic case ${reference} is not <benchmark>/<case>`,
  )
  return { benchmarkId, caseId }
}

// The ports the deterministic section covers: those the config gives a
// `deterministic` entry. TypeScript has none, and the reason is not an
// omission: V8 compiles at run time, so an instruction count of it
// counts the compiler as much as the parser. Go's entry carries
// GOMAXPROCS=1, without which valgrind cannot follow the scheduler, and
// GOGC=off, without which the count is not deterministic either: three
// runs of the same twenty parses with the collector on cost 56.5M,
// 58.3M and 72.1M instructions, because the runtime paces collection
// on wall-clock terms that valgrind stretches fifty-fold; two with it
// off cost 49.24M and 49.32M. So the Go figure is the mutator alone,
// and the collector's cost stays where the wall clock already has it.
export function deterministicPorts(config) {
  return config.ports.filter((port) => port.deterministic !== undefined)
}

export function profilePath(portId, benchmarkId, caseId, kind) {
  const suffix = kind === 'measured' ? '' : `-${kind}`
  return join('raw', 'deterministic', portId, `${benchmarkId}-${caseId}${suffix}.out`)
}

// Runs the deterministic section of a run and writes
// `raw/deterministic/<port>.json` for every port that takes part, with
// the callgrind profiles next to it.
export async function recordDeterministic({
  config,
  manifests,
  runDirectory,
  definitionsDirectory,
  run,
  valgrind,
  log = (line) => process.stdout.write(line),
}) {
  const section = config.deterministic
  assert(section !== undefined, 'measure.config.json has no deterministic section')
  for (const port of deterministicPorts(config)) {
    const portDirectory = join(runDirectory, 'raw', 'deterministic', port.id)
    await mkdir(portDirectory, { recursive: true })
    const cases = []
    for (const reference of section.cases) {
      const { benchmarkId, caseId } = parseCase(reference)
      const manifest = manifests.find((candidate) => candidate.id === benchmarkId)
      assert(manifest !== undefined, `deterministic case ${reference} names an unknown benchmark`)
      const performanceCase = manifest.performanceCases.find((candidate) => candidate.id === caseId)
      assert(performanceCase !== undefined, `deterministic case ${reference} names an unknown case`)
      log(`Counting ${port.label} ${reference} under callgrind (${section.iterations} parses)…\n`)
      const measured = await countOnce({
        port,
        reference,
        iterations: section.iterations,
        kind: 'measured',
        runDirectory,
        definitionsDirectory,
      })
      const baseline = await countOnce({
        port,
        reference,
        iterations: 0,
        kind: 'baseline',
        runDirectory,
        definitionsDirectory,
      })
      assert(
        measured.result.input.sha256 === baseline.result.input.sha256,
        `${port.id} ${reference}: the two callgrind runs parsed different inputs`,
      )
      assert(
        JSON.stringify(measured.profile.events) === JSON.stringify(baseline.profile.events),
        `${port.id} ${reference}: the two callgrind runs recorded different events`,
      )
      cases.push({
        benchmarkId,
        caseId,
        input: measured.result.input,
        checksum: measured.result.checksum,
        events: measured.profile.events,
        caches: measured.profile.caches,
        measured: {
          iterations: section.iterations,
          totals: measured.profile.totals,
          profile: measured.path,
        },
        baseline: {
          iterations: 0,
          totals: baseline.profile.totals,
          profile: baseline.path,
        },
      })
    }
    await writeJson(join(runDirectory, 'raw', 'deterministic', `${port.id}.json`), {
      $schema: SCHEMA,
      schemaVersion: SCHEMA_VERSION,
      run,
      port: { id: port.id },
      tool: { name: 'valgrind', version: valgrind.version, arguments: [...CALLGRIND_ARGUMENTS] },
      runner: {
        command: port.command,
        arguments: [...port.arguments],
        environment: { ...(port.deterministic.environment ?? {}) },
      },
      iterations: section.iterations,
      cases,
    })
  }
}

async function countOnce({ port, reference, iterations, kind, runDirectory, definitionsDirectory }) {
  const { benchmarkId, caseId } = parseCase(reference)
  const path = profilePath(port.id, benchmarkId, caseId, kind)
  const absolute = join(runDirectory, path)
  const runnerArguments = [
    ...port.arguments,
    `--config=${join(definitionsDirectory, 'measure.config.json')}`,
    `--benchmarks=${join(definitionsDirectory, 'benchmarks')}`,
    `--deterministic=${reference}`,
    `--iterations=${iterations}`,
  ]
  let stdout
  let stderr
  try {
    ;({ stdout, stderr } = await execute(
      'valgrind',
      ['-q', ...CALLGRIND_ARGUMENTS, `--callgrind-out-file=${absolute}`, port.command, ...runnerArguments],
      {
        cwd: repositoryRoot,
        encoding: 'utf8',
        maxBuffer: 16 * 1024 * 1024,
        env: { ...process.env, ...(port.deterministic.environment ?? {}) },
      },
    ))
  } catch (cause) {
    throw new Error(
      `${port.id} ${reference} failed under callgrind (${iterations} parses): ${cause.stderr?.trim() || cause.message}`,
    )
  }
  // Valgrind's own notes (which cache it simulated, and at what geometry)
  // are in the profile's `desc:` lines; the runner's diagnostics are not.
  const diagnostics = stderr
    .split('\n')
    .filter((line) => line.length > 0 && !/^--\d+-- /.test(line))
    .join('\n')
  if (diagnostics) process.stderr.write(`${diagnostics}\n`)

  let result
  try {
    result = JSON.parse(stdout)
  } catch (cause) {
    throw new Error(`${port.id} ${reference} emitted invalid JSON under callgrind: ${cause.message}`)
  }
  assert(
    result.benchmarkId === benchmarkId && result.caseId === caseId && result.iterations === iterations,
    `${port.id} reported a different case or count than it was asked for (${reference}, ${iterations})`,
  )
  const text = redactPaths(await readFile(absolute, 'utf8'))
  await writeFile(absolute, text)
  return { path, result, profile: parseCallgrind(text) }
}

// The deterministic half of a run, read back for aggregation: the raw
// documents, checked against the config, the manifests and the input
// snapshots the run carries. Returns `undefined` for a run that has no
// deterministic section, which is every run recorded before the mode
// existed and every run made without `--deterministic`.
export async function readDeterministic({ runDirectory, config, manifests, canonicalRun, validate }) {
  const directory = join(runDirectory, 'raw', 'deterministic')
  if (!(await exists(directory))) return undefined
  const section = config.deterministic
  assert(section !== undefined, `${directory} exists but the run's config has no deterministic section`)
  const ports = deterministicPorts(config)
  assert(ports.length > 0, `${directory} exists but no configured port takes part`)

  const raws = []
  for (const port of ports) {
    const path = join(directory, `${port.id}.json`)
    assert(await exists(path), `missing deterministic result for configured port ${port.id}`)
    const raw = JSON.parse(await readFile(path, 'utf8'))
    await validate('deterministic-result.schema.json', raw, `deterministic result ${port.id}.json`)
    assert(raw.port.id === port.id, `${path} reports port ${raw.port.id}`)
    assert(
      JSON.stringify(raw.run) === JSON.stringify(canonicalRun),
      `deterministic run metadata differs for port ${port.id}`,
    )
    assert(raw.iterations === section.iterations, `${port.id} counted a different number of parses than configured`)
    assert(
      JSON.stringify(raw.cases.map((item) => `${item.benchmarkId}/${item.caseId}`)) ===
        JSON.stringify(section.cases),
      `${port.id} counted a different case set than configured`,
    )
    assert(raw.runner.command === port.command, `${port.id} was counted through a different command`)
    assert(
      JSON.stringify(raw.runner.environment) === JSON.stringify(port.deterministic.environment ?? {}),
      `${port.id} was counted under a different environment than configured`,
    )
    for (const item of raw.cases) {
      const source = await readFile(
        join(runDirectory, 'definitions', 'inputs', item.benchmarkId, `${item.caseId}.txt`),
        'utf8',
      )
      assert(
        JSON.stringify(item.input) === JSON.stringify(inputIdentity(source)),
        `${port.id} counted a different input for ${item.benchmarkId}/${item.caseId}`,
      )
      assert(item.measured.iterations === section.iterations, `${port.id} measured the wrong count`)
      assert(item.baseline.iterations === 0, `${port.id} baseline is not a zero-parse run`)
      for (const kind of ['measured', 'baseline']) {
        assert(
          item[kind].profile === profilePath(port.id, item.benchmarkId, item.caseId, kind),
          `${port.id} ${item.benchmarkId}/${item.caseId} names an unexpected ${kind} profile`,
        )
        assert(
          await exists(join(runDirectory, item[kind].profile)),
          `${port.id} ${item.benchmarkId}/${item.caseId} ${kind} profile is missing from the run`,
        )
        assert(
          JSON.stringify(Object.keys(item[kind].totals)) === JSON.stringify(item.events),
          `${port.id} ${item.benchmarkId}/${item.caseId} ${kind} totals do not match its events`,
        )
      }
    }
    raws.push({ port, raw })
  }

  const rows = []
  for (const reference of section.cases) {
    const { benchmarkId, caseId } = parseCase(reference)
    const manifest = manifests.find((candidate) => candidate.id === benchmarkId)
    assert(manifest !== undefined, `deterministic case ${reference} names an unknown benchmark`)
    const performanceCase = manifest.performanceCases.find((candidate) => candidate.id === caseId)
    assert(performanceCase !== undefined, `deterministic case ${reference} names an unknown case`)
    const portRows = {}
    for (const { port, raw } of raws) {
      const item = raw.cases.find(
        (candidate) => candidate.benchmarkId === benchmarkId && candidate.caseId === caseId,
      )
      portRows[port.id] = {
        perParse: perParse(item.measured.totals, item.baseline.totals, section.iterations),
        measured: item.measured.totals,
        baseline: item.baseline.totals,
        checksum: item.checksum,
        profile: item.measured.profile,
        baselineProfile: item.baseline.profile,
      }
    }
    const fewest = Math.min(...Object.values(portRows).map((summary) => summary.perParse.instructions))
    const relativeInstructions = Object.fromEntries(
      Object.entries(portRows).map(([portId, summary]) => [
        portId,
        round(summary.perParse.instructions / fewest, 3),
      ]),
    )
    rows.push({
      benchmarkId,
      caseId,
      description: performanceCase.description,
      input: raws[0].raw.cases.find(
        (candidate) => candidate.benchmarkId === benchmarkId && candidate.caseId === caseId,
      ).input,
      ports: portRows,
      relativeInstructions,
    })
  }

  return {
    tool: raws[0].raw.tool,
    iterations: section.iterations,
    caches: raws[0].raw.cases[0].caches,
    ports: Object.fromEntries(
      raws.map(({ port, raw }) => [port.id, { label: port.label, environment: raw.runner.environment }]),
    ),
    rows,
  }
}

async function exists(path) {
  try {
    await access(path)
    return true
  } catch (cause) {
    if (cause?.code === 'ENOENT') return false
    throw cause
  }
}
