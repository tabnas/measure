/* Copyright (c) 2026 Richard Rodger and other contributors, MIT License */

// The counted mode, without valgrind.
//
// A wall-clock difference of a few percent is inside what binary layout
// alone can do to this suite, so the harness can also count instructions
// under callgrind. That mode is optional and slow, and `npm test` must
// not need valgrind, so what is tested here is everything around the
// tool: the parser that reads its profile, the per-parse arithmetic, the
// schemas accepting a run with the section and every run without it, and
// the path a host without valgrind takes. The fixture text is real: the
// header and totals of profiles the mode captured on this host, with the
// per-function body cut out because the parser never reads it.

import Assert from 'node:assert'
import { spawnSync } from 'node:child_process'
import Fs from 'node:fs'
import Os from 'node:os'
import Path from 'node:path'
import { describe, test } from 'node:test'

import { scanRunMatrices } from './lib/catalog.mjs'
import { loadConfig, readJson, repositoryRoot, sha256 as digest, validateSchema } from './lib/common.mjs'
import {
  CALLGRIND_ARGUMENTS,
  HEADLINE,
  SCHEMA,
  SCHEMA_VERSION,
  deterministicPorts,
  parseCallgrind,
  parseCase,
  perParse,
  profilePath,
  readDeterministic,
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

// `GOMAXPROCS=1 .build/measure-go` at twenty parses of the same case.
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

const header = (totalsLine) =>
  `# callgrind format\nevents: ${EVENTS.join(' ')}\n${totalsLine}\n`

const matrices = await scanRunMatrices()
const config = await loadConfig()
const oldest = matrices[0]
const runDirectoryOf = (runId) => Path.join(repositoryRoot, 'results', 'runs', runId)

describe('callgrind profile parsing', () => {
  test('reads the events, the totals and the cache geometry of a real profile', () => {
    const profile = parseCallgrind(RUST_MEASURED)
    Assert.deepEqual(profile.events, EVENTS)
    Assert.equal(profile.totals.Ir, 157_063_015)
    Assert.equal(profile.totals.Bim, 154_447)
    Assert.equal(Object.keys(profile.totals).length, EVENTS.length)
    Assert.deepEqual(profile.caches, [
      'I1 cache: 32768 B, 64 B, 8-way associative',
      'D1 cache: 32768 B, 64 B, 8-way associative',
      'LL cache: 35651584 B, 64 B, 17-way associative',
    ])
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

  test('reproduces the established Rust-to-Go instruction ratio on the parses alone', () => {
    const ratio = rust.instructions / go.instructions
    Assert.ok(2.5 < ratio && ratio < 3.0, `ratio ${ratio}`)
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
        checksum: 10240,
        events: EVENTS,
        caches: parseCallgrind(RUST_MEASURED).caches,
        measured: {
          iterations: 20,
          totals: parseCallgrind(RUST_MEASURED).totals,
          profile: 'raw/deterministic/rust/adder-terms-512.out',
        },
        baseline: {
          iterations: 0,
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
        caches: parseCallgrind(RUST_MEASURED).caches,
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
  const runDirectory = Fs.mkdtempSync(Path.join(Os.tmpdir(), 'measure-counted-'))
  const input = Array.from({ length: 512 }, () => '1').join('+')
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
        checksum: 10240,
        events: EVENTS,
        caches: parseCallgrind(measured).caches,
        measured: {
          iterations: 20,
          totals: parseCallgrind(measured).totals,
          profile: profilePath(portId, 'adder', 'terms-512', 'measured'),
        },
        baseline: {
          iterations: 0,
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
  })

  test('is absent, not empty, for a run without the section', async () => {
    const plain = Fs.mkdtempSync(Path.join(Os.tmpdir(), 'measure-plain-'))
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
    const emptyPath = Fs.mkdtempSync(Path.join(Os.tmpdir(), 'measure-no-valgrind-'))
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

  test('is not this one, when it is not', async () => {
    const result = await valgrindVersion()
    if (result.available) Assert.match(result.version, /^valgrind-\d/)
    else Assert.match(result.message, /Install valgrind/)
  })
})
