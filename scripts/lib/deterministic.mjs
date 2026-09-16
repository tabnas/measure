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
// iteration count and once at zero, and the difference over the count
// is what one parse costs. Both runs read the config, build the parser,
// generate the input and take one parse before the counted loop, so all
// of that cancels. The parse before the loop is there because an engine
// can leave work until it is first asked to parse: the Rust engine at
// the pinned revision builds its parser on the first call, roughly 100k
// instructions on top of a 7.8M-instruction parse, and a baseline
// without a parse would leave that in the measured run at one part in
// N. So the per-parse figure is a steady-state parse: no share of
// process startup, no first-use work, and no symbol name the tool has
// to find.
//
// What the runner reports is checked rather than trusted. It prints the
// checksum of the parse before the loop and the checksum of the loop,
// and the loop's has to be the count times the first, modulo the
// runners' shared modulus. It prints the runtime settings it read back
// (Go's GOMAXPROCS and GOGC), and they have to be the ones the config
// asked for. And the ports counted in one run have to report the same
// input and the same checksums, since they parse the same input the
// same number of times. The read-back the aggregator uses repeats every
// one of those checks on the recorded documents.

import { execFile } from 'node:child_process'
import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'

import { assert, inputIdentity, repositoryRoot, round, sameJson, writeJson } from './common.mjs'

const execute = promisify(execFile)

export const SCHEMA = 'https://tabnas.github.io/measure/schemas/deterministic-result.schema.json'
export const SCHEMA_VERSION = 1

// The tool's arguments are the harness's, the way the timing loop is:
// they are recorded in every result, and a change to them is a new
// measurement rather than a new reading of an old one.
export const CALLGRIND_ARGUMENTS = ['--tool=callgrind', '--cache-sim=yes', '--branch-sim=yes']

