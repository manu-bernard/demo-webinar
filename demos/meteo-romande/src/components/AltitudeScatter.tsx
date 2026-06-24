import { motion } from 'framer-motion'
import { locations } from '../lib/data'
import { linreg, niceTicks } from '../lib/chart'
import { useMeasure } from '../lib/useMeasure'
import { fmt1 } from '../lib/format'

const ease = [0.16, 1, 0.3, 1] as const

type Box = { x: number; y: number; w: number; h: number }
const overlap = (a: Box, b: Box) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y

export function AltitudeScatter({ active, setActive }: { active: string | null; setActive: (s: string | null) => void }) {
  const [ref, width] = useMeasure<HTMLDivElement>()
  const W = width || 900
  const H = Math.round(Math.max(320, Math.min(460, W * 0.6)))

  const padL = 52
  const padR = 18
  const padT = 26
  const padB = 42
  const plotW = W - padL - padR
  const plotH = H - padT - padB

  const temps = locations.map((l) => l.current.temp)
  const alts = locations.map((l) => l.alt)
  // marge à droite plus large : laisse de la place aux étiquettes du groupe chaud.
  const xMin = Math.min(...temps) - 2.2
  const xMax = Math.max(...temps) + 3.4
  const yMin = 250
  const yMax = 1950

  const xScale = (t: number) => padL + ((t - xMin) / (xMax - xMin)) * plotW
  const yScale = (a: number) => padT + (1 - (a - yMin) / (yMax - yMin)) * plotH

  // Régression temp ~ altitude → gradient adiabatique observé (°C / 100 m).
  const { a, b, r } = linreg(alts, temps)
  const lapse = Math.abs(a) * 100
  const trendA: [number, number] = [xScale(a * yMin + b), yScale(yMin)]
  const trendB: [number, number] = [xScale(a * yMax + b), yScale(yMax)]

  const xt = niceTicks(xMin, xMax, 5).ticks
  const yt = [500, 1000, 1500]

  // Placement glouton des étiquettes : on réserve d'abord la zone de l'encart
  // (haut-droite) pour qu'aucune étiquette ne passe dessous.
  const placed: Box[] = [{ x: W - 184, y: 2, w: 182, h: 84 }]
  const points = locations.map((l) => {
    const px = xScale(l.current.temp)
    const py = yScale(l.alt)
    const w = l.name.length * 6.7 + 8
    const h = 14
    const candidates: Box[] = [
      { x: px + 11, y: py - h / 2, w, h },
      { x: px - w - 11, y: py - h / 2, w, h },
      { x: px - w / 2, y: py + 11, w, h },
      { x: px - w / 2, y: py - h - 11, w, h },
      { x: px + 11, y: py + 9, w, h },
      { x: px + 11, y: py - h - 9, w, h },
      { x: px - w - 11, y: py + 9, w, h },
      { x: px - w - 11, y: py - h - 9, w, h },
    ]
    let box = candidates[0]
    for (const c of candidates) {
      const inBounds = c.x > 4 && c.x + c.w < W - 4 && c.y > 2 && c.y + c.h < H - 2
      if (inBounds && !placed.some((p) => overlap(p, c))) {
        box = c
        break
      }
    }
    placed.push(box)
    return { l, px, py, box }
  })

  return (
    <div ref={ref} className="relative w-full overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-b from-white/[0.04] to-transparent p-2 sm:p-4">
      <svg width={W} height={H} className="block">
        {/* gridlines altitude */}
        {yt.map((alt) => (
          <g key={alt}>
            <line x1={padL} x2={W - padR} y1={yScale(alt)} y2={yScale(alt)} stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
            <text x={padL - 10} y={yScale(alt) + 4} textAnchor="end" className="fill-white/35 text-[11px] tabular-nums">
              {alt} m
            </text>
          </g>
        ))}
        {/* ticks température */}
        {xt.map((t) => (
          <text key={t} x={xScale(t)} y={H - 14} textAnchor="middle" className="fill-white/35 text-[11px] tabular-nums">
            {t}°
          </text>
        ))}
        <text x={(padL + W - padR) / 2} y={H - 1} textAnchor="middle" className="fill-white/30 text-[10px] uppercase tracking-[0.18em]">
          température actuelle
        </text>

        {/* trend */}
        <motion.line
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease, delay: 0.2 }}
          x1={trendA[0]}
          y1={trendA[1]}
          x2={trendB[0]}
          y2={trendB[1]}
          stroke="rgba(255,255,255,0.4)"
          strokeWidth={1.5}
          strokeDasharray="5 6"
        />

        {/* points + labels */}
        {points.map(({ l, px, py, box }, i) => {
          const dim = active && active !== l.slug
          const on = active === l.slug
          return (
            <g
              key={l.slug}
              style={{ opacity: dim ? 0.35 : 1, transition: 'opacity 0.25s', cursor: 'pointer' }}
              onMouseEnter={() => setActive(l.slug)}
              onMouseLeave={() => setActive(null)}
            >
              <motion.circle
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease, delay: 0.4 + i * 0.05 }}
                cx={px}
                cy={py}
                r={on ? 9 : 6}
                fill={l.color}
                stroke="rgba(255,255,255,0.85)"
                strokeWidth={on ? 2 : 1.2}
                style={{ filter: `drop-shadow(0 0 8px ${l.color}aa)` }}
              />
              <motion.g
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 + i * 0.05 }}
              >
                <text x={box.x} y={box.y + 11} className="fill-white text-[11px] font-semibold" style={{ opacity: 0.92 }}>
                  {l.name}
                </text>
              </motion.g>
            </g>
          )
        })}
      </svg>

      <div className="pointer-events-none absolute right-3 top-3 rounded-xl border border-white/10 bg-black/40 px-3 py-1.5 text-right backdrop-blur-sm sm:right-4 sm:top-4 sm:py-2">
        <div className="text-base font-semibold tabular-nums text-white sm:text-lg">−{fmt1(lapse)} °C</div>
        <div className="text-[11px] font-medium text-white/50">par 100 m de montée</div>
        <div className="mt-0.5 text-[10px] tabular-nums text-white/35">corrélation {Math.abs(Math.round(r * 100))} %</div>
      </div>
    </div>
  )
}
