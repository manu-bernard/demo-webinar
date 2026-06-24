// Échelle thermique chaud→froid, sans vert criard : on passe par un point
// milieu pâle (aqua) plutôt que par le vert. Sert d'identité couleur unique
// à chaque lieu, réutilisée dans tous les graphiques.

type RGB = [number, number, number]

const STOPS: Array<[number, RGB]> = [
  [0.0, [79, 107, 255]], // froid — indigo/bleu
  [0.18, [47, 155, 242]], // bleu
  [0.36, [37, 199, 224]], // cyan
  [0.5, [186, 240, 230]], // milieu pâle (aqua)
  [0.63, [255, 209, 102]], // jaune chaud
  [0.78, [255, 158, 66]], // orange
  [0.9, [255, 92, 84]], // rouge
  [1.0, [222, 20, 60]], // chaud — cramoisi
]

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

function sample(u: number): RGB {
  const x = clamp01(u)
  let i = 0
  while (i < STOPS.length - 1 && x > STOPS[i + 1][0]) i++
  const [x0, c0] = STOPS[i]
  const [x1, c1] = STOPS[Math.min(i + 1, STOPS.length - 1)]
  const t = x1 === x0 ? 0 : (x - x0) / (x1 - x0)
  return [lerp(c0[0], c1[0], t), lerp(c0[1], c1[1], t), lerp(c0[2], c1[2], t)]
}

const hex2 = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')

// Hex (#rrggbb) pour que l'on puisse suffixer une alpha 2-digits : `${color}55`.
export function ramp(u: number): string {
  const [r, g, b] = sample(u)
  return `#${hex2(r)}${hex2(g)}${hex2(b)}`
}

export function rampA(u: number, a: number): string {
  const [r, g, b] = sample(u)
  return `rgba(${Math.round(r)} ${Math.round(g)} ${Math.round(b)} / ${a})`
}

// Fabrique une échelle bornée à un domaine de valeurs réelles.
export function makeScale(min: number, max: number) {
  const span = max - min || 1
  const norm = (v: number) => clamp01((v - min) / span)
  const scale = (v: number) => ramp(norm(v))
  scale.norm = norm
  scale.alpha = (v: number, a: number) => rampA(norm(v), a)
  return scale
}
