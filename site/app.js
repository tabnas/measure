const [catalog, history] = await Promise.all([
  fetchJSON('data/catalog.json'),
  fetchJSON('data/history.json'),
])

if (catalog.latestRunId === null) {
  document.querySelector('main').innerHTML = '<section><h2>No complete runs yet.</h2></section>'
} else {
  const latest = await fetchJSON(`data/runs/${catalog.latestRunId}/matrix.json`)
  renderSummary(catalog, latest)
  renderLatest(latest)
  renderPerformance(latest)
  renderHistory(history)
  renderRuns(catalog)
}

function renderSummary(catalogData, latest) {
  const hostCount = new Set(catalogData.runs.map((run) => run.host.id)).size
  const values = [
    ['Recorded runs', catalogData.runs.length],
    ['Hosts', hostCount],
    ['Benchmarks', latest.benchmarks.length],
    ['Implemented ports', latest.ports.length],
  ]
  document.querySelector('#summary').innerHTML = values
    .map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`)
    .join('')
}

function renderLatest(matrix) {
  const date = new Date(matrix.run.generatedAt)
  const host = hostFromEnvironment(matrix.ports[0].environment)
  document.querySelector('#latest-json').href = `data/runs/${matrix.run.id}/matrix.json`
  document.querySelector('#latest-meta').innerHTML = [
    `<span>${date.toLocaleString()}</span>`,
    `<span>suite ${matrix.run.suiteVersion}</span>`,
    `<span>commit ${escapeHTML(matrix.run.repositoryCommit.slice(0, 10))}</span>`,
    `<span>host ${escapeHTML(hostDisplayName(host))}</span>`,
    ...matrix.ports.map((port) => `<span>${escapeHTML(port.label)} parser ${escapeHTML(port.parserVersion)}</span>`),
  ].join('')

  renderEnvironment(matrix)

  document.querySelector('#capability-catalog').innerHTML = matrix.benchmarks
    .map((benchmark) => {
      const rows = matrix.capabilityMatrix.filter((row) => row.benchmarkId === benchmark.id)
      const passed = rows.reduce(
        (sum, row) => sum + Object.values(row.ports).filter((result) => result.passed).length,
        0,
      )
      const total = rows.length * matrix.ports.length
      return `<article class="benchmark-card">
        <p class="pass">${passed}/${total} capability checks pass</p>
        <h3>${escapeHTML(benchmark.title)}</h3>
        <p class="note">${escapeHTML(benchmark.summary)}</p>
        <div class="tags">${benchmark.classification.map((tag) => `<span class="tag">${escapeHTML(tag)}</span>`).join('')}</div>
      </article>`
    })
    .join('')
}

function renderEnvironment(matrix) {
  const environment = matrix.ports[0].environment
  const host = hostFromEnvironment(environment)
  const facts = [
    ['Host ID', host.id],
    ['Observed hostname', host.hostname],
    ['Processor', environment.cpu],
    ['Logical CPUs', format(environment.logicalCpus, 0)],
    ['Memory', `${format(environment.memoryBytes / 2 ** 30, 2)} GiB (${format(environment.memoryBytes, 0)} bytes)`],
    ['Environment fingerprint', environment.fingerprint],
  ]
  const runtimes = matrix.ports
    .map(
      (port) => `<article class="runtime-card">
        <p>${escapeHTML(port.label)}</p>
        <strong>${escapeHTML(port.runtime)} ${escapeHTML(port.runtimeVersion)}</strong>
        <small>${escapeHTML(port.parserModule)}@${escapeHTML(port.parserVersion)}</small>
      </article>`,
    )
    .join('')

  document.querySelector('#environment-details').innerHTML = `
    <div class="environment-intro">
      <p class="eyebrow">Recorded host</p>
      <h3>${escapeHTML(host.label)}</h3>
      <p class="environment-host-key">${escapeHTML(host.id)} · env ${escapeHTML(environment.fingerprint.slice(0, 8))}</p>
      <p class="note">${escapeHTML(environment.os)} / ${escapeHTML(environment.arch)} · kernel ${escapeHTML(environment.kernelVersion)}</p>
    </div>
    <dl class="host-facts">
      ${facts
        .map(
          ([label, value]) => `<div><dt>${escapeHTML(label)}</dt><dd${label === 'Environment fingerprint' ? ' class="fingerprint"' : ''}>${escapeHTML(value)}</dd></div>`,
        )
        .join('')}
    </dl>
    <div class="runtime-grid">${runtimes}</div>`
}

function renderPerformance(matrix) {
  const header = `<thead><tr><th>Benchmark / input</th><th>Bytes</th>${matrix.ports
    .map((port) => `<th>${escapeHTML(port.label)}<br>median · ops/s</th>`)
    .join('')}</tr></thead>`
  const body = matrix.performanceMatrix
    .map(
      (row) => `<tr><td>${escapeHTML(row.benchmarkId)} / ${escapeHTML(row.caseId)}</td><td>${format(row.input.bytes, 0)}</td>${matrix.ports
        .map((port) => {
          const value = row.ports[port.id]
          return `<td><strong>${format(value.medianNs, 1)} ns</strong><br>${format(value.operationsPerSecond, 0)} ops/s · ${format(row.relativeThroughput[port.id], 2)}×</td>`
        })
        .join('')}</tr>`,
    )
    .join('')
  document.querySelector('#performance-table').innerHTML = `${header}<tbody>${body}</tbody>`
}

function renderHistory(historyData) {
  const measurementSelector = document.querySelector('#history-case')
  const hostSelector = document.querySelector('#history-host')
  const measurements = [...new Set(historyData.series.map((series) => `${series.benchmarkId}/${series.caseId}`))]
  const hosts = uniqueHosts(historyData.series.map((series) => series.host))
  measurementSelector.innerHTML = measurements
    .map((key) => `<option value="${escapeHTML(key)}">${escapeHTML(key)}</option>`)
    .join('')
  hostSelector.innerHTML = [
    '<option value="">All hosts</option>',
    ...hosts.map(
      (host) => `<option value="${escapeHTML(host.id)}">${escapeHTML(hostDisplayName(host))}</option>`,
    ),
  ].join('')
  const update = () => drawChart(historyData, measurementSelector.value, hostSelector.value)
  measurementSelector.addEventListener('change', update)
  hostSelector.addEventListener('change', update)
  drawChart(historyData, measurements[0], '')
}

function drawChart(historyData, measurement, hostID) {
  const svg = document.querySelector('#history-chart')
  const series = historyData.series.filter(
    (candidate) =>
      `${candidate.benchmarkId}/${candidate.caseId}` === measurement &&
      (hostID === '' || candidate.host.id === hostID),
  )
  const points = series.flatMap((item) => item.points)
  if (points.length === 0) {
    svg.innerHTML = '<text x="450" y="170" text-anchor="middle" class="chart-label">No history</text>'
    document.querySelector('#history-legend').innerHTML = ''
    document.querySelector('#history-context').textContent = 'No matching measurements.'
    return
  }
  const visibleHostCount = new Set(series.map((item) => item.host.id)).size
  document.querySelector('#history-context').textContent = `${visibleHostCount} ${visibleHostCount === 1 ? 'host' : 'hosts'} · ${series.length} ${series.length === 1 ? 'series' : 'series'} · ${points.length} ${points.length === 1 ? 'point' : 'points'}`
  svg.setAttribute(
    'aria-label',
    `${measurement} historical median latency for ${hostID === '' ? 'all hosts' : series[0].host.label}`,
  )
  const width = 900
  const height = 340
  const margin = { left: 86, right: 28, top: 30, bottom: 54 }
  const times = points.map((point) => Date.parse(point.generatedAt))
  const values = points.map((point) => point.medianNs)
  const minTime = Math.min(...times)
  const maxTime = Math.max(...times)
  const minLog = Math.log10(Math.min(...values) * 0.8)
  const maxLog = Math.log10(Math.max(...values) * 1.25)
  const x = (value) =>
    minTime === maxTime
      ? (margin.left + width - margin.right) / 2
      : margin.left + ((value - minTime) / (maxTime - minTime)) * (width - margin.left - margin.right)
  const y = (value) =>
    height - margin.bottom - ((Math.log10(value) - minLog) / (maxLog - minLog || 1)) * (height - margin.top - margin.bottom)

  const nodes = []
  for (let index = 0; index <= 4; index += 1) {
    const ratio = index / 4
    const yPosition = margin.top + ratio * (height - margin.top - margin.bottom)
    const label = 10 ** (maxLog - ratio * (maxLog - minLog))
    nodes.push(`<line x1="${margin.left}" x2="${width - margin.right}" y1="${yPosition}" y2="${yPosition}" class="chart-grid"/>`)
    nodes.push(`<text x="${margin.left - 12}" y="${yPosition + 4}" text-anchor="end" class="chart-label">${formatDuration(label)}</text>`)
  }
  nodes.push(`<text x="${margin.left}" y="${height - 18}" class="chart-label">${new Date(minTime).toLocaleDateString()}</text>`)
  nodes.push(`<text x="${width - margin.right}" y="${height - 18}" text-anchor="end" class="chart-label">${new Date(maxTime).toLocaleDateString()}</text>`)

  series.forEach((item) => {
    const color = hostColor(item.host.id)
    const dash = portDash(item.portId)
    const coordinates = item.points.map((point) => `${x(Date.parse(point.generatedAt))},${y(point.medianNs)}`)
    if (coordinates.length > 1) {
      nodes.push(`<polyline points="${coordinates.join(' ')}" fill="none" stroke="${color}" stroke-width="3"${dash === '' ? '' : ` stroke-dasharray="${dash}"`}/>`)
    }
    item.points.forEach((point) => {
      const title = `${hostDisplayName(item.host)} · ${item.portLabel} · parser ${point.parserVersion} · ${formatDuration(point.medianNs)} · ${new Date(point.generatedAt).toLocaleString()}`
      nodes.push(chartMarker(item.portId, x(Date.parse(point.generatedAt)), y(point.medianNs), color, title))
    })
  })
  svg.innerHTML = nodes.join('')
  document.querySelector('#history-legend').innerHTML = series
    .map(
      (item) =>
        `<span style="--series:${hostColor(item.host.id)}"><b>${escapeHTML(hostDisplayName(item.host))}</b> · ${escapeHTML(item.portLabel)} ${escapeHTML(item.runtimeVersion)} · suite ${escapeHTML(item.suiteVersion)} · env ${escapeHTML(item.environmentFingerprint.slice(0, 8))}</span>`,
    )
    .join('')
}

function renderRuns(catalogData) {
  const selector = document.querySelector('#run-host')
  const hosts = uniqueHosts(catalogData.runs.map((run) => run.host))
  selector.innerHTML = [
    '<option value="">All hosts</option>',
    ...hosts.map(
      (host) => `<option value="${escapeHTML(host.id)}">${escapeHTML(hostDisplayName(host))}</option>`,
    ),
  ].join('')
  const update = () => {
    document.querySelector('#run-list').innerHTML = catalogData.runs
      .filter((run) => selector.value === '' || run.host.id === selector.value)
      .map(
        (run) => `<a class="run-row" href="data/${run.reportPath}">
          <div class="run-leading">
            <strong>${escapeHTML(new Date(run.generatedAt).toLocaleString())}</strong>
            <span class="host-chip" style="--host:${hostColor(run.host.id)}">${escapeHTML(hostDisplayName(run.host))} · env ${escapeHTML(run.host.environmentFingerprint.slice(0, 8))}</span>
          </div>
          <code>${escapeHTML(run.id)}</code>
          <small>${run.capability.passed}/${run.capability.total} checks · ${run.ports.map((port) => `${escapeHTML(port.id)} ${escapeHTML(port.parserVersion)}`).join(' · ')}</small>
        </a>`,
      )
      .join('')
  }
  selector.addEventListener('change', update)
  update()
}

function hostFromEnvironment(environment) {
  const hostname = environment.hostname || `unknown-${environment.fingerprint.slice(0, 8)}`
  const id = environment.hostId || hostname
  return {
    id,
    label: environment.hostLabel || id,
    hostname,
    environmentFingerprint: environment.fingerprint,
  }
}

function hostDisplayName(host) {
  return host.label === host.id ? host.label : `${host.label} (${host.id})`
}

function uniqueHosts(hosts) {
  const byID = new Map()
  for (const host of hosts) {
    if (!byID.has(host.id)) byID.set(host.id, host)
  }
  return [...byID.values()].sort((left, right) =>
    hostDisplayName(left).localeCompare(hostDisplayName(right)),
  )
}

function hostColor(hostID) {
  return `hsl(${stringHash(hostID) % 360} 72% 66%)`
}

function portDash(portID) {
  const patterns = ['', '8 5', '2 4', '10 4 2 4']
  return patterns[stringHash(portID) % patterns.length]
}

function chartMarker(portID, x, y, color, title) {
  const safeTitle = escapeHTML(title)
  const variant = stringHash(portID) % 3
  if (variant === 0) {
    return `<circle cx="${x}" cy="${y}" r="6" fill="${color}" stroke="#101311" stroke-width="3"><title>${safeTitle}</title></circle>`
  }
  if (variant === 1) {
    return `<rect x="${x - 5}" y="${y - 5}" width="10" height="10" rx="1" fill="${color}" stroke="#101311" stroke-width="3" transform="rotate(45 ${x} ${y})"><title>${safeTitle}</title></rect>`
  }
  return `<polygon points="${x},${y - 7} ${x + 7},${y + 6} ${x - 7},${y + 6}" fill="${color}" stroke="#101311" stroke-width="3"><title>${safeTitle}</title></polygon>`
}

function stringHash(value) {
  let hash = 2_166_136_261
  for (const character of String(value)) {
    hash = Math.imul(hash ^ character.codePointAt(0), 16_777_619)
  }
  return hash >>> 0
}

async function fetchJSON(path) {
  const response = await fetch(path)
  if (!response.ok) throw new Error(`Unable to load ${path}: ${response.status}`)
  return response.json()
}

function format(value, digits) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(value)
}

function formatDuration(nanoseconds) {
  if (nanoseconds >= 1_000_000) return `${format(nanoseconds / 1_000_000, 2)} ms`
  if (nanoseconds >= 1_000) return `${format(nanoseconds / 1_000, 2)} µs`
  return `${format(nanoseconds, 1)} ns`
}

function escapeHTML(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
