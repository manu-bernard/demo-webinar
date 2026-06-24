import { motion } from 'framer-motion'
import { Flame, Snowflake, Mountain, Clock, Radio, ArrowDown } from 'lucide-react'
import {
  data,
  hottest,
  coldest,
  spreadNow,
  highest,
  lowest,
  observedLabel,
  monthLong,
} from './lib/data'
import { tempColor, tempGradientCss } from './lib/colors'
import AltitudeProfile from './components/AltitudeProfile'
import NowBars from './components/NowBars'
import EvolutionChart from './components/EvolutionChart'

const denivele = (highest.elevation - lowest.elevation).toLocaleString('fr-CH').replace(/ /g, ' ')

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
      {children}
    </span>
  )
}

function SectionHead({ kicker, title, sub }: { kicker: string; title: string; sub: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.6 }}
      className="mb-7 sm:mb-9"
    >
      <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.22em] text-sky-300/70">{kicker}</div>
      <h2 className="headline text-3xl font-bold text-white sm:text-[40px]">{title}</h2>
      <p className="mt-2.5 max-w-2xl text-[15px] leading-relaxed text-white/55 sm:text-base">{sub}</p>
    </motion.div>
  )
}

function StatCard({
  icon,
  label,
  children,
  delay = 0,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="glass rounded-2xl p-5"
    >
      <div className="mb-3 inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-wider text-white/45">
        {icon}
        {label}
      </div>
      {children}
    </motion.div>
  )
}

