import raw from '../../data/weather.json'
import { ALT_PALETTE } from './colors'

export type Current = {
  temp: number
  apparent: number
  humidity: number
  wind: number
  weatherCode: number
  time: string
}
export type Loc = {
  slug: string
  name: string
  kind: string
  blurb: string
  lat: number
  lon: number
  elevation: number
  current: Current
  hourly: number[]
  daily: { min: number[]; mean: number[]; max: number[] }
  monthly: number[]
}
export type Weather = {
  generatedAt: string
  timezone: string
  source: string
  observedAt: string
  windows: { monthly: { start: string; end: string } }
  axes: { hourly: string[]; daily: string[]; monthly: string[] }
  locations: Loc[]
}

export const data = raw as unknown as Weather
export const locations = data.locations

// Couleur stable par lieu, assignée selon l'altitude (bas = chaud, haut = froid).
const byAltAsc = [...locations].sort((a, b) => a.elevation - b.elevation)
const colorMap = new Map<string, string>()
byAltAsc.forEach((l, i) => colorMap.set(l.slug, ALT_PALETTE[i] ?? ALT_PALETTE[ALT_PALETTE.length - 1]))
export const locColor = (slug: string) => colorMap.get(slug) ?? '#94a3b8'

// Tris pratiques.
export const byTempDesc = [...locations].sort((a, b) => b.current.temp - a.current.temp)
export const byAltDesc = [...locations].sort((a, b) => b.elevation - a.elevation)

// Extrêmes du « maintenant ».
export const hottest = byTempDesc[0]
export const coldest = byTempDesc[byTempDesc.length - 1]
export const spreadNow = Math.round((hottest.current.temp - coldest.current.temp) * 10) / 10
export const highest = byAltDesc[0]
export const lowest = byAltDesc[byAltDesc.length - 1]

// ---- Formatage (fr-CH) ----------------------------------------------------
export function hourLabel(iso: string): string {
  return iso.slice(11, 16) // "HH:MM"
}
export function hourShort(iso: string): string {
  return iso.slice(11, 13) + 'h'
}
const WEEK = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.']
export function dayLabel(iso: string): string {
  const d = new Date(iso + 'T12:00:00')
  return `${WEEK[d.getDay()]} ${d.getDate()}`
}
const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']
export function monthLabel(ym: string): string {
  const m = Number(ym.slice(5, 7)) - 1
  return MONTHS[m] ?? ym
}
export function monthLong(ym: string): string {
  const m = Number(ym.slice(5, 7)) - 1
  const y = ym.slice(0, 4)
  return `${MONTHS[m]?.replace('.', '') ?? ''} ${y}`
}

const FULL_MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
/** "24 juin 2026 à 19h15" depuis un horodatage local naïf. */
export function observedLabel(iso: string): string {
  const day = Number(iso.slice(8, 10))
  const mon = FULL_MONTHS[Number(iso.slice(5, 7)) - 1]
  const year = iso.slice(0, 4)
  const time = iso.slice(11, 16).replace(':', 'h')
  return `${day} ${mon} ${year} · ${time}`
}

// Conditions météo (codes WMO) -> libellé + glyphe.
export function weatherText(code: number): string {
  if (code === 0) return 'Ciel clair'
  if (code <= 2) return 'Peu nuageux'
  if (code === 3) return 'Couvert'
  if (code <= 48) return 'Brouillard'
  if (code <= 57) return 'Bruine'
  if (code <= 67) return 'Pluie'
  if (code <= 77) return 'Neige'
  if (code <= 82) return 'Averses'
  if (code <= 86) return 'Averses de neige'
  return 'Orage'
}
