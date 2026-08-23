import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

import { repositoryRoot } from './lib/common.mjs'

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

const elements = new Map()
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
  elements.set(`#${id}`, new StubElement())
}
for (const id of ['history-case', 'history-host', 'run-host']) {
  elements.set(`#${id}`, new StubElement({ select: true }))
}
elements.set('main', new StubElement())

globalThis.document = {
  querySelector(selector) {
    const element = elements.get(selector)
    assert(element !== undefined, `Unexpected selector: ${selector}`)
    return element
  },
}

globalThis.fetch = async (path) => {
  const content = await readFile(join(repositoryRoot, 'site', path), 'utf8')
  const data = JSON.parse(content)
  addSyntheticSecondHost(path, data)
  return { ok: true, json: async () => data }
}

await import(`${pathToFileURL(join(repositoryRoot, 'site', 'app.js')).href}?smoke`)

assert.match(elements.get('#summary').innerHTML, /<dt>Hosts<\/dt><dd>2<\/dd>/)
assert.match(elements.get('#latest-meta').innerHTML, /host inch/)
assert.match(elements.get('#environment-details').innerHTML, /Host ID/)
assert.match(elements.get('#history-host').innerHTML, /Lab B \(lab-b\)/)
assert.match(elements.get('#history-context').textContent, /^2 hosts · 3 series · \d+ points$/)
assert.match(elements.get('#history-legend').innerHTML, /inch/)
assert.match(elements.get('#history-legend').innerHTML, /Lab B \(lab-b\)/)
assert.match(elements.get('#run-host').innerHTML, /Lab B \(lab-b\)/)
assert.match(elements.get('#run-list').innerHTML, /host-chip/)

const historyHost = elements.get('#history-host')
historyHost.value = 'lab-b'
historyHost.listeners.get('change')()
assert.match(elements.get('#history-context').textContent, /^1 host · 1 series · \d+ points?$/)
assert.match(elements.get('#history-legend').innerHTML, /Lab B \(lab-b\)/)
assert.doesNotMatch(elements.get('#history-legend').innerHTML, />inch</)

const runHost = elements.get('#run-host')
runHost.value = 'lab-b'
runHost.listeners.get('change')()
assert.match(elements.get('#run-list').innerHTML, /Lab B \(lab-b\)/)
assert.doesNotMatch(elements.get('#run-list').innerHTML, />inch · env/)

process.stdout.write('Validated host-aware Pages rendering with two synthetic hosts\n')

function addSyntheticSecondHost(path, data) {
  if (path === 'data/catalog.json') {
    const run = structuredClone(data.runs[0])
    run.id = 'synthetic-second-host-run'
    run.host = { ...run.host, id: 'lab-b', label: 'Lab B', hostname: 'lab-b.local' }
    data.runs.push(run)
  }
  if (path === 'data/history.json') {
    const series = structuredClone(data.series[0])
    series.id = `${series.id}/synthetic-second-host`
    series.host = { ...series.host, id: 'lab-b', label: 'Lab B', hostname: 'lab-b.local' }
    series.points = series.points.map((point) => ({
      ...point,
      runId: 'synthetic-second-host-run',
      hostId: 'lab-b',
      hostLabel: 'Lab B',
      hostname: 'lab-b.local',
    }))
    data.series.push(series)
  }
}

function decodeHTML(value) {
  return value
    .replaceAll('&quot;', '"')
    .replaceAll('&#039;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&')
}
