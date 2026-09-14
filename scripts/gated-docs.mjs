import Fs from 'node:fs'
import Path from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = Path.join(Path.dirname(fileURLToPath(import.meta.url)), '..')

// The reader-facing set. This repository documents itself in its README
// and two prose pages rather than a per-runtime Diataxis set, because it
// is a measurement harness, not a library. Working documents (the
// benchmark manifests, the schemas, the results) are not prose.
const PAGES = [
  'README.md',
  'docs/methodology.md',
  'docs/adding-a-benchmark.md',
]

// No tutorial here, so "we" is allowed nowhere and the exclamation
// ration is zero.
const TUTORIALS = []

const exists = (rel) => Fs.existsSync(Path.join(REPO, rel))

// A declared page that is not on disk THROWS.
//
// This filtered instead, and the comment here claimed the filter made a
// renamed page "fail as a missing gate". It did the opposite: the page
// left the list, both halves of the gate carried on over what remained,
// and the coverage test passed because it only counts what the list
// returned. Deleting a page was the one way to stop it being checked.
const present = (declared, what) => {
  const gone = declared.filter((f) => !exists(f))
  if (0 < gone.length) {
    throw new Error(
      `gated-docs: declared ${what} but not on disk: ` + gone.join(', ') +
      '. Rename it here, or delete the entry deliberately.')
  }
  return declared
}

export const gatedDocs = () => present(PAGES, 'gated')
export const tutorials = () => present(TUTORIALS, 'a tutorial')

if (import.meta.url === `file://${process.argv[1]}`) {
  process.stdout.write(gatedDocs().join('\n') + '\n')
}
