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
  SCHEMA,
  SCHEMA_VERSION,
  checkPortIdentity,
  checkRunnerDocument,
  deterministicPorts,
  loopChecksum,
  parseCallgrind,
  parseCase,
  perParse,
  profilePath,
  readDeterministic,
  recordDeterministic,
  redactPaths,
  valgrindVersion,
} from './lib/deterministic.mjs'

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

const header = (totalsLine) =>
  `# callgrind format\nevents: ${EVENTS.join(' ')}\n${totalsLine}\n`

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
// logs what it was asked to run and under what settings, and then runs
// the command it was given. The runner stand-in reads the snapshot's
// manifest, prints the document a port prints, reports the settings the
// harness passed it exactly as a runtime would, and misbehaves on
// request in the ways the harness has to refuse.
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
const port = args.find((argument) => argument.startsWith('--port=')).slice('--port='.length)
const iterations = Number(args.find((argument) => argument.startsWith('--iterations=')).slice('--iterations='.length))
const totals = readFileSync(join(here, port + '-' + (iterations > 0 ? 'measured' : 'baseline') + '.totals'), 'utf8').trim()
// The cmd: line carries the paths the harness passed, as the real tool's
// does, so the recorded copy has to have them replaced.
writeFileSync(outFile, [
  '# callgrind format', 'version: 1', 'creator: valgrind-stand-in', 'pid: ' + process.pid,
  'cmd:  ' + command + ' ' + args.join(' '), 'part: 1', '',
  ${JSON.stringify(CACHES.map((cache) => `desc: ${cache}`))}.join('\\n'), '',
  'positions: line', 'events: ${EVENTS.join(' ')}', totals.replace('totals:', 'summary:'), '', totals, '',
].join('\\n'))
appendFileSync(process.env.MEASURE_STAND_IN_LOG, JSON.stringify({
  options, command, args, GOMAXPROCS: process.env.GOMAXPROCS ?? null, GOGC: process.env.GOGC ?? null,
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
const input = generateInput(manifest.performanceCases.find((candidate) => candidate.id === caseId))
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
  case 'collector-on': environment.GOGC = '100'; break
  case 'silent': for (const name of Object.keys(environment)) delete environment[name]; break
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
    Fs.writeFileSync(Path.join(definitionsDirectory, 'inputs', 'adder', 'terms-512.txt'), adderInput)
    return { runDirectory, definitionsDirectory }
  }
  const standInPort = (id, label, environment, misbehave) => ({
    id,
    label,
    parser: { module: `stand-in-${id}`, version: '0.0.0' },
    manifests: [],
    command: process.execPath,
    arguments: [standIns.runner, `--port=${id}`, ...(misbehave === undefined ? [] : [`--misbehave=${misbehave}`])],
    deterministic: environment === undefined ? {} : { environment },
  })
  const run = { ...oldest.run }
  // A run staged for recording: its directory, its snapshot, and a config
  // whose two ports are the stand-in runner, misbehaving where asked.
  const stage = ({ go, rust } = {}) => {
    const staged = freshRun()
    staged.standInConfig = {
      ...config,
      deterministic: { iterations: 20, cases: ['adder/terms-512'] },
      ports: [
        standInPort('go', 'Go', { GOMAXPROCS: '1', GOGC: 'off' }, go),
        standInPort('rust', 'Rust', undefined, rust),
      ],
    }
    Fs.writeFileSync(
      Path.join(staged.definitionsDirectory, 'measure.config.json'),
      JSON.stringify(staged.standInConfig),
    )
    return staged
  }
  const record = async (staged) => {
    const log = Path.join(staged.runDirectory, 'stand-in-invocations.jsonl')
    process.env.MEASURE_STAND_IN_LOG = log
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
      delete process.env.MEASURE_STAND_IN_LOG
    }
    const invocations = Fs.readFileSync(log, 'utf8').trim().split('\n').map((line) => JSON.parse(line))
    return { ...staged, invocations }
  }
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
    Assert.deepEqual(
      under('go').map((invocation) => [invocation.GOMAXPROCS, invocation.GOGC, invocation.args.at(-1)]),
      [['1', 'off', '--iterations=20'], ['1', 'off', '--iterations=0']],
    )
    Assert.deepEqual(
      under('rust').map((invocation) => [invocation.GOMAXPROCS, invocation.GOGC, invocation.args.at(-1)]),
      [[null, null, '--iterations=20'], [null, null, '--iterations=0']],
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
      go: { label: 'Go', environment: { GOMAXPROCS: '1', GOGC: 'off' } },
      rust: { label: 'Rust', environment: {} },
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
    runner: { command: '.build/measure-rust', arguments: [], environment: {} },
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
        ports: { rust: { label: 'Rust', environment: {} } },
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
    runner: { command: `.build/measure-${portId}`, arguments: [], environment },
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
    Fs.writeFileSync(Path.join(runDirectory, profilePath(portId, 'adder', 'terms-512', 'baseline')), header(baseline))
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
  test('is told what to install, in a sentence rather than a stack trace', async () => {
    const result = await valgrindVersion({ command: '/nonexistent/valgrind' })
    Assert.equal(result.available, false)
    Assert.match(result.message, /needs valgrind/)
    Assert.match(result.message, /Install valgrind, or run without --deterministic/)
    Assert.doesNotMatch(result.message, /\n\s+at /)
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
