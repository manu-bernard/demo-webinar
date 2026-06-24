#!/usr/bin/env node
// Lance le serveur de dev Vite pour UNE démo.
// Usage: npm run demo:dev <slug>
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const slug = process.argv[2]
if (!slug) {
  console.error('Usage: npm run demo:dev <slug>')
  process.exit(1)
}
if (!existsSync(resolve('demos', slug))) {
  console.error(`✗ demos/${slug} introuvable. Crée-la avec: npm run demo:new ${slug}`)
  process.exit(1)
}

const r = spawnSync('npx', ['vite', '-c', 'vite.demo.config.mjs'], {
  stdio: 'inherit',
  env: { ...process.env, DEMO_SLUG: slug },
})
process.exit(r.status ?? 0)
