/* Copyright (c) 2026 Richard Rodger and other contributors, MIT License */

// Can a recorded run still say which parser it measured?
//
// Invariant 8 pins the Rust crate by git revision, because it is unpublished
// and untagged. Invariant 11 says every run carries the manifests used to
// produce it. Between them, the run that measured a revision has to carry
// the file that names it -- otherwise the only link is the run's
// `repositoryCommit`, and a rebase or a squash takes that commit away while
// the run stays. Every port reports its parser as an in-tree version, and on
// a branch that moves the pin repeatedly those versions are all identical,
// so the version answers nothing.

import Assert from 'node:assert'
import Fs from 'node:fs'
import Path from 'node:path'
import { describe, test } from 'node:test'

import { loadConfig, repositoryRoot } from './lib/common.mjs'
import { scanRunMatrices } from './lib/catalog.mjs'

const config = await loadConfig()
const matrices = await scanRunMatrices()

const manifestsOf = (runId) =>
  Path.join(repositoryRoot, 'results', 'runs', runId, 'definitions', 'manifests')

describe('run provenance', () => {
  test('every port names the files that pin it, and they are on disk', () => {
    for (const port of config.ports) {
      Assert.ok(port.manifests?.length, `${port.id} names no pinning manifest`)
      for (const manifest of port.manifests) {
        Assert.ok(
          Fs.existsSync(Path.join(repositoryRoot, manifest)),
          `${port.id} names ${manifest}, which is not in the repository`,
        )
      }
    }
  })

  test('a recorded run carries them', () => {
    const carrying = matrices.filter((matrix) => Fs.existsSync(manifestsOf(matrix.run.id)))
    Assert.ok(
      0 < carrying.length,
      'no recorded run carries its pinning manifests; record one so the newest figures are self-describing',
    )
    for (const matrix of carrying) {
      for (const port of config.ports) {
        for (const manifest of port.manifests) {
          Assert.ok(
            Fs.existsSync(Path.join(manifestsOf(matrix.run.id), port.id, manifest)),
            `${matrix.run.id} is missing ${port.id}/${manifest}`,
          )
        }
      }
    }
  })

  test('the Rust manifest a run carries pins an exact revision', () => {
    const carrying = matrices.filter((matrix) => Fs.existsSync(manifestsOf(matrix.run.id)))
    for (const matrix of carrying) {
      const cargo = Fs.readFileSync(
        Path.join(manifestsOf(matrix.run.id), 'rust', 'ports', 'rust', 'Cargo.toml'),
        'utf8',
      )
      Assert.match(
        cargo,
        /rev = "[0-9a-f]{40}"/,
        `${matrix.run.id} carries a Rust manifest that does not pin a revision`,
      )
    }
  })
})
