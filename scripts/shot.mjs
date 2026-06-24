#!/usr/bin/env node
// Capture d'écran d'une URL en desktop ET mobile (Playwright / Chromium).
// Usage: npm run demo:shot <url> [--out <dir>] [--name <prefix>]
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

// Arguments positionnels (les flags `--x` sont avalés par `npm run`).
// Usage : npm run demo:shot <url> [nom] [dossier]
const args = process.argv.slice(2)
const url = args[0]
if (!url) {
  console.error('Usage: npm run demo:shot <url> [nom] [dossier]')
  process.exit(1)
}
const name = args[1] && !args[1].startsWith('-') ? args[1] : 'shot'
const out = args[2] && !args[2].startsWith('-') ? args[2] : '.shots'
mkdirSync(out, { recursive: true })

const viewports = [
  { id: 'desktop', width: 1440, height: 900 },
  { id: 'mobile', width: 390, height: 844 },
]

// En sandbox Claude Code, le trafic sortant passe par un proxy (HTTPS_PROXY).
// On le passe à Chromium pour les URL externes ; localhost est bypassé.
const proxyServer = process.env.HTTPS_PROXY || process.env.https_proxy
const browser = await chromium.launch({
  // --disable-quic : le proxy ne tunnelise que le TCP ; sans ça Chromium tente
  // du HTTP/3 (QUIC/UDP) en direct et la connexion est coupée.
  args: ['--disable-quic'],
  ...(proxyServer ? { proxy: { server: proxyServer, bypass: 'localhost,127.0.0.1' } } : {}),
})
const results = []
for (const v of viewports) {
  // ignoreHTTPSErrors : le proxy re-termine le TLS avec son propre CA.
  const ctx = await browser.newContext({
    viewport: { width: v.width, height: v.height },
    ignoreHTTPSErrors: true,
  })
  const page = await ctx.newPage()
  await page.goto(url, { waitUntil: 'load', timeout: 30000 }).catch(() => {})
  await page.waitForTimeout(1500) // laisse anims / 3D se stabiliser
  const file = resolve(out, `${name}-${v.id}.png`)
  await page.screenshot({ path: file, fullPage: true })
  results.push(file)
  await ctx.close()
}
await browser.close()
console.log(results.join('\n'))
