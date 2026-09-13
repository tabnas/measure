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

export const gatedDocs = () => PAGES.filter(exists)
export const tutorials = () => TUTORIALS.filter(exists)

if (import.meta.url === `file://${process.argv[1]}`) {
  process.stdout.write(gatedDocs().join('\n') + '\n')
}
