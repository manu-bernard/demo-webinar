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
// On le passe à Chromium pour les URL externes, mais PAS pour localhost : le
// bypass de Chromium ne tient pas ici et le proxy n'accepte que du CONNECT, si
// bien que les requêtes vers le serveur de dev reviennent en page d'erreur.
let isLocal = false
try {
  const host = new URL(url).hostname
  isLocal = ['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(host)
} catch {}
const proxyServer = process.env.HTTPS_PROXY || process.env.https_proxy
const useProxy = proxyServer && !isLocal
const browser = await chromium.launch({
  // --disable-quic : le proxy ne tunnelise que le TCP ; sans ça Chromium tente
  // du HTTP/3 (QUIC/UDP) en direct et la connexion est coupée.
  args: ['--disable-quic'],
  ...(useProxy ? { proxy: { server: proxyServer } } : {}),
})

// Fait défiler toute la page puis revient en haut, pour déclencher les
// animations « reveal au scroll » (IntersectionObserver / whileInView) — sinon
// elles restent à opacity:0 dans une capture fullPage, qui ne scrolle jamais.
const revealOnScroll = (page) =>
  page
    .evaluate(
      () =>
        new Promise((done) => {
          let y = 0
          const step = () => {
            window.scrollTo(0, y)
            y += Math.round(window.innerHeight * 0.5)
            if (y < document.body.scrollHeight) setTimeout(step, 80)
            else {
              window.scrollTo(0, document.body.scrollHeight)
              setTimeout(() => {
                window.scrollTo(0, 0)
                done()
              }, 400)
            }
          }
          step()
        }),
    )
    .catch(() => {})

const results = []
for (const v of viewports) {
  // ignoreHTTPSErrors : le proxy re-termine le TLS avec son propre CA.
  const ctx = await browser.newContext({
    viewport: { width: v.width, height: v.height },
    ignoreHTTPSErrors: true,
  })
  const page = await ctx.newPage()
  await page.goto(url, { waitUntil: 'load', timeout: 30000 }).catch(() => {})
  await revealOnScroll(page) // déclenche les anims au scroll avant la capture
  await page.waitForTimeout(1500) // laisse anims / 3D se stabiliser
  const file = resolve(out, `${name}-${v.id}.png`)
  await page.screenshot({ path: file, fullPage: true })
  results.push(file)
  await ctx.close()
}
await browser.close()
console.log(results.join('\n'))
