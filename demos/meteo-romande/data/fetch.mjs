#!/usr/bin/env node
// Récupère TOUT au build et fige en JSON (demos/meteo-romande/data/weather.json).
// Source : Open-Meteo (gratuit, sans clé). La page en ligne ne fait aucun appel
// réseau : elle ne lit que ce JSON figé.
//
// On passe par `curl` (et non fetch) car, dans la sandbox, le trafic sortant
// transite par un proxy que curl honore nativement (comme verify-live.mjs).
//
// Usage : node demos/meteo-romande/data/fetch.mjs
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const TZ = 'Europe/Zurich'

// Coordonnées choisies à la main (centre de localité), altitude officielle
// affichée. L'API renvoie aussi sa propre élévation de grille (apiElevation),
// conservée à titre indicatif. Du bord du lac aux sommets glacés.
const LOCATIONS = [
  { slug: 'lausanne',     name: 'Lausanne',      canton: 'VD', lat: 46.5197, lon: 6.6323, alt: 495 },
  { slug: 'montreux',     name: 'Montreux',      canton: 'VD', lat: 46.4312, lon: 6.9123, alt: 390 },
  { slug: 'chateau-doex', name: "Château-d'Œx",  canton: 'VD', lat: 46.4764, lon: 7.1334, alt: 958 },
  { slug: 'leysin',       name: 'Leysin',        canton: 'VD', lat: 46.3417, lon: 7.0124, alt: 1263 },
  { slug: 'sion',         name: 'Sion',          canton: 'VS', lat: 46.2294, lon: 7.3590, alt: 512 },
  { slug: 'sierre',       name: 'Sierre',        canton: 'VS', lat: 46.2919, lon: 7.5354, alt: 533 },
  { slug: 'zermatt',      name: 'Zermatt',       canton: 'VS', lat: 46.0207, lon: 7.7491, alt: 1608 },
  { slug: 'saas-fee',     name: 'Saas-Fee',      canton: 'VS', lat: 46.1090, lon: 7.9265, alt: 1800 },
]

const sleep = (s) => { try { execFileSync('sleep', [String(s)]) } catch {} }
const r1 = (x) => (x == null ? null : Math.round(x * 10) / 10)

function getJSON(url) {
  let lastErr
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const out = execFileSync('curl', ['-sS', '--max-time', '30', '-L', url], {
        encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024,
      })
      const data = JSON.parse(out)
      if (data && data.error) throw new Error(data.reason || 'API error')
      return data
    } catch (e) {
      lastErr = e
      sleep(2 ** attempt) // 1s, 2s, 4s, 8s
    }
  }
  throw new Error(`Échec après 4 tentatives: ${url}\n${lastErr?.message}`)
}

// Fenêtre des 12 derniers mois COMPLETS (exclut le mois en cours).
function monthWindow(now) {
  const endMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0)) // dernier jour du mois précédent
  const startMonth = new Date(Date.UTC(endMonth.getUTCFullYear(), endMonth.getUTCMonth() - 11, 1))
  const fmt = (d) => d.toISOString().slice(0, 10)
  return { start: fmt(startMonth), end: fmt(endMonth) }
}

const now = new Date()
const { start, end } = monthWindow(now)
console.log(`▶ Archive 12 mois : ${start} → ${end}`)

const FORECAST = (L) =>
  `https://api.open-meteo.com/v1/forecast?latitude=${L.lat}&longitude=${L.lon}` +
  `&timezone=${encodeURIComponent(TZ)}` +
  `&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m` +
  `&hourly=temperature_2m&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,weather_code` +
  `&past_days=7&forecast_days=1`

const ARCHIVE = (L) =>
  `https://archive-api.open-meteo.com/v1/archive?latitude=${L.lat}&longitude=${L.lon}` +
  `&timezone=${encodeURIComponent(TZ)}&start_date=${start}&end_date=${end}` +
  `&daily=temperature_2m_mean`

