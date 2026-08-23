import { cp, mkdir, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

import { deriveCatalog, deriveHistory, scanRunMatrices } from './lib/catalog.mjs'
import { repositoryRoot, writeJson } from './lib/common.mjs'

export async function buildSite() {
  const matrices = await scanRunMatrices()
  const catalog = deriveCatalog(matrices)
  const history = deriveHistory(matrices)
  const siteDirectory = join(repositoryRoot, 'site')
  const dataDirectory = join(siteDirectory, 'data')
  const publishedRuns = join(dataDirectory, 'runs')
  const publishedSchemas = join(siteDirectory, 'schemas')

  await mkdir(dataDirectory, { recursive: true })
  await writeJson(join(dataDirectory, 'catalog.json'), catalog)
  await writeJson(join(dataDirectory, 'history.json'), history)

  await rm(publishedRuns, { recursive: true, force: true })
  await mkdir(publishedRuns, { recursive: true })
  for (const matrix of matrices) {
    await cp(
      join(repositoryRoot, 'results', 'runs', matrix.run.id),
      join(publishedRuns, matrix.run.id),
      { recursive: true },
    )
  }

  await rm(publishedSchemas, { recursive: true, force: true })
  await cp(join(repositoryRoot, 'schemas'), publishedSchemas, { recursive: true })
  return { catalog, history }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  buildSite().catch((cause) => {
    process.stderr.write(`${cause instanceof Error ? cause.stack : String(cause)}\n`)
    process.exitCode = 1
  })
}
