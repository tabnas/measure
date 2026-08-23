import { createHash } from 'node:crypto'
import { isDeepStrictEqual } from 'node:util'
import { readFile, readdir } from 'node:fs/promises'
import { arch, cpus, hostname, platform, release, totalmem } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { VERSION as parserVersion } from '@tabnas/parser'

import type {
  BenchmarkManifest,
  CapabilityGroup,
  CapabilityResult,
  MeasureConfig,
  Measurement,
  PerformanceCase,
  Profile,
  RunnerArguments,
} from './model.js'
import { makeParser } from './parsers.js'

const CHECKSUM_MODULUS = 1_000_000_007
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

async function main(): Promise<void> {
  const args = parseArguments(process.argv.slice(2))
  const config = await readJson<MeasureConfig>(resolve(root, args.config))
  const profile = config.profiles[args.profile]
  if (profile === undefined) {
    throw new Error(`Unknown profile: ${args.profile}`)
  }

  const port = config.ports.find((candidate) => candidate.id === 'typescript')
  if (port === undefined) {
    throw new Error('The configuration has no typescript port')
  }
  if (parserVersion !== port.parser.version) {
    throw new Error(
      `Configured ${port.parser.module} ${port.parser.version}, loaded ${parserVersion}`,
    )
  }

  const manifests = await loadManifests(resolve(args.benchmarks))
  const capabilities: CapabilityGroup[] = []
  const measurements: Measurement[] = []

  for (const manifest of manifests) {
    const parser = makeParser(manifest.id)
    capabilities.push(runCapabilities(manifest, parser))
    for (const performanceCase of manifest.performanceCases) {
      measurements.push(runMeasurement(manifest, performanceCase, parser, profile))
    }
  }

  const cpu = cpus()[0]?.model ?? 'unknown'
  const logicalCpus = cpus().length
  const memoryBytes = totalmem()
  const os = platform()
  const osName = await operatingSystemName(os)
  const kernelVersion = release()
  const architecture = canonicalArchitecture(arch())
  const fingerprint = sha256(
    JSON.stringify({ os, osName, kernelVersion, arch: architecture, cpu, logicalCpus, memoryBytes }),
  )

  const result = {
    $schema: 'https://tabnas.github.io/measure/schemas/port-result.schema.json',
    schemaVersion: 1,
    run: {
      id: args.runId,
      generatedAt: args.generatedAt,
      profile: args.profile,
      suiteVersion: config.suiteVersion,
      repositoryCommit: args.commit,
      repositoryDirty: args.dirty,
    },
    port: {
      id: port.id,
      label: port.label,
      language: 'TypeScript',
      runtime: 'Node.js',
      runtimeVersion: process.version,
      parserModule: port.parser.module,
      parserVersion,
    },
    environment: {
      fingerprint,
      os,
      osName,
      kernelVersion,
      arch: architecture,
      cpu,
      logicalCpus,
      memoryBytes,
      hostname: hostname(),
    },
    methodology: {
      scope: 'parse-only-steady-state-sequential',
      ...profile,
    },
    capabilities,
    measurements,
  }

  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
}

function runCapabilities(
  manifest: BenchmarkManifest,
  parser: { parse(source: string): unknown },
): CapabilityGroup {
  const cases: CapabilityResult[] = manifest.capabilityCases.map((testCase) => {
    let accepted = false
    let actual: unknown
    let error: string | undefined
    try {
      actual = parser.parse(testCase.input)
      accepted = true
    } catch (cause) {
      error = cleanError(cause)
    }

    const passed =
      accepted === testCase.accept &&
      (!testCase.accept || isDeepStrictEqual(actual, testCase.expected))
    const result: CapabilityResult = {
      caseId: testCase.id,
      description: testCase.description,
      acceptExpected: testCase.accept,
      accepted,
      passed,
    }
    if ('expected' in testCase) result.expected = testCase.expected
    if (accepted) result.actual = actual
    if (error !== undefined) result.error = error
    return result
  })

  return {
    benchmarkId: manifest.id,
    passed: cases.filter((testCase) => testCase.passed).length,
    total: cases.length,
    cases,
  }
}

function runMeasurement(
  manifest: BenchmarkManifest,
  performanceCase: PerformanceCase,
  parser: { parse(source: string): unknown },
  profile: Profile,
): Measurement {
  const input = generateInput(performanceCase)
  parser.parse(input)

  const warmupUntil = performance.now() + profile.warmupMs
  while (performance.now() < warmupUntil) parser.parse(input)

  let iterations = 1
  while (iterations < profile.maxIterations) {
    const elapsedNs = timeBatch(parser, input, iterations).elapsedNs
    if (elapsedNs >= profile.sampleTargetMs * 1_000_000) break
    iterations = Math.min(iterations * 2, profile.maxIterations)
  }

  globalThis.gc?.()
  let checksum = 0
  const samples: Array<{ elapsedNs: number }> = []
  for (let index = 0; index < profile.samples; index += 1) {
    const sample = timeBatch(parser, input, iterations)
    checksum = (checksum + sample.checksum) % CHECKSUM_MODULUS
    samples.push({ elapsedNs: sample.elapsedNs })
  }

  return {
    benchmarkId: manifest.id,
    caseId: performanceCase.id,
    description: performanceCase.description,
    input: {
      bytes: Buffer.byteLength(input, 'utf8'),
      codeUnits: input.length,
      sha256: sha256(input),
    },
    iterationsPerSample: iterations,
    samples,
    checksum,
  }
}