// Moyennes mensuelles à partir des moyennes journalières.
function toMonthly(times, means) {
  const buckets = new Map()
  for (let i = 0; i < times.length; i++) {
    const m = times[i].slice(0, 7) // YYYY-MM
    const v = means[i]
    if (v == null) continue
    if (!buckets.has(m)) buckets.set(m, { sum: 0, n: 0 })
    const b = buckets.get(m)
    b.sum += v
    b.n += 1
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, b]) => ({ month, mean: r1(b.sum / b.n) }))
}

const out = []
let axesHours = null
let axesDays = null
let axesMonths = null
let releve = null

for (const L of LOCATIONS) {
  process.stdout.write(`  · ${L.name.padEnd(14)} `)
  const fc = getJSON(FORECAST(L))
  sleep(0.3)
  const ar = getJSON(ARCHIVE(L))
  sleep(0.3)

  // --- 24 dernières heures (jusqu'à l'heure courante incluse) ---
  const ht = fc.hourly.time
  const hv = fc.hourly.temperature_2m
  const nowStr = fc.current.time // ex "2026-06-24T13:15"
  let cut = ht.length - 1
  for (let i = ht.length - 1; i >= 0; i--) {
    if (ht[i] <= nowStr) { cut = i; break }
  }
  const from = Math.max(0, cut - 23)
  const hours = ht.slice(from, cut + 1)
  const hourly = hv.slice(from, cut + 1).map(r1)

  // --- 7 derniers jours COMPLETS (exclut aujourd'hui) ---
  const today = nowStr.slice(0, 10)
  const dIdx = fc.daily.time.map((d, i) => ({ d, i })).filter((x) => x.d < today)
  const last7 = dIdx.slice(-7)
  const days = last7.map((x) => x.d)
  const daily = {
    tmax: last7.map((x) => r1(fc.daily.temperature_2m_max[x.i])),
    tmin: last7.map((x) => r1(fc.daily.temperature_2m_min[x.i])),
    tmean: last7.map((x) => r1(fc.daily.temperature_2m_mean[x.i])),
    code: last7.map((x) => fc.daily.weather_code[x.i]),
  }

  // --- 12 derniers mois (moyennes) ---
  const monthlyArr = toMonthly(ar.daily.time, ar.daily.temperature_2m_mean)

  // Axes partagés (mêmes fenêtres pour tous les lieux) — pris au 1er lieu.
  if (!axesHours) axesHours = hours
  if (!axesDays) axesDays = days
  if (!axesMonths) axesMonths = monthlyArr.map((m) => m.month)
  if (!releve) releve = { iso: nowStr, tz: TZ }

  out.push({
    slug: L.slug,
    name: L.name,
    canton: L.canton,
    lat: L.lat,
    lon: L.lon,
    alt: L.alt,
    apiElevation: fc.elevation,
    current: {
      temp: r1(fc.current.temperature_2m),
      apparent: r1(fc.current.apparent_temperature),
      humidity: fc.current.relative_humidity_2m,
      code: fc.current.weather_code,
      wind: r1(fc.current.wind_speed_10m),
      time: fc.current.time,
    },
    hourly, // 24 valeurs (axe = axes.hours)
    daily, // {tmax,tmin,tmean,code} × 7 (axe = axes.days)
    monthly: monthlyArr.map((m) => m.mean), // 12 valeurs (axe = axes.months)
  })
  console.log(`✓ ${r1(fc.current.temperature_2m)}°C  (${L.alt} m)`)
}

const payload = {
  source: 'Open-Meteo · open-meteo.com (CC BY 4.0)',
  generatedAt: now.toISOString(),
  releve,
  axes: { hours: axesHours, days: axesDays, months: axesMonths },
  monthsRange: { start: start.slice(0, 7), end: end.slice(0, 7) },
  locations: out,
}

const dest = resolve(HERE, 'weather.json')
writeFileSync(dest, JSON.stringify(payload, null, 2) + '\n')
console.log(`\n✓ Figé : ${dest}`)
console.log(`  Relevé : ${releve.iso} (${releve.tz})`)
console.log(`  Lieux  : ${out.length}  ·  Mois : ${axesMonths.length}  ·  Jours : ${axesDays.length}  ·  Heures : ${axesHours.length}`)
