import { motion } from 'framer-motion'
import { Mountain, Wind, Droplets } from 'lucide-react'
import { byTempDesc, weatherText } from '../lib/data'
import { tempColor } from '../lib/colors'
import WeatherGlyph from './WeatherGlyph'

// Comparaison « maintenant » : barres triées du plus chaud au plus froid,
// colorées par température. L'altitude monte à mesure qu'on descend la liste.

const temps = byTempDesc.map((l) => l.current.temp)
const LO = Math.floor(Math.min(...temps) - 3)
const HI = Math.ceil(Math.max(...temps) + 1)
const widthPct = (t: number) => 6 + ((t - LO) / (HI - LO)) * 94

export default function NowBars() {
  return (
    <div className="flex flex-col gap-2.5 sm:gap-3">
      {byTempDesc.map((l, i) => {
        const col = tempColor(l.current.temp)
        return (
          <motion.div
            key={l.slug}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: i * 0.06, duration: 0.5, ease: 'easeOut' }}
            className="group relative rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-3 transition-colors hover:border-white/15 hover:bg-white/[0.05] sm:px-5 sm:py-3.5"
          >
            <div className="flex items-baseline justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="tnum w-5 shrink-0 text-sm font-semibold text-white/30">{i + 1}</span>
                <span className="truncate text-[15px] font-semibold tracking-tight text-white sm:text-base">{l.name}</span>
                <span className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-medium text-white/55 sm:inline-flex">
                  <Mountain className="h-3 w-3" strokeWidth={2} />
                  <span className="tnum">{l.elevation.toLocaleString('fr-CH').replace(/ /g, ' ')} m</span>
                </span>
              </div>
              <div className="flex shrink-0 items-baseline gap-1">
                <span className="tnum text-2xl font-bold leading-none sm:text-[28px]" style={{ color: col }}>
                  {l.current.temp.toFixed(1)}
                </span>
                <span className="text-sm font-semibold" style={{ color: col }}>
                  °C
                </span>
              </div>
            </div>

            {/* barre */}
            <div className="mt-2.5 h-3 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${col}99, ${col})`,
                  boxShadow: `0 0 18px ${col}66`,
                }}
                initial={{ width: 0 }}
                whileInView={{ width: `${widthPct(l.current.temp)}%` }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ delay: 0.1 + i * 0.06, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>

            {/* méta */}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-white/45">
              <span className="inline-flex items-center gap-1 text-white/55">
                <WeatherGlyph code={l.current.weatherCode} className="h-3.5 w-3.5" strokeWidth={2} />
                {weatherText(l.current.weatherCode)}
              </span>
              <span className="tnum inline-flex items-center gap-1">
                ressenti <span className="text-white/70">{Math.round(l.current.apparent)}°</span>
              </span>
              <span className="tnum inline-flex items-center gap-1">
                <Droplets className="h-3 w-3" strokeWidth={2} />
                {l.current.humidity}%
              </span>
              <span className="tnum inline-flex items-center gap-1">
                <Wind className="h-3 w-3" strokeWidth={2} />
                {Math.round(l.current.wind)} km/h
              </span>
              <span className="tnum ml-auto inline-flex items-center gap-1 text-white/35 sm:hidden">
                <Mountain className="h-3 w-3" strokeWidth={2} />
                {l.elevation.toLocaleString('fr-CH').replace(/ /g, ' ')} m
              </span>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
