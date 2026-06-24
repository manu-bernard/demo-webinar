import { useState } from 'react'
import { motion } from 'framer-motion'
import { axes, locations } from '../lib/data'
import { hourLabel, dayLabel, monthLabel, fmt1 } from '../lib/format'
import { niceTicks, smoothPath } from '../lib/chart'
import { useMeasure } from '../lib/useMeasure'
import { ScaleSelector, type Scale } from './ScaleSelector'

const ease = [0.16, 1, 0.3, 1] as const

function seriesFor(scale: Scale) {
  if (scale === '24h') return { iso: axes.hours, get: (l: (typeof locations)[number]) => l.hourly, fmt: hourLabel }
  if (scale === '7d') return { iso: axes.days, get: (l: (typeof locations)[number]) => l.daily.tmean, fmt: dayLabel }
  return { iso: axes.months, get: (l: (typeof locations)[number]) => l.monthly, fmt: monthLabel }
}

export function Evolution({ active, setActive }: { active: string | null; setActive: (s: string | null) => void }) {
  const [scale, setScale] = useState<Scale>('24h')
  const [hover, setHover] = useState<number | null>(null)
  const [ref, width] = useMeasure<HTMLDivElement>()

  const W = width || 960
  const H = Math.round(Math.max(300, Math.min(440, W * 0.48)))
  const padL = 44
  const padR = 18
  const padT = 18
  const padB = 32
  const plotW = W - padL - padR
  const plotH = H - padT - padB

  const s = seriesFor(scale)
  const n = s.iso.length
  const stepX = plotW / Math.max(1, n - 1)
  const xAt = (i: number) => padL + i * stepX

  const allVals = locations.flatMap((l) => s.get(l))
  const dMin = Math.min(...allVals) - 1
  const dMax = Math.max(...allVals) + 1
  const yAt = (v: number) => padT + (1 - (v - dMin) / (dMax - dMin)) * plotH
  const { ticks } = niceTicks(dMin, dMax, 5)

  // sous-ensemble d'étiquettes X selon la largeur
  const maxTicks = scale === '7d' ? n : width < 560 ? (scale === '12m' ? 6 : 5) : scale === '12m' ? 12 : 9
  const every = Math.max(1, Math.ceil(n / maxTicks))
  const showTick = (i: number) => i % every === 0 || i === n - 1

  const order = [...locations].sort((a, b) => b.current.temp - a.current.temp)

  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    if (x < padL - 8 || x > W - padR + 8) {
      setHover(null)
      return
    }
    setHover(Math.max(0, Math.min(n - 1, Math.round((x - padL) / stepX))))
  }

  const hoverX = hover != null ? xAt(hover) : 0
  const tipRight = hover != null && hoverX > padL + plotW * 0.62

  return (
    <div>
      <div className="mb-5 flex flex-col gap-4">
        <ScaleSelector value={scale} onChange={(v) => { setScale(v); setHover(null) }} />
        <Legend order={order} active={active} setActive={setActive} />
      </div>

      <div ref={ref} className="relative w-full overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-b from-white/[0.035] to-transparent p-2 sm:p-4">
        <svg
          width={W}
          height={H}
          className="block touch-none"
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
        >
          {/* gridlines + axe Y */}
          {ticks.map((t) => {
            const zero = Math.abs(t) < 1e-6
            return (
              <g key={t}>
                <line
                  x1={padL}
                  x2={W - padR}
                  y1={yAt(t)}
                  y2={yAt(t)}
                  stroke={zero ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.06)'}
                  strokeWidth={1}
                />
                <text x={padL - 8} y={yAt(t) + 4} textAnchor="end" className={`text-[11px] tabular-nums ${zero ? 'fill-white/55' : 'fill-white/30'}`}>
                  {t}°
                </text>
              </g>
            )
          })}

          {/* axe X — ancrage adaptatif aux extrémités pour ne pas déborder */}
          {s.iso.map((iso, i) =>
            showTick(i) ? (
              <text
                key={iso}
                x={xAt(i)}
                y={H - 12}
                textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}
                className="fill-white/35 text-[11px]"
              >
                {s.fmt(iso)}
              </text>
            ) : null,
          )}

          {/* guide de survol */}
          {hover != null && (
            <line x1={hoverX} x2={hoverX} y1={padT} y2={padT + plotH} stroke="rgba(255,255,255,0.18)" strokeWidth={1} />
          )}

          {/* lignes */}
          <g key={scale}>
            {order.map((l, idx) => {
              const pts = s.get(l).map((v, i) => [xAt(i), yAt(v)] as [number, number])
              const dim = active && active !== l.slug
              const on = active === l.slug
              return (
                <motion.path
                  key={l.slug}
                  d={smoothPath(pts)}
                  fill="none"
                  stroke={l.color}
                  strokeWidth={on ? 3.2 : active ? 1.4 : 2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: dim ? 0.16 : 1 }}
                  transition={{ pathLength: { duration: 1, ease, delay: idx * 0.04 }, opacity: { duration: 0.3 } }}
                  style={on ? { filter: `drop-shadow(0 0 7px ${l.color}cc)` } : undefined}
                />
              )
            })}

            {/* point "maintenant" en bout de ligne */}
            {order.map((l) => {
              const v = s.get(l)
              const dim = active && active !== l.slug
              return (
                <circle
                  key={l.slug + '-end'}
                  cx={xAt(n - 1)}
                  cy={yAt(v[v.length - 1])}
                  r={active === l.slug ? 4.5 : 3}
                  fill={l.color}
                  opacity={dim ? 0.16 : 1}
                />
              )
            })}

            {/* points au survol */}
            {hover != null &&
              order.map((l) => {
                const v = s.get(l)
                const dim = active && active !== l.slug
                return (
                  <circle
                    key={l.slug + '-h'}
                    cx={hoverX}
                    cy={yAt(v[hover])}
                    r={active === l.slug ? 5 : 3.5}
                    fill={l.color}
                    stroke="rgba(7,10,20,0.9)"
                    strokeWidth={1.5}
                    opacity={dim ? 0.2 : 1}
                  />
                )
              })}
          </g>
        </svg>

        {/* tooltip */}
        {hover != null && (
          <div
            className="pointer-events-none absolute top-3 z-10 w-44 rounded-xl border border-white/12 bg-[#0a0e1c]/85 p-2.5 backdrop-blur-md"
            style={{ left: hoverX, transform: `translateX(${tipRight ? 'calc(-100% - 12px)' : '12px'})` }}
          >
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-white/45">{s.fmt(s.iso[hover])}</div>
            <div className="flex flex-col gap-1">
              {[...order]
                .sort((a, b) => s.get(b)[hover] - s.get(a)[hover])
                .map((l) => (
                  <div key={l.slug} className={`flex items-center justify-between gap-2 text-[12px] ${active && active !== l.slug ? 'opacity-40' : ''}`}>
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: l.color }} />
                      <span className="truncate text-white/75">{l.name}</span>
                    </span>
                    <span className="shrink-0 font-semibold tabular-nums text-white">{fmt1(s.get(l)[hover])}°</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Legend({
  order,
  active,
  setActive,
}: {
  order: typeof locations
  active: string | null
  setActive: (s: string | null) => void
}) {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1.5">
      {order.map((l) => (
        <button
          key={l.slug}
          onMouseEnter={() => setActive(l.slug)}
          onMouseLeave={() => setActive(null)}
          className="flex items-center gap-1.5 text-xs font-medium transition-opacity"
          style={{ opacity: active && active !== l.slug ? 0.4 : 1 }}
        >
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: l.color }} />
          <span className="text-white/70">{l.name}</span>
        </button>
      ))}
    </div>
  )
}
