import { readFile, readdir, stat } from 'node:fs/promises'
import { join, relative, resolve } from 'node:path'

import { aggregateRun } from './aggregate.mjs'
import { deriveCatalog, deriveHistory, scanRunMatrices } from './lib/catalog.mjs'
import {
  assert,
  loadConfig,
  loadManifests,
  readJson,
  repositoryRoot,
  sameJson,
  validateSchema,
} from './lib/common.mjs'

async function main() {
  const runArgument = parseRunArgument(process.argv.slice(2))
  await validateDefinitions()
  if (runArgument !== undefined) {
    await validateRun(resolve(repositoryRoot, runArgument), false)
    process.stdout.write(`Validated ${runArgument}\n`)
    return
  }

  const matrices = await scanRunMatrices()
  const runIDs = new Set()
  for (const matrix of matrices) {
    assert(!runIDs.has(matrix.run.id), `Duplicate run id ${matrix.run.id}`)
    runIDs.add(matrix.run.id)
    assert(matrix.run.profile === 'full', `Recorded run ${matrix.run.id} did not use the full profile`)
    assert(!matrix.run.repositoryDirty, `Recorded run ${matrix.run.id} came from a dirty working tree`)
    await validateRun(join(repositoryRoot, 'results', 'runs', matrix.run.id), true)
  }

  const expectedCatalog = deriveCatalog(matrices)
  const actualCatalog = await readJson(join(repositoryRoot, 'results', 'index.json'))
  await validateSchema('catalog.schema.json', actualCatalog, 'results/index.json')
  assert(sameJson(actualCatalog, expectedCatalog), 'results/index.json is stale; rebuild the catalog')

  const siteCatalog = await readJson(join(repositoryRoot, 'site', 'data', 'catalog.json'))
  const siteHistory = await readJson(join(repositoryRoot, 'site', 'data', 'history.json'))
  await validateSchema('catalog.schema.json', siteCatalog, 'site/data/catalog.json')
  await validateSchema('history.schema.json', siteHistory, 'site/data/history.json')
  assert(sameJson(siteCatalog, expectedCatalog), 'site/data/catalog.json is stale')
  assert(sameJson(siteHistory, deriveHistory(matrices)), 'site/data/history.json is stale')

  if (expectedCatalog.latestRunId === null) {
    assert(!(await exists(join(repositoryRoot, 'results', 'latest'))), 'results/latest exists without a run')
  } else {
    await compareDirectories(
      join(repositoryRoot, 'results', 'runs', expectedCatalog.latestRunId),
      join(repositoryRoot, 'results', 'latest'),
    )
  }

  process.stdout.write(
    `Validated ${matrices.length} immutable run${matrices.length === 1 ? '' : 's'}, definitions, catalog, and site data\n`,
  )
}

async function validateDefinitions() {
  const config = await loadConfig()
  const manifests = await loadManifests()
  await validateSchema('config.schema.json', config, 'measure.config.json')
  const portIDs = config.ports.map((port) => port.id)
  assert(new Set(portIDs).size === portIDs.length, 'Port identifiers must be unique')
  const benchmarkIDs = manifests.map((manifest) => manifest.id)
  assert(new Set(benchmarkIDs).size === benchmarkIDs.length, 'Benchmark identifiers must be unique')
  for (const manifest of manifests) {
    await validateSchema('benchmark.schema.json', manifest, `benchmark ${manifest.id}`)
    const directory = join(repositoryRoot, 'benchmarks', manifest.id)
    assert(await exists(directory), `Benchmark ${manifest.id} must live in its matching directory`)
    const caseIDs = [...manifest.capabilityCases, ...manifest.performanceCases].map((testCase) => testCase.id)
    assert(new Set(caseIDs).size === caseIDs.length, `${manifest.id} case identifiers must be unique`)
  }
}

async function validateRun(directory, recorded) {
  const storedMatrix = await readJson(join(directory, 'matrix.json'))
  await validateSchema('matrix.schema.json', storedMatrix, `matrix ${storedMatrix.run.id}`)
  if (recorded) {
    assert(
      directory.endsWith(join('results', 'runs', storedMatrix.run.id)),
      `Run ${storedMatrix.run.id} is stored under a mismatched path`,
    )
  }
  const { matrix, report } = await aggregateRun(directory, { write: false })
  assert(sameJson(matrix, storedMatrix), `${relative(repositoryRoot, directory)}/matrix.json is not derived from raw data`)
  const storedReport = await readFile(join(directory, 'README.md'), 'utf8')
  assert(report === storedReport, `${relative(repositoryRoot, directory)}/README.md is stale`)
}

async function compareDirectories(expectedDirectory, actualDirectory) {
  assert(await exists(actualDirectory), 'results/latest is missing')
  const expectedFiles = await listFiles(expectedDirectory)
  const actualFiles = await listFiles(actualDirectory)
  assert(sameJson(expectedFiles, actualFiles), 'results/latest has a different file set from the newest run')
  for (const path of expectedFiles) {
    const [expected, actual] = await Promise.all([
      readFile(join(expectedDirectory, path)),
      readFile(join(actualDirectory, path)),
    ])
    assert(expected.equals(actual), `results/latest/${path} differs from the newest run`)
  }
}

async function listFiles(directory, prefix = '') {
  const entries = await readdir(join(directory, prefix), { withFileTypes: true })
  const files = []
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const path = join(prefix, entry.name)
    if (entry.isDirectory()) files.push(...(await listFiles(directory, path)))
    else files.push(path)
  }
  return files
}

async function exists(path) {
  try {
    await stat(path)
    return true
  } catch (cause) {
    if (cause?.code === 'ENOENT') return false
    throw cause
  }
}

function parseRunArgument(arguments_) {
  if (arguments_.length === 0) return undefined
  if (arguments_.length === 2 && arguments_[0] === '--run') return arguments_[1]
  throw new Error('Usage: validate-repository.mjs [--run <directory>]')
}

main().catch((cause) => {
  process.stderr.write(`${cause instanceof Error ? cause.stack : String(cause)}\n`)
  process.exitCode = 1
})
