/* Copyright (c) 2026 Richard Rodger and other contributors, MIT License */

// The deterministic mode: instruction and cache-event counts from
// callgrind, recorded next to the wall-clock samples of the same run.
//
// Wall clock has a floor this harness cannot lower. A null change to the
// Rust engine (one function marked never-inline, displacing code and
// changing nothing) moves the suite by a few percent from one build to
// the next, and reproduced a "regression" that four real changes had
// appeared to show. Interleaving two builds controls for drift over
// time, not for where the linker put the code. A change worth less than
// that band needs a count that does not depend on layout, and
// callgrind's instruction count is one; its cache counters move with
// where the allocator put memory, so they are recorded as secondary
// evidence. The band, the repeatability figures and what each was
// measured on are in docs/methodology.md under "Deterministic metrics",
// in the note that says which of them this repository can reproduce.
//
// The runner is not asked to count anything. It is run twice under
// valgrind in its `--deterministic` mode, once at the configured
// iteration count and once at zero, and the difference over the count
// is what one parse costs. Both runs read the config, build the parser,
// generate the input and take one parse before the counted loop, so all
// of that cancels. The parse before the loop is there because an engine
// can leave work until it is first asked to parse: the Rust engine at
// the pinned revision builds its parser on the first call, some 84k
// instructions on top of a 7.8M-instruction parse when it was measured
// (the methodology note has the figures and the command), and a
// baseline without a parse would leave that in the measured run at one
// part in N. So the per-parse figure is a steady-state parse: no share
// of process startup, no first-use work, and no symbol name the tool
// has to find.
//
// What the runner reports is checked rather than trusted. It prints the
// checksum of the parse before the loop and the checksum of the loop,
// and the loop's has to be the count times the first, modulo the
// runners' shared modulus. It prints the runtime settings it read back
// (Go's GOMAXPROCS and GOGC), and they have to be the ones the config
// asked for. And the ports counted in one run have to report the same
// input and the same checksums, since they parse the same input the
// same number of times. The read-back the aggregator uses repeats every
// one of those checks on the recorded documents, and adds one the
// recorder does not need: the totals a document records are read back
// out of the profile it names, so a figure in the JSON is held to the
// evidence on disk rather than taken from the document, and each
// profile's own `cmd:` and `creator:` lines are held to the runner
// command, the run's snapshot, the case, the count and the tool the
// document records.
//
// The counted process is given an environment the harness builds, not
// the recording shell's. The Go runtime paces its collector on
// GOMEMLIMIT as well as GOGC and reads GODEBUG; the Rust port's
// allocator reads MIMALLOC_* when it starts; the loader honours
// LD_PRELOAD; valgrind reads VALGRIND_OPTS. A runner can read back GOGC
// and GOMAXPROCS, and cannot read back the rest, so the only way to
// record what the process ran under is to decide it: the allowlist in
// `INHERITED_ENVIRONMENT`, the port's configured settings, and nothing
// else. What was given is recorded beside what the runtime reported.
//
// The Go port is counted with its collector off (see
// `deterministicPorts`), and that shapes its cache columns as well as
// its instruction column: a heap that is never recycled is written into
// fresh lines on every parse, so its write misses run to memory where
// the Rust port's are served from the last-level cache. Those columns
// are a cost of the setting, and `docs/methodology.md` says so where
// the figures are read.

import { execFile } from 'node:child_process'
import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'

import {
  assert,
  inputIdentity,
  recordingDirectory,
  repositoryRoot,
  round,
  sameJson,
  writeJson,
} from './common.mjs'

const execute = promisify(execFile)

export const SCHEMA = 'https://tabnas.github.io/measure/schemas/deterministic-result.schema.json'
export const SCHEMA_VERSION = 1

// The tool's arguments are the harness's, the way the timing loop is:
// they are recorded in every result, and a change to them is a new
// measurement rather than a new reading of an old one.
export const CALLGRIND_ARGUMENTS = ['--tool=callgrind', '--cache-sim=yes', '--branch-sim=yes']

