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
  renderScaling(history)
  renderRuns(catalog)
}

function renderSummary(catalogData, latest) {
  const hostCount = new Set(catalogData.runs.map((run) => run.host.fingerprint)).size
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
    `<span>${escapeHTML(hostDisplayName(host))}</span>`,
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
    ['Host fingerprint', host.fingerprint],
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
      <h3>${escapeHTML(hostDisplayName(host))}</h3>
      <p class="environment-host-key">env ${escapeHTML(environment.fingerprint.slice(0, 8))}</p>
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
  const fromSlider = document.querySelector('#history-from')
  const toSlider = document.querySelector('#history-to')
  const resetButton = document.querySelector('#history-reset')
  const measurements = [...new Set(historyData.series.map((series) => `${series.benchmarkId}/${series.caseId}`))]
  const hosts = uniqueHosts(historyData.series.map((series) => series.host))
  measurementSelector.innerHTML = measurements
    .map((key) => `<option value="${escapeHTML(key)}">${escapeHTML(key)}</option>`)
    .join('')
  hostSelector.innerHTML = [
    '<option value="">All hosts</option>',
    ...hosts.map(
      (host) => `<option value="${escapeHTML(host.fingerprint)}">${escapeHTML(hostDisplayName(host))}</option>`,
    ),
  ].join('')
  let availableTimes = []
  const updateRangeLabel = () => {
    if (availableTimes.length === 0) {
      document.querySelector('#history-range').textContent = 'No observations'
      return
    }
    document.querySelector('#history-range').textContent = `${formatDateTime(availableTimes[Number(fromSlider.value)])} — ${formatDateTime(availableTimes[Number(toSlider.value)])}`
  }
  const draw = () => {
    const start = availableTimes[Number(fromSlider.value)] ?? Number.NEGATIVE_INFINITY
    const end = availableTimes[Number(toSlider.value)] ?? Number.POSITIVE_INFINITY
    drawChart(historyData, measurementSelector.value, hostSelector.value, { start, end })
    updateRangeLabel()
  }
  const resetRange = () => {
    availableTimes = historyTimes(historyData, measurementSelector.value, hostSelector.value)
    const last = Math.max(0, availableTimes.length - 1)
    fromSlider.min = '0'
    fromSlider.max = String(last)
    fromSlider.value = '0'
    toSlider.min = '0'
    toSlider.max = String(last)
    toSlider.value = String(last)
    draw()
  }
  measurementSelector.addEventListener('change', resetRange)
  hostSelector.addEventListener('change', resetRange)
  fromSlider.addEventListener('input', () => {
    if (Number(fromSlider.value) > Number(toSlider.value)) toSlider.value = fromSlider.value
    draw()
  })
  toSlider.addEventListener('input', () => {
    if (Number(toSlider.value) < Number(fromSlider.value)) fromSlider.value = toSlider.value
    draw()
  })
  resetButton.addEventListener('click', resetRange)
  resetRange()
}

function historyTimes(historyData, measurement, hostFingerprint) {
  return [...new Set(historyData.series
    .filter((candidate) => `${candidate.benchmarkId}/${candidate.caseId}` === measurement && (hostFingerprint === '' || candidate.host.fingerprint === hostFingerprint))
    .flatMap((item) => item.points.map((point) => Date.parse(point.generatedAt))))].sort((left, right) => left - right)
}

function drawChart(historyData, measurement, hostFingerprint, range) {
  const svg = document.querySelector('#history-chart')
  const series = historyData.series
    .filter((candidate) =>
      `${candidate.benchmarkId}/${candidate.caseId}` === measurement &&
      (hostFingerprint === '' || candidate.host.fingerprint === hostFingerprint),
    )
    .map((item) => ({
      ...item,
      points: item.points.filter((point) => {
        const time = Date.parse(point.generatedAt)
        return time >= range.start && time <= range.end
      }),
    }))
    .filter((item) => item.points.length > 0)
  const points = series.flatMap((item) => item.points)
  if (points.length === 0) {
    svg.innerHTML = '<text x="450" y="170" text-anchor="middle" class="chart-label">No history</text>'
    document.querySelector('#history-legend').innerHTML = ''
    document.querySelector('#history-context').textContent = 'No matching measurements.'
    return
  }
  const visibleHostCount = new Set(series.map((item) => item.host.fingerprint)).size
  document.querySelector('#history-context').textContent = `${visibleHostCount} ${visibleHostCount === 1 ? 'host' : 'hosts'} · ${series.length} ${series.length === 1 ? 'series' : 'series'} · ${points.length} ${points.length === 1 ? 'point' : 'points'}`
  svg.setAttribute(
    'aria-label',
    `${measurement} historical median latency for ${hostFingerprint === '' ? 'all hosts' : hostDisplayName(series[0].host)}`,
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
    const color = hostColor(item.host.fingerprint)
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
        `<span style="--series:${hostColor(item.host.fingerprint)}"><b>${escapeHTML(hostDisplayName(item.host))}</b> · ${escapeHTML(item.portLabel)} ${escapeHTML(item.runtimeVersion)} · suite ${escapeHTML(item.suiteVersion)} · env ${escapeHTML(item.environmentFingerprint.slice(0, 8))}</span>`,
    )
    .join('')
}

