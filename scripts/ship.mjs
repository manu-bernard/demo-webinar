#!/usr/bin/env node
// Finalise une démo : build figé + vignette + maj galerie + temps écoulé.
// Usage: npm run demo:ship <slug>
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium } from 'playwright'
import { upsertDemo } from './lib/registry.mjs'
import { serveDir } from './lib/static-server.mjs'

const slug = process.argv[2]
if (!slug) {
  console.error('Usage: npm run demo:ship <slug>')
  process.exit(1)
}
const dir = resolve('demos', slug)
const metaPath = resolve(dir, 'demo.json')
if (!existsSync(metaPath)) {
  console.error(`✗ demos/${slug}/demo.json introuvable.`)
  process.exit(1)
}
const meta = JSON.parse(readFileSync(metaPath, 'utf8'))

// 1) Build figé
console.log('▶ Build…')
execFileSync('node', ['scripts/build-demo.mjs', slug], { stdio: 'inherit' })

// 2) Vignette : on sert public/ et on screenshote la démo construite
console.log('▶ Vignette…')
const thumbsDir = resolve('public', 'thumbs')
mkdirSync(thumbsDir, { recursive: true })
const thumbRel = `thumbs/${slug}.png`
const srv = await serveDir(resolve('public'))
const browser = await chromium.launch()
const ctxPage = await browser.newContext({ viewport: { width: 1200, height: 750 } })
const page = await ctxPage.newPage()
await page.goto(`${srv.url}/demos/${slug}/`, { waitUntil: 'load', timeout: 30000 }).catch(() => {})
await page.waitForTimeout(1800)
await page.screenshot({ path: resolve(thumbsDir, `${slug}.png`) })
await browser.close()
await srv.close()

// 3) Registre
const now = new Date()
const durationMs = meta.startedAt ? now.getTime() - new Date(meta.startedAt).getTime() : null
upsertDemo({
  slug,
  title: meta.title || slug,
  description: meta.description || '',
  shippedAt: now.toISOString(),
  date: now.toISOString().slice(0, 10),
  thumbnail: thumbRel,
  durationMs,
  url: `/demos/${slug}/`,
})

// 4) Galerie
console.log('▶ Galerie…')
execFileSync('node', ['scripts/build-home.mjs'], { stdio: 'inherit' })

// 5) Résumé
console.log('')
console.log(`✓ Démo prête : ${slug}`)
console.log(`  Durée : ${durationMs != null ? humanDuration(durationMs) : '—'}`)
console.log(`  Lien  : https://demo.avqn.ch/demos/${slug}/`)
console.log('')
console.log('Pour déployer (auto-deploy Coolify on push) :')
console.log(`  git add -A && git commit -m "demo: ${slug}" && git push`)

function humanDuration(ms) {
  const s = Math.round(ms / 1000)
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  if (h) return `${h} h ${m % 60} min`
  if (m) return `${m} min ${s % 60} s`
  return `${s} s`
}
