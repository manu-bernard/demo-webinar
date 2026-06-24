#!/usr/bin/env node
// Crée une nouvelle démo isolée à partir de demos/_template.
// Usage: npm run demo:new <slug> [titre…]
import { cpSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { slugify } from './lib/registry.mjs'

const [rawSlug, ...titleParts] = process.argv.slice(2)
if (!rawSlug) {
  console.error('Usage: npm run demo:new <slug> [titre…]')
  process.exit(1)
}

const slug = slugify(rawSlug)
if (!slug) {
  console.error('✗ Slug invalide.')
  process.exit(1)
}
const title = titleParts.join(' ').trim() || slug
const dir = resolve('demos', slug)

if (existsSync(dir)) {
  console.error(`✗ La démo "${slug}" existe déjà (${dir}).`)
  process.exit(1)
}

cpSync(resolve('demos', '_template'), dir, { recursive: true })

const meta = { slug, title, description: '', startedAt: new Date().toISOString() }
writeFileSync(resolve(dir, 'demo.json'), JSON.stringify(meta, null, 2) + '\n')

const htmlPath = resolve(dir, 'index.html')
writeFileSync(
  htmlPath,
  readFileSync(htmlPath, 'utf8').replace(/__DEMO_TITLE__/g, title),
)

console.log(`✓ Démo créée : demos/${slug}`)
console.log(`  Titre    : ${title}`)
console.log(`  Démarrée : ${meta.startedAt}`)
console.log('')
console.log('Étapes suivantes :')
console.log(`  npm run demo:dev ${slug}     # serveur de dev + hot reload`)
console.log(`  npm run demo:build ${slug}   # build statique -> public/demos/${slug}/`)
console.log(`  npm run demo:ship ${slug}    # build + vignette + galerie + temps écoulé`)