function renderScaling(historyData) {
  const benchmarkSelector = document.querySelector('#scaling-benchmark')
  const hostSelector = document.querySelector('#scaling-host')
  const runSelector = document.querySelector('#scaling-run')
  const benchmarks = [...new Set(historyData.series.map((series) => series.benchmarkId))].sort()
  const hosts = uniqueHosts(historyData.series.map((series) => series.host))
  benchmarkSelector.innerHTML = benchmarks.map((id) => `<option value="${escapeHTML(id)}">${escapeHTML(id)}</option>`).join('')
  hostSelector.innerHTML = hosts.map((host) => `<option value="${escapeHTML(host.fingerprint)}">${escapeHTML(hostDisplayName(host))}</option>`).join('')

  const updateRuns = () => {
    const runs = scalingRuns(historyData, benchmarkSelector.value, hostSelector.value)
    runSelector.innerHTML = runs.map((run) => `<option value="${escapeHTML(run.id)}">${escapeHTML(formatDateTime(Date.parse(run.generatedAt)))} · suite ${escapeHTML(run.suiteVersion)}</option>`).join('')
    if (runs.length > 0) runSelector.value = runs[0].id
    drawScalingChart(historyData, benchmarkSelector.value, hostSelector.value, runSelector.value)
  }
  benchmarkSelector.addEventListener('change', updateRuns)
  hostSelector.addEventListener('change', updateRuns)
  runSelector.addEventListener('change', () => drawScalingChart(historyData, benchmarkSelector.value, hostSelector.value, runSelector.value))
  updateRuns()
}

function scalingRuns(historyData, benchmarkId, hostFingerprint) {
  const byID = new Map()
  for (const series of historyData.series.filter((item) => item.benchmarkId === benchmarkId && item.host.fingerprint === hostFingerprint)) {
    for (const point of series.points) {
      byID.set(point.runId, { id: point.runId, generatedAt: point.generatedAt, suiteVersion: series.suiteVersion })
    }
  }
  return [...byID.values()].sort((left, right) => right.generatedAt.localeCompare(left.generatedAt))
}

function drawScalingChart(historyData, benchmarkId, hostFingerprint, runId) {
  const svg = document.querySelector('#scaling-chart')
  const legend = document.querySelector('#scaling-legend')
  const context = document.querySelector('#scaling-context')
  const byPort = new Map()
  for (const item of historyData.series.filter((candidate) => candidate.benchmarkId === benchmarkId && candidate.host.fingerprint === hostFingerprint)) {
    const point = item.points.find((candidate) => candidate.runId === runId)
    if (point === undefined) continue
    if (!byPort.has(item.portId)) byPort.set(item.portId, { portId: item.portId, portLabel: item.portLabel, points: [] })
    byPort.get(item.portId).points.push({ bytes: item.input.bytes, medianNs: point.medianNs, caseId: item.caseId })
  }
  const series = [...byPort.values()]
  for (const item of series) item.points.sort((left, right) => left.bytes - right.bytes)
  const points = series.flatMap((item) => item.points)
  if (points.length === 0) {
    svg.innerHTML = '<text x="450" y="195" text-anchor="middle" class="chart-label">No scaling data</text>'
    legend.innerHTML = ''
    context.textContent = 'No matching run.'
    return
  }
  const width = 900
  const height = 390
  const margin = { left: 86, right: 32, top: 30, bottom: 66 }
  const minX = Math.log10(Math.min(...points.map((point) => point.bytes)))
  const maxX = Math.log10(Math.max(...points.map((point) => point.bytes)))
  const minY = Math.log10(Math.min(...points.map((point) => point.medianNs)) * 0.8)
  const maxY = Math.log10(Math.max(...points.map((point) => point.medianNs)) * 1.25)
  const x = (value) => margin.left + ((Math.log10(value) - minX) / (maxX - minX || 1)) * (width - margin.left - margin.right)
  const y = (value) => height - margin.bottom - ((Math.log10(value) - minY) / (maxY - minY || 1)) * (height - margin.top - margin.bottom)
  const nodes = []
  for (let index = 0; index <= 4; index += 1) {
    const ratio = index / 4
    const yPosition = margin.top + ratio * (height - margin.top - margin.bottom)
    const value = 10 ** (maxY - ratio * (maxY - minY))
    nodes.push(`<line x1="${margin.left}" x2="${width - margin.right}" y1="${yPosition}" y2="${yPosition}" class="chart-grid"/>`)
    nodes.push(`<text x="${margin.left - 12}" y="${yPosition + 4}" text-anchor="end" class="chart-label">${formatDuration(value)}</text>`)
  }
  const xTicks = [...new Set(points.map((point) => point.bytes))].sort((left, right) => left - right)
  for (const value of xTicks) {
    nodes.push(`<line x1="${x(value)}" x2="${x(value)}" y1="${margin.top}" y2="${height - margin.bottom}" class="chart-grid chart-grid-minor"/>`)
    nodes.push(`<text x="${x(value)}" y="${height - 38}" text-anchor="middle" class="chart-label">${formatBytes(value)}</text>`)
  }
  nodes.push(`<text x="${(margin.left + width - margin.right) / 2}" y="${height - 10}" text-anchor="middle" class="chart-label">Input size (bytes, log scale)</text>`)

  const summaries = []
  for (const item of series) {
    const color = portColor(item.portId)
    const coordinates = item.points.map((point) => `${x(point.bytes)},${y(point.medianNs)}`)
    if (coordinates.length > 1) nodes.push(`<polyline points="${coordinates.join(' ')}" fill="none" stroke="${color}" stroke-width="3"/>`)
    const exponents = []
    item.points.forEach((point, index) => {
      let exponent
      if (index > 0) {
        const previous = item.points[index - 1]
        exponent = Math.log(point.medianNs / previous.medianNs) / Math.log(point.bytes / previous.bytes)
        exponents.push(exponent)
      }
      const title = `${item.portLabel} · ${point.caseId} · ${formatBytes(point.bytes)} · ${formatDuration(point.medianNs)}${exponent === undefined ? '' : ` · adjacent exponent ${format(exponent, 2)}×`}`
      nodes.push(chartMarker(item.portId, x(point.bytes), y(point.medianNs), color, title))
      if (exponent !== undefined) nodes.push(`<text x="${x(point.bytes)}" y="${y(point.medianNs) - 12}" text-anchor="middle" class="chart-exponent${exponent > 1 ? ' superlinear' : ''}">${format(exponent, 2)}×</text>`)
    })
    const peak = exponents.length === 0 ? null : Math.max(...exponents)
    summaries.push(`${item.portLabel}: ${peak === null ? 'n/a' : `${format(peak, 2)}× peak exponent`}`)
  }
  svg.innerHTML = nodes.join('')
  svg.setAttribute('aria-label', `${benchmarkId} median latency by input size for ${hostFingerprint}`)
  context.textContent = `${formatDateTime(Date.parse(scalingRunDate(historyData, runId)))} · ${summaries.join(' · ')}`
  legend.innerHTML = series.map((item) => `<span style="--series:${portColor(item.portId)}"><b>${escapeHTML(item.portLabel)}</b> · adjacent exponent labels</span>`).join('')
}

