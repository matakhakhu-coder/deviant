// scripts/launch.js — pre-production validation gate.
// Run with: npm run launch
// Scans manifest.js for unresolved nulls, flags.js for blocking simulation
// switches, and content/[slug].json for completeness. Rewrites public/robots.txt
// to allow indexing once all checks pass.

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const warnings = []

function findNulls(obj, prefix = '') {
  const nulls = []
  for (const [key, value] of Object.entries(obj)) {
    const fieldPath = prefix ? `${prefix}.${key}` : key
    if (value === null) {
      nulls.push(fieldPath)
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      nulls.push(...findNulls(value, fieldPath))
    }
  }
  return nulls
}

async function main() {
  const { DEVIANT } = await import(pathToFileURL(path.join(root, 'src/core/manifest.js')))
  const { FLAGS } = await import(pathToFileURL(path.join(root, 'src/core/flags.js')))

  const manifestNulls = findNulls(DEVIANT)
  if (manifestNulls.length > 0) {
    warnings.push(`Unresolved nulls in manifest.js: ${manifestNulls.join(', ')}`)
  }

  const blockingFlags = Object.entries(FLAGS).filter(([, value]) => value === true)
  if (blockingFlags.length > 0) {
    warnings.push(`Active simulation flags: ${blockingFlags.map(([k]) => k).join(', ')}`)
  }

  for (const slug of Object.keys(DEVIANT.books)) {
    const contentPath = path.join(root, 'content', `${slug}.json`)
    if (!existsSync(contentPath)) {
      warnings.push(`Missing content/${slug}.json`)
      continue
    }
    const book = JSON.parse(readFileSync(contentPath, 'utf-8'))
    if (!Array.isArray(book.chapters) || book.chapters.length === 0) {
      warnings.push(`content/${slug}.json has no chapters`)
    }
  }

  if (warnings.length === 0) {
    const robotsPath = path.join(root, 'public', 'robots.txt')
    writeFileSync(robotsPath, 'User-agent: *\nAllow: /\nSitemap: /sitemap.xml\n')
    console.log('[LAUNCH] All checks passed. robots.txt updated to Allow: /')
    process.exit(0)
  }

  console.log(`[LAUNCH] ${warnings.length} warning(s):`)
  for (const warning of warnings) {
    console.log(`  - ${warning}`)
  }
  process.exit(1)
}

main()