// The host variables the counted process is given, by name. Everything
// else in the recording shell is withheld, because the runtimes and the
// tool take settings from the environment that change the count and
// that no runner can read back: an operator's GOMEMLIMIT keeps the Go
// collector running under a document that says GOGC=off, MIMALLOC_*
// changes what the Rust port's allocator does per parse, LD_PRELOAD and
// VALGRIND_OPTS change the process and the tool. PATH is what the tool
// finds its own pieces with and TMPDIR is where it keeps its scratch
// files; the runners need neither.
export const INHERITED_ENVIRONMENT = ['PATH', 'TMPDIR']

// The environment one counted process runs under, and the record of it:
// the allowlisted host variables that were set, by name, and the port's
// configured settings, by value. The settings win where the two name
// the same variable.
export function processEnvironment(port, host = process.env) {
  const environment = {}
  const inherited = []
  for (const name of INHERITED_ENVIRONMENT) {
    if (host[name] === undefined) continue
    environment[name] = host[name]
    inherited.push(name)
  }
  const settings = { ...(port.deterministic?.environment ?? {}) }
  return { environment: { ...environment, ...settings }, given: { inherited, settings } }
}

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
// gets two lines, one saying what is missing and one saying what to do,
// not a stack trace from `execFile`. The command it answers for is the
// one the counts are then taken through.
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
  return { creator: field('creator'), command: field('cmd'), events, totals, caches }
}

// What a profile says it is a profile of, held to what was counted.
// Callgrind writes the command it ran on the `cmd:` line and its own
// version on the `creator:` line, so a profile copied in from another
// case, another count, another run or another tool does not pass as
// this one's, however faithfully its totals were copied along with it.
// The command is the runner's, then the config and the benchmarks of
// one snapshot, then the case and the count. The snapshot is the one
// the document records the process being given (`runner.snapshot`),
// and a run being recorded is assembled in a directory named by the
// run, so the profile of a process that read another run's snapshot
// carries that run's name and is refused here, whichever engine pin
// that run's runner was built at.
export function checkProfileProvenance({ label, profile, tool, runner, reference, iterations }) {
  const creator = `callgrind-${tool.version.replace(/^valgrind-/, '')}`
  assert(
    profile.creator === creator,
    `${label}: the profile was written by ${profile.creator ?? 'a tool it does not name'} where the run was counted by ${tool.version}`,
  )
  const words = profile.command?.split(' ') ?? []
  const head = [runner.command, ...runner.arguments]
  assert(
    sameJson(words.slice(0, head.length), head),
    `${label}: the profile is of \`${profile.command}\`, not of the runner command recorded`,
  )
  const [configArgument, benchmarksArgument, ...rest] = words.slice(head.length)
  assert(
    sameJson(rest, [`--deterministic=${reference}`, `--iterations=${iterations}`]),
    `${label}: the profile is of \`${profile.command}\`, not of ${reference} at ${iterations} parses`,
  )
  assert(
    configArgument === `--config=${runner.snapshot}/measure.config.json` &&
      benchmarksArgument === `--benchmarks=${runner.snapshot}/benchmarks`,
    `${label}: the profile is of \`${profile.command}\`, which does not read this run's snapshot at ${runner.snapshot}`,
  )
}

// The snapshot a counted process is given, as the document records it
// and as callgrind writes it into the profile after redaction: the
// run's definitions directory, under the repository. The definitions
// are written into the run directory, which the harness keeps under
// the repository, so a path that does not redact to `<repository>/…`
// is not one this harness made.
export function snapshotPath(definitionsDirectory) {
  const snapshot = redactPaths(definitionsDirectory)
  assert(
    snapshot.startsWith('<repository>/'),
    `the definitions snapshot at ${definitionsDirectory} is outside the repository`,
  )
  return snapshot
}