function scalingRunDate(historyData, runId) {
  for (const series of historyData.series) {
    const point = series.points.find((candidate) => candidate.runId === runId)
    if (point !== undefined) return point.generatedAt
  }
  return new Date(0).toISOString()
}

function renderRuns(catalogData) {
  const selector = document.querySelector('#run-host')
  const hosts = uniqueHosts(catalogData.runs.map((run) => run.host))
  selector.innerHTML = [
    '<option value="">All hosts</option>',
    ...hosts.map(
      (host) => `<option value="${escapeHTML(host.fingerprint)}">${escapeHTML(hostDisplayName(host))}</option>`,
    ),
  ].join('')
  const update = () => {
    document.querySelector('#run-list').innerHTML = catalogData.runs
      .filter((run) => selector.value === '' || run.host.fingerprint === selector.value)
      .map(
        (run) => `<a class="run-row" href="data/${run.reportPath}">
          <div class="run-leading">
            <strong>${escapeHTML(new Date(run.generatedAt).toLocaleString())}</strong>
            <span class="host-chip" style="--host:${hostColor(run.host.fingerprint)}">${escapeHTML(hostDisplayName(run.host))} · env ${escapeHTML(run.host.environmentFingerprint.slice(0, 8))}</span>
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
  return {
    fingerprint: environment.hostFingerprint,
    environmentFingerprint: environment.fingerprint,
  }
}

function hostDisplayName(host) {
  return `host ${host.fingerprint}`
}

function uniqueHosts(hosts) {
  const byFingerprint = new Map()
  for (const host of hosts) {
    if (!byFingerprint.has(host.fingerprint)) byFingerprint.set(host.fingerprint, host)
  }
  return [...byFingerprint.values()].sort((left, right) =>
    hostDisplayName(left).localeCompare(hostDisplayName(right)),
  )
}

function hostColor(hostFingerprint) {
  return `hsl(${stringHash(hostFingerprint) % 360} 72% 66%)`
}

function portColor(portID) {
  return `hsl(${(stringHash(portID) + 110) % 360} 72% 66%)`
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

function formatBytes(bytes) {
  if (bytes >= 1024) return `${format(bytes / 1024, bytes % 1024 === 0 ? 0 : 1)} KiB`
  return `${format(bytes, 0)} B`
}

function formatDateTime(milliseconds) {
  return new Date(milliseconds).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
}

function escapeHTML(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
