/* Copyright (c) 2026 Richard Rodger and other contributors, MIT License */

// The recorded runs this exercises are real: 20260915T191334778Z ran on
// Node 24.21.0 and 20260915T192906755Z, two minutes later on the same
// host, ran on Node 22.22.2 because the container had been replaced. Both
// report the same environment fingerprint, which is correct -- it is the
// same machine -- and is exactly why the fingerprint cannot be what
// answers this question.

import Assert from 'node:assert'
import { describe, test } from 'node:test'

import { scanRunMatrices } from './lib/catalog.mjs'
import {
  comparableCountedRun,
  comparableRun,
  countingChanges,
  toolchainChanges,
  toolchainWarning,
} from './lib/toolchain.mjs'

const matrices = await scanRunMatrices()
const at = (prefix) => {
  const matrix = matrices.find((candidate) => candidate.run.id.startsWith(prefix))
  Assert.ok(matrix, `no recorded run starts with ${prefix}`)
  return matrix
}

describe('toolchain discontinuity', () => {
  test('reports a runtime that changed under an unchanged fingerprint', () => {
    const before = at('20260915T191334778Z')
    const after = at('20260915T192906755Z')
    Assert.equal(
      before.ports[0].environment.fingerprint,
      after.ports[0].environment.fingerprint,
      'the two runs are on one machine, so the fingerprint cannot flag this',
    )

    const changes = toolchainChanges(after, matrices)
    Assert.deepEqual(changes, ['TypeScript / Node.js: Node.js v24.21.0 -> Node.js v22.22.2'])

    const warning = toolchainWarning(after, matrices)
    Assert.match(warning, /Toolchain changed since 20260915T191334778Z/)
    Assert.match(warning, /not comparable/)
  })

  test('says nothing when the toolchain held still', () => {
    const matrix = at('20260915T193109014Z')
    Assert.deepEqual(toolchainChanges(matrix, matrices), [])
    Assert.equal(toolchainWarning(matrix, matrices), '')
  })

  test('compares against the run before it, not the newest one', () => {
    const matrix = at('20260915T191334778Z')
    Assert.ok(comparableRun(matrix, matrices).run.id.startsWith('20260915T191142310Z'))
  })

  test('has nothing to compare the first run against', () => {
    Assert.deepEqual(toolchainChanges(matrices[0], matrices), [])
  })
})

// No recorded run carries the counted section yet, so the runs here are
// the recorded ones with a section put on them: the same host, counted
// by one tool with one argument list against one geometry, and then by
// another.
describe('counted-section discontinuity', () => {
  const ARGUMENTS = ['--tool=callgrind', '--cache-sim=yes', '--branch-sim=yes']
  const counted = (matrix, tool, caches, callgrindArguments = ARGUMENTS) => ({
    ...matrix,
    deterministic: {
      tool: { name: 'valgrind', version: tool, arguments: [...callgrindArguments] },
      iterations: 20,
      caches,
      ports: {},
      rows: [],
    },
  })
  const narrow = ['I1 cache: 32768 B, 64 B, 8-way associative', 'D1 cache: 32768 B, 64 B, 8-way associative', 'LL cache: 35651584 B, 64 B, 17-way associative']
  const wide = [...narrow.slice(0, 2), 'LL cache: 71303168 B, 64 B, 17-way associative']
  const first = counted(at('20260915T192906755Z'), 'valgrind-3.22.0', narrow)
  const uncounted = at('20260915T193109014Z')
  const same = counted(at('20260915T204238333Z'), 'valgrind-3.22.0', narrow)
  const otherTool = counted(at('20260915T204429053Z'), 'valgrind-3.23.0', narrow)
  const otherCaches = counted(at('20260915T204429053Z'), 'valgrind-3.22.0', wide)
  // The same list spelled out again, so the check is on what the
  // arguments are and not on which array object carries them.
  const sameArguments = counted(at('20260915T204429053Z'), 'valgrind-3.22.0', narrow, [...ARGUMENTS])
  const otherArguments = counted(at('20260915T204429053Z'), 'valgrind-3.22.0', narrow, [...ARGUMENTS, '--cache-sim=no'])
  const series = [first, uncounted, same]

  test('compares against the previous counted run, skipping runs without the section', () => {
    Assert.equal(comparableCountedRun(same, series).run.id, first.run.id)
    Assert.equal(comparableCountedRun(uncounted, series).run.id, first.run.id, 'a run without the section still has a counted predecessor')
    Assert.equal(comparableCountedRun(first, series), undefined, 'the first counted run has none before it')
    Assert.deepEqual(countingChanges(same, series), [])
    Assert.deepEqual(countingChanges(uncounted, series), [], 'a run without the section has nothing to compare')
    Assert.deepEqual(countingChanges(first, series), [], 'the first counted run has nothing to compare against')
  })

  test('reports a tool version or a simulated cache geometry that changed', () => {
    Assert.deepEqual(countingChanges(otherTool, [...series, otherTool]), ['callgrind: valgrind-3.22.0 -> valgrind-3.23.0'])
    Assert.deepEqual(countingChanges(otherCaches, [...series, otherCaches]), [
      `simulated caches: ${narrow.join('; ')} -> ${wide.join('; ')}`,
    ])
    const warning = toolchainWarning(otherTool, [...series, otherTool])
    Assert.match(warning, /The counted section's tool changed since 20260915T204238333Z/)
    Assert.match(warning, /callgrind: valgrind-3\.22\.0 -> valgrind-3\.23\.0/)
    Assert.match(warning, /not\ncomparable with earlier counted runs/)
    Assert.doesNotMatch(warning, /Toolchain changed/, 'the runtimes held still')
  })

  test('reports a changed argument list as a discontinuity, and an unchanged one as none', () => {
    Assert.deepEqual(countingChanges(sameArguments, [...series, sameArguments]), [])
    Assert.deepEqual(countingChanges(otherArguments, [...series, otherArguments]), [
      `callgrind arguments: ${ARGUMENTS.join(' ')} -> ${[...ARGUMENTS, '--cache-sim=no'].join(' ')}`,
    ])
    const warning = toolchainWarning(otherArguments, [...series, otherArguments])
    Assert.match(warning, /The counted section's tool changed since 20260915T204238333Z/)
    Assert.match(warning, /callgrind arguments: .* -> .*--cache-sim=no/)
    Assert.match(warning, /not\ncomparable with earlier counted runs/)
  })

  test('says nothing when the tool, its arguments and the geometry held still', () => {
    Assert.equal(toolchainWarning(same, series), '')
    Assert.equal(toolchainWarning(sameArguments, [...series, sameArguments]), '')
  })
})
