export interface MeasureConfig {
  schemaVersion: number
  suiteVersion: string
  profiles: Record<string, Profile>
  ports: PortConfig[]
}

export interface Profile {
  warmupMs: number
  sampleTargetMs: number
  samples: number
  maxIterations: number
}

export interface PortConfig {
  id: string
  label: string
  parser: { module: string; version: string }
  command: string
  arguments: string[]
}

export interface BenchmarkManifest {
  schemaVersion: number
  id: string
  title: string
  summary: string
  classification: string[]
  reference: { label: string; url: string }
  capabilityCases: CapabilityCase[]
  performanceCases: PerformanceCase[]
}

export interface CapabilityCase {
  id: string
  description: string
  input: string
  accept: boolean
  expected?: unknown
}

export interface PerformanceCase {
  id: string
  description: string
  generator:
    | { kind: 'adder-chain'; size: number; value: number }
    | { kind: 'even-palindrome'; size: number; pattern: string }
}

export interface RunnerArguments {
  config: string
  benchmarks: string
  profile: string
  runId: string
  generatedAt: string
  commit: string
  dirty: boolean
  hostId: string
  hostLabel: string
}

export interface ParserAdapter {
  parse(source: string): unknown
}

export interface CapabilityResult {
  caseId: string
  description: string
  acceptExpected: boolean
  accepted: boolean
  passed: boolean
  expected?: unknown
  actual?: unknown
  error?: string
}

export interface CapabilityGroup {
  benchmarkId: string
  passed: number
  total: number
  cases: CapabilityResult[]
}

export interface Measurement {
  benchmarkId: string
  caseId: string
  description: string
  input: { bytes: number; codeUnits: number; sha256: string }
  iterationsPerSample: number
  samples: Array<{ elapsedNs: number }>
  checksum: number
}
