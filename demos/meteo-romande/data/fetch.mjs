#!/usr/bin/env node
// Récupère TOUTES les données météo au build et les fige dans weather.json.
// La page en ligne ne fait aucun appel réseau au runtime.
//
// Source : Open-Meteo (gratuit, sans clé).
//   - forecast : current + hourly (24 dernières heures) + daily (7 derniers jours)
//   - archive (ERA5) : moyennes journalières -> 12 moyennes mensuelles
//
// ⚠️ On récupère via `curl` (shell-out) : le fetch global de Node n'emprunte pas
//    le proxy sortant de la sandbox.
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TZ = 'Europe/Zurich'

// 8 lieux de Suisse romande, du bord du lac au sommet glacé.
// Chaque ville du lac a son sommet « au-dessus » : Vevey ↔ Rochers-de-Naye,
// Yverdon ↔ Le Chasseron — et la région culmine à Glacier 3000.
const LOCATIONS = [
  { slug: 'vevey',            name: 'Vevey',              lat: 46.462,  lon: 6.843,  kind: 'lac',      blurb: 'Riviera lémanique' },
  { slug: 'lausanne',         name: 'Lausanne',           lat: 46.516,  lon: 6.629,  kind: 'lac',      blurb: 'Capitale olympique' },
  { slug: 'yverdon',          name: 'Yverdon-les-Bains',  lat: 46.778,  lon: 6.641,  kind: 'plaine',   blurb: 'Pied du Jura' },
  { slug: 'chateau-doex',     name: "Château-d'Œx",       lat: 46.476,  lon: 7.131,  kind: 'vallée',   blurb: "Pays-d'Enhaut" },
  { slug: 'leysin',           name: 'Leysin',             lat: 46.342,  lon: 7.015,  kind: 'montagne', blurb: 'Balcon des Alpes' },
  { slug: 'chasseron',        name: 'Le Chasseron',       lat: 46.853,  lon: 6.536,  kind: 'sommet',   blurb: 'Sommet du Jura' },
  { slug: 'rochers-de-naye',  name: 'Rochers-de-Naye',    lat: 46.4317, lon: 6.9789, kind: 'sommet',   blurb: 'Balcon du Léman' },
  { slug: 'glacier-3000',     name: 'Glacier 3000',       lat: 46.3250, lon: 7.2120, kind: 'glacier',  blurb: 'Scex Rouge · Les Diablerets' },
]

// Fenêtre des 12 derniers mois COMPLETS (on évite le mois courant partiel).
const now = new Date()
const endD = new Date(now.getFullYear(), now.getMonth(), 0)          // dernier jour du mois précédent
const startD = new Date(endD.getFullYear(), endD.getMonth() - 11, 1) // premier jour, 12 mois plus tôt
const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const START = fmt(startD)
const END = fmt(endD)

function curlJson(url) {
  const out = execFileSync('curl', ['-sS', '--max-time', '45', '--retry', '3', '--retry-delay', '2', url], {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 64,
  })
  const j = JSON.parse(out)
  if (j.error) throw new Error(j.reason || 'Open-Meteo error')
  return j
}

function fetchLocation(loc) {
  const fc = curlJson(
    `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
      `&hourly=temperature_2m&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean` +
      `&past_days=7&forecast_days=1&timezone=Europe%2FZurich`,
  )
  const ar = curlJson(
    `https://archive-api.open-meteo.com/v1/archive?latitude=${loc.lat}&longitude=${loc.lon}` +
      `&start_date=${START}&end_date=${END}&daily=temperature_2m_mean&timezone=Europe%2FZurich`,
  )
  return { fc, ar }
}

const round1 = (x) => (x == null ? null : Math.round(x * 10) / 10)

// ---- 1) Récupération brute ------------------------------------------------
const raw = []
for (const loc of LOCATIONS) {
  process.stderr.write(`→ ${loc.name}… `)
  const { fc, ar } = fetchLocation(loc)
  raw.push({ loc, fc, ar })
  process.stderr.write(`elev ${fc.elevation}m, actuel ${round1(fc.current.temperature_2m)}°C\n`)
}

