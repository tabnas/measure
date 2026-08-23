import { cp, mkdir, readdir, rm } from 'node:fs/promises'
import { join } from 'node:path'

import { readJson, repositoryRoot, writeJson } from './common.mjs'

export async function scanRunMatrices() {
  const runsDirectory = join(repositoryRoot, 'results', 'runs')
  await mkdir(runsDirectory, { recursive: true })
  const entries = await readdir(runsDirectory, { withFileTypes: true })
  const matrices = []
  for (const entry of entries.filter((candidate) => candidate.isDirectory())) {
    const matrix = await readJson(join(runsDirectory, entry.name, 'matrix.json'))
    if (matrix.run.id !== entry.name) {
      throw new Error(`Run directory ${entry.name} contains matrix for ${matrix.run.id}`)
    }
    matrices.push(matrix)
  }
  return matrices.sort(
    (left, right) =>
      left.run.generatedAt.localeCompare(right.run.generatedAt) || left.run.id.localeCompare(right.run.id),
  )
}

export function deriveCatalog(matrices) {
  const runs = [...matrices]
    .sort(
      (left, right) =>
        right.run.generatedAt.localeCompare(left.run.generatedAt) ||
        right.run.id.localeCompare(left.run.id),
    )
    .map((matrix) => {
      const host = describeHost(matrix.ports[0].environment)
      const capabilityTotal = matrix.capabilityMatrix.length * matrix.ports.length
      const capabilityPassed = matrix.capabilityMatrix.reduce(
        (count, row) => count + Object.values(row.ports).filter((result) => result.passed).length,
        0,
      )
      return {
        id: matrix.run.id,
        generatedAt: matrix.run.generatedAt,
        profile: matrix.run.profile,
        suiteVersion: matrix.run.suiteVersion,
        repositoryCommit: matrix.run.repositoryCommit,
        repositoryDirty: matrix.run.repositoryDirty,
        matrixPath: `runs/${matrix.run.id}/matrix.json`,
        reportPath: `runs/${matrix.run.id}/README.md`,
        host,
        ports: matrix.ports.map((port) => ({
          id: port.id,
          label: port.label,
          parserModule: port.parserModule,
          parserVersion: port.parserVersion,
          runtime: port.runtime,
          runtimeVersion: port.runtimeVersion,
          environmentFingerprint: port.environment.fingerprint,
        })),
        benchmarks: matrix.benchmarks.map((benchmark) => benchmark.id),
        capability: { passed: capabilityPassed, total: capabilityTotal },
        performanceRows: matrix.performanceMatrix.length,
      }
    })
  return {
    $schema: 'https://tabnas.github.io/measure/schemas/catalog.schema.json',
    schemaVersion: 3,
    latestRunId: runs[0]?.id ?? null,
    runs,
  }
}

export function deriveHistory(matrices) {
  const seriesByKey = new Map()
  for (const matrix of matrices) {
    for (const row of matrix.performanceMatrix) {
      for (const port of matrix.ports) {
        const summary = row.ports[port.id]
        const host = describeHost(port.environment)
        const key = [
          matrix.run.suiteVersion,
          row.benchmarkId,
          row.caseId,
          port.id,
          port.runtime,
          port.runtimeVersion,
          host.fingerprint,
          port.environment.fingerprint,
        ].join('/')
        let series = seriesByKey.get(key)
        if (series === undefined) {
          series = {
            id: key,
            suiteVersion: matrix.run.suiteVersion,
            benchmarkId: row.benchmarkId,
            caseId: row.caseId,
            description: row.description,
            input: row.input,
            portId: port.id,
            portLabel: port.label,
            runtime: port.runtime,
            runtimeVersion: port.runtimeVersion,
            host,
            environmentFingerprint: port.environment.fingerprint,
            environment: port.environment,
            points: [],
          }
          seriesByKey.set(key, series)
        } else {
          series.host = host
          series.environment = port.environment
        }
        series.points.push({
          runId: matrix.run.id,
          generatedAt: matrix.run.generatedAt,
          repositoryCommit: matrix.run.repositoryCommit,
          parserVersion: port.parserVersion,
          hostFingerprint: host.fingerprint,
          medianNs: summary.medianNs,
          p95Ns: summary.p95Ns,
          operationsPerSecond: summary.operationsPerSecond,
          coefficientOfVariationPercent: summary.coefficientOfVariationPercent,
        })
      }
    }
  }
  const series = [...seriesByKey.values()]
  for (const item of series) {
    item.points.sort(
      (left, right) =>
        left.generatedAt.localeCompare(right.generatedAt) || left.runId.localeCompare(right.runId),
    )
  }
  series.sort((left, right) => left.id.localeCompare(right.id))
  return {
    $schema: 'https://tabnas.github.io/measure/schemas/history.schema.json',
    schemaVersion: 3,
    series,
  }
}

export function describeHost(environment) {
  return {
    fingerprint: environment.hostFingerprint,
    environmentFingerprint: environment.fingerprint,
    os: environment.os,
    osName: environment.osName || environment.os,
    kernelVersion: environment.kernelVersion || 'unrecorded',
    arch: environment.arch,
    cpu: environment.cpu,
    logicalCpus: environment.logicalCpus,
    memoryBytes: environment.memoryBytes,
  }
}

export async function rebuildCatalog() {
  const matrices = await scanRunMatrices()
  const catalog = deriveCatalog(matrices)
  await writeJson(join(repositoryRoot, 'results', 'index.json'), catalog)

  const latestDirectory = join(repositoryRoot, 'results', 'latest')
  await rm(latestDirectory, { recursive: true, force: true })
  if (catalog.latestRunId !== null) {
    await cp(join(repositoryRoot, 'results', 'runs', catalog.latestRunId), latestDirectory, {
      recursive: true,
    })
  }
  return { matrices, catalog }
}
