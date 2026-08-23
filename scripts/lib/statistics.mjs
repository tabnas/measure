import { round } from './common.mjs'

export function summarize(samples, iterations, inputBytes) {
  const perOperation = samples.map((sample) => sample.elapsedNs / iterations).sort((a, b) => a - b)
  const mean = perOperation.reduce((sum, value) => sum + value, 0) / perOperation.length
  const variance =
    perOperation.length > 1
      ? perOperation.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
        (perOperation.length - 1)
      : 0
  const median = percentile(perOperation, 0.5)
  const opsPerSecond = 1_000_000_000 / median
  return {
    minNs: round(perOperation[0]),
    medianNs: round(median),
    p95Ns: round(percentile(perOperation, 0.95)),
    maxNs: round(perOperation.at(-1)),
    meanNs: round(mean),
    standardDeviationNs: round(Math.sqrt(variance)),
    coefficientOfVariationPercent: round(mean === 0 ? 0 : (Math.sqrt(variance) / mean) * 100),
    operationsPerSecond: round(opsPerSecond),
    sourceMiBPerSecond: round((opsPerSecond * inputBytes) / (1024 * 1024)),
  }
}

function percentile(sorted, probability) {
  const position = (sorted.length - 1) * probability
  const lower = Math.floor(position)
  const upper = Math.ceil(position)
  if (lower === upper) return sorted[lower]
  const weight = position - lower
  return sorted[lower] * (1 - weight) + sorted[upper] * weight
}
