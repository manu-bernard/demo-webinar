import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  data,
  locations,
  locColor,
  hourLabel,
  hourShort,
  dayLabel,
  monthLabel,
  monthLong,
} from '../lib/data'
import { smoothPath, type Pt } from '../lib/path'

type RangeId = '24h' | '7j' | '12m'
const RANGES: { id: RangeId; label: string; short: string }[] = [
  { id: '24h', label: '24 heures', short: '24 h' },
  { id: '7j', label: '7 jours', short: '7 j' },
  { id: '12m', label: '12 mois', short: '12 mois' },
]

// Ordre d'altitude (croissant) -> sert au délai d'apparition « du bas vers le haut ».
const altRank = new Map<string, number>()
;[...locations].sort((a, b) => a.elevation - b.elevation).forEach((l, i) => altRank.set(l.slug, i))

function niceTicks(min: number, max: number, count = 5): number[] {
  const span = max - min || 1
  const step0 = span / count
  const mag = Math.pow(10, Math.floor(Math.log10(step0)))
  const norm = step0 / mag
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag
  const start = Math.ceil(min / step) * step
  const out: number[] = []
  for (let v = start; v <= max + 1e-9; v += step) out.push(Math.round(v * 100) / 100)
  return out
}

export default function EvolutionChart() {
  const [range, setRange] = useState<RangeId>('24h')
  const [hover, setHover] = useState<number | null>(null)
  const [muted, setMuted] = useState<Set<string>>(new Set())
  const [legHover, setLegHover] = useState<string | null>(null)

  const wrapRef = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(760)
  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const update = () => setW(el.clientWidth)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const series = useMemo(() => {
    if (range === '24h')
      return { axis: data.axes.hourly, get: (s: string) => locations.find((l) => l.slug === s)!.hourly }
    if (range === '7j')
      return { axis: data.axes.daily, get: (s: string) => locations.find((l) => l.slug === s)!.daily.mean }
    return { axis: data.axes.monthly, get: (s: string) => locations.find((l) => l.slug === s)!.monthly }
  }, [range])

  const len = series.axis.length
  const h = w < 560 ? 300 : 384
  const pad = { l: 40, r: 16, t: 18, b: 32 }
  const iw = Math.max(10, w - pad.l - pad.r)
  const ih = Math.max(10, h - pad.t - pad.b)

  // Domaine Y stable (toutes les courbes, indépendamment des masquées).
  const { ymin, ymax } = useMemo(() => {
    let mn = Infinity
    let mx = -Infinity
    for (const l of locations) {
      for (const v of series.get(l.slug)) {
        if (v == null) continue
        if (v < mn) mn = v
        if (v > mx) mx = v
      }
    }
    const p = Math.max(1, (mx - mn) * 0.1)
    return { ymin: mn - p, ymax: mx + p }
  }, [series])

  const x = (i: number) => pad.l + (len <= 1 ? iw / 2 : (i / (len - 1)) * iw)
  const y = (v: number) => pad.t + ih - ((v - ymin) / (ymax - ymin)) * ih
  const stepX = len <= 1 ? iw : iw / (len - 1)

  const ticks = useMemo(() => niceTicks(ymin, ymax, 5), [ymin, ymax])
  const showZero = ymin < 0 && ymax > 0

  // Libellés X : densité adaptée à la largeur.
  const xLabelIdx = useMemo(() => {
    const idx: number[] = []
    if (range === '24h') {
      for (let i = 0; i < len; i++) if (Number(series.axis[i].slice(11, 13)) % 3 === 0) idx.push(i)
    } else if (range === '12m') {
      const step = w < 440 ? 2 : 1
      for (let i = 0; i < len; i++) if (i % step === 0) idx.push(i)
    } else {
      for (let i = 0; i < len; i++) idx.push(i)
    }
    return idx
  }, [range, len, w, series])

  const xText = (i: number) =>
    range === '24h' ? hourShort(series.axis[i]) : range === '7j' ? dayLabel(series.axis[i]) : monthLabel(series.axis[i])

  const visible = locations.filter((l) => !muted.has(l.slug))
  const toggle = (slug: string) =>
    setMuted((prev) => {
      const next = new Set(prev)
      next.has(slug) ? next.delete(slug) : next.add(slug)
      return next
    })

  const hoverHeader =
    hover == null
      ? ''
      : range === '24h'
        ? hourLabel(series.axis[hover])
        : range === '7j'
          ? dayLabel(series.axis[hover])
          : monthLong(series.axis[hover])

  const hoverRows =
    hover == null
      ? []
      : [...visible]
          .map((l) => ({ l, v: series.get(l.slug)[hover] }))
          .filter((r) => r.v != null)
          .sort((a, b) => (b.v as number) - (a.v as number))

  const onMove = (e: React.PointerEvent) => {
    const rect = (e.currentTarget as SVGRectElement).getBoundingClientRect()
    const px = e.clientX - rect.left
    const i = Math.round((px - pad.l) / stepX)
    setHover(Math.max(0, Math.min(len - 1, i)))
  }

  const tooltipLeft = hover == null ? 0 : x(hover)
  const tipSide = tooltipLeft > w * 0.58 ? -1 : 1
  const TIP_W = w < 480 ? 158 : 192

  return (
    <div>
      {/* Sélecteur */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1">
          {RANGES.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                setRange(r.id)
                setHover(null)
              }}
              className="relative rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors sm:px-4"
              style={{ color: range === r.id ? '#06121f' : 'rgba(231,236,245,0.65)' }}
            >
              {range === r.id && (
                <motion.span
                  layoutId="range-pill"
                  className="absolute inset-0 rounded-full bg-white"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative z-10">
                <span className="sm:hidden">{r.short}</span>
                <span className="hidden sm:inline">{r.label}</span>
              </span>
            </button>
          ))}
        </div>
        <AnimatePresence>
          {muted.size > 0 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMuted(new Set())}
              className="text-[12px] font-medium text-white/45 underline-offset-2 hover:text-white/80 hover:underline"
            >
              tout afficher
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Graphe */}
      <div ref={wrapRef} className="relative w-full select-none" style={{ height: h }}>
        <svg width={w} height={h} className="block">
          <defs>
            <filter id="ec-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grille horizontale + libellés Y */}
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={pad.l}
                x2={w - pad.r}
                y1={y(t)}
                y2={y(t)}
                stroke={showZero && t === 0 ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.07)'}
                strokeWidth={1}
              />
              <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" className="tnum" fill="rgba(231,236,245,0.4)" fontSize={11}>
                {t}°
              </text>
            </g>
          ))}

          {/* Libellés X */}
          {xLabelIdx.map((i) => (
            <text
              key={i}
              x={x(i)}
              y={h - 10}
              textAnchor={i === 0 ? 'start' : i === len - 1 ? 'end' : 'middle'}
              fill="rgba(231,236,245,0.42)"
              fontSize={11}
              className="tnum"
            >
              {xText(i)}
            </text>
          ))}

          {/* Courbes */}
          <g key={range}>
            {locations.map((l) => {
              const vals = series.get(l.slug)
              const pts: Pt[] = vals.map((v, i) => ({ x: x(i), y: y(v) })).filter((_, i) => vals[i] != null)
              const col = locColor(l.slug)
              const isMuted = muted.has(l.slug)
              const dim = legHover != null && legHover !== l.slug
              const active = legHover === l.slug
              return (
                <motion.path
                  key={l.slug}
                  d={smoothPath(pts)}
                  fill="none"
                  stroke={col}
                  strokeWidth={active ? 3.4 : 2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter={active ? 'url(#ec-glow)' : undefined}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{
                    pathLength: 1,
                    opacity: isMuted ? 0.07 : dim ? 0.22 : 0.95,
                  }}
                  transition={{
                    pathLength: { duration: 1.1, ease: 'easeInOut', delay: (altRank.get(l.slug) ?? 0) * 0.05 },
                    opacity: { duration: 0.3 },
                  }}
                />
              )
            })}
          </g>

          {/* Survol : guide + points */}
          {hover != null && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={pad.t + ih} stroke="rgba(255,255,255,0.25)" strokeWidth={1} />
              {visible.map((l) => {
                const v = series.get(l.slug)[hover]
                if (v == null) return null
                return <circle key={l.slug} cx={x(hover)} cy={y(v)} r={4} fill={locColor(l.slug)} stroke="#06121f" strokeWidth={1.5} />
              })}
            </g>
          )}

          {/* Zone de capture du pointeur */}
          <rect
            x={pad.l}
            y={pad.t}
            width={iw}
            height={ih}
            fill="transparent"
            style={{ touchAction: 'none' }}
            onPointerMove={onMove}
            onPointerDown={onMove}
            onPointerLeave={() => setHover(null)}
          />
        </svg>

        {/* Infobulle */}
        <AnimatePresence>
          {hover != null && hoverRows.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.12 }}
              className="glass pointer-events-none absolute z-20 rounded-2xl p-3 shadow-2xl"
              style={{
                left: tooltipLeft,
                top: 8,
                width: TIP_W,
                transform: 'translateX(' + (tipSide === 1 ? 14 : -(TIP_W + 14)) + 'px)',
              }}
            >
              <div className="mb-2 text-[12px] font-semibold tracking-tight text-white/90">{hoverHeader}</div>
              <div className="flex flex-col gap-1">
                {hoverRows.map(({ l, v }) => (
                  <div key={l.slug} className="flex items-center justify-between gap-2 text-[12px]">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: locColor(l.slug) }} />
                      <span className="truncate text-white/65">{l.name}</span>
                    </span>
                    <span className="tnum shrink-0 font-semibold text-white">{(v as number).toFixed(1)}°</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Légende */}
      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
        {[...locations]
          .sort((a, b) => a.elevation - b.elevation)
          .map((l) => {
            const isMuted = muted.has(l.slug)
            return (
              <button
                key={l.slug}
                onClick={() => toggle(l.slug)}
                onPointerEnter={() => setLegHover(l.slug)}
                onPointerLeave={() => setLegHover(null)}
                className="group inline-flex items-center gap-1.5 text-[12.5px] transition-opacity"
                style={{ opacity: isMuted ? 0.4 : 1 }}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full transition-transform group-hover:scale-125"
                  style={{ background: locColor(l.slug), boxShadow: `0 0 10px ${locColor(l.slug)}88` }}
                />
                <span
                  className="font-medium text-white/70 group-hover:text-white"
                  style={{ textDecoration: isMuted ? 'line-through' : 'none' }}
                >
                  {l.name}
                </span>
              </button>
            )
          })}
      </div>
    </div>
  )
}
