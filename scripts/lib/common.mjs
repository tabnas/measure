import { createHash } from 'node:crypto'
import { readFile, readdir, rename, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'

export const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

const schemaValidators = new Map()

export async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'))
}

export async function writeJson(path, value) {
  const temporary = `${path}.tmp`
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`)
  await rename(temporary, path)
}

export async function loadConfig() {
  return readJson(join(repositoryRoot, 'measure.config.json'))
}

export async function loadManifests(directory = join(repositoryRoot, 'benchmarks')) {
  const entries = await readdir(directory, { withFileTypes: true })
  const manifests = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => readJson(join(directory, entry.name, 'benchmark.json'))),
  )
  return manifests.sort((left, right) => left.id.localeCompare(right.id))
}

export async function validateSchema(schemaFile, value, label = schemaFile) {
  let validate = schemaValidators.get(schemaFile)
  if (validate === undefined) {
    const schema = await readJson(join(repositoryRoot, 'schemas', schemaFile))
    const ajv = new Ajv2020({ allErrors: true, strict: true })
    addFormats(ajv)
    validate = ajv.compile(schema)
    schemaValidators.set(schemaFile, validate)
  }
  if (!validate(value)) {
    const errors = validate.errors
      .map((error) => `${error.instancePath || '/'} ${error.message}`)
      .join('; ')
    throw new Error(`${label} does not satisfy ${schemaFile}: ${errors}`)
  }
}

export function generateInput(performanceCase) {
  const generator = performanceCase.generator
  if (generator.kind === 'adder-chain') {
    return Array.from({ length: generator.size }, () => String(generator.value)).join('+')
  }
  if (generator.kind === 'even-palindrome') {
    if (generator.size <= 0 || generator.size % 2 !== 0 || generator.pattern.length === 0) {
      throw new Error(`Invalid even-palindrome generator for ${performanceCase.id}`)
    }
    const halfLength = generator.size / 2
    const half = generator.pattern
      .repeat(Math.ceil(halfLength / generator.pattern.length))
      .slice(0, halfLength)
    return half + [...half].reverse().join('')
  }
  throw new Error(`Unknown generator kind ${generator.kind} for ${performanceCase.id}`)
}

export function inputIdentity(input) {
  return {
    bytes: Buffer.byteLength(input, 'utf8'),
    codeUnits: input.length,
    sha256: sha256(input),
  }
}

export function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

export function assert(condition, message) {
  if (!condition) throw new Error(message)
}

export function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right)
}

export function round(value, digits = 6) {
  if (!Number.isFinite(value)) return value
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

export function formatNumber(value, digits = 2) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value)
}

export function markdownValue(value) {
  if (value === undefined) return '—'
  if (typeof value === 'string') return `\`${value.replaceAll('`', '\\`')}\``
  return `\`${JSON.stringify(value)}\``
}