// The modulus every runner reduces its checksum by (`CHECKSUM_MODULUS`
// in each port). A loop of n parses of one input sums n copies of one
// parse's value, so its checksum is n times that value under the same
// modulus, and the harness can do that arithmetic itself.
export const CHECKSUM_MODULUS = 1_000_000_007n

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
// `execFile`. The command it answers for is the one the counts are then
// taken through.
export async function valgrindVersion({ command = 'valgrind' } = {}) {
  try {
    const { stdout } = await execute(command, ['--version'], { encoding: 'utf8' })
    const version = stdout.trim()
    if (!/^valgrind-\d/.test(version)) {
      return { available: false, message: unavailable(`\`${command} --version\` printed "${version}"`) }
    }
    return { available: true, version, command }
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

// What a loop of `iterations` parses checksums to, given what one parse
// checksums to: the runners add one value per parse and reduce by the
// modulus as they go.
export function loopChecksum(parseChecksum, iterations) {
  return Number((BigInt(parseChecksum) * BigInt(iterations)) % CHECKSUM_MODULUS)
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

const isCount = (value) => Number.isInteger(value) && value >= 0

const isSettings = (value) =>
  value !== null &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  Object.values(value).every((setting) => typeof setting === 'string')

// The document a runner prints in its `--deterministic` mode, held to
// what it was asked to do. The runner's word is taken for nothing that
// can be checked: the case and the count it names have to be the ones
// requested; the loop's checksum has to be the count times the checksum
// of the one parse taken before the loop, so a loop that ran nineteen
// times is refused; a parse that checksums to zero is refused because a
// loop of zeros proves nothing about how many times it ran; and every
// setting the config gives the port has to come back from the runner at
// that value, read from its runtime rather than from its environment,
// so a count taken with the collector on cannot be recorded under a
// config that says it was off.
export function checkRunnerDocument({ port, reference, iterations, result }) {
  const { benchmarkId, caseId } = parseCase(reference)
  const label = `${port.id} ${reference}`
  assert(result !== null && typeof result === 'object', `${label}: the runner printed no document`)
  assert(
    result.benchmarkId === benchmarkId && result.caseId === caseId,
    `${label}: the runner reported a different case (${result.benchmarkId}/${result.caseId})`,
  )
  assert(
    result.iterations === iterations,
    `${label}: the runner reported ${result.iterations} parses where ${iterations} were asked for`,
  )
  assert(isSettings(result.environment), `${label}: the runner did not report the settings it ran under`)
  checkSettings(port, result.environment, (name, actual, value) =>
    actual === undefined
      ? `${label}: the runner does not report ${name}, which the config sets to ${value}`
      : `${label}: the runner ran under ${name}=${actual} where the config says ${name}=${value}`,
  )
  assert(isCount(result.parseChecksum), `${label}: the runner reported no checksum for the parse before the loop`)
  assert(
    result.parseChecksum !== 0,
    `${label}: one parse checksums to zero, so the loop count cannot be checked; count a case whose value is not zero`,
  )
  assert(isCount(result.checksum), `${label}: the runner reported no checksum for the loop`)
  checkLoop(label, 'loop', result.checksum, result.parseChecksum, iterations)
  assert(
    result.input !== null &&
      typeof result.input === 'object' &&
      isCount(result.input.bytes) &&
      isCount(result.input.codeUnits) &&
      typeof result.input.sha256 === 'string',
    `${label}: the runner reported no input identity`,
  )
  return result
}

function checkSettings(port, reported, message) {
  for (const [name, value] of Object.entries(port.deterministic?.environment ?? {})) {
    assert(reported[name] === value, message(name, reported[name], value))
  }
}

function checkLoop(label, what, checksum, parseChecksum, iterations) {
  const expected = loopChecksum(parseChecksum, iterations)
  assert(
    checksum === expected,
    `${label}: the ${what} checksum is ${checksum}, and ${iterations} parses of a value checksumming to ${parseChecksum} give ${expected}`,
  )
}

// Every port counted in one run parses the same input the same number
// of times, so what the ports report about the parses has to agree:
// the input, the value one parse checksums to, and the loop's checksum.
// A port that parsed something else, or a different number of times, is
// refused rather than published as comparable, the way the wall-clock
// aggregator refuses a port whose input hash differs.
export function checkPortIdentity(documents) {
  const [first, ...rest] = documents
  for (const other of rest) {
    for (const item of first.cases) {
      const reference = `${item.benchmarkId}/${item.caseId}`
      const match = other.cases.find(
        (candidate) => candidate.benchmarkId === item.benchmarkId && candidate.caseId === item.caseId,
      )
      assert(match !== undefined, `${other.port.id} did not count ${reference}`)
      const pair = `${first.port.id} and ${other.port.id}`
      assert(sameJson(match.input, item.input), `${pair} counted different inputs for ${reference}`)
      assert(
        match.parseChecksum === item.parseChecksum,
        `${pair} parse ${reference} to different values (${item.parseChecksum} and ${match.parseChecksum})`,
      )
      assert(
        match.measured.checksum === item.measured.checksum,
        `${pair} report different loop checksums for ${reference} (${item.measured.checksum} and ${match.measured.checksum})`,
      )
    }
  }
}

// Runs the deterministic section of a run and writes
// `raw/deterministic/<port>.json` for every port that takes part, with
// the callgrind profiles next to it. Nothing is written until every
// port has been counted and the ports have been checked against each
// other, so a run directory never holds a counted section that the
// read-back would refuse.
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
  const ports = deterministicPorts(config)
  assert(ports.length > 0, 'measure.config.json gives no port a deterministic entry')
  const documents = []
  for (const port of ports) {
    await mkdir(join(runDirectory, 'raw', 'deterministic', port.id), { recursive: true })
    const cases = []
    let environment
    for (const reference of section.cases) {
      const { benchmarkId, caseId } = parseCase(reference)
      const manifest = manifests.find((candidate) => candidate.id === benchmarkId)
      assert(manifest !== undefined, `deterministic case ${reference} names an unknown benchmark`)
      const performanceCase = manifest.performanceCases.find((candidate) => candidate.id === caseId)
      assert(performanceCase !== undefined, `deterministic case ${reference} names an unknown case`)
      const input = inputIdentity(
        await readFile(join(definitionsDirectory, 'inputs', benchmarkId, `${caseId}.txt`), 'utf8'),
      )
      log(`Counting ${port.label} ${reference} under callgrind (${section.iterations} parses)…\n`)
      const count = (iterations, kind) =>
        countOnce({ port, reference, iterations, kind, input, runDirectory, definitionsDirectory, valgrind })
      const measured = await count(section.iterations, 'measured')
      const baseline = await count(0, 'baseline')
      assert(
        measured.result.parseChecksum === baseline.result.parseChecksum,
        `${port.id} ${reference}: the two callgrind runs parsed to different values`,
      )
      assert(
        sameJson(measured.result.environment, baseline.result.environment),
        `${port.id} ${reference}: the two callgrind runs ran under different settings`,
      )
      assert(
        sameJson(measured.profile.events, baseline.profile.events),
        `${port.id} ${reference}: the two callgrind runs recorded different events`,
      )
      if (environment === undefined) environment = measured.result.environment
      assert(
        sameJson(environment, measured.result.environment),
        `${port.id}: ${reference} ran under different settings from the case counted before it`,
      )
      cases.push({
        benchmarkId,
        caseId,
        input,
        parseChecksum: measured.result.parseChecksum,
        events: measured.profile.events,
        caches: measured.profile.caches,
        measured: {
          iterations: section.iterations,
          checksum: measured.result.checksum,
          totals: measured.profile.totals,
          profile: measured.path,
        },
        baseline: {
          iterations: 0,
          checksum: baseline.result.checksum,
          totals: baseline.profile.totals,
          profile: baseline.path,
        },
      })
    }
    documents.push({
      $schema: SCHEMA,
      schemaVersion: SCHEMA_VERSION,
      run,
      port: { id: port.id },
      tool: { name: 'valgrind', version: valgrind.version, arguments: [...CALLGRIND_ARGUMENTS] },
      // The settings are the ones the runner read back from its runtime
      // and reported, checked against the config in `countOnce`; the
      // config's own copy is not recorded, because the document should
      // say what the process ran under rather than what it was told.
      runner: { command: port.command, arguments: [...port.arguments], environment: { ...environment } },
      iterations: section.iterations,
      cases,
    })
  }
  checkPortIdentity(documents)
  for (const document of documents) {
    await writeJson(join(runDirectory, 'raw', 'deterministic', `${document.port.id}.json`), document)
  }
}

async function countOnce({
  port,
  reference,
  iterations,
  kind,
  input,
  runDirectory,
  definitionsDirectory,
  valgrind,
}) {
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
      valgrind.command,
      ['-q', ...CALLGRIND_ARGUMENTS, `--callgrind-out-file=${absolute}`, port.command, ...runnerArguments],
      {
        cwd: repositoryRoot,
        encoding: 'utf8',
        maxBuffer: 16 * 1024 * 1024,
        // The port's settings go to the process here, and come back in
        // its document as what the runtime saw, which is what
        // `checkRunnerDocument` holds against the config.
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
  checkRunnerDocument({ port, reference, iterations, result })
  assert(sameJson(result.input, input), `${port.id} ${reference}: the counted process parsed a different input from the snapshot`)
  const text = redactPaths(await readFile(absolute, 'utf8'))
  await writeFile(absolute, text)
  return { path, result, profile: parseCallgrind(text) }
}

// The deterministic half of a run, read back for aggregation: the raw
// documents, checked against the config, the manifests, the input
// snapshots the run carries and each other. Returns `undefined` for a
// run that has no deterministic section, which is every run recorded
// before the mode existed and every run made without `--deterministic`.
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
    assert(sameJson(raw.run, canonicalRun), `deterministic run metadata differs for port ${port.id}`)
    assert(raw.iterations === section.iterations, `${port.id} counted a different number of parses than configured`)
    assert(
      sameJson(
        raw.cases.map((item) => `${item.benchmarkId}/${item.caseId}`),
        section.cases,
      ),
      `${port.id} counted a different case set than configured`,
    )
    assert(raw.runner.command === port.command, `${port.id} was counted through a different command`)
    assert(sameJson(raw.runner.arguments, port.arguments), `${port.id} was counted with different arguments`)
    checkSettings(
      port,
      raw.runner.environment,
      (name, actual, value) =>
        `${port.id} was counted under ${name}=${actual ?? 'nothing'} where the config says ${name}=${value}`,
    )
    for (const item of raw.cases) {
      const reference = `${item.benchmarkId}/${item.caseId}`
      const source = await readFile(
        join(runDirectory, 'definitions', 'inputs', item.benchmarkId, `${item.caseId}.txt`),
        'utf8',
      )
      assert(
        sameJson(item.input, inputIdentity(source)),
        `${port.id} counted a different input for ${reference}`,
      )
      assert(
        item.parseChecksum !== 0,
        `${port.id} ${reference}: one parse checksums to zero, so the loop count cannot be checked`,
      )
      assert(item.measured.iterations === section.iterations, `${port.id} measured the wrong count`)
      assert(item.baseline.iterations === 0, `${port.id} baseline is not a zero-parse run`)
      for (const kind of ['measured', 'baseline']) {
        checkLoop(`${port.id} ${reference}`, kind, item[kind].checksum, item.parseChecksum, item[kind].iterations)
        assert(
          item[kind].profile === profilePath(port.id, item.benchmarkId, item.caseId, kind),
          `${port.id} ${reference} names an unexpected ${kind} profile`,
        )
        assert(
          await exists(join(runDirectory, item[kind].profile)),
          `${port.id} ${reference} ${kind} profile is missing from the run`,
        )
        assert(
          sameJson(Object.keys(item[kind].totals), item.events),
          `${port.id} ${reference} ${kind} totals do not match its events`,
        )
      }
    }
    raws.push({ port, raw })
  }
  checkPortIdentity(raws.map(({ raw }) => raw))

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
        parseChecksum: item.parseChecksum,
        checksum: item.measured.checksum,
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
