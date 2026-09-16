/* Copyright (c) 2026 Richard Rodger and other contributors, MIT License */

// The counted mode, without valgrind.
//
// A wall-clock difference of a few percent is inside what binary layout
// alone can do to this suite, so the harness can also count instructions
// under callgrind. That mode is optional and slow, and `npm test` must
// not need valgrind, so what is tested here is everything around the
// tool: the parser that reads its profile, the per-parse arithmetic, the
// schemas accepting a run with the section and every run without it, the
// recording path with a stand-in in valgrind's place and stand-ins for
// the runners behind it, the read-back the aggregator uses, and the path
// a host without valgrind takes. The runners' own `--deterministic` mode
// is covered by `go test` and `cargo test` in each port, and by
// scripts/runners.test.mjs against the built binaries. The fixture text
// is real: the header and totals of profiles the mode captured on this
// host, with the per-function body cut out because the parser never
// reads it.

import Assert from 'node:assert'
import { spawnSync } from 'node:child_process'
import Fs from 'node:fs'
import Os from 'node:os'
import Path from 'node:path'
import { after, describe, test } from 'node:test'
import { pathToFileURL } from 'node:url'

import { scanRunMatrices } from './lib/catalog.mjs'
import {
  generateInput,
  loadConfig,
  readJson,
  repositoryRoot,
  sha256 as digest,
  validateSchema,
} from './lib/common.mjs'
import {
  CALLGRIND_ARGUMENTS,
  CHECKSUM_MODULUS,
  HEADLINE,
  INHERITED_ENVIRONMENT,
  SCHEMA,
  SCHEMA_VERSION,
  checkPortIdentity,
  checkProfileProvenance,
  checkRunnerDocument,
  deterministicPorts,
  loopChecksum,
  parseCallgrind,
  parseCase,
  perParse,
  processEnvironment,
  profilePath,
  readDeterministic,
  recordDeterministic,
  redactPaths,
  valgrindVersion,
} from './lib/deterministic.mjs'
import { renderDeterministic } from './aggregate.mjs'

// `.build/measure-rust --deterministic=adder/terms-512 --iterations=20`
// under `valgrind --tool=callgrind --cache-sim=yes --branch-sim=yes`,
// after the harness replaced the repository path. `summary:` and
// `totals:` differ by two instructions, which is the dump itself.
const RUST_MEASURED = `# callgrind format
version: 1
creator: callgrind-3.22.0
pid: 27034
cmd:  .build/measure-rust --config=<repository>/.build/deterministic-run/definitions/measure.config.json --benchmarks=<repository>/.build/deterministic-run/definitions/benchmarks --deterministic=adder/terms-512 --iterations=20
part: 1


desc: I1 cache: 32768 B, 64 B, 8-way associative
desc: D1 cache: 32768 B, 64 B, 8-way associative
desc: LL cache: 35651584 B, 64 B, 17-way associative

desc: Timerange: Basic block 0 - 29473648
desc: Trigger: Program termination

positions: line
events: Ir Dr Dw I1mr D1mr D1mw ILmr DLmr DLmw Bc Bcm Bi Bim
summary: 157063017 45308011 35609235 5087268 565866 445192 5754 5032 15847 21359784 730465 1093944 154447


ob=(3) ???
fl=(153) ???
fn=(860) 0x00000000048a0410
0 6 3 0 1 1 0 1 0 0 0 0 3 1
cob=(2) /usr/lib/x86_64-linux-gnu/libc.so.6
cfi=(193) ./malloc/./malloc/malloc.c
cfn=(862) realloc
calls=3 3407
0 804 167 91 19 1 4 19 1 4 130 28 1

fn=(520) 0x000000000484e000
0 7 2 0 1 1 0 1 0 0 1 1

totals: 157063015 45308011 35609235 5087268 565866 445192 5754 5032 15847 21359784 730465 1093944 154447
`

// The same binary at `--iterations=0`: the config read, the parser
// construction and the input generation, and no parse.
const RUST_BASELINE_TOTALS =
  'totals: 1512100 325516 174636 5490 7011 5607 4426 4976 5147 250507 12951 4965 814'

// `GOMAXPROCS=1 .build/measure-go` at twenty parses of the same case,
// captured before the config switched the collector off. A recorded run
// therefore counts fewer Go instructions than this fixture does, and a
// Rust-to-Go ratio taken from it (2.79x) is arithmetic on the fixture,
// not the ratio the mode records (3.3x on this case with the collector
// off). Both captures predate the parse the runners now take before the
// loop, which moves a baseline by one parse and a per-parse figure by
// what the engine's first parse does over its second.
const GO_MEASURED = `# callgrind format
version: 1
creator: callgrind-3.22.0
pid: 27022
cmd:  .build/measure-go --config=<repository>/.build/deterministic-run/definitions/measure.config.json --benchmarks=<repository>/.build/deterministic-run/definitions/benchmarks --deterministic=adder/terms-512 --iterations=20
part: 1


desc: I1 cache: 32768 B, 64 B, 8-way associative
desc: D1 cache: 32768 B, 64 B, 8-way associative
desc: LL cache: 35651584 B, 64 B, 17-way associative

desc: Timerange: Basic block 0 - 13519275
desc: Trigger: Program termination

positions: line
events: Ir Dr Dw I1mr D1mr D1mw ILmr DLmr DLmw Bc Bcm Bi Bim
summary: 58303130 15414745 8436883 509616 36071 113573 6421 6366 64275 9642252 318133 98961 2819

totals: 58303127 15414744 8436883 509615 36071 113573 6420 6366 64275 9642252 318133 98961 2819
`

const GO_BASELINE_TOTALS =
  'totals: 2499251 563813 326592 15093 5323 3860 5222 2423 3219 409252 24331 15186 2487'

const EVENTS = ['Ir', 'Dr', 'Dw', 'I1mr', 'D1mr', 'D1mw', 'ILmr', 'DLmr', 'DLmw', 'Bc', 'Bcm', 'Bi', 'Bim']

const CACHES = [
  'I1 cache: 32768 B, 64 B, 8-way associative',
  'D1 cache: 32768 B, 64 B, 8-way associative',
  'LL cache: 35651584 B, 64 B, 17-way associative',
]

// What the tool writes on its `creator:` line, for the version whose
// banner the stand-in answers `--version` with.
const CREATOR = 'callgrind-3.22.0'

// The `cmd:` line of a profile the mode took of a built runner, after
// the harness replaced the repository path: the runner, the two
// snapshot paths, the case and the count.
const commandLine = (portId, iterations, reference = 'adder/terms-512') =>
  `.build/measure-${portId} --config=<repository>/.build/deterministic-run/definitions/measure.config.json --benchmarks=<repository>/.build/deterministic-run/definitions/benchmarks --deterministic=${reference} --iterations=${iterations}`

// A profile reduced to what the harness reads: the tool's version and
// the command it ran, the cache geometry it simulated, the events line
// and the totals line.
const header = (totalsLine, command = commandLine('rust', 0)) =>
  `# callgrind format\ncreator: ${CREATOR}\ncmd:  ${command}\n${CACHES.map((cache) => `desc: ${cache}`).join('\n')}\nevents: ${EVENTS.join(' ')}\n${totalsLine}\n`

// What one parse of the adder's 512-term input checksums to, in every
// port: the sum of 512 ones. Twenty of them are the 10240 the fixture
// documents carry.
const ADDER_PARSE = 512

const matrices = await scanRunMatrices()
const config = await loadConfig()
const oldest = matrices[0]
const runDirectoryOf = (runId) => Path.join(repositoryRoot, 'results', 'runs', runId)
const adder = await readJson(Path.join(repositoryRoot, 'benchmarks', 'adder', 'benchmark.json'))
const adderInput = generateInput(adder.performanceCases.find((candidate) => candidate.id === 'terms-512'))

