import { rm } from 'node:fs/promises'
import { join } from 'node:path'

import { repositoryRoot } from './lib/common.mjs'

await rm(join(repositoryRoot, '.build'), { recursive: true, force: true })
