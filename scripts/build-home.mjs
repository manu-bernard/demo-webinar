#!/usr/bin/env node
// Génère la galerie statique public/index.html à partir de registry.json.
// Auto-contenue (CSS inline, aucun framework au runtime) => incassable.
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { readRegistry } from './lib/registry.mjs'

const demos = readRegistry()
mkdirSync(resolve('public'), { recursive: true })
writeFileSync(resolve('public', 'index.html'), page(demos))
writeFileSync(resolve('public', 'registry.json'), JSON.stringify(demos, null, 2) + '\n')
console.log(`✓ Galerie générée : public/index.html (${demos.length} démo${demos.length > 1 ? 's' : ''})`)

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ))
}
function fmtDate(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('fr-CH', { day: '2-digit', month: 'long', year: 'numeric' })
  } catch {
    return ''
  }
}
function card(d) {
  const href = esc(d.url || `/demos/${d.slug}/`)
  const thumb = d.thumbnail
    ? `<img src="${esc(d.thumbnail)}" alt="Aperçu de ${esc(d.title || d.slug)}" loading="lazy" />`
    : `<div class="noimg">🎬</div>`
  return `      <a class="card" href="${href}">
        <div class="thumb">${thumb}</div>
        <div class="body">
          <h2>${esc(d.title || d.slug)}</h2>
          ${d.description ? `<p>${esc(d.description)}</p>` : ''}
          <div class="meta"><time>${esc(fmtDate(d.shippedAt || d.date))}</time></div>
        </div>
      </a>`
}
function page(list) {
  const cards = list.length
    ? `<main class="grid">\n${list.map(card).join('\n')}\n    </main>`
    : `<main class="empty">
      <p class="big">Aucune démo pour l'instant.</p>
      <p class="muted">La première mission d'agent la fera apparaître ici. 🎉</p>
    </main>`
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Démos — créées par des agents IA</title>
<meta name="description" content="Galerie de mini-sites de démonstration, construits en autonomie par des agents IA." />
<link rel="icon" href="data:," />
<style>
  *, *::before, *::after { box-sizing: border-box; }
  :root { color-scheme: dark; --bg:#08080c; --card:#121219; --line:rgba(255,255,255,.08); --txt:#f4f4f6; --muted:#9a9aa6; --accent:#7c5cff; }
  html, body { margin: 0; }
  body {
    background: radial-gradient(1200px 600px at 50% -10%, rgba(124,92,255,.18), transparent 60%), var(--bg);
    color: var(--txt);
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    min-height: 100vh;
  }
  .wrap { max-width: 1160px; margin: 0 auto; padding: 0 24px; }
  header { padding: 96px 0 48px; text-align: center; }
  .eyebrow {
    display: inline-block; font-size: 13px; letter-spacing: .12em; text-transform: uppercase;
    color: var(--muted); border: 1px solid var(--line); border-radius: 999px; padding: 6px 14px; margin-bottom: 22px;
  }
  h1 {
    font-size: clamp(34px, 6vw, 64px); line-height: 1.05; margin: 0 0 18px; font-weight: 800; letter-spacing: -.02em;
    background: linear-gradient(180deg, #fff, rgba(255,255,255,.6)); -webkit-background-clip: text; background-clip: text; color: transparent;
  }
  header p { color: var(--muted); font-size: 18px; margin: 0 auto; max-width: 560px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 22px; padding-bottom: 80px; }
  .card {
    display: flex; flex-direction: column; background: var(--card); border: 1px solid var(--line);
    border-radius: 16px; overflow: hidden; text-decoration: none; color: inherit;
    transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease;
  }
  .card:hover { transform: translateY(-4px); border-color: rgba(124,92,255,.5); box-shadow: 0 20px 50px -20px rgba(124,92,255,.45); }
  .thumb { aspect-ratio: 16 / 10; background: #0d0d14; overflow: hidden; }
  .thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .noimg { width: 100%; height: 100%; display: grid; place-items: center; font-size: 42px; opacity: .5; }
  .body { padding: 18px 20px 20px; }
  .body h2 { font-size: 19px; margin: 0 0 6px; font-weight: 700; letter-spacing: -.01em; }
  .body p { margin: 0 0 12px; color: var(--muted); font-size: 14px; line-height: 1.5; }
  .meta { color: var(--muted); font-size: 13px; }
  .empty { text-align: center; padding: 80px 0 120px; }
  .empty .big { font-size: 22px; margin: 0 0 8px; }
  .muted { color: var(--muted); }
  footer { border-top: 1px solid var(--line); padding: 28px 0; color: var(--muted); font-size: 13px; text-align: center; }
  footer a { color: var(--muted); }
</style>
</head>
<body>
  <div class="wrap">
    <header>
      <span class="eyebrow">Construites en autonomie par des agents IA</span>
      <h1>Galerie de démos</h1>
      <p>Chaque carte est un mini-site statique et isolé, conçu, testé et déployé par un agent — d'un seul prompt.</p>
    </header>
    ${cards}
    <footer>${list.length} démo${list.length > 1 ? 's' : ''} · <a href="https://demo.avqn.ch">demo.avqn.ch</a></footer>
  </div>
</body>
</html>
`
}