// A stand-in for valgrind and a stand-in for a runner, so the recording
// path runs end to end with no tool and no built port. The valgrind
// stand-in answers `--version` with a real banner, writes a profile with
// the fixture totals for the count it sees to the file it is told to,
// logs what it was asked to run and the whole environment it was given,
// and then runs the command it was given. The runner stand-in reads the
// snapshot's manifest, prints the document a port prints, reports the
// settings the harness passed it exactly as a runtime would, and
// misbehaves on request in the ways the harness has to refuse. Each
// misbehaviour is one guard's only witness: `--misbehave=` for the
// runner's and `--tool-misbehave=` for the tool's. The log's path is
// taken from the profile's, because the harness passes the process
// nothing from this test's environment that could carry it.
function stageStandIns() {
  const directory = Fs.mkdtempSync(Path.join(Os.tmpdir(), 'measure-stand-ins-'))
  const write = (name, content) => {
    const path = Path.join(directory, name)
    Fs.writeFileSync(path, content)
    Fs.chmodSync(path, 0o755)
    return path
  }
  for (const [port, measured, baseline] of [
    ['go', GO_MEASURED, GO_BASELINE_TOTALS],
    ['rust', RUST_MEASURED, RUST_BASELINE_TOTALS],
  ]) {
    write(`${port}-measured.totals`, /^totals: .*$/m.exec(measured)[0])
    write(`${port}-baseline.totals`, baseline)
  }
  const valgrind = write(
    'valgrind.mjs',
    `#!${process.execPath}
import { spawnSync } from 'node:child_process'
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const argv = process.argv.slice(2)
if (argv.includes('--version')) {
  process.stdout.write('valgrind-3.22.0\\n')
  process.exit(0)
}
const commandIndex = argv.findIndex((argument) => !argument.startsWith('-'))
const options = argv.slice(0, commandIndex)
const [command, ...args] = argv.slice(commandIndex)
const outFile = options.find((option) => option.startsWith('--callgrind-out-file=')).slice('--callgrind-out-file='.length)
const value = (name) => args.find((argument) => argument.startsWith('--' + name + '='))?.slice(name.length + 3)
const port = value('port')
const iterations = Number(value('iterations'))
const misbehave = value('tool-misbehave')
const totals = readFileSync(join(here, port + '-' + (iterations > 0 ? 'measured' : 'baseline') + '.totals'), 'utf8').trim()
let creator = ${JSON.stringify(CREATOR)}
let caches = ${JSON.stringify(CACHES)}
let commandLine = command + ' ' + args.join(' ')
switch (misbehave) {
  // The baseline simulated a wider last-level cache than the measured run.
  case 'cache-drift': if (iterations === 0) caches[2] = 'LL cache: 71303168 B, 64 B, 17-way associative'; break
  // The profile is of a run at another count, as a stale file would be.
  case 'profile-of-another-count': commandLine = commandLine.replace(/--iterations=\\d+$/, '--iterations=' + (iterations + 1)); break
  // The profile was written by another version of the tool.
  case 'other-creator': creator = 'callgrind-3.21.0'; break
  case undefined: break
  default: throw new Error('unknown tool misbehaviour ' + misbehave)
}
// The cmd: line carries the paths the harness passed, as the real tool's
// does, so the recorded copy has to have them replaced.
writeFileSync(outFile, [
  '# callgrind format', 'version: 1', 'creator: ' + creator, 'pid: ' + process.pid,
  'cmd:  ' + commandLine, 'part: 1', '',
  caches.map((cache) => 'desc: ' + cache).join('\\n'), '',
  'positions: line', 'events: ${EVENTS.join(' ')}', totals.replace('totals:', 'summary:'), '', totals, '',
].join('\\n'))
appendFileSync(join(outFile, '..', '..', '..', '..', 'stand-in-invocations.jsonl'), JSON.stringify({
  options, command, args, environment: process.env,
}) + '\\n')
process.exit(spawnSync(command, args, { stdio: 'inherit' }).status ?? 1)
`,
  )
  const runner = write(
    'runner.mjs',
    `import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { generateInput, inputIdentity } from ${JSON.stringify(pathToFileURL(Path.join(repositoryRoot, 'scripts', 'lib', 'common.mjs')).href)}

const args = Object.fromEntries(process.argv.slice(2).map((argument) => {
  const [name, ...value] = argument.replace(/^--/, '').split('=')
  return [name, value.join('=')]
}))
const [benchmarkId, caseId] = args.deterministic.split('/')
const manifest = JSON.parse(readFileSync(join(args.benchmarks, benchmarkId, 'benchmark.json'), 'utf8'))
let input = generateInput(manifest.performanceCases.find((candidate) => candidate.id === caseId))
const iterations = Number(args.iterations)
const environment = {}
for (const name of ['GOMAXPROCS', 'GOGC']) {
  if (process.env[name] !== undefined) environment[name] = process.env[name]
}
let parseChecksum = ${ADDER_PARSE}
let loops = iterations
switch (args.misbehave) {
  case 'short-loop': loops = Math.max(0, iterations - 1); break
  case 'other-value': parseChecksum += 1; break
  // The parse before the loop comes to something else in the baseline
  // run only, so each run's loop still checksums to its count.
  case 'other-value-at-baseline': if (iterations === 0) parseChecksum += 1; break
  case 'collector-on': environment.GOGC = '100'; break
  case 'silent': for (const name of Object.keys(environment)) delete environment[name]; break
  // A setting the config does not name, reported from the second case on.
  case 'setting-per-case': if (caseId !== 'terms-512') environment.MIMALLOC_PURGE_DELAY = '0'; break
  // Not the snapshot's input, reported with a consistent identity.
  case 'other-input': input += '+1'; break
  case undefined: break
  default: throw new Error('unknown misbehaviour ' + args.misbehave)
}
let checksum = 0
for (let index = 0; index < loops; index += 1) checksum = (checksum + parseChecksum) % ${CHECKSUM_MODULUS}
process.stdout.write(JSON.stringify({
  benchmarkId, caseId, input: inputIdentity(input), iterations, parseChecksum, checksum, environment,
}) + '\\n')
`,
  )
  return { directory, valgrind, runner }
}

const standIns = stageStandIns()

// Every directory a test makes, removed once the file is done with it.
const scratch = [standIns.directory]
after(() => {
  for (const directory of scratch) Fs.rmSync(directory, { recursive: true, force: true })
})
const scratchDirectory = (prefix) => {
  const directory = Fs.mkdtempSync(prefix)
  scratch.push(directory)
  return directory
}

describe('callgrind profile parsing', () => {
  test('reads the events, the totals and the cache geometry of a real profile', () => {
    const profile = parseCallgrind(RUST_MEASURED)
    Assert.deepEqual(profile.events, EVENTS)
    Assert.equal(profile.totals.Ir, 157_063_015)
    Assert.equal(profile.totals.Bim, 154_447)
    Assert.equal(Object.keys(profile.totals).length, EVENTS.length)
    Assert.deepEqual(profile.caches, CACHES)
    Assert.match(profile.command, /--deterministic=adder\/terms-512 --iterations=20$/)
    Assert.equal(profile.creator, CREATOR)
  })

  test('takes totals: over summary:, which differ by the cost of the dump', () => {
    Assert.equal(parseCallgrind(RUST_MEASURED).totals.Ir, 157_063_015)
    Assert.match(RUST_MEASURED, /^summary: 157063017 /m)
    Assert.equal(parseCallgrind(GO_MEASURED).totals.Ir, 58_303_127)
    Assert.match(GO_MEASURED, /^summary: 58303130 /m)
  })

  test('refuses a profile whose dump was cut off, whatever its summary: says', () => {
    const withoutTotals = RUST_MEASURED.replace(/^totals: .*\n/m, '')
    Assert.match(withoutTotals, /^summary: /m)
    Assert.throws(() => parseCallgrind(withoutTotals), /no totals: line/)
    Assert.throws(() => parseCallgrind('# callgrind format\nversion: 1\n'), /no events: line/)
  })

  test('refuses a totals line that does not match its events line', () => {
    Assert.throws(() => parseCallgrind(header('totals: 1 2 3')), /does not match its events line/)
    Assert.throws(
      () => parseCallgrind(header('totals: ' + EVENTS.map(() => 'x').join(' '))),
      /does not match its events line/,
    )
  })
})

