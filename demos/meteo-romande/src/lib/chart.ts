// Petits utilitaires de graphes faits main.

export interface Ticks {
  ticks: number[]
  step: number
}

// Graduations "rondes" pour un axe.
export function niceTicks(min: number, max: number, count = 5): Ticks {
  const span = Math.max(1e-6, max - min)
  const step0 = span / count
  const mag = Math.pow(10, Math.floor(Math.log10(step0)))
  const norm = step0 / mag
  let step: number
  if (norm < 1.5) step = 1
  else if (norm < 3) step = 2
  else if (norm < 7) step = 5
  else step = 10
  step *= mag
  const start = Math.ceil(min / step) * step
  const ticks: number[] = []
  for (let v = start; v <= max + 1e-9; v += step) ticks.push(Math.round(v * 1e6) / 1e6)
  return { ticks, step }
}

// Chemin lissé (Catmull-Rom → Bézier) à partir de points pixel.
export function smoothPath(points: Array<[number, number]>, tension = 1): string {
  if (points.length === 0) return ''
  if (points.length < 3) return points.map((p, i) => `${i ? 'L' : 'M'} ${p[0]} ${p[1]}`).join(' ')
  let d = `M ${points[0][0]} ${points[0][1]}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] || p2
    const c1x = p1[0] + ((p2[0] - p0[0]) / 6) * tension
    const c1y = p1[1] + ((p2[1] - p0[1]) / 6) * tension
    const c2x = p2[0] - ((p3[0] - p1[0]) / 6) * tension
    const c2y = p2[1] - ((p3[1] - p1[1]) / 6) * tension
    d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${p2[0]} ${p2[1]}`
  }
  return d
}

// Régression linéaire simple → { a (pente), b (ordonnée), r }.
export function linreg(xs: number[], ys: number[]) {
  const n = xs.length
  const mx = xs.reduce((s, v) => s + v, 0) / n
  const my = ys.reduce((s, v) => s + v, 0) / n
  let sxy = 0
  let sxx = 0
  let syy = 0
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx
    const dy = ys[i] - my
    sxy += dx * dy
    sxx += dx * dx
    syy += dy * dy
  }
  const a = sxy / (sxx || 1)
  const b = my - a * mx
  const r = sxy / (Math.sqrt(sxx * syy) || 1)
  return { a, b, r }
}
