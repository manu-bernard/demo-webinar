#!/usr/bin/env node
// Vérifie qu'une démo est bien servie en ligne (check HTTP via curl, qui passe
// par le proxy de la sandbox — contrairement au navigateur). Le rendu visuel,
// lui, est déjà vérifié en local (la vignette = octets identiques au déployé).
// Usage: npm run demo:verify <slug> [baseURL]
import { execFileSync } from 'node:child_process'

const slug = process.argv[2]
const base = process.argv[3] || 'https://demo.avqn.ch'
if (!slug) {
  console.error('Usage: npm run demo:verify <slug> [baseURL]')
  process.exit(1)
}
const url = `${base}/demos/${slug}/`

function curl(extra) {
  return execFileSync('curl', ['-sS', '--max-time', '25', '-L', ...extra], { encoding: 'utf8' })
}

let ok = true
try {
  const code = curl(['-o', '/dev/null', '-w', '%{http_code}', url]).trim()
  const html = curl([url])
  const servesDemo = html.includes(`/demos/${slug}/assets/`) || html.includes('id="root"')
  console.log(`HTTP ${code}  ${url}`)
  console.log(servesDemo ? '✓ la démo est bien servie en ligne' : '⚠ contenu inattendu (build pas encore déployé ?)')
  ok = code === '200' && servesDemo
} catch (e) {
  console.error('✗ injoignable :', e.message)
  ok = false
}
process.exit(ok ? 0 : 1)