// Where a run's snapshot can be, read back: for a run assembled for
// recording, its recording directory, which it left when it was renamed
// into results/; for an ephemeral run, or one still being assembled,
// the directory being read. Both name the run and nothing else.
export function snapshotPaths(runDirectory, runId) {
  return [
    ...new Set([
      redactPaths(join(recordingDirectory(runId), 'definitions')),
      redactPaths(join(runDirectory, 'definitions')),
    ]),
  ]
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
// GOGC=off, without which the count is not deterministic either: with
// the collector on, the count carries the collector's work as well as
// the parser's, and the runtime paces that work on wall-clock terms
// that valgrind stretches fifty-fold, so three counts of the same
// twenty parses differ by a fifth of a percent where two with the
// collector off differ by a few hundred instructions in fifty million.
// The figures are not repeated here: they were measured once, and the
// methodology note ("Measured once, outside the harness") carries them
// with the command that repeats them, so this comment cannot drift
// from the note the way a second copy of the numbers did. So the Go
// figure is the mutator alone, and the collector's cost stays where
// the wall clock already has it.
//
// The setting reaches the cache counters as well, in the other
// direction. With the collector off nothing is freed, so every parse
// allocates into memory the process has never touched, and the first
// write to each of those lines misses every level of the simulated
// cache: on `adder/terms-512` nearly every one of the Go port's
// first-level write misses goes on to miss the last level, where the
// Rust port, recycling through its allocator, has almost none reach
// it. Go's D1 write-miss and LL data-miss columns measure the setting
// more than the port, and the report's reader is told so in the
// methodology, whose note carries the figures and the command that
// repeats them.
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
  const snapshot = snapshotPath(definitionsDirectory)
  const documents = []
  for (const port of ports) {
    await mkdir(join(runDirectory, 'raw', 'deterministic', port.id), { recursive: true })
    const cases = []
    const handed = processEnvironment(port)
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
        countOnce({
          port,
          reference,
          iterations,
          kind,
          input,
          runDirectory,
          definitionsDirectory,
          snapshot,
          valgrind,
          environment: handed.environment,
        })
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
      assert(
        sameJson(measured.profile.caches, baseline.profile.caches),
        `${port.id} ${reference}: the two callgrind runs simulated different caches`,
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
      // `given` is what the process was handed: the host variables by
      // name and the settings by value. `environment` is what the runner
      // read back from its runtime and reported, checked against the
      // config in `countOnce`. The document carries both, so it says what
      // the process ran under as well as what it was told. `snapshot` is
      // the definitions directory every counted process read, which the
      // read-back holds to this run and every profile's `cmd:` line to.
      runner: {
        command: port.command,
        arguments: [...port.arguments],
        snapshot,
        given: handed.given,
        environment: { ...environment },
      },
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
  snapshot,
  valgrind,
  environment,
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
        // The environment is the one `processEnvironment` built and the
        // document records, never the recording shell's. The port's
        // settings come back in its document as what the runtime saw,
        // which is what `checkRunnerDocument` holds against the config.
        env: environment,
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
  const profile = parseCallgrind(text)
  checkProfileProvenance({
    label: `${port.id} ${reference} ${kind} profile`,
    profile,
    tool: { version: valgrind.version },
    runner: { command: port.command, arguments: port.arguments, snapshot },
    reference,
    iterations,
  })
  return { path, result, profile }
}

// The deterministic half of a run, read back for aggregation: the raw
// documents, checked against the config, the manifests, the input
// snapshots the run carries, the profiles they name and each other.
// Every total a document records is re-read from its profile, the way
// the wall-clock aggregator holds `matrix.json` to its raw samples, so
// no per-parse figure rests on a number that is only in the JSON, and
// every profile is held to being a profile of the recorded command, the
// case, the count and the tool. The environment a port was given is
// held to the config and the allowlist. The tool and the simulated
// cache geometry are taken from the first document once every port and
// every case has been held to the same ones. Returns `undefined` for a
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
  let tool
  let caches
  for (const port of ports) {
    const path = join(directory, `${port.id}.json`)
    assert(await exists(path), `missing deterministic result for configured port ${port.id}`)
    const raw = JSON.parse(await readFile(path, 'utf8'))
    await validate('deterministic-result.schema.json', raw, `deterministic result ${port.id}.json`)
    assert(raw.port.id === port.id, `${path} reports port ${raw.port.id}`)
    assert(sameJson(raw.run, canonicalRun), `deterministic run metadata differs for port ${port.id}`)
    if (tool === undefined) tool = raw.tool
    assert(
      sameJson(raw.tool, tool),
      `${port.id} was counted by ${describeTool(raw.tool)} where ${raws[0]?.port.id} was counted by ${describeTool(tool)}`,
    )
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
    const snapshots = snapshotPaths(runDirectory, canonicalRun.id)
    assert(
      snapshots.includes(raw.runner.snapshot),
      `${port.id} was counted against the snapshot at ${raw.runner.snapshot}, which is not this run's (${snapshots.join(' or ')})`,
    )
    assert(
      sameJson(raw.runner.given.settings, port.deterministic.environment ?? {}),
      `${port.id} was given ${describeSettings(raw.runner.given.settings)} where the config sets ${describeSettings(port.deterministic.environment ?? {})}`,
    )
    const foreign = raw.runner.given.inherited.filter((name) => !INHERITED_ENVIRONMENT.includes(name))
    assert(
      foreign.length === 0,
      `${port.id} was counted with ${foreign.join(', ')} inherited from the host, which the harness does not pass`,
    )
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
      // The per-parse figure divides by the configured count and
      // subtracts a run of no parses, so each side is held to its
      // count here, before the loop checksums and the profiles are held
      // to whatever count the document names. A document that names 19
      // parses with a checksum and a profile to match passes every check
      // below and comes out 5% low per parse without these two.
      assert(
        item.measured.iterations === section.iterations,
        `${port.id} ${reference}: the measured run counted ${item.measured.iterations} parses where the run counts ${section.iterations}`,
      )
      assert(
        item.baseline.iterations === 0,
        `${port.id} ${reference}: the baseline counted ${item.baseline.iterations} parse${item.baseline.iterations === 1 ? '' : 's'}, and the per-parse figure subtracts a run of none`,
      )
      for (const kind of ['measured', 'baseline']) {
        checkLoop(`${port.id} ${reference}`, kind, item[kind].checksum, item.parseChecksum, item[kind].iterations)
        assert(
          item[kind].profile === profilePath(port.id, item.benchmarkId, item.caseId, kind),
          `${port.id} ${reference} names an unexpected ${kind} profile`,
        )
        const profileFile = join(runDirectory, item[kind].profile)
        assert(await exists(profileFile), `${port.id} ${reference} ${kind} profile is missing from the run`)
        assert(
          sameJson(Object.keys(item[kind].totals), item.events),
          `${port.id} ${reference} ${kind} totals do not match its events`,
        )
        const profile = await readProfile(profileFile, `${port.id} ${reference} ${kind} profile`)
        checkProfileProvenance({
          label: `${port.id} ${reference} ${kind} profile`,
          profile,
          tool,
          runner: raw.runner,
          reference,
          iterations: item[kind].iterations,
        })
        assert(
          sameJson(profile.totals, item[kind].totals),
          `${port.id} ${reference} ${kind} totals are not the totals line of ${item[kind].profile}`,
        )
        assert(
          sameJson(profile.caches, item.caches),
          `${port.id} ${reference} ${kind} profile simulated different caches from the ones recorded`,
        )
      }
      if (caches === undefined) caches = item.caches
      assert(
        sameJson(item.caches, caches),
        `${port.id} ${reference} was counted against different simulated caches from the first case counted`,
      )
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
    tool,
    iterations: section.iterations,
    caches,
    ports: Object.fromEntries(
      raws.map(({ port, raw }) => [
        port.id,
        { label: port.label, given: raw.runner.given, environment: raw.runner.environment },
      ]),
    ),
    rows,
  }
}

const describeTool = (tool) => `${tool.name} ${tool.version} (${tool.arguments.join(' ')})`

const describeSettings = (settings) =>
  Object.keys(settings).length === 0
    ? 'nothing'
    : Object.entries(settings)
        .map(([name, value]) => `${name}=${value}`)
        .join(', ')

// A recorded profile, parsed; a profile that cannot be parsed names the
// document that pointed at it rather than only the line it lacks.
async function readProfile(path, label) {
  try {
    return parseCallgrind(await readFile(path, 'utf8'))
  } catch (cause) {
    throw new Error(`${label}: ${cause.message}`)
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
