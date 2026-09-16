/* Copyright (c) 2026 Richard Rodger and other contributors, MIT License */

// Invariant 10: a trend line must not imply that measurements taken under
// different conditions form one controlled series.
//
// The environment fingerprint cannot carry this. The aggregator requires
// all ports of a run to report the SAME fingerprint, and each port runs a
// different runtime, so a runtime version can never be part of it. The
// site's history series key does include the runtime version, so its charts
// already break the line. What was missing is a word to the person at the
// terminal, who is about to compare the numbers that just printed against
// the previous run by eye.
//
// It is not a hypothetical. Between two runs recorded minutes apart, this
// harness's container replaced Node 24.21.0 with Node 22.22.2. Go, whose
// code had not changed, moved by its usual few percent. TypeScript moved by
// +106% on `adder/terms-16384` and +57% on `palindrome/chars-32768`. Read
// as a time series, those rows say the parser regressed. They say nothing
// about the parser at all.
//
// The counted section has the same shape of problem with two things the
// environment fingerprint does not cover either: the valgrind version,
// which is the one runtime dependency this repository does not pin, and
// the cache geometry callgrind simulates, which it takes from the host
// it runs on. A run records both and holds every port and case in it to
// them, and a counted run is compared against the previous counted run
// on the same host the way the wall clock is compared against the
// previous run.

import { sameJson } from './common.mjs'

function describeToolchain(port) {
  return `${port.runtime} ${port.runtimeVersion}`
}

// The recorded run the given one follows: same host, same suite version,
// and OLDER -- a run is compared against what came before it, not against
// whatever happens to be newest in the catalog. A run being recorded now is
// not in the catalog yet, so for that case the two readings agree; a run
// looked up after the fact is where they part.
export function comparableRun(matrix, matrices) {
  const host = matrix.ports[0].environment.hostFingerprint
  const order = (candidate) => `${candidate.run.generatedAt}/${candidate.run.id}`
  return matrices.findLast(
    (candidate) =>
      candidate.run.id !== matrix.run.id &&
      order(candidate) < order(matrix) &&
      candidate.ports[0].environment.hostFingerprint === host &&
      candidate.run.suiteVersion === matrix.run.suiteVersion,
  )
}

// One line per port whose runtime changed since that run, empty when the
// toolchain held still or there is nothing to compare against.
export function toolchainChanges(matrix, matrices) {
  const previous = comparableRun(matrix, matrices)
  if (previous === undefined) return []
  const changes = []
  for (const port of matrix.ports) {
    const before = previous.ports.find((candidate) => candidate.id === port.id)
    if (before === undefined || describeToolchain(before) === describeToolchain(port)) continue
    changes.push(`${port.label}: ${describeToolchain(before)} -> ${describeToolchain(port)}`)
  }
  return changes
}

// The counted run the given one follows: the same host, the same suite
// version, older, and counted, since a run without the section has no
// tool version or cache geometry to compare.
export function comparableCountedRun(matrix, matrices) {
  const host = matrix.ports[0].environment.hostFingerprint
  const order = (candidate) => `${candidate.run.generatedAt}/${candidate.run.id}`
  return matrices.findLast(
    (candidate) =>
      candidate.run.id !== matrix.run.id &&
      order(candidate) < order(matrix) &&
      candidate.ports[0].environment.hostFingerprint === host &&
      candidate.run.suiteVersion === matrix.run.suiteVersion &&
      candidate.deterministic !== undefined,
  )
}

// One line per thing the counts depend on that changed since the previous
// counted run: the tool version, and the simulated cache geometry.
// Empty for a run without the section, or with nothing to compare against.
export function countingChanges(matrix, matrices) {
  if (matrix.deterministic === undefined) return []
  const previous = comparableCountedRun(matrix, matrices)
  if (previous === undefined) return []
  const changes = []
  const before = previous.deterministic
  const now = matrix.deterministic
  if (before.tool.version !== now.tool.version) {
    changes.push(`callgrind: ${before.tool.version} -> ${now.tool.version}`)
  }
  if (!sameJson(before.caches, now.caches)) {
    changes.push(`simulated caches: ${before.caches.join('; ')} -> ${now.caches.join('; ')}`)
  }
  return changes
}

export function toolchainWarning(matrix, matrices) {
  const changes = toolchainChanges(matrix, matrices)
  const counting = countingChanges(matrix, matrices)
  if (changes.length === 0 && counting.length === 0) return ''
  const lines = ['']
  if (changes.length > 0) {
    const previous = comparableRun(matrix, matrices)
    lines.push(
      `Toolchain changed since ${previous.run.id}:`,
      ...changes.map((change) => `  ${change}`),
      'Those ports start a new series here. Their numbers are not comparable',
      'with earlier runs on this host, however unchanged the parser is.',
      '',
    )
  }
  if (counting.length > 0) {
    const previous = comparableCountedRun(matrix, matrices)
    lines.push(
      `The counted section's tool changed since ${previous.run.id}:`,
      ...counting.map((change) => `  ${change}`),
      'The counts start a new series here. Instructions and misses are not',
      'comparable with earlier counted runs on this host, whatever the ports did.',
      '',
    )
  }
  lines.push('')
  return lines.join('\n')
}