function timeBatch(
  parser: { parse(source: string): unknown },
  input: string,
  iterations: number,
): { elapsedNs: number; checksum: number } {
  let checksum = 0
  const started = process.hrtime.bigint()
  for (let index = 0; index < iterations; index += 1) {
    checksum = (checksum + checksumValue(parser.parse(input))) % CHECKSUM_MODULUS
  }
  const elapsedNs = Number(process.hrtime.bigint() - started)
  return { elapsedNs, checksum }
}

function checksumValue(value: unknown): number {
  if (typeof value === 'number') return Math.trunc(value) % CHECKSUM_MODULUS
  if (typeof value === 'boolean') return value ? 1 : 0
  return JSON.stringify(value)?.length ?? 0
}

function generateInput(performanceCase: PerformanceCase): string {
  const generator = performanceCase.generator
  if (generator.kind === 'adder-chain') {
    return Array.from({ length: generator.size }, () => String(generator.value)).join('+')
  }

  if (generator.size <= 0 || generator.size % 2 !== 0 || generator.pattern.length === 0) {
    throw new Error(`Invalid even-palindrome generator for ${performanceCase.id}`)
  }
  const halfLength = generator.size / 2
  const half = generator.pattern.repeat(Math.ceil(halfLength / generator.pattern.length)).slice(0, halfLength)
  return half + [...half].reverse().join('')
}

async function loadManifests(benchmarksDirectory: string): Promise<BenchmarkManifest[]> {
  const entries = await readdir(benchmarksDirectory, { withFileTypes: true })
  const manifests = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => readJson<BenchmarkManifest>(join(benchmarksDirectory, entry.name, 'benchmark.json'))),
  )
  return manifests.sort((left, right) => left.id.localeCompare(right.id))
}

async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, 'utf8')) as T
}

function parseArguments(arguments_: string[]): RunnerArguments {
  const values = new Map<string, string>()
  for (let index = 0; index < arguments_.length; index += 1) {
    const key = arguments_[index]
    if (key === undefined || !key.startsWith('--')) {
      throw new Error(`Invalid runner arguments: ${arguments_.join(' ')}`)
    }
    const separator = key.indexOf('=')
    if (separator >= 0) {
      values.set(key.slice(2, separator), key.slice(separator + 1))
      continue
    }
    const value = arguments_[index + 1]
    if (value === undefined) throw new Error(`Missing value for ${key}`)
    values.set(key.slice(2), value)
    index += 1
  }
  const required = (name: string): string => {
    const value = values.get(name)
    if (value === undefined) throw new Error(`Missing --${name}`)
    return value
  }
  const dirty = required('dirty')
  if (dirty !== 'true' && dirty !== 'false') throw new Error('--dirty must be true or false')
  return {
    config: required('config'),
    benchmarks: required('benchmarks'),
    profile: required('profile'),
    runId: required('run-id'),
    generatedAt: required('generated-at'),
    commit: required('commit'),
    dirty: dirty === 'true',
  }
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function canonicalArchitecture(value: string): string {
  if (value === 'x64') return 'amd64'
  if (value === 'ia32') return '386'
  return value
}

async function operatingSystemName(fallback: string): Promise<string> {
  for (const path of ['/etc/os-release', '/usr/lib/os-release']) {
    try {
      const content = await readFile(path, 'utf8')
      const prettyName = content
        .split('\n')
        .find((line) => line.startsWith('PRETTY_NAME='))
      if (prettyName !== undefined) {
        return unquoteOSReleaseValue(prettyName.slice('PRETTY_NAME='.length)) || fallback
      }
    } catch {
      // Distribution metadata is optional; the runtime platform remains useful.
    }
  }
  return fallback
}

function unquoteOSReleaseValue(value: string): string {
  const trimmed = value.trim()
  const unquoted =
    trimmed.length >= 2 &&
    ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'")))
      ? trimmed.slice(1, -1)
      : trimmed
  return unquoted.replaceAll('\\"', '"').replaceAll('\\\\', '\\')
}

function cleanError(cause: unknown): string {
  const message = cause instanceof Error ? cause.message : String(cause)
  return message.replaceAll(/\x1b\[[0-9;]*m/g, '').split('\n')[0]?.slice(0, 500) ?? 'parse error'
}

main().catch((cause: unknown) => {
  process.stderr.write(`${cause instanceof Error ? cause.stack : String(cause)}\n`)
  process.exitCode = 1
})
