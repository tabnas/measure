import assert from 'node:assert/strict'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

import { deriveCatalog, deriveHistory } from './lib/catalog.mjs'
import { readJson, repositoryRoot } from './lib/common.mjs'

class StubElement {
  constructor({ select = false } = {}) {
    this.attributes = new Map()
    this.listeners = new Map()
    this.select = select
    this.value = ''
    this._innerHTML = ''
    this.textContent = ''
    this.href = ''
  }

  set innerHTML(value) {
    this._innerHTML = value
    if (this.select) {
      const firstOption = value.match(/<option value="([^"]*)"/)
      if (firstOption !== null) this.value = decodeHTML(firstOption[1])
    }
  }

  get innerHTML() {
    return this._innerHTML
  }

  addEventListener(name, listener) {
    this.listeners.set(name, listener)
  }

  setAttribute(name, value) {
    this.attributes.set(name, value)
  }
}

let elements = createElements()

globalThis.document = {
  querySelector(selector) {
    const element = elements.get(selector)
    assert(element !== undefined, `Unexpected selector: ${selector}`)
    return element
  },
}

const publishedCatalog = await readJson(join(repositoryRoot, 'site', 'data', 'catalog.json'))
const publishedHistory = await readJson(join(repositoryRoot, 'site', 'data', 'history.json'))
assert.equal(publishedCatalog.latestRunId, null)
assert.deepEqual(publishedCatalog.runs, [])
assert.deepEqual(publishedHistory.series, [])
globalThis.fetch = async (path) => {
  const data = path === 'data/catalog.json' ? publishedCatalog : publishedHistory
  return { ok: true, status: 200, json: async () => data }
}
await import(`${pathToFileURL(join(repositoryRoot, 'site', 'app.js')).href}?empty-smoke`)
assert.equal(elements.get('main').innerHTML, '<section><h2>No complete runs yet.</h2></section>')

elements = createElements()
const firstMatrix = await readJson(join(repositoryRoot, '.build', 'smoke-run', 'matrix.json'))
const firstFingerprint = firstMatrix.ports[0].environment.hostFingerprint
const secondFingerprint = firstFingerprint === '000000000001' ? '000000000002' : '000000000001'
const secondMatrix = structuredClone(firstMatrix)
secondMatrix.run.id = 'synthetic-second-host-run'
secondMatrix.run.generatedAt = new Date(
  Date.parse(firstMatrix.run.generatedAt) + 1_000,
).toISOString()
for (const port of secondMatrix.ports) {
  port.environment.hostFingerprint = secondFingerprint
}
const matrices = [firstMatrix, secondMatrix]
const catalog = deriveCatalog(matrices)
const history = deriveHistory(matrices)
const matricesByID = new Map(matrices.map((matrix) => [matrix.run.id, matrix]))

globalThis.fetch = async (path) => {
  let data
  if (path === 'data/catalog.json') data = catalog
  else if (path === 'data/history.json') data = history
  else {
    const runID = path.match(/^data\/runs\/([^/]+)\/matrix\.json$/)?.[1]
    data = matricesByID.get(runID)
  }
  return { ok: data !== undefined, status: data === undefined ? 404 : 200, json: async () => data }
}

await import(`${pathToFileURL(join(repositoryRoot, 'site', 'app.js')).href}?populated-smoke`)

assert.match(elements.get('#summary').innerHTML, /<dt>Hosts<\/dt><dd>2<\/dd>/)
assert.match(elements.get('#latest-meta').innerHTML, new RegExp(`host ${secondFingerprint}`))
assert.match(elements.get('#environment-details').innerHTML, /Host fingerprint/)
assert.match(elements.get('#history-host').innerHTML, new RegExp(`host ${secondFingerprint}`))
assert.equal(elements.get('#history-context').textContent, '2 hosts · 4 series · 4 points')
assert.match(elements.get('#history-legend').innerHTML, new RegExp(`host ${firstFingerprint}`))
assert.match(elements.get('#history-legend').innerHTML, new RegExp(`host ${secondFingerprint}`))
assert.match(elements.get('#run-host').innerHTML, new RegExp(`host ${secondFingerprint}`))
assert.match(elements.get('#run-list').innerHTML, /host-chip/)

const historyHost = elements.get('#history-host')
historyHost.value = secondFingerprint
historyHost.listeners.get('change')()
assert.equal(elements.get('#history-context').textContent, '1 host · 2 series · 2 points')
assert.match(elements.get('#history-legend').innerHTML, new RegExp(`host ${secondFingerprint}`))
assert.doesNotMatch(elements.get('#history-legend').innerHTML, new RegExp(`host ${firstFingerprint}`))

const runHost = elements.get('#run-host')
runHost.value = secondFingerprint
runHost.listeners.get('change')()
assert.match(elements.get('#run-list').innerHTML, new RegExp(`host ${secondFingerprint}`))
assert.doesNotMatch(elements.get('#run-list').innerHTML, new RegExp(`host ${firstFingerprint}`))

const rendered = [...elements.values()].map((element) => element.innerHTML).join('\n')
assert.doesNotMatch(rendered, /hostId|hostLabel|hostname/i)

process.stdout.write('Validated fingerprint-only Pages rendering with two synthetic hosts\n')

function createElements() {
  const result = new Map()
  for (const id of [
    'summary',
    'latest-json',
    'latest-meta',
    'environment-details',
    'capability-catalog',
    'performance-table',
    'history-chart',
    'history-legend',
    'history-context',
    'run-list',
  ]) {
    result.set(`#${id}`, new StubElement())
  }
  for (const id of ['history-case', 'history-host', 'run-host']) {
    result.set(`#${id}`, new StubElement({ select: true }))
  }
  result.set('main', new StubElement())
  return result
}

function decodeHTML(value) {
  return value
    .replaceAll('&quot;', '"')
    .replaceAll('&#039;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&')
}
