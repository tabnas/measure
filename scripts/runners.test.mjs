/* Copyright (c) 2026 Richard Rodger and other contributors, MIT License */

// The counted mode of the built runners, run natively.
//
// `npm test` runs this after the smoke run has built every port, and it
// runs each counted port's `--deterministic` mode with no valgrind
// around it: the same parses, with nothing counting them. The documents
// are held to what the harness holds them to under callgrind, through
// the same function, and to each other through the same identity check.
// So the contract the counted section rests on is tested by every
// `npm test`, on a host with or without valgrind, against the engines
// the harness measures rather than stand-ins for them.

import Assert from 'node:assert'
import { execFile } from 'node:child_process'
import Fs from 'node:fs'
import Path from 'node:path'
import { describe, test } from 'node:test'
import { promisify } from 'node:util'

import { generateInput, inputIdentity, loadConfig, loadManifests, repositoryRoot } from './lib/common.mjs'
import {
  checkPortIdentity,
  checkRunnerDocument,
  deterministicPorts,
  loopChecksum,
  parseCase,
} from './lib/deterministic.mjs'

const execute = promisify(execFile)
const config = await loadConfig()
const manifests = await loadManifests()
const ports = deterministicPorts(config)

for (const port of ports) {
  Assert.ok(
    Fs.existsSync(Path.join(repositoryRoot, port.command)),
    `${port.command} is not built; run \`npm run build\` first`,
  )
}

async function counted(port, reference, iterations, environment = port.deterministic.environment ?? {}) {
  const { stdout } = await execute(
    port.command,
    [
      ...port.arguments,
      '--config=measure.config.json',
      '--benchmarks=benchmarks',
      `--deterministic=${reference}`,
      `--iterations=${iterations}`,
    ],
    { cwd: repositoryRoot, encoding: 'utf8', env: { ...process.env, ...environment } },
  )
  return JSON.parse(stdout)
}

describe('the counted mode of every built runner', () => {
  for (const reference of config.deterministic.cases) {
    test(`${reference}: every port parses it once and then the count asked, to one value`, async () => {
      const { benchmarkId, caseId } = parseCase(reference)
      const performanceCase = manifests
        .find((manifest) => manifest.id === benchmarkId)
        .performanceCases.find((candidate) => candidate.id === caseId)
      const input = inputIdentity(generateInput(performanceCase))
      const documents = []
      for (const port of ports) {
        const three = checkRunnerDocument({
          port,
          reference,
          iterations: 3,
          result: await counted(port, reference, 3),
        })
        const none = checkRunnerDocument({
          port,
          reference,
          iterations: 0,
          result: await counted(port, reference, 0),
        })
        Assert.deepEqual(three.input, input, `${port.id} parsed a different input from the harness's`)
        Assert.deepEqual(none.input, input)
        Assert.equal(none.parseChecksum, three.parseChecksum, `${port.id} parses to one value whatever the count`)
        Assert.equal(three.checksum, loopChecksum(three.parseChecksum, 3))
        Assert.equal(none.checksum, 0)
        Assert.deepEqual(none.environment, three.environment)
        documents.push({
          port: { id: port.id },
          cases: [
            {
              benchmarkId,
              caseId,
              input: three.input,
              parseChecksum: three.parseChecksum,
              measured: { checksum: three.checksum },
            },
          ],
        })
      }
      checkPortIdentity(documents)
    })
  }

  test('the Go runner reports the settings its runtime has, whatever it was meant to have', async () => {
    const go = ports.find((port) => port.id === 'go')
    Assert.ok(go !== undefined, 'the Go port is counted')
    const reference = config.deterministic.cases[0]
    const result = await counted(go, reference, 1, { GOMAXPROCS: '2', GOGC: '150' })
    Assert.deepEqual(result.environment, { GOMAXPROCS: '2', GOGC: '150' })
    Assert.throws(
      () => checkRunnerDocument({ port: go, reference, iterations: 1, result }),
      /the runner ran under GOMAXPROCS=2 where the config says GOMAXPROCS=1/,
    )
  })
})