// ---- 2) Axes canoniques (partagés par tous les lieux) ---------------------
// Heure de relevé = current.time du 1er lieu (même grille horaire pour tous).
const refFc = raw[0].fc
const currentTime = refFc.current.time // ex. "2026-06-24T19:00"
const hourIdx = refFc.hourly.time.indexOf(currentTime.slice(0, 13) + ':00')
const endHour = hourIdx >= 0 ? hourIdx : refFc.hourly.time.length - 1
const startHour = Math.max(0, endHour - 23)
const hourlyAxis = refFc.hourly.time.slice(startHour, endHour + 1) // 24 points finissant maintenant

// 7 derniers jours COMPLETS (on retire aujourd'hui, partiel).
const dailyAxis = refFc.daily.time.slice(0, 7)

// 12 mois : libellés YYYY-MM dans l'ordre.
const monthlyAxis = []
{
  const d = new Date(startD)
  for (let i = 0; i < 12; i++) {
    monthlyAxis.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
    d.setMonth(d.getMonth() + 1)
  }
}

// ---- 3) Projection par lieu sur les axes ----------------------------------
function monthlyMeans(ar) {
  const sums = {}
  const counts = {}
  ar.daily.time.forEach((t, i) => {
    const m = t.slice(0, 7)
    const v = ar.daily.temperature_2m_mean[i]
    if (v == null) return
    sums[m] = (sums[m] || 0) + v
    counts[m] = (counts[m] || 0) + 1
  })
  return monthlyAxis.map((m) => (counts[m] ? round1(sums[m] / counts[m]) : null))
}

const locations = raw.map(({ loc, fc, ar }) => {
  const hMap = new Map(fc.hourly.time.map((t, i) => [t, fc.hourly.temperature_2m[i]]))
  const dMin = new Map(fc.daily.time.map((t, i) => [t, fc.daily.temperature_2m_min[i]]))
  const dMean = new Map(fc.daily.time.map((t, i) => [t, fc.daily.temperature_2m_mean[i]]))
  const dMax = new Map(fc.daily.time.map((t, i) => [t, fc.daily.temperature_2m_max[i]]))
  return {
    slug: loc.slug,
    name: loc.name,
    kind: loc.kind,
    blurb: loc.blurb,
    lat: loc.lat,
    lon: loc.lon,
    elevation: Math.round(fc.elevation),
    current: {
      temp: round1(fc.current.temperature_2m),
      apparent: round1(fc.current.apparent_temperature),
      humidity: fc.current.relative_humidity_2m,
      wind: round1(fc.current.wind_speed_10m),
      weatherCode: fc.current.weather_code,
      time: fc.current.time,
    },
    hourly: hourlyAxis.map((t) => round1(hMap.get(t) ?? null)),
    daily: {
      min: dailyAxis.map((t) => round1(dMin.get(t) ?? null)),
      mean: dailyAxis.map((t) => round1(dMean.get(t) ?? null)),
      max: dailyAxis.map((t) => round1(dMax.get(t) ?? null)),
    },
    monthly: monthlyMeans(ar),
  }
})

// ---- 4) Écriture ----------------------------------------------------------
const payload = {
  generatedAt: now.toISOString(),
  timezone: TZ,
  source: 'Open-Meteo · forecast + archive ERA5',
  observedAt: currentTime,
  windows: { monthly: { start: START, end: END } },
  axes: { hourly: hourlyAxis, daily: dailyAxis, monthly: monthlyAxis },
  locations,
}

const outPath = resolve(__dirname, 'weather.json')
writeFileSync(outPath, JSON.stringify(payload, null, 2))
process.stderr.write(`\n✓ ${outPath}\n`)
process.stderr.write(`  relevé : ${currentTime} (${TZ})\n`)
process.stderr.write(`  mois   : ${START} → ${END}\n`)
const sorted = [...locations].sort((a, b) => b.current.temp - a.current.temp)
process.stderr.write(
  '  écart actuel : ' +
    `${sorted[0].name} ${sorted[0].current.temp}°C  →  ${sorted.at(-1).name} ${sorted.at(-1).current.temp}°C ` +
    `(Δ ${round1(sorted[0].current.temp - sorted.at(-1).current.temp)}°C)\n`,
)
