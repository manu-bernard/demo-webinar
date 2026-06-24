// Étiquettes FR déterministes : on calcule tout en UTC midi pour ne jamais
// dériver d'un jour selon le fuseau du navigateur qui affiche la page.

const wd = new Intl.DateTimeFormat('fr-CH', { weekday: 'short', timeZone: 'UTC' })
const mo = new Intl.DateTimeFormat('fr-CH', { month: 'short', timeZone: 'UTC' })
const moLong = new Intl.DateTimeFormat('fr-CH', { month: 'long', timeZone: 'UTC' })

const clean = (s: string) => s.replace('.', '')

function dateUTC(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d, 12))
}

/** "2026-06-23T14:00" → "14h" */
export const hourLabel = (iso: string) => iso.slice(11, 13) + 'h'

/** "2026-06-17" → { wd: "mar", day: 17 } */
export function dayParts(iso: string) {
  const dt = dateUTC(iso)
  return { wd: clean(wd.format(dt)), day: dt.getUTCDate() }
}

/** "2026-06-17" → "mar 17" */
export function dayLabel(iso: string) {
  const { wd: w, day } = dayParts(iso)
  return `${w} ${day}`
}

/** "2025-06" → "juin" (+ année si janvier) */
export function monthLabel(iso: string) {
  const [y, m] = iso.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, 15, 12))
  const base = clean(mo.format(dt))
  return m === 1 ? `${base} ${String(y).slice(2)}` : base
}

/** "2025-06" → "juin 2025" */
export function monthLong(iso: string) {
  const [y, m] = iso.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, 15, 12))
  return `${moLong.format(dt)} ${y}`
}

/** "2026-06-24T13:30" → "24 juin 2026 · 13:30" */
export function releveLabel(iso: string) {
  const dt = dateUTC(iso.slice(0, 10))
  return `${dt.getUTCDate()} ${moLong.format(dt)} ${dt.getUTCFullYear()} · ${iso.slice(11, 16)}`
}

export const fmt1 = (n: number) => (Math.round(n * 10) / 10).toLocaleString('fr-CH', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
export const fmt0 = (n: number) => Math.round(n).toLocaleString('fr-CH')
