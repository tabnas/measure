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
import { comparableRun, toolchainChanges, toolchainWarning } from './lib/toolchain.mjs'

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
