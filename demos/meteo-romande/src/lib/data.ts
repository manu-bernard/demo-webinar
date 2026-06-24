import raw from '../../data/weather.json'
import { makeScale } from './color'

export interface Current {
  temp: number
  apparent: number
  humidity: number
  code: number
  wind: number
  time: string
}
export interface Daily {
  tmax: number[]
  tmin: number[]
  tmean: number[]
  code: number[]
}
export interface Loc {
  slug: string
  name: string
  canton: 'VD' | 'VS'
  lat: number
  lon: number
  alt: number
  apiElevation: number
  current: Current
  hourly: number[]
  daily: Daily
  monthly: number[]
  /** Couleur identité (selon la température actuelle, sur l'étendue du jeu). */
  color: string
}
export interface Weather {
  source: string
  generatedAt: string
  releve: { iso: string; tz: string }
  axes: { hours: string[]; days: string[]; months: string[] }
  monthsRange: { start: string; end: string }
  locations: Loc[]
}

const data = raw as unknown as Weather

const temps = data.locations.map((l) => l.current.temp)
export const minNow = Math.min(...temps)
export const maxNow = Math.max(...temps)

// Échelle couleur partagée : la plus froide du moment → bleu, la plus chaude → rouge.
export const tempScale = makeScale(minNow, maxNow)
data.locations.forEach((l) => {
  l.color = tempScale(l.current.temp)
})

export const weather = data
export const locations = data.locations
export const axes = data.axes

// Extrêmes pour le récit (chaud bas / froid haut).
export const warmest = locations.reduce((a, b) => (b.current.temp > a.current.temp ? b : a))
export const coldest = locations.reduce((a, b) => (b.current.temp < a.current.temp ? b : a))
export const highest = locations.reduce((a, b) => (b.alt > a.alt ? b : a))
export const lowest = locations.reduce((a, b) => (b.alt < a.alt ? b : a))
