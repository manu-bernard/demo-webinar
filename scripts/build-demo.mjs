#!/usr/bin/env node
// Build statique d'UNE démo vers public/demos/<slug>/.
// Usage: npm run demo:build <slug>
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const slug = process.argv[2]
if (!slug) {
  console.error('Usage: npm run demo:build <slug>')
  process.exit(1)
}
if (!existsSync(resolve('demos', slug))) {
  console.error(`✗ demos/${slug} introuvable.`)
  process.exit(1)
}

const r = spawnSync('npx', ['vite', 'build', '-c', 'vite.demo.config.mjs'], {
  stdio: 'inherit',
  env: { ...process.env, DEMO_SLUG: slug },
})
if (r.status !== 0) process.exit(r.status ?? 1)
console.log(`✓ Build -> public/demos/${slug}/`)
