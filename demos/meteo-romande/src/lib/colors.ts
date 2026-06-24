// Échelle de couleur TEMPÉRATURE — chaud → froid.
// Pensée pour un fond sombre : teintes vives, transitions douces.
type Stop = [number, [number, number, number]]
const SCALE: Stop[] = [
  [-15, [124, 58, 237]], // violet glacé
  [-8, [79, 70, 229]], // indigo
  [-1, [59, 130, 246]], // bleu
  [5, [6, 182, 212]], // cyan
  [11, [20, 184, 166]], // turquoise
  [16, [132, 204, 22]], // lime
  [21, [250, 204, 21]], // ambre
  [26, [251, 146, 60]], // orange
  [31, [244, 63, 94]], // corail
  [37, [190, 18, 60]], // rouge profond
]

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const toRgb = ([r, g, b]: number[]) => `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`

/** Couleur continue pour une température (°C). */
export function tempColor(t: number): string {
  if (t <= SCALE[0][0]) return toRgb(SCALE[0][1])
  if (t >= SCALE[SCALE.length - 1][0]) return toRgb(SCALE[SCALE.length - 1][1])
  for (let i = 0; i < SCALE.length - 1; i++) {
    const [t0, c0] = SCALE[i]
    const [t1, c1] = SCALE[i + 1]
    if (t >= t0 && t <= t1) {
      const f = (t - t0) / (t1 - t0)
      return toRgb([lerp(c0[0], c1[0], f), lerp(c0[1], c1[1], f), lerp(c0[2], c1[2], f)])
    }
  }
  return toRgb(SCALE[SCALE.length - 1][1])
}

/** Dégradé CSS (froid → chaud) pour les légendes. */
export function tempGradientCss(from = -12, to = 36, dir = 'to right'): string {
  const n = 10
  const stops: string[] = []
  for (let i = 0; i <= n; i++) {
    const t = from + ((to - from) * i) / n
    stops.push(`${tempColor(t)} ${(i / n) * 100}%`)
  }
  return `linear-gradient(${dir}, ${stops.join(', ')})`
}

// Palette CATÉGORIELLE par altitude (du bord du lac → sommet glacé).
// Sert à colorer les courbes superposées : bas = chaud, haut = froid.
export const ALT_PALETTE = [
  '#fb7185', // rose — le plus bas
  '#fb923c', // orange
  '#fbbf24', // ambre
  '#a3e635', // lime
  '#34d399', // émeraude
  '#22d3ee', // cyan
  '#38bdf8', // ciel
  '#818cf8', // indigo — le plus haut
]
