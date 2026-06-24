// Génération de chemins SVG lissés — interpolation cubique MONOTONE
// (Fritsch–Carlson) : pas de dépassement sous/au-dessus des points, donc des
// courbes de température fidèles (jamais de faux « rebond »).
export type Pt = { x: number; y: number }

export function smoothPath(pts: Pt[]): string {
  const n = pts.length
  if (n === 0) return ''
  if (n === 1) return `M${pts[0].x},${pts[0].y}`
  if (n === 2) return `M${pts[0].x},${pts[0].y} L${pts[1].x},${pts[1].y}`

  // Pentes des sécantes.
  const dx: number[] = []
  const dy: number[] = []
  const s: number[] = []
  for (let i = 0; i < n - 1; i++) {
    dx[i] = pts[i + 1].x - pts[i].x
    dy[i] = pts[i + 1].y - pts[i].y
    s[i] = dx[i] === 0 ? 0 : dy[i] / dx[i]
  }

  // Tangentes initiales.
  const m: number[] = new Array(n)
  m[0] = s[0]
  m[n - 1] = s[n - 2]
  for (let i = 1; i < n - 1; i++) {
    if (s[i - 1] * s[i] <= 0) m[i] = 0
    else m[i] = (s[i - 1] + s[i]) / 2
  }

  // Contrainte de monotonicité.
  for (let i = 0; i < n - 1; i++) {
    if (s[i] === 0) {
      m[i] = 0
      m[i + 1] = 0
    } else {
      const a = m[i] / s[i]
      const b = m[i + 1] / s[i]
      const h = a * a + b * b
      if (h > 9) {
        const t = 3 / Math.sqrt(h)
        m[i] = t * a * s[i]
        m[i + 1] = t * b * s[i]
      }
    }
  }

  // Hermite -> Bézier cubique.
  let d = `M${pts[0].x},${pts[0].y}`
  for (let i = 0; i < n - 1; i++) {
    const c1x = pts[i].x + dx[i] / 3
    const c1y = pts[i].y + (m[i] * dx[i]) / 3
    const c2x = pts[i + 1].x - dx[i] / 3
    const c2y = pts[i + 1].y - (m[i + 1] * dx[i]) / 3
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${pts[i + 1].x},${pts[i + 1].y}`
  }
  return d
}

/** Aire fermée sous une courbe lissée (pour les silhouettes / remplissages). */
export function areaPath(pts: Pt[], baseY: number): string {
  if (pts.length === 0) return ''
  const top = smoothPath(pts)
  return `${top} L${pts[pts.length - 1].x},${baseY} L${pts[0].x},${baseY} Z`
}
