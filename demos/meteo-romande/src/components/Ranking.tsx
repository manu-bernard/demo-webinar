import { motion } from 'framer-motion'
import { Droplets, Wind } from 'lucide-react'
import { locations, minNow, maxNow } from '../lib/data'
import { wmo } from '../lib/wmo'
import { fmt1, fmt0 } from '../lib/format'

const ease = [0.16, 1, 0.3, 1] as const

// Largeur de barre : on étire un peu le domaine pour que la plus froide reste lisible.
const lo = minNow - 6
const hi = maxNow + 0.4
const widthOf = (t: number) => Math.max(20, Math.min(100, ((t - lo) / (hi - lo)) * 100))

export function Ranking({ active, setActive }: { active: string | null; setActive: (s: string | null) => void }) {
  const rows = [...locations].sort((a, b) => b.current.temp - a.current.temp)

  return (
    <div className="flex flex-col gap-2.5">
      {rows.map((l, i) => {
        const { Icon, label } = wmo(l.current.code)
        const dim = active && active !== l.slug
        return (
          <motion.div
            key={l.slug}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-8% 0px' }}
            transition={{ duration: 0.5, ease, delay: i * 0.06 }}
            onMouseEnter={() => setActive(l.slug)}
            onMouseLeave={() => setActive(null)}
            className={`group grid grid-cols-[1.4rem_1fr_auto] items-center gap-3 rounded-2xl border px-3 py-3 transition-colors sm:gap-5 sm:px-5 sm:py-4 ${
              active === l.slug ? 'border-white/20 bg-white/[0.06]' : 'border-white/8 bg-white/[0.025]'
            }`}
            style={{ opacity: dim ? 0.45 : 1 }}
          >
            <span className="text-sm font-semibold tabular-nums text-white/30">{i + 1}</span>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-base font-semibold text-white sm:text-lg">{l.name}</h3>
                <span className="shrink-0 rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/40">
                  {l.canton}
                </span>
                <span className="shrink-0 text-xs font-medium tabular-nums text-white/35">{fmt0(l.alt)} m</span>
              </div>

              {/* barre */}
              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${widthOf(l.current.temp)}%` }}
                  viewport={{ once: true, margin: '-8% 0px' }}
                  transition={{ duration: 1, ease, delay: 0.15 + i * 0.06 }}
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${l.color}55, ${l.color})`,
                    boxShadow: `0 0 18px ${l.color}66`,
                  }}
                />
              </div>

              <div className="mt-2 flex items-center gap-3 text-[11px] font-medium text-white/40">
                <span className="inline-flex items-center gap-1">
                  <Icon className="h-3.5 w-3.5" style={{ color: l.color }} />
                  {label}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Droplets className="h-3.5 w-3.5" /> {l.current.humidity}%
                </span>
                <span className="inline-flex items-center gap-1">
                  <Wind className="h-3.5 w-3.5" /> {fmt0(l.current.wind)} km/h
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-semibold tabular-nums leading-none tracking-tight sm:text-4xl" style={{ color: l.color }}>
                {fmt1(l.current.temp)}°
              </div>
              <div className="mt-1.5 text-[11px] font-medium tabular-nums text-white/40">ressenti {fmt1(l.current.apparent)}°</div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
