#!/usr/bin/env node
// Capture d'écran d'une URL en desktop ET mobile (Playwright / Chromium).
// Usage: npm run demo:shot <url> [--out <dir>] [--name <prefix>]
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const args = process.argv.slice(2)
const url = args[0]
if (!url) {
  console.error('Usage: npm run demo:shot <url> [--out <dir>] [--name <prefix>]')
  process.exit(1)
}
const argVal = (flag) => {
  const i = args.indexOf(flag)
  return i >= 0 ? args[i + 1] : null
}
const out = argVal('--out') || '.shots'
const name = argVal('--name') || 'shot'
mkdirSync(out, { recursive: true })

const viewports = [
  { id: 'desktop', width: 1440, height: 900 },
  { id: 'mobile', width: 390, height: 844 },
]

const browser = await chromium.launch()
const results = []
for (const v of viewports) {
  const ctx = await browser.newContext({ viewport: { width: v.width, height: v.height } })
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
