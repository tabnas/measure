import { readFile, readdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import {
  assert,
  formatNumber,
  inputIdentity,
  loadManifests,
  markdownValue,
  readJson,
  repositoryRoot,
  round,
  sameJson,
  validateSchema,
  writeJson,
} from './lib/common.mjs'
import { HEADLINE, readDeterministic } from './lib/deterministic.mjs'
import { summarize } from './lib/statistics.mjs'

export async function aggregateRun(runDirectory, { write = true } = {}) {
  const absoluteRunDirectory = resolve(repositoryRoot, runDirectory)
  const definitionsDirectory = join(absoluteRunDirectory, 'definitions')
  const schemasDirectory = join(definitionsDirectory, 'schemas')
  const config = await readJson(join(definitionsDirectory, 'measure.config.json'))
  const manifests = await loadManifests(join(definitionsDirectory, 'benchmarks'))
  await validateSchema('config.schema.json', config, 'measure.config.json', schemasDirectory)
  for (const manifest of manifests) {
    await validateSchema(
      'benchmark.schema.json',
      manifest,
      `benchmark ${manifest.id}`,
      schemasDirectory,
    )
  }

  const rawDirectory = join(absoluteRunDirectory, 'raw')
  const rawEntries = (await readdir(rawDirectory))
    .filter((entry) => entry.endsWith('.json'))
    .sort()
  assert(rawEntries.length === config.ports.length, `${rawDirectory} has an unexpected raw result count`)

  const rawByPort = new Map()
  for (const entry of rawEntries) {
    const raw = await readJson(join(rawDirectory, entry))
    await validateSchema('port-result.schema.json', raw, `raw result ${entry}`, schemasDirectory)
    assert(!rawByPort.has(raw.port.id), `Duplicate raw result for port ${raw.port.id}`)
    rawByPort.set(raw.port.id, raw)
  }

  const rawResults = config.ports.map((port) => {
    const raw = rawByPort.get(port.id)
    assert(raw !== undefined, `Missing raw result for configured port ${port.id}`)
    return raw
  })
  const canonicalRun = rawResults[0].run
  const canonicalEnvironment = rawResults[0].environment
  for (const raw of rawResults) {
    assert(sameJson(raw.run, canonicalRun), `Run metadata differs for port ${raw.port.id}`)
    assert(
      raw.environment.fingerprint === canonicalEnvironment.fingerprint,
      `${raw.port.id} reports a different machine fingerprint; cross-port runs must share one host`,
    )
    assert(
      sameJson(raw.environment, canonicalEnvironment),
      `${raw.port.id} reports different host details; cross-port runs must share one environment`,
    )
    validatePortMetadata(raw, config)
  }

  const capabilityMatrix = []
  const performanceMatrix = []
  for (const manifest of manifests) {
    for (const capabilityCase of manifest.capabilityCases) {
      const ports = {}
      for (const raw of rawResults) {
        const group = raw.capabilities.find((candidate) => candidate.benchmarkId === manifest.id)
        assert(group !== undefined, `${raw.port.id} omitted capability benchmark ${manifest.id}`)
        assert(group.total === manifest.capabilityCases.length, `${raw.port.id} changed ${manifest.id} case count`)
        assert(group.cases.length === group.total, `${raw.port.id} has inconsistent ${manifest.id} totals`)
        assert(group.passed === group.total, `${raw.port.id} has capability failures in ${manifest.id}`)
        const result = group.cases.find((candidate) => candidate.caseId === capabilityCase.id)
        assert(result !== undefined, `${raw.port.id} omitted ${manifest.id}/${capabilityCase.id}`)
        assert(result.passed, `${raw.port.id} failed ${manifest.id}/${capabilityCase.id}`)
        assert(
          result.acceptExpected === capabilityCase.accept,
          `${raw.port.id} changed the expected acceptance of ${manifest.id}/${capabilityCase.id}`,
        )
        assert(
          result.accepted === capabilityCase.accept,
          `${raw.port.id} reported the wrong acceptance for ${manifest.id}/${capabilityCase.id}`,
        )
        if (capabilityCase.accept) {
          assert(
            sameJson(result.actual, capabilityCase.expected),
            `${raw.port.id} reported the wrong value for ${manifest.id}/${capabilityCase.id}`,
          )
        }
        ports[raw.port.id] = {
          accepted: result.accepted,
          passed: result.passed,
          ...(Object.hasOwn(result, 'actual') ? { actual: result.actual } : {}),
        }
      }
      capabilityMatrix.push({
        benchmarkId: manifest.id,
        caseId: capabilityCase.id,
        description: capabilityCase.description,
        acceptExpected: capabilityCase.accept,
        ...(Object.hasOwn(capabilityCase, 'expected') ? { expected: capabilityCase.expected } : {}),
        ports,
      })
    }

    for (const performanceCase of manifest.performanceCases) {
      const source = await readFile(
        join(definitionsDirectory, 'inputs', manifest.id, `${performanceCase.id}.txt`),
        'utf8',
      )
      const expectedInput = inputIdentity(source)
      const ports = {}
      for (const raw of rawResults) {
        const measurement = raw.measurements.find(
          (candidate) =>
            candidate.benchmarkId === manifest.id && candidate.caseId === performanceCase.id,
        )
        assert(measurement !== undefined, `${raw.port.id} omitted ${manifest.id}/${performanceCase.id}`)
        assert(
          sameJson(measurement.input, expectedInput),
          `${raw.port.id} generated a different input for ${manifest.id}/${performanceCase.id}`,
        )
        assert(
          measurement.samples.length === config.profiles[raw.run.profile].samples,
          `${raw.port.id} used the wrong sample count for ${manifest.id}/${performanceCase.id}`,
        )
        assert(
          measurement.iterationsPerSample <= config.profiles[raw.run.profile].maxIterations,
          `${raw.port.id} exceeded the iteration cap for ${manifest.id}/${performanceCase.id}`,
        )
        ports[raw.port.id] = {
          iterationsPerSample: measurement.iterationsPerSample,
          sampleCount: measurement.samples.length,
          checksum: measurement.checksum,
          environmentFingerprint: raw.environment.fingerprint,
          ...summarize(measurement.samples, measurement.iterationsPerSample, measurement.input.bytes),
        }
      }
      const slowestThroughput = Math.min(
        ...Object.values(ports).map((summary) => summary.operationsPerSecond),
      )
      const relativeThroughput = Object.fromEntries(
        Object.entries(ports).map(([portId, summary]) => [
          portId,
          round(summary.operationsPerSecond / slowestThroughput, 3),
        ]),
      )
      performanceMatrix.push({
        benchmarkId: manifest.id,
        caseId: performanceCase.id,
        description: performanceCase.description,
        input: expectedInput,
        ports,
        relativeThroughput,
      })
    }
  }

  for (const raw of rawResults) {
    assert(
      raw.capabilities.length === manifests.length,
      `${raw.port.id} reported an unexpected capability benchmark`,
    )
    const expectedMeasurementCount = manifests.reduce(
      (count, manifest) => count + manifest.performanceCases.length,
      0,
    )
    assert(
      raw.measurements.length === expectedMeasurementCount,
      `${raw.port.id} reported an unexpected performance case`,
    )
    const measurementKeys = raw.measurements.map(
      (measurement) => `${measurement.benchmarkId}/${measurement.caseId}`,
    )
    assert(
      new Set(measurementKeys).size === measurementKeys.length,
      `${raw.port.id} reported duplicate performance cases`,
    )
  }

  // Present only for a run made with --deterministic. Every run recorded
  // before the mode existed lacks it, and stays exactly as it was.
  const deterministic = await readDeterministic({
    runDirectory: absoluteRunDirectory,
    config,
    manifests,
    canonicalRun,
    validate: (schemaFile, value, label) => validateSchema(schemaFile, value, label, schemasDirectory),
  })

  const matrix = {
    $schema: 'https://tabnas.github.io/measure/schemas/matrix.schema.json',
    schemaVersion: rawResults[0].schemaVersion,
    run: canonicalRun,
    ports: rawResults.map((raw) => ({ ...raw.port, environment: raw.environment })),
    benchmarks: manifests.map((manifest) => ({
      id: manifest.id,
      title: manifest.title,
      summary: manifest.summary,
      classification: manifest.classification,
      reference: manifest.reference,
    })),
    capabilityMatrix,
    performanceMatrix,
    ...(deterministic === undefined ? {} : { deterministic }),
  }
  await validateSchema(
    'matrix.schema.json',
    matrix,
    `matrix ${canonicalRun.id}`,
    schemasDirectory,
  )
  const report = renderReport(matrix)
  if (write) {
    await writeJson(join(absoluteRunDirectory, 'matrix.json'), matrix)
    await writeFile(join(absoluteRunDirectory, 'README.md'), report)
  }
  return { matrix, report }
}

function validatePortMetadata(raw, config) {
  const configured = config.ports.find((candidate) => candidate.id === raw.port.id)
  assert(configured !== undefined, `Unconfigured port ${raw.port.id}`)
  assert(raw.port.label === configured.label, `${raw.port.id} changed its configured label`)
  assert(raw.port.parserModule === configured.parser.module, `${raw.port.id} parser module differs`)
  assert(raw.port.parserVersion === configured.parser.version, `${raw.port.id} parser version differs`)
  assert(raw.run.suiteVersion === config.suiteVersion, `${raw.port.id} suite version differs`)
  const profile = config.profiles[raw.run.profile]
  assert(profile !== undefined, `${raw.port.id} used an unknown profile`)
  assert(
    sameJson(raw.methodology, { scope: 'parse-only-steady-state-sequential', ...profile }),
    `${raw.port.id} methodology differs from profile ${raw.run.profile}`,
  )
}

export function renderReport(matrix) {
  const environment = matrix.ports[0].environment
  const lines = [
    `# Tabnas measurement — ${matrix.run.id}`,
    '',
    `Generated ${matrix.run.generatedAt} from suite \`${matrix.run.suiteVersion}\` at commit \`${matrix.run.repositoryCommit}\`${matrix.run.repositoryDirty ? ' (dirty working tree)' : ''}.`,
    '',
    '> These are steady-state, sequential, parse-only measurements on the recorded host. Parser construction, process startup, and compilation are excluded. Compare values inside this run; do not treat workstation results as universal rankings.',
    '',
    '## Recorded host',
    '',
    '| Field | Value |',
    '| --- | --- |',
    `| Host fingerprint | ${markdownValue(environment.hostFingerprint)} |`,
    `| Operating system | ${markdownValue(`${environment.osName} (${environment.os}/${environment.arch})`)} |`,
    `| Kernel | ${markdownValue(environment.kernelVersion)} |`,
    `| Processor | ${markdownValue(environment.cpu)} |`,
    `| Logical CPUs | ${formatNumber(environment.logicalCpus, 0)} |`,
    `| Memory | ${formatNumber(environment.memoryBytes / 2 ** 30, 2)} GiB (${formatNumber(environment.memoryBytes, 0)} bytes) |`,
    `| Environment fingerprint | ${markdownValue(environment.fingerprint)} |`,
    '',
    '## Ports and runtimes',
    '',
    '| Port | Parser | Runtime |',
    '| --- | --- | --- |',
    ...matrix.ports.map(
      (port) =>
        `| ${port.label} | \`${port.parserModule}@${port.parserVersion}\` | ${port.runtime} ${port.runtimeVersion} |`,
    ),
    '',
  ]

  for (const benchmark of matrix.benchmarks) {
    lines.push(`## ${benchmark.title}`, '', benchmark.summary, '', '### Capability matrix', '')
    lines.push(
      `| Case | Expected | ${matrix.ports.map((port) => port.label).join(' | ')} |`,
      `| --- | --- | ${matrix.ports.map(() => '---').join(' | ')} |`,
    )
    for (const row of matrix.capabilityMatrix.filter((candidate) => candidate.benchmarkId === benchmark.id)) {
      const expected = row.acceptExpected ? markdownValue(row.expected) : 'reject'
      const cells = matrix.ports.map((port) => {
        const result = row.ports[port.id]
        return result.passed
          ? result.accepted
            ? `pass ${markdownValue(result.actual)}`
            : 'pass (rejected)'
          : 'FAIL'
      })
      lines.push(`| ${row.caseId} | ${expected} | ${cells.join(' | ')} |`)
    }

    lines.push('', '### Performance matrix', '')
    lines.push(
      `| Input | Bytes | ${matrix.ports.map((port) => `${port.label} median / ops·s⁻¹ / relative`).join(' | ')} |`,
      `| --- | ---: | ${matrix.ports.map(() => '---:').join(' | ')} |`,
    )
    for (const row of matrix.performanceMatrix.filter((candidate) => candidate.benchmarkId === benchmark.id)) {
      const cells = matrix.ports.map((port) => {
        const summary = row.ports[port.id]
        return `${formatNumber(summary.medianNs)} ns / ${formatNumber(summary.operationsPerSecond, 0)} / ${formatNumber(row.relativeThroughput[port.id], 2)}×`
      })
      lines.push(`| ${row.caseId} | ${row.input.bytes} | ${cells.join(' | ')} |`)
    }
    lines.push('')
  }

  if (matrix.deterministic !== undefined) {
    lines.push(...renderDeterministic(matrix.deterministic))
  }

  lines.push(
    '## Raw evidence',
    '',
    ...matrix.ports.map((port) => `- [${port.label} raw samples](raw/${port.id}.json)`),
    ...(matrix.deterministic === undefined
      ? []
      : Object.entries(matrix.deterministic.ports).map(
          ([portId, port]) => `- [${port.label} callgrind counts](raw/deterministic/${portId}.json)`,
        )),
    '',
    'Statistics: median is p50; p95 is linearly interpolated; standard deviation is the sample standard deviation. Relative throughput is normalized to the slowest port in each row (1.00×).',
    '',
  )
  return lines.join('\n')
}

const HEADLINE_LABELS = {
  instructions: 'Ir',
  d1ReadMisses: 'D1 read misses',
  d1WriteMisses: 'D1 write misses',
  llDataMisses: 'LL data misses',
  branches: 'branches',
  mispredicts: 'mispredicts',
}

function renderDeterministic(deterministic) {
  const portIds = Object.keys(deterministic.ports)
  const environments = portIds
    .filter((portId) => Object.keys(deterministic.ports[portId].environment).length > 0)
    .map(
      (portId) =>
        `${deterministic.ports[portId].label} ran with ${Object.entries(deterministic.ports[portId].environment)
          .map(([name, value]) => `\`${name}=${value}\``)
          .join(', ')}`,
    )
  const lines = [
    '## Deterministic metrics',
    '',
    `> Counted by ${deterministic.tool.version} (\`${deterministic.tool.arguments.join(' ')}\`), not timed. Each figure is per parse: the process counted at ${deterministic.iterations} parses, less the same process counted at zero, divided by ${deterministic.iterations}; both processes parse once before the counted loop, so first-use work is in the baseline too. Instruction count clears the layout floor that wall clock cannot; the cache and branch counters vary more between runs and are secondary evidence.${environments.length ? ` ${environments.join('; ')}, as read back from the runtime.` : ''}`,
    '',
    `Simulated caches: ${deterministic.caches.map((cache) => `\`${cache}\``).join(', ')}.`,
    '',
    `| Case | Port | ${Object.values(HEADLINE_LABELS).join(' / parse | ')} / parse | Relative Ir |`,
    `| --- | --- | ${Object.keys(HEADLINE_LABELS).map(() => '---:').join(' | ')} | ---: |`,
  ]
  for (const row of deterministic.rows) {
    for (const portId of portIds) {
      const summary = row.ports[portId]
      const cells = Object.keys(HEADLINE).map((metric) => formatNumber(summary.perParse[metric], 0))
      lines.push(
        `| ${row.benchmarkId}/${row.caseId} | ${deterministic.ports[portId].label} | ${cells.join(' | ')} | ${formatNumber(row.relativeInstructions[portId], 2)}× |`,
      )
    }
  }
  lines.push(
    '',
    ...deterministic.rows.flatMap((row) =>
      portIds.map(
        (portId) =>
          `- [${deterministic.ports[portId].label} ${row.benchmarkId}/${row.caseId} profile](${row.ports[portId].profile}) (annotate with \`callgrind_annotate\`)`,
      ),
    ),
    '',
  )
  return lines
}

function parseCLI(arguments_) {
  const index = arguments_.indexOf('--run')
  if (index < 0 || arguments_[index + 1] === undefined) throw new Error('Usage: aggregate.mjs --run <directory>')
  return arguments_[index + 1]
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  aggregateRun(parseCLI(process.argv.slice(2))).catch((cause) => {
    process.stderr.write(`${cause instanceof Error ? cause.stack : String(cause)}\n`)
    process.exitCode = 1
  })
}
