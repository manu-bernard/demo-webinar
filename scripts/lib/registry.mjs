import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const REGISTRY = resolve(process.cwd(), 'registry.json')

export function readRegistry() {
  if (!existsSync(REGISTRY)) return []
  try {
    return JSON.parse(readFileSync(REGISTRY, 'utf8'))
  } catch {
    return []
  }
}

export function writeRegistry(list) {
  writeFileSync(REGISTRY, JSON.stringify(list, null, 2) + '\n')
}

export function upsertDemo(entry) {
  const list = readRegistry()
  const i = list.findIndex((d) => d.slug === entry.slug)
  if (i >= 0) list[i] = { ...list[i], ...entry }
  else list.push(entry)
  // Plus récent d'abord.
  list.sort((a, b) => String(b.shippedAt ?? '').localeCompare(String(a.shippedAt ?? '')))
  writeRegistry(list)
  return list
}

export function slugify(s) {
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}
