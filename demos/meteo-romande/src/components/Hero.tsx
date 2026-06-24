import { motion } from 'framer-motion'
import { ChevronDown, MapPin } from 'lucide-react'
import { Counter } from './Counter'
import { warmest, coldest, weather } from '../lib/data'
import { releveLabel } from '../lib/format'

const ease = [0.16, 1, 0.3, 1] as const
const rise = {
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
}

export function Hero() {
  const spread = warmest.current.temp - coldest.current.temp
  // dénivelé entre le plus chaud et le plus froid (la paire mise en avant).
  const deniv = Math.abs(coldest.alt - warmest.alt)

  return (
    <header className="relative isolate flex min-h-[100svh] flex-col overflow-hidden">
      {/* fond : gradient vallée→sommet + halos dérivants + grain */}
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(120%_90%_at_50%_120%,#1a1228_0%,#0c1022_42%,#070a14_72%,#05060d_100%)]" />
      <Blob className="left-[-12%] top-[18%] h-[42rem] w-[42rem] bg-[#ff7a3c]" delay={0} />
      <Blob className="right-[-14%] top-[2%] h-[40rem] w-[40rem] bg-[#3f7bff]" delay={1.2} />
      <Blob className="left-[28%] top-[-18%] h-[34rem] w-[34rem] bg-[#15c2d6]" delay={2.1} />
      <div className="pointer-events-none absolute inset-0 -z-10 grain opacity-[0.5]" />
      <Stars />

      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-5 pb-44 pt-28 sm:px-8 sm:pb-52">
        <motion.div
          variants={rise}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.7, ease }}
          className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/65 backdrop-blur-md"
        >
          <MapPin className="h-3.5 w-3.5 text-white/45" />
          Suisse romande · relevé du {releveLabel(weather.releve.iso)}
        </motion.div>

        <motion.h1
          variants={rise}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.8, ease, delay: 0.06 }}
          className="max-w-4xl text-[clamp(2.7rem,9vw,6.5rem)] font-semibold leading-[0.95] tracking-[-0.03em]"
        >
          <span className="bg-gradient-to-r from-[#ffd166] via-[#ff8a3c] to-[#ff5a57] bg-clip-text text-transparent">Du lac</span>
          <br />
          <span className="bg-gradient-to-r from-[#baf0e6] via-[#43b8ff] to-[#6a7bff] bg-clip-text text-transparent">aux sommets.</span>
        </motion.h1>

        <motion.p
          variants={rise}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.8, ease, delay: 0.16 }}
          className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-white/60 sm:text-xl"
        >
          Huit lieux du Valais et du canton de Vaud. La même chaleur d'été, filtrée par
          l'altitude — du bord du Léman aux glaciers.
        </motion.p>

        <motion.div
          variants={rise}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.8, ease, delay: 0.28 }}
          className="mt-12 flex flex-wrap items-stretch gap-3 sm:gap-4"
        >
          <Stat
            value={<Counter value={spread} decimals={1} suffix="°C" />}
            label="d'écart en ce moment"
            tone="warm"
          />
          <Stat
            value={<Counter value={deniv} suffix=" m" />}
            label="de dénivelé"
            tone="cool"
          />
          <Stat
            value={
              <span className="flex items-baseline gap-1.5">
                <span style={{ color: warmest.color }}>{warmest.name}</span>
                <span className="text-white/30">→</span>
                <span style={{ color: coldest.color }}>{coldest.name}</span>
              </span>
            }
            label={`${warmest.alt} m → ${coldest.alt} m`}
            tone="none"
          />
        </motion.div>
      </div>

      <Ridge />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 1 }}
        className="absolute inset-x-0 bottom-6 z-10 flex justify-center"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-1 text-white/40"
        >
          <span className="text-[11px] uppercase tracking-[0.2em]">défiler</span>
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </motion.div>
    </header>
  )
}

function Stat({ value, label, tone }: { value: React.ReactNode; label: string; tone: 'warm' | 'cool' | 'none' }) {
  const ring =
    tone === 'warm'
      ? 'shadow-[inset_0_1px_0_rgba(255,180,120,0.18)]'
      : tone === 'cool'
        ? 'shadow-[inset_0_1px_0_rgba(120,180,255,0.18)]'
        : 'shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur-md ${ring}`}>
      <div className="text-2xl font-semibold tabular-nums tracking-tight text-white sm:text-3xl">{value}</div>
      <div className="mt-1 text-xs font-medium uppercase tracking-wide text-white/45">{label}</div>
    </div>
  )
}

function Blob({ className, delay }: { className: string; delay: number }) {
  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 0.28, scale: 1, x: [0, 24, -16, 0], y: [0, -18, 12, 0] }}
      transition={{
        opacity: { duration: 1.6, delay },
        scale: { duration: 1.6, delay },
        x: { duration: 22, repeat: Infinity, ease: 'easeInOut', delay },
        y: { duration: 26, repeat: Infinity, ease: 'easeInOut', delay },
      }}
      className={`pointer-events-none absolute -z-10 rounded-full blur-[90px] ${className}`}
    />
  )
}

// Ciel d'altitude : quelques étoiles faibles en haut.
function Stars() {
  const dots = [
    [8, 12], [18, 22], [27, 8], [41, 18], [55, 10], [63, 24], [72, 14], [83, 7], [91, 20], [12, 30], [48, 28], [78, 30],
  ]
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[45%]">
      {dots.map(([x, y], i) => (
        <motion.span
          key={i}
          className="absolute h-[2px] w-[2px] rounded-full bg-white"
          style={{ left: `${x}%`, top: `${y}%` }}
          animate={{ opacity: [0.1, 0.6, 0.1] }}
          transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

// Silhouette de montagnes dessinée à la main, deux plans pour la profondeur.
function Ridge() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10">
      <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="h-[40vh] max-h-[420px] min-h-[220px] w-full">
        <defs>
          <linearGradient id="ridgeBack" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1b2a52" />
            <stop offset="100%" stopColor="#0a1024" />
          </linearGradient>
          <linearGradient id="ridgeFront" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0c1330" />
            <stop offset="100%" stopColor="#05060d" />
          </linearGradient>
        </defs>
        <motion.path
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2, ease, delay: 0.2 }}
          d="M0,210 L120,150 L250,200 L360,120 L470,185 L600,90 L720,170 L840,110 L980,180 L1110,130 L1240,195 L1360,150 L1440,190 L1440,320 L0,320 Z"
          fill="url(#ridgeBack)"
        />
        <motion.path
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2, ease, delay: 0.35 }}
          d="M0,260 L150,215 L300,255 L430,190 L560,250 L700,205 L820,255 L960,215 L1090,260 L1230,210 L1340,255 L1440,225 L1440,320 L0,320 Z"
          fill="url(#ridgeFront)"
        />
        {/* neige sur les crêtes du plan avant */}
        <motion.path
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 1, delay: 1 }}
          d="M430,190 L470,212 L500,196 M700,205 L735,224 L760,210 M960,215 L995,234 L1020,220 M1230,210 L1265,230 L1290,216"
          fill="none"
          stroke="rgba(220,235,255,0.55)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