describe('per-parse arithmetic', () => {
  const rust = perParse(
    parseCallgrind(RUST_MEASURED).totals,
    parseCallgrind(header(RUST_BASELINE_TOTALS)).totals,
    20,
  )
  const go = perParse(parseCallgrind(GO_MEASURED).totals, parseCallgrind(header(GO_BASELINE_TOTALS)).totals, 20)

  test('is the measured run less the baseline, divided by the count', () => {
    Assert.equal((157_063_015 - 1_512_100) / 20, 7_777_545.75)
    Assert.equal(rust.instructions, 7_777_545.8, 'rounded to one decimal place')
    Assert.equal(rust.d1ReadMisses, 27_942.8)
    Assert.equal(rust.d1WriteMisses, 21_979.3)
    Assert.equal(rust.llDataMisses, (5032 + 15_847 - 4976 - 5147) / 20)
    Assert.equal(rust.branches, (21_359_784 + 1_093_944 - 250_507 - 4965) / 20)
    Assert.equal(rust.mispredicts, 43_557.4)
    Assert.equal(go.instructions, (58_303_127 - 2_499_251) / 20)
    Assert.deepEqual(Object.keys(rust), Object.keys(HEADLINE))
  })

  test('refuses a zero count and a profile taken without the simulators', () => {
    const measured = parseCallgrind(RUST_MEASURED).totals
    const baseline = parseCallgrind(header(RUST_BASELINE_TOTALS)).totals
    Assert.throws(() => perParse(measured, baseline, 0), /at least one iteration/)
    Assert.throws(
      () => perParse({ Ir: 100 }, { Ir: 10 }, 1),
      new RegExp(`did not record D1mr; .*${CALLGRIND_ARGUMENTS.join(' ')}`),
    )
  })

  test('a loop checksums to the count times one parse, under the runners\' modulus', () => {
    Assert.equal(CHECKSUM_MODULUS, 1_000_000_007n)
    Assert.equal(loopChecksum(ADDER_PARSE, 20), 10_240)
    Assert.equal(loopChecksum(ADDER_PARSE, 0), 0)
    Assert.equal(loopChecksum(1, 20), 20, 'the palindrome parses to true, which checksums to one')
    Assert.equal(loopChecksum(1_000_000_006, 2), 1_000_000_005, 'reduced the way the runners reduce it')
  })
})