export default function App() {
  return (
    <div className="relative min-h-full">
      <div className="atmosphere" />
      <div className="grain" />

      <main className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8">
        {/* ---------- En-tête ---------- */}
        <header className="flex items-center justify-between py-6">
          <div className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.2em] text-white/80">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-sky-400 to-rose-400 text-[15px]">
              ❄
            </span>
            Météo romande
          </div>
          <div className="hidden items-center gap-2 text-[12px] text-white/45 sm:flex">
            <Radio className="h-3.5 w-3.5 text-emerald-400" strokeWidth={2.4} />
            relevé figé · aucun appel réseau
          </div>
        </header>

        {/* ---------- Hero ---------- */}
        <section className="pt-8 sm:pt-12">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Eyebrow>
              <Clock className="h-3 w-3" strokeWidth={2.4} />
              Relevé du {observedLabel(data.observedAt)}
            </Eyebrow>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08 }}
            className="headline mt-5 text-[44px] font-extrabold sm:text-7xl"
          >
            <span className="bg-gradient-to-r from-rose-300 via-amber-200 to-white bg-clip-text text-transparent">Du lac</span>{' '}
            <span className="text-white/50">aux</span>{' '}
            <span className="bg-gradient-to-r from-white via-sky-200 to-indigo-300 bg-clip-text text-transparent">glaciers.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16 }}
            className="mt-5 max-w-2xl text-lg leading-relaxed text-white/60 sm:text-xl"
          >
            Huit lieux de Suisse romande, de la rive du Léman aux sommets glacés. La même région,{' '}
            <span className="font-semibold text-white">{spreadNow}&nbsp;°C d'écart</span> en ce moment — l'altitude raconte tout.
          </motion.p>

          {/* Chiffres-clés */}
          <div className="mt-9 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            <StatCard icon={<Mountain className="h-3.5 w-3.5" strokeWidth={2} />} label="Écart actuel" delay={0.24}>
              <div className="flex items-end gap-1.5">
                <span className="tnum text-5xl font-extrabold leading-none text-white">{spreadNow}</span>
                <span className="mb-1 text-xl font-bold text-white/70">°C</span>
              </div>
              <div className="mt-2 text-[13px] text-white/50">
                du bord du lac ({lowest.elevation}&nbsp;m) au glacier ({highest.elevation.toLocaleString('fr-CH').replace(/ /g, ' ')}&nbsp;m) ·{' '}
                {denivele}&nbsp;m de dénivelé
              </div>
            </StatCard>

            <StatCard icon={<Flame className="h-3.5 w-3.5 text-rose-400" strokeWidth={2} />} label="Le plus chaud" delay={0.32}>
              <div className="flex items-end justify-between gap-2">
                <div>
                  <div className="text-lg font-bold text-white">{hottest.name}</div>
                  <div className="text-[13px] text-white/45">{hottest.elevation}&nbsp;m</div>
                </div>
                <div className="tnum text-4xl font-extrabold leading-none" style={{ color: tempColor(hottest.current.temp) }}>
                  {Math.round(hottest.current.temp)}°
                </div>
              </div>
            </StatCard>

            <StatCard icon={<Snowflake className="h-3.5 w-3.5 text-sky-300" strokeWidth={2} />} label="Le plus froid" delay={0.4}>
              <div className="flex items-end justify-between gap-2">
                <div>
                  <div className="text-lg font-bold text-white">{coldest.name}</div>
                  <div className="text-[13px] text-white/45">
                    {coldest.elevation.toLocaleString('fr-CH').replace(/ /g, ' ')}&nbsp;m
                  </div>
                </div>
                <div className="tnum text-4xl font-extrabold leading-none" style={{ color: tempColor(coldest.current.temp) }}>
                  {Math.round(coldest.current.temp)}°
                </div>
              </div>
            </StatCard>
          </div>
        </section>

        {/* ---------- Maintenant ---------- */}
        <section className="pt-20 sm:pt-28">
          <SectionHead
            kicker="Maintenant"
            title="La température, d'un coup d'œil"
            sub="Les huit lieux comparés en direct, triés du plus chaud au plus froid. La couleur suit le thermomètre — et, comme par hasard, plus on grimpe, plus ça refroidit."
          />

          {/* Profil d'altitude (desktop) */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            id="altitude-card"
            className="mb-12 hidden rounded-3xl border border-white/8 bg-white/[0.02] p-6 md:block"
          >
            <AltitudeProfile />
          </motion.div>

          {/* Légende chaud → froid */}
          <div className="mb-6 flex items-center gap-3">
            <span className="text-[12px] font-medium text-white/45">froid</span>
            <div className="h-2.5 flex-1 rounded-full" style={{ background: tempGradientCss(-12, 36) }} />
            <span className="text-[12px] font-medium text-white/45">chaud</span>
          </div>

          <NowBars />
        </section>

        {/* ---------- Évolution ---------- */}
        <section className="pt-20 sm:pt-28">
          <SectionHead
            kicker="L'évolution"
            title="Les courbes, superposées"
            sub="Trois échelles de temps, huit courbes côte à côte. Survolez (ou touchez) le graphe pour lire toutes les valeurs ; cliquez une légende pour isoler un lieu."
          />

          <div id="evolution-card" className="rounded-3xl border border-white/8 bg-white/[0.02] p-5 sm:p-7">
            <EvolutionChart />
          </div>

          <p className="mt-5 flex items-start gap-2 text-[13.5px] leading-relaxed text-white/45">
            <ArrowDown className="mt-0.5 h-4 w-4 shrink-0 text-sky-300/70" strokeWidth={2} />
            Sur 12 mois, la courbe de {highest.name} plonge sous 0&nbsp;°C tout l'hiver pendant que le Léman reste clément :
            l'écart d'altitude se lit aussi dans le temps. Moyennes mensuelles de {monthLong(data.axes.monthly[0])} à{' '}
            {monthLong(data.axes.monthly[data.axes.monthly.length - 1])}.
          </p>
        </section>

        {/* ---------- Footer ---------- */}
        <footer className="mt-20 border-t border-white/8 pt-8 text-[13px] text-white/40 sm:mt-28">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              Données : {data.source} · relevé du {observedLabel(data.observedAt)} ({data.timezone}).
            </div>
            <div className="text-white/30">
              Figé au build — aucun appel réseau au runtime · <span className="text-white/55">demo.avqn.ch</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