describe('what a profile carries', () => {
  test('the recording host\'s directories are replaced before the profile is stored', () => {
    const text = `cmd:  /srv/measure/.build/measure-rust --config=/srv/measure/x\nfl=(1) /home/someone/.cargo/registry/src/x.rs\n`
    Assert.equal(
      redactPaths(text, { repository: '/srv/measure', home: '/home/someone' }),
      `cmd:  <repository>/.build/measure-rust --config=<repository>/x\nfl=(1) <home>/.cargo/registry/src/x.rs\n`,
    )
    Assert.doesNotMatch(RUST_MEASURED, /\/home\/|\/root\//)
  })

  test('a case reference is <benchmark>/<case> and nothing else', () => {
    Assert.deepEqual(parseCase('adder/terms-512'), { benchmarkId: 'adder', caseId: 'terms-512' })
    Assert.throws(() => parseCase('adder'), /not <benchmark>\/<case>/)
    Assert.throws(() => parseCase('a/b/c'), /not <benchmark>\/<case>/)
  })

  test('profiles are named by port, case and kind under raw/deterministic', () => {
    Assert.equal(profilePath('rust', 'adder', 'terms-512', 'measured'), 'raw/deterministic/rust/adder-terms-512.out')
    Assert.equal(
      profilePath('go', 'palindrome', 'chars-1024', 'baseline'),
      'raw/deterministic/go/palindrome-chars-1024-baseline.out',
    )
  })
})

describe('the configured case set', () => {
  test('is explicit, small, and names real performance cases', async () => {
    Assert.ok(config.deterministic, 'measure.config.json has no deterministic section')
    Assert.ok(config.deterministic.cases.length <= 4, 'the counted set is meant to stay small')
    for (const reference of config.deterministic.cases) {
      const { benchmarkId, caseId } = parseCase(reference)
      const manifest = await readJson(Path.join(repositoryRoot, 'benchmarks', benchmarkId, 'benchmark.json'))
      Assert.ok(
        manifest.performanceCases.some((candidate) => candidate.id === caseId),
        `${reference} is not a performance case`,
      )
    }
  })

  test('counts Rust, and Go on one thread with the collector off, and leaves TypeScript out', () => {
    const ports = deterministicPorts(config).map((port) => port.id)
    Assert.deepEqual(ports, ['go', 'rust'])
    Assert.deepEqual(config.ports.find((port) => port.id === 'go').deterministic.environment, {
      GOMAXPROCS: '1',
      GOGC: 'off',
    })
  })
})

// A document as a runner prints it, and as the harness holds it to what
// it asked for.
const runnerDocument = (overrides = {}) => ({
  benchmarkId: 'adder',
  caseId: 'terms-512',
  input: { bytes: 1023, codeUnits: 1023, sha256: digest(adderInput) },
  iterations: 20,
  parseChecksum: ADDER_PARSE,
  checksum: 10_240,
  environment: { GOMAXPROCS: '1', GOGC: 'off' },
  ...overrides,
})

const goPort = config.ports.find((port) => port.id === 'go')
const rustPort = config.ports.find((port) => port.id === 'rust')

describe('what a runner reports', () => {
  const check = (port, result, iterations = 20) =>
    checkRunnerDocument({ port, reference: 'adder/terms-512', iterations, result })

  test('is accepted when it is the case, the count and the settings asked for', () => {
    check(goPort, runnerDocument())
    check(rustPort, runnerDocument({ environment: {} }))
    check(rustPort, runnerDocument({ environment: { GOGC: 'off' } }), 20)
    check(goPort, runnerDocument({ iterations: 0, checksum: 0 }), 0)
  })

  test('is refused when the loop did not run the count asked', () => {
    Assert.throws(
      () => check(goPort, runnerDocument({ checksum: loopChecksum(ADDER_PARSE, 19) })),
      /the loop checksum is 9728, and 20 parses of a value checksumming to 512 give 10240/,
    )
    Assert.throws(
      () => check(goPort, runnerDocument({ iterations: 19, checksum: loopChecksum(ADDER_PARSE, 19) })),
      /reported 19 parses where 20 were asked for/,
    )
    Assert.throws(
      () => check(goPort, runnerDocument({ parseChecksum: 0, checksum: 0 })),
      /one parse checksums to zero, so the loop count cannot be checked/,
    )
  })

  test('is refused when the settings it read back are not the configured ones', () => {
    Assert.throws(
      () => check(goPort, runnerDocument({ environment: { GOMAXPROCS: '1', GOGC: '100' } })),
      /go adder\/terms-512: the runner ran under GOGC=100 where the config says GOGC=off/,
    )
    Assert.throws(
      () => check(goPort, runnerDocument({ environment: { GOGC: 'off' } })),
      /the runner does not report GOMAXPROCS, which the config sets to 1/,
    )
    Assert.throws(() => check(goPort, runnerDocument({ environment: undefined })), /did not report the settings/)
  })

  test('is refused when it names another case', () => {
    Assert.throws(() => check(goPort, runnerDocument({ caseId: 'terms-8' })), /reported a different case \(adder\/terms-8\)/)
  })

  test('every port counted in a run has to agree with the others', () => {
    const document = (portId, overrides = {}) => ({
      port: { id: portId },
      cases: [
        {
          benchmarkId: 'adder',
          caseId: 'terms-512',
          input: runnerDocument().input,
          parseChecksum: ADDER_PARSE,
          measured: { checksum: 10_240 },
          ...overrides,
        },
      ],
    })
    checkPortIdentity([document('go'), document('rust')])
    checkPortIdentity([document('go')])
    Assert.throws(
      () => checkPortIdentity([document('go'), document('rust', { parseChecksum: 513, measured: { checksum: 10_260 } })]),
      /go and rust parse adder\/terms-512 to different values \(512 and 513\)/,
    )
    Assert.throws(
      () => checkPortIdentity([document('go'), document('rust', { measured: { checksum: 9728 } })]),
      /go and rust report different loop checksums for adder\/terms-512 \(10240 and 9728\)/,
    )
    Assert.throws(
      () => checkPortIdentity([document('go'), document('rust', { input: { ...runnerDocument().input, bytes: 1024 } })]),
      /go and rust counted different inputs for adder\/terms-512/,
    )
    Assert.throws(
      () => checkPortIdentity([document('go'), document('rust', { caseId: 'terms-8' })]),
      /rust did not count adder\/terms-512/,
    )
  })
})

describe('recording a counted section', () => {
  // A run directory under .build/, where the harness keeps its own
  // ephemeral runs, so the paths the stand-in writes into its profile
  // are ones the redaction has to replace.
  const freshRun = () => {
    Fs.mkdirSync(Path.join(repositoryRoot, '.build'), { recursive: true })
    const runDirectory = scratchDirectory(Path.join(repositoryRoot, '.build', 'counted-test-'))
    const definitionsDirectory = Path.join(runDirectory, 'definitions')
    Fs.mkdirSync(Path.join(definitionsDirectory, 'benchmarks', 'adder'), { recursive: true })
    Fs.mkdirSync(Path.join(definitionsDirectory, 'inputs', 'adder'), { recursive: true })
    Fs.writeFileSync(Path.join(definitionsDirectory, 'benchmarks', 'adder', 'benchmark.json'), JSON.stringify(adder))
    for (const performanceCase of adder.performanceCases) {
      Fs.writeFileSync(
        Path.join(definitionsDirectory, 'inputs', 'adder', `${performanceCase.id}.txt`),
        generateInput(performanceCase),
      )
    }
    return { runDirectory, definitionsDirectory }
  }
  const standInPort = (id, label, environment, misbehave, toolMisbehave) => ({
    id,
    label,
    parser: { module: `stand-in-${id}`, version: '0.0.0' },
    manifests: [],
    command: process.execPath,
    arguments: [
      standIns.runner,
      `--port=${id}`,
      ...(misbehave === undefined ? [] : [`--misbehave=${misbehave}`]),
      ...(toolMisbehave === undefined ? [] : [`--tool-misbehave=${toolMisbehave}`]),
    ],
    deterministic: environment === undefined ? {} : { environment },
  })
  const run = { ...oldest.run }
  // A run staged for recording: its directory, its snapshot, and a config
  // whose two ports are the stand-in runner, misbehaving where asked, with
  // the tool stand-in misbehaving where asked around it.
  const stage = ({ go, rust, tool = {}, cases = ['adder/terms-512'] } = {}) => {
    const staged = freshRun()
    staged.standInConfig = {
      ...config,
      deterministic: { iterations: 20, cases },
      ports: [
        standInPort('go', 'Go', { GOMAXPROCS: '1', GOGC: 'off' }, go, tool.go),
        standInPort('rust', 'Rust', undefined, rust, tool.rust),
      ],
    }
    Fs.writeFileSync(
      Path.join(staged.definitionsDirectory, 'measure.config.json'),
      JSON.stringify(staged.standInConfig),
    )
    return staged
  }
  // The shell an operator records from, with the settings an operator
  // might have in it that change a count and that no runner reads back.
  // The counted process has to see none of them.
  const OPERATOR_SHELL = {
    GOMEMLIMIT: '256MiB',
    GODEBUG: 'gctrace=1',
    MIMALLOC_PURGE_DELAY: '0',
    LD_PRELOAD: '/nonexistent/libjemalloc.so',
    VALGRIND_OPTS: '--cache-sim=no',
  }
  const record = async (staged) => {
    const before = { ...process.env }
    Object.assign(process.env, OPERATOR_SHELL)
    try {
      await recordDeterministic({
        config: staged.standInConfig,
        manifests: [adder],
        runDirectory: staged.runDirectory,
        definitionsDirectory: staged.definitionsDirectory,
        run,
        valgrind: { available: true, version: 'valgrind-3.22.0', command: standIns.valgrind },
        log: () => {},
      })
    } finally {
      for (const name of Object.keys(OPERATOR_SHELL)) delete process.env[name]
      Object.assign(process.env, before)
    }
    const log = Path.join(staged.runDirectory, 'stand-in-invocations.jsonl')
    const invocations = Fs.readFileSync(log, 'utf8').trim().split('\n').map((line) => JSON.parse(line))
    return { ...staged, invocations }
  }
  // What the harness hands a counted process on this host: the allowlisted
  // variables that are set here, and the port's settings.
  const handed = (settings = {}) => ({
    inherited: INHERITED_ENVIRONMENT.filter((name) => process.env[name] !== undefined),
    settings,
  })
  const document = (runDirectory, portId) => readJson(Path.join(runDirectory, 'raw', 'deterministic', `${portId}.json`))
  const recorded = (runDirectory, portId) => Fs.existsSync(Path.join(runDirectory, 'raw', 'deterministic', `${portId}.json`))

  test('writes each port\'s document and profiles from what its runner reported', async () => {
    const { runDirectory } = await record(stage())
    for (const [portId, measured, baseline] of [
      ['go', GO_MEASURED, GO_BASELINE_TOTALS],
      ['rust', RUST_MEASURED, RUST_BASELINE_TOTALS],
    ]) {
      const raw = await document(runDirectory, portId)
      await validateSchema('deterministic-result.schema.json', raw, `${portId} stand-in document`)
      Assert.deepEqual(raw.run, run)
      Assert.equal(raw.port.id, portId)
      Assert.deepEqual(raw.tool, { name: 'valgrind', version: 'valgrind-3.22.0', arguments: CALLGRIND_ARGUMENTS })
      Assert.equal(raw.runner.command, process.execPath)
      Assert.deepEqual(raw.runner.arguments, [standIns.runner, `--port=${portId}`])
      Assert.deepEqual(raw.runner.given, handed(portId === 'go' ? { GOMAXPROCS: '1', GOGC: 'off' } : {}))
      Assert.equal(raw.iterations, 20)
      Assert.equal(raw.cases.length, 1)
      const item = raw.cases[0]
      Assert.deepEqual(item.input, { bytes: 1023, codeUnits: 1023, sha256: digest(adderInput) })
      Assert.equal(item.parseChecksum, ADDER_PARSE)
      Assert.deepEqual(item.events, EVENTS)
      Assert.deepEqual(item.caches, CACHES)
      Assert.deepEqual(item.measured, {
        iterations: 20,
        checksum: 10_240,
        totals: parseCallgrind(measured).totals,
        profile: profilePath(portId, 'adder', 'terms-512', 'measured'),
      })
      Assert.deepEqual(item.baseline, {
        iterations: 0,
        checksum: 0,
        totals: parseCallgrind(header(baseline)).totals,
        profile: profilePath(portId, 'adder', 'terms-512', 'baseline'),
      })
      for (const kind of ['measured', 'baseline']) {
        const profile = Fs.readFileSync(Path.join(runDirectory, item[kind].profile), 'utf8')
        Assert.match(profile, /^cmd: .*--config=<repository>\/\.build\/counted-test-/m, 'the recording host\'s paths are replaced')
        Assert.doesNotMatch(profile, new RegExp(repositoryRoot.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&')))
        Assert.deepEqual(parseCallgrind(profile).totals, item[kind].totals)
        Assert.equal(parseCallgrind(profile).creator, CREATOR)
        Assert.match(
          parseCallgrind(profile).command,
          new RegExp(`^${process.execPath} ${standIns.runner} --port=${portId} --config=.*--deterministic=adder/terms-512 --iterations=${kind === 'measured' ? 20 : 0}$`),
        )
      }
    }
  })

  test('passes each port its settings, and records what the runner read back rather than the config', async () => {
    const { runDirectory, invocations } = await record(stage())
    Assert.deepEqual((await document(runDirectory, 'go')).runner.environment, { GOMAXPROCS: '1', GOGC: 'off' })
    Assert.deepEqual((await document(runDirectory, 'rust')).runner.environment, {})
    Assert.equal(invocations.length, 4, 'two counted runs per port')
    for (const invocation of invocations) {
      Assert.deepEqual(invocation.options.slice(0, 1 + CALLGRIND_ARGUMENTS.length), ['-q', ...CALLGRIND_ARGUMENTS])
      Assert.match(invocation.options.at(-1), /^--callgrind-out-file=.*\/raw\/deterministic\/(go|rust)\/adder-terms-512(-baseline)?\.out$/)
      Assert.equal(invocation.command, process.execPath)
      Assert.match(invocation.args.at(-2), /^--deterministic=adder\/terms-512$/)
    }
    const under = (portId) => invocations.filter((invocation) => invocation.args.includes(`--port=${portId}`))
    const settings = ({ environment }) => [environment.GOMAXPROCS ?? null, environment.GOGC ?? null]
    Assert.deepEqual(
      under('go').map((invocation) => [...settings(invocation), invocation.args.at(-1)]),
      [['1', 'off', '--iterations=20'], ['1', 'off', '--iterations=0']],
    )
    Assert.deepEqual(
      under('rust').map((invocation) => [...settings(invocation), invocation.args.at(-1)]),
      [[null, null, '--iterations=20'], [null, null, '--iterations=0']],
    )
  })

  // The environment the counted process runs under is decided and
  // recorded, not inherited. An operator's shell can carry settings that
  // change a count and that no runner reads back: GOMEMLIMIT keeps the
  // Go collector running under a document that says GOGC=off, MIMALLOC_*
  // changes the Rust allocator's work per parse, VALGRIND_OPTS changes
  // the tool. The process sees the allowlist and the settings, and the
  // document says which of the allowlist were set.
  test('gives the counted process the allowlisted host variables and its settings, and nothing else from the shell', async () => {
    Assert.deepEqual(INHERITED_ENVIRONMENT, ['PATH', 'TMPDIR'])
    const { runDirectory, invocations } = await record(stage())
    const expected = (settings) => Object.fromEntries([
      ...INHERITED_ENVIRONMENT.filter((name) => process.env[name] !== undefined).map((name) => [name, process.env[name]]),
      ...Object.entries(settings),
    ])
    for (const invocation of invocations) {
      const portId = invocation.args.includes('--port=go') ? 'go' : 'rust'
      Assert.deepEqual(
        invocation.environment,
        expected(portId === 'go' ? { GOMAXPROCS: '1', GOGC: 'off' } : {}),
        `${portId} was handed the allowlist and its settings and nothing else`,
      )
      for (const name of Object.keys(OPERATOR_SHELL)) {
        Assert.equal(invocation.environment[name], undefined, `${name} did not reach the ${portId} process`)
      }
    }
    Assert.deepEqual((await document(runDirectory, 'go')).runner.given, handed({ GOMAXPROCS: '1', GOGC: 'off' }))
    Assert.deepEqual((await document(runDirectory, 'rust')).runner.given, handed())
    Assert.deepEqual(
      processEnvironment(rustPort, { PATH: '/usr/bin', HOME: '/home/someone', GOMEMLIMIT: '1GiB' }),
      { environment: { PATH: '/usr/bin' }, given: { inherited: ['PATH'], settings: {} } },
    )
    Assert.deepEqual(
      processEnvironment(goPort, { PATH: '/usr/bin', TMPDIR: '/scratch', GOGC: '100' }),
      {
        environment: { PATH: '/usr/bin', TMPDIR: '/scratch', GOMAXPROCS: '1', GOGC: 'off' },
        given: { inherited: ['PATH', 'TMPDIR'], settings: { GOMAXPROCS: '1', GOGC: 'off' } },
      },
      'a configured setting wins over the shell, and the shell\'s own copy is not what the process sees',
    )
  })

  test('refuses a runner whose loop ran fewer times than the count asked', async () => {
    const staged = stage({ go: 'short-loop' })
    await Assert.rejects(
      record(staged),
      /go adder\/terms-512: the loop checksum is 9728, and 20 parses of a value checksumming to 512 give 10240/,
    )
    Assert.ok(!recorded(staged.runDirectory, 'go') && !recorded(staged.runDirectory, 'rust'))
  })

  test('refuses a runner whose runtime does not have the configured settings', async () => {
    await Assert.rejects(
      record(stage({ go: 'collector-on' })),
      /go adder\/terms-512: the runner ran under GOGC=100 where the config says GOGC=off/,
    )
    await Assert.rejects(
      record(stage({ go: 'silent' })),
      /go adder\/terms-512: the runner does not report GOMAXPROCS, which the config sets to 1/,
    )
  })

  test('refuses two ports that parse the case to different values, and writes no document', async () => {
    const staged = stage({ rust: 'other-value' })
    await Assert.rejects(
      record(staged),
      /go and rust parse adder\/terms-512 to different values \(512 and 513\)/,
    )
    // Each port passed its own checks, so both were counted; the identity
    // check across them is what refused the run, before either document
    // was written.
    for (const portId of ['go', 'rust']) {
      Assert.ok(
        Fs.existsSync(Path.join(staged.runDirectory, profilePath(portId, 'adder', 'terms-512', 'measured'))),
        `${portId} was counted`,
      )
      Assert.ok(!recorded(staged.runDirectory, portId), `${portId} has no document`)
    }
  })

  // The four refusals below are the recorder's alone. The document keeps
  // the measured run's parse checksum, the first case's settings and the
  // measured run's cache geometry, so a baseline that parsed to something
  // else, a second case counted under other settings, or a baseline
  // against other caches would be recorded and read back clean; and both
  // ports parsing the wrong input agree with each other, so the identity
  // check across them passes.
  const nothingRecorded = (staged) =>
    Assert.ok(!recorded(staged.runDirectory, 'go') && !recorded(staged.runDirectory, 'rust'), 'no document was written')

  test('refuses a runner whose parse before the loop differs between the two counted runs', async () => {
    const staged = stage({ go: 'other-value-at-baseline' })
    await Assert.rejects(record(staged), /^Error: go adder\/terms-512: the two callgrind runs parsed to different values$/)
    nothingRecorded(staged)
  })

  test('refuses two callgrind runs of one case that simulated different caches', async () => {
    const staged = stage({ tool: { rust: 'cache-drift' } })
    await Assert.rejects(record(staged), /^Error: rust adder\/terms-512: the two callgrind runs simulated different caches$/)
    nothingRecorded(staged)
  })

  test('refuses a port whose settings differ between the cases counted', async () => {
    const staged = stage({ rust: 'setting-per-case', cases: ['adder/terms-512', 'adder/terms-8'] })
    await Assert.rejects(
      record(staged),
      /^Error: rust: adder\/terms-8 ran under different settings from the case counted before it$/,
    )
    nothingRecorded(staged)
    const clean = await record(stage({ cases: ['adder/terms-512', 'adder/terms-8'] }))
    Assert.equal((await document(clean.runDirectory, 'rust')).cases.length, 2, 'two cases are counted when the settings hold')
  })

  test('refuses a counted process that parsed something other than the snapshot, before the ports are compared', async () => {
    const staged = stage({ go: 'other-input', rust: 'other-input' })
    await Assert.rejects(
      record(staged),
      /^Error: go adder\/terms-512: the counted process parsed a different input from the snapshot$/,
    )
    nothingRecorded(staged)
  })

  test('refuses a profile that is not of the command counted, or not by the tool counting', async () => {
    const stale = stage({ tool: { go: 'profile-of-another-count' } })
    await Assert.rejects(
      record(stale),
      /go adder\/terms-512 measured profile: the profile is of `.*--iterations=21`, not of adder\/terms-512 at 20 parses/,
    )
    nothingRecorded(stale)
    const other = stage({ tool: { rust: 'other-creator' } })
    await Assert.rejects(
      record(other),
      /rust adder\/terms-512 measured profile: the profile was written by callgrind-3\.21\.0 where the run was counted by valgrind-3\.22\.0/,
    )
    nothingRecorded(other)
  })

  test('reads back into the rows the matrix carries, and the matrix schema accepts them', async () => {
    const { runDirectory, standInConfig } = await record(stage())
    const section = await readDeterministic({
      runDirectory,
      config: standInConfig,
      manifests: [adder],
      canonicalRun: run,
      validate: (schemaFile, value, label) => validateSchema(schemaFile, value, label),
    })
    Assert.equal(section.iterations, 20)
    Assert.deepEqual(section.caches, CACHES)
    Assert.deepEqual(section.ports, {
      go: { label: 'Go', given: handed({ GOMAXPROCS: '1', GOGC: 'off' }), environment: { GOMAXPROCS: '1', GOGC: 'off' } },
      rust: { label: 'Rust', given: handed(), environment: {} },
    })
    Assert.equal(section.rows.length, 1)
    const row = section.rows[0]
    Assert.equal(row.ports.rust.perParse.instructions, 7_777_545.8)
    Assert.equal(row.ports.go.perParse.instructions, 2_790_193.8)
    Assert.deepEqual(row.relativeInstructions, { go: 1, rust: 2.787 })
    Assert.equal(row.ports.go.parseChecksum, ADDER_PARSE)
    Assert.equal(row.ports.go.checksum, 10_240)
    await validateSchema('matrix.schema.json', { ...oldest, deterministic: section }, 'stand-in matrix')
  })
})

describe('schemas', () => {
  const rawDocument = (run) => ({
    $schema: SCHEMA,
    schemaVersion: SCHEMA_VERSION,
    run,
    port: { id: 'rust' },
    tool: { name: 'valgrind', version: 'valgrind-3.22.0', arguments: [...CALLGRIND_ARGUMENTS] },
    runner: {
      command: '.build/measure-rust',
      arguments: [],
      given: { inherited: ['PATH', 'TMPDIR'], settings: {} },
      environment: {},
    },
    iterations: 20,
    cases: [
      {
        benchmarkId: 'adder',
        caseId: 'terms-512',
        input: {
          bytes: 1023,
          codeUnits: 1023,
          sha256: 'c6973089da125bc7162b53db8e8e6fa05cd62ce89ff873f197625ab4c08bf194',
        },
        parseChecksum: ADDER_PARSE,
        events: EVENTS,
        caches: CACHES,
        measured: {
          iterations: 20,
          checksum: 10_240,
          totals: parseCallgrind(RUST_MEASURED).totals,
          profile: 'raw/deterministic/rust/adder-terms-512.out',
        },
        baseline: {
          iterations: 0,
          checksum: 0,
          totals: parseCallgrind(header(RUST_BASELINE_TOTALS)).totals,
          profile: 'raw/deterministic/rust/adder-terms-512-baseline.out',
        },
      },
    ],
  })

  test('the raw document the mode writes satisfies its schema', async () => {
    await validateSchema('deterministic-result.schema.json', rawDocument(oldest.run), 'fixture')
    const broken = rawDocument(oldest.run)
    broken.cases[0].measured.totals.Ir = -1
    await Assert.rejects(validateSchema('deterministic-result.schema.json', broken, 'fixture'), /totals\/Ir must be >= 0/)
    const unproven = rawDocument(oldest.run)
    unproven.cases[0].parseChecksum = 0
    await Assert.rejects(validateSchema('deterministic-result.schema.json', unproven, 'fixture'), /parseChecksum must be >= 1/)
    const { checksum: _checksum, ...uncounted } = rawDocument(oldest.run).cases[0].measured
    const withoutLoop = rawDocument(oldest.run)
    withoutLoop.cases[0].measured = uncounted
    await Assert.rejects(validateSchema('deterministic-result.schema.json', withoutLoop, 'fixture'), /required property 'checksum'/)
    const { given: _given, ...ungiven } = rawDocument(oldest.run).runner
    const withoutGiven = rawDocument(oldest.run)
    withoutGiven.runner = ungiven
    await Assert.rejects(validateSchema('deterministic-result.schema.json', withoutGiven, 'fixture'), /required property 'given'/)
  })

  test("today's matrix schema accepts every recorded run, none of which the mode edited", async () => {
    Assert.ok(matrices.length > 0)
    for (const matrix of matrices) {
      await validateSchema('matrix.schema.json', matrix, `matrix ${matrix.run.id}`)
    }
    Assert.equal(oldest.deterministic, undefined, 'the oldest run predates the mode')
    Assert.ok(
      !Fs.existsSync(Path.join(runDirectoryOf(oldest.run.id), 'raw', 'deterministic')),
      'the oldest run must not have grown a deterministic section',
    )
  })

  test("today's config schema accepts a config with the section and one without", async () => {
    await validateSchema('config.schema.json', config, 'measure.config.json')
    const { deterministic: _section, ...withoutSection } = config
    withoutSection.ports = config.ports.map(({ deterministic: _port, ...port }) => port)
    await validateSchema('config.schema.json', withoutSection, 'measure.config.json without the section')
    const newest = await readJson(
      Path.join(runDirectoryOf(matrices.at(-1).run.id), 'definitions', 'measure.config.json'),
    )
    await validateSchema('config.schema.json', newest, `config of ${matrices.at(-1).run.id}`)
  })

  test("today's matrix schema accepts a run that carries the section", async () => {
    const counted = matrices.find((matrix) => matrix.deterministic !== undefined)
    const matrix = counted ?? {
      ...oldest,
      deterministic: {
        tool: { name: 'valgrind', version: 'valgrind-3.22.0', arguments: [...CALLGRIND_ARGUMENTS] },
        iterations: 20,
        caches: CACHES,
        ports: { rust: { label: 'Rust', given: { inherited: ['PATH'], settings: {} }, environment: {} } },
        rows: [
          {
            benchmarkId: 'adder',
            caseId: 'terms-512',
            description: 'fixture',
            input: rawDocument(oldest.run).cases[0].input,
            ports: { rust: { perParse: perParse(parseCallgrind(RUST_MEASURED).totals, parseCallgrind(header(RUST_BASELINE_TOTALS)).totals, 20) } },
            relativeInstructions: { rust: 1 },
          },
        ],
      },
    }
    await validateSchema('matrix.schema.json', matrix, 'counted matrix')
    if (counted !== undefined) {
      for (const row of counted.deterministic.rows) {
        for (const [portId, summary] of Object.entries(row.ports)) {
          Assert.ok(summary.perParse.instructions > 0, `${counted.run.id} ${portId} counted nothing`)
          Assert.ok(
            Fs.existsSync(Path.join(runDirectoryOf(counted.run.id), summary.profile)),
            `${counted.run.id} is missing ${summary.profile}`,
          )
        }
      }
    }
  })
})

describe('reading a counted run back', () => {
  // A run directory built from the fixtures: the shape the aggregator
  // reads, with no valgrind involved.
  const runDirectory = scratchDirectory(Path.join(Os.tmpdir(), 'measure-counted-'))
  const input = adderInput
  const run = { ...oldest.run }
  const runConfig = {
    ...config,
    deterministic: { iterations: 20, cases: ['adder/terms-512'] },
  }
  const manifests = [
    {
      id: 'adder',
      performanceCases: [{ id: 'terms-512', description: 'Five hundred and twelve terms.' }],
    },
  ]
  Fs.mkdirSync(Path.join(runDirectory, 'definitions', 'inputs', 'adder'), { recursive: true })
  Fs.writeFileSync(Path.join(runDirectory, 'definitions', 'inputs', 'adder', 'terms-512.txt'), input)
  const sha256 = digest(input)
  const document = (portId, measured, baselineTotals, environment) => ({
    $schema: SCHEMA,
    schemaVersion: SCHEMA_VERSION,
    run,
    port: { id: portId },
    tool: { name: 'valgrind', version: 'valgrind-3.22.0', arguments: [...CALLGRIND_ARGUMENTS] },
    runner: {
      command: `.build/measure-${portId}`,
      arguments: [],
      given: { inherited: ['PATH', 'TMPDIR'], settings: environment },
      environment,
    },
    iterations: 20,
    cases: [
      {
        benchmarkId: 'adder',
        caseId: 'terms-512',
        input: { bytes: 1023, codeUnits: 1023, sha256 },
        parseChecksum: ADDER_PARSE,
        events: EVENTS,
        caches: parseCallgrind(measured).caches,
        measured: {
          iterations: 20,
          checksum: 10_240,
          totals: parseCallgrind(measured).totals,
          profile: profilePath(portId, 'adder', 'terms-512', 'measured'),
        },
        baseline: {
          iterations: 0,
          checksum: 0,
          totals: parseCallgrind(header(baselineTotals)).totals,
          profile: profilePath(portId, 'adder', 'terms-512', 'baseline'),
        },
      },
    ],
  })
  const environmentOf = (portId) =>
    config.ports.find((port) => port.id === portId).deterministic.environment ?? {}
  for (const [portId, measured, baseline, environment] of [
    ['go', GO_MEASURED, GO_BASELINE_TOTALS, environmentOf('go')],
    ['rust', RUST_MEASURED, RUST_BASELINE_TOTALS, environmentOf('rust')],
  ]) {
    Fs.mkdirSync(Path.join(runDirectory, 'raw', 'deterministic', portId), { recursive: true })
    Fs.writeFileSync(Path.join(runDirectory, profilePath(portId, 'adder', 'terms-512', 'measured')), measured)
    Fs.writeFileSync(
      Path.join(runDirectory, profilePath(portId, 'adder', 'terms-512', 'baseline')),
      header(baseline, commandLine(portId, 0)),
    )
    Fs.writeFileSync(
      Path.join(runDirectory, 'raw', 'deterministic', `${portId}.json`),
      JSON.stringify(document(portId, measured, baseline, environment)),
    )
  }
  const read = (overrides = {}) =>
    readDeterministic({
      runDirectory,
      config: runConfig,
      manifests,
      canonicalRun: run,
      validate: (schemaFile, value, label) => validateSchema(schemaFile, value, label),
      ...overrides,
    })
  // The read-back with one port's recorded document changed, and the
  // document put back afterwards whatever the read-back said.
  const readWith = async (portId, change) => {
    const path = Path.join(runDirectory, 'raw', 'deterministic', `${portId}.json`)
    const original = Fs.readFileSync(path, 'utf8')
    const raw = JSON.parse(original)
    change(raw)
    Fs.writeFileSync(path, JSON.stringify(raw))
    try {
      return await read()
    } finally {
      Fs.writeFileSync(path, original)
    }
  }

  test('derives the rows the matrix carries', async () => {
    const section = await read()
    Assert.equal(section.iterations, 20)
    Assert.deepEqual(section.ports.go.environment, { GOMAXPROCS: '1', GOGC: 'off' })
    Assert.deepEqual(section.ports.go.given, { inherited: ['PATH', 'TMPDIR'], settings: { GOMAXPROCS: '1', GOGC: 'off' } })
    Assert.equal(section.rows.length, 1)
    const row = section.rows[0]
    Assert.equal(row.description, 'Five hundred and twelve terms.')
    Assert.equal(row.ports.rust.perParse.instructions, 7_777_545.8)
    Assert.equal(row.ports.go.perParse.instructions, 2_790_193.8)
    Assert.deepEqual(row.relativeInstructions, { go: 1, rust: 2.787 })
    Assert.equal(row.ports.rust.profile, 'raw/deterministic/rust/adder-terms-512.out')
    Assert.equal(row.ports.rust.parseChecksum, ADDER_PARSE)
    Assert.equal(row.ports.rust.checksum, 10_240)
  })

  test('is absent, not empty, for a run without the section', async () => {
    const plain = scratchDirectory(Path.join(Os.tmpdir(), 'measure-plain-'))
    Assert.equal(await read({ runDirectory: plain }), undefined)
  })

  test('refuses a run whose count or case set differs from its config', async () => {
    await Assert.rejects(
      read({ config: { ...runConfig, deterministic: { iterations: 21, cases: ['adder/terms-512'] } } }),
      /different number of parses/,
    )
    await Assert.rejects(
      read({ config: { ...runConfig, deterministic: { iterations: 20, cases: ['adder/terms-8'] } } }),
      /different case set/,
    )
    await Assert.rejects(read({ canonicalRun: { ...run, id: 'other' } }), /run metadata differs/)
  })

  test('refuses a run whose counted input is not the snapshot input', async () => {
    Fs.writeFileSync(Path.join(runDirectory, 'definitions', 'inputs', 'adder', 'terms-512.txt'), `${input}+1`)
    await Assert.rejects(read(), /counted a different input/)
    Fs.writeFileSync(Path.join(runDirectory, 'definitions', 'inputs', 'adder', 'terms-512.txt'), input)
  })

  test('refuses a run counted under settings other than the configured ones', async () => {
    await Assert.rejects(
      readWith('go', (raw) => {
        raw.runner.environment.GOGC = '100'
      }),
      /go was counted under GOGC=100 where the config says GOGC=off/,
    )
    await Assert.rejects(
      readWith('go', (raw) => {
        delete raw.runner.environment.GOMAXPROCS
      }),
      /go was counted under GOMAXPROCS=nothing where the config says GOMAXPROCS=1/,
    )
  })

  test('refuses a run whose process was given other settings, or a host variable the harness does not pass', async () => {
    await Assert.rejects(
      readWith('go', (raw) => {
        raw.runner.given.settings.GOGC = '100'
      }),
      /go was given GOMAXPROCS=1, GOGC=100 where the config sets GOMAXPROCS=1, GOGC=off/,
    )
    await Assert.rejects(
      readWith('rust', (raw) => {
        raw.runner.given.settings = { MIMALLOC_PURGE_DELAY: '0' }
      }),
      /rust was given MIMALLOC_PURGE_DELAY=0 where the config sets nothing/,
    )
    await Assert.rejects(
      readWith('go', (raw) => {
        raw.runner.given.inherited.push('GOMEMLIMIT')
      }),
      /go was counted with GOMEMLIMIT inherited from the host, which the harness does not pass/,
    )
  })

  // A profile carries what it was a profile of. Totals that agree with
  // the document prove nothing if the profile is of another case, another
  // count, another runner or another version of the tool.
  const withProfile = async (portId, kind, change, expected) => {
    const profile = Path.join(runDirectory, profilePath(portId, 'adder', 'terms-512', kind))
    const original = Fs.readFileSync(profile, 'utf8')
    Fs.writeFileSync(profile, change(original))
    try {
      await Assert.rejects(read(), expected)
    } finally {
      Fs.writeFileSync(profile, original)
    }
  }

  test('refuses a profile whose cmd: line is not the recorded command, the case and the count', async () => {
    await withProfile(
      'rust',
      'measured',
      (text) => text.replace('--iterations=20', '--iterations=19'),
      /rust adder\/terms-512 measured profile: the profile is of `.*--iterations=19`, not of adder\/terms-512 at 20 parses/,
    )
    await withProfile(
      'go',
      'baseline',
      (text) => text.replace('--deterministic=adder/terms-512', '--deterministic=adder/terms-8'),
      /go adder\/terms-512 baseline profile: the profile is of `.*`, not of adder\/terms-512 at 0 parses/,
    )
    await withProfile(
      'rust',
      'measured',
      (text) => text.replace('cmd:  .build/measure-rust ', 'cmd:  .build/measure-rust-debug '),
      /rust adder\/terms-512 measured profile: the profile is of `\.build\/measure-rust-debug .*`, not of the runner command recorded/,
    )
    await withProfile(
      'rust',
      'measured',
      (text) => text.replace('--config=<repository>/.build/deterministic-run/definitions/measure.config.json', '--config=/etc/measure.config.json'),
      /rust adder\/terms-512 measured profile: the profile is of `.*`, which does not read one run's snapshot/,
    )
    await withProfile(
      'go',
      'measured',
      (text) => text.replace(/^cmd: .*\n/m, ''),
      /go adder\/terms-512 measured profile: the profile is of `undefined`, not of the runner command recorded/,
    )
  })

  test('refuses a profile whose creator: line is not the tool the run was counted by', async () => {
    await withProfile(
      'go',
      'measured',
      (text) => text.replace(`creator: ${CREATOR}`, 'creator: callgrind-3.21.0'),
      /go adder\/terms-512 measured profile: the profile was written by callgrind-3\.21\.0 where the run was counted by valgrind-3\.22\.0/,
    )
    await withProfile(
      'rust',
      'baseline',
      (text) => text.replace(/^creator: .*\n/m, ''),
      /rust adder\/terms-512 baseline profile: the profile was written by a tool it does not name where the run was counted by valgrind-3\.22\.0/,
    )
    Assert.throws(
      () =>
        checkProfileProvenance({
          label: 'x',
          profile: parseCallgrind(RUST_MEASURED),
          tool: { version: 'valgrind-3.22.0' },
          runner: { command: '.build/measure-rust', arguments: ['--fast'] },
          reference: 'adder/terms-512',
          iterations: 20,
        }),
      /not of the runner command recorded/,
    )
  })

  test('the run report says what its Relative Ir column compares', async () => {
    const report = renderDeterministic(await read()).join('\n')
    Assert.match(report, /^> Counted by valgrind-3\.22\.0/m)
    Assert.match(report, /given `PATH` and `TMPDIR` from the recording host and the settings named here, and nothing else from the shell that recorded the run\. Go ran with `GOMAXPROCS=1`, `GOGC=off`, as read back from the runtime\./)
    Assert.match(report, /^> Relative Ir is each port's instructions per parse over the fewest in the row\. It compares what each process did under its own settings, not like for like: Go ran with the collector off, so that figure carries none of the collector's work, where a port that frees as it goes carries every free in its\. Instructions are comparable with another run's only under the same tool version and the same simulated caches/m)
    Assert.match(report, /\| adder\/terms-512 \| Rust \| 7,777,546 \| .* \| 2\.79× \|/)
    Assert.match(report, /\| adder\/terms-512 \| Go \| 2,790,194 \| .* \| 1\.00× \|/)
    const section = await read()
    section.ports.go.environment = { GOMAXPROCS: '1' }
    section.ports.go.given = { inherited: [], settings: { GOMAXPROCS: '1' } }
    section.ports.rust.given = { inherited: [], settings: {} }
    const plain = renderDeterministic(section).join('\n')
    Assert.match(plain, /given nothing from the recording host and the settings named here/)
    Assert.match(plain, /not like for like\. Instructions are comparable/)
    Assert.doesNotMatch(plain, /collector/)
  })

  test('refuses a run counted through a different command or arguments', async () => {
    await Assert.rejects(
      readWith('rust', (raw) => {
        raw.runner.command = '.build/measure-rust-debug'
      }),
      /rust was counted through a different command/,
    )
    await Assert.rejects(
      readWith('rust', (raw) => {
        raw.runner.arguments = ['--fast']
      }),
      /rust was counted with different arguments/,
    )
  })

  test('refuses a run missing a profile its document names', async () => {
    const profile = Path.join(runDirectory, profilePath('go', 'adder', 'terms-512', 'measured'))
    Fs.renameSync(profile, `${profile}.aside`)
    try {
      await Assert.rejects(read(), /go adder\/terms-512 measured profile is missing from the run/)
    } finally {
      Fs.renameSync(`${profile}.aside`, profile)
    }
  })

  test('refuses totals whose events are not the profile\'s', async () => {
    await Assert.rejects(
      readWith('go', (raw) => {
        const { Ir, ...rest } = raw.cases[0].baseline.totals
        raw.cases[0].baseline.totals = { Instr: Ir, ...rest }
      }),
      /go adder\/terms-512 baseline totals do not match its events/,
    )
  })

  // The totals in the document are held to the totals line of the
  // profile it names, whichever side is edited: a figure in the JSON
  // that the profile on disk does not carry is refused, and so is a
  // profile that no longer says what the JSON recorded from it.
  test('refuses totals that are not the totals line of the profile they name', async () => {
    await Assert.rejects(
      readWith('rust', (raw) => {
        raw.cases[0].measured.totals.Ir = 999_999_999
      }),
      /rust adder\/terms-512 measured totals are not the totals line of raw\/deterministic\/rust\/adder-terms-512\.out/,
    )
    await Assert.rejects(
      readWith('go', (raw) => {
        raw.cases[0].baseline.totals.D1mw -= 1
      }),
      /go adder\/terms-512 baseline totals are not the totals line of raw\/deterministic\/go\/adder-terms-512-baseline\.out/,
    )
    const profile = Path.join(runDirectory, profilePath('rust', 'adder', 'terms-512', 'measured'))
    const original = Fs.readFileSync(profile, 'utf8')
    Fs.writeFileSync(profile, original.replace(/^totals: 157063015/m, 'totals: 157063016'))
    try {
      await Assert.rejects(read(), /rust adder\/terms-512 measured totals are not the totals line of/)
    } finally {
      Fs.writeFileSync(profile, original)
    }
  })

  test('names the document when a profile it points at cannot be read', async () => {
    const profile = Path.join(runDirectory, profilePath('go', 'adder', 'terms-512', 'baseline'))
    const original = Fs.readFileSync(profile, 'utf8')
    Fs.writeFileSync(profile, original.replace(/^totals: .*\n/m, ''))
    try {
      await Assert.rejects(
        read(),
        /go adder\/terms-512 baseline profile: callgrind profile has no totals: line; the dump did not finish/,
      )
    } finally {
      Fs.writeFileSync(profile, original)
    }
  })

  test('refuses a document whose cache geometry is not its profile\'s', async () => {
    await Assert.rejects(
      readWith('go', (raw) => {
        raw.cases[0].caches[1] = 'D1 cache: 65536 B, 64 B, 8-way associative'
      }),
      /go adder\/terms-512 measured profile simulated different caches from the ones recorded/,
    )
  })

  // The section reports one tool and one cache geometry for the run, so
  // every port has to have been counted by that tool and every case
  // against that geometry, rather than the first document speaking for
  // the rest.
  test('refuses ports counted by different tools', async () => {
    await Assert.rejects(
      readWith('rust', (raw) => {
        raw.tool.version = 'valgrind-3.21.0'
      }),
      /rust was counted by valgrind valgrind-3\.21\.0 \(--tool=callgrind --cache-sim=yes --branch-sim=yes\) where go was counted by valgrind valgrind-3\.22\.0/,
    )
    await Assert.rejects(
      readWith('rust', (raw) => {
        raw.tool.arguments = ['--tool=callgrind']
      }),
      /rust was counted by valgrind valgrind-3\.22\.0 \(--tool=callgrind\) where go was counted by/,
    )
  })

  test('refuses cases counted against different simulated caches', async () => {
    // Both of the port's profiles and its document move together, so the
    // check that fires is the one across ports rather than the one
    // between a document and its profile.
    const wider = 'LL cache: 71303168 B, 64 B, 17-way associative'
    const profiles = ['measured', 'baseline'].map((kind) =>
      Path.join(runDirectory, profilePath('rust', 'adder', 'terms-512', kind)),
    )
    const originals = profiles.map((profile) => Fs.readFileSync(profile, 'utf8'))
    for (const [index, profile] of profiles.entries()) {
      Fs.writeFileSync(profile, originals[index].replace(`desc: ${CACHES[2]}`, `desc: ${wider}`))
    }
    try {
      await Assert.rejects(
        readWith('rust', (raw) => {
          raw.cases[0].caches[2] = wider
        }),
        /rust adder\/terms-512 was counted against different simulated caches from the first case counted/,
      )
    } finally {
      for (const [index, profile] of profiles.entries()) Fs.writeFileSync(profile, originals[index])
    }
  })

  test('refuses a loop whose checksum is not the count times one parse', async () => {
    await Assert.rejects(
      readWith('go', (raw) => {
        raw.cases[0].measured.checksum = 9728
      }),
      /go adder\/terms-512: the measured checksum is 9728, and 20 parses of a value checksumming to 512 give 10240/,
    )
    await Assert.rejects(
      readWith('rust', (raw) => {
        raw.cases[0].baseline.checksum = ADDER_PARSE
      }),
      /rust adder\/terms-512: the baseline checksum is 512, and 0 parses of a value checksumming to 512 give 0/,
    )
  })

  test('refuses ports that parsed the same case to different values', async () => {
    await Assert.rejects(
      readWith('rust', (raw) => {
        raw.cases[0].parseChecksum = 513
        raw.cases[0].measured.checksum = 10_260
      }),
      /go and rust parse adder\/terms-512 to different values \(512 and 513\)/,
    )
  })
})

describe('a host without valgrind', () => {
  test('is told what to install, in two lines rather than a stack trace', async () => {
    const result = await valgrindVersion({ command: '/nonexistent/valgrind' })
    Assert.equal(result.available, false)
    Assert.match(result.message, /needs valgrind/)
    Assert.match(result.message, /Install valgrind, or run without --deterministic/)
    Assert.doesNotMatch(result.message, /\n\s+at /)
    // Two lines, what is missing and what to do, which is the shape
    // docs/methodology.md describes.
    Assert.deepEqual(
      result.message.split('\n').map((line) => line.replace(/:.*$/, ':')),
      ['Deterministic mode needs valgrind (--tool=callgrind), and this host has none:', 'Install valgrind, or run without --deterministic.'],
    )
  })

  test('is refused by a program that is not valgrind', async () => {
    const result = await valgrindVersion({ command: 'true' })
    Assert.equal(result.available, false)
    Assert.match(result.message, /`true --version` printed "/)
    Assert.match(result.message, /Install valgrind/)
  })

  test('stops the harness before it builds anything', () => {
    const emptyPath = scratchDirectory(Path.join(Os.tmpdir(), 'measure-no-valgrind-'))
    const result = spawnSync(
      process.execPath,
      ['scripts/run-all.mjs', '--profile', 'smoke', '--output', '.build/never-written', '--deterministic'],
      {
        cwd: repositoryRoot,
        encoding: 'utf8',
        env: { ...process.env, PATH: emptyPath, TABNAS_MEASURE_HOST_KEY: 'deterministic-test' },
      },
    )
    Assert.equal(result.status, 1)
    Assert.match(result.stderr, /Deterministic mode needs valgrind/)
    Assert.doesNotMatch(result.stderr, /\n\s+at /)
    Assert.doesNotMatch(result.stdout, /build/)
    Assert.ok(!Fs.existsSync(Path.join(repositoryRoot, '.build', 'never-written')))
  })

  test('is not this one when the command answers with a valgrind banner, which is then the command counted through', async () => {
    const result = await valgrindVersion({ command: standIns.valgrind })
    Assert.deepEqual(result, { available: true, version: 'valgrind-3.22.0', command: standIns.valgrind })
  })
})
