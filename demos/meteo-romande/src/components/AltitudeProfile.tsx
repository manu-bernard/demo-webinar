import { motion } from 'framer-motion'
import { byAltDesc, type Loc } from '../lib/data'
import { tempColor } from '../lib/colors'
import { smoothPath, areaPath, type Pt } from '../lib/path'

// Silhouette « ascension » : 8 lieux placés du plus bas (gauche) au plus haut
// (droite), à leur altitude réelle. Le point est coloré par la température
// actuelle → on lit l'histoire d'un coup d'œil : on monte, ça refroidit.

const SHORT: Record<string, string> = {
  vevey: 'Vevey',
  lausanne: 'Lausanne',
  yverdon: 'Yverdon',
  'chateau-doex': "Château-d'Œx",
  leysin: 'Leysin',
  chasseron: 'Chasseron',
  'rochers-de-naye': 'Rochers',
  'glacier-3000': 'Glacier 3000',
}

const W = 1000
const H = 480
const PAD = { l: 68, r: 34, t: 78, b: 66 }
const innerW = W - PAD.l - PAD.r
const innerH = H - PAD.t - PAD.b
const baseY = PAD.t + innerH
const ALT_MAX = 3000

const halo = { paintOrder: 'stroke', stroke: '#080c16', strokeWidth: 4, strokeLinejoin: 'round' } as const

export default function AltitudeProfile() {
  const ordered: Loc[] = [...byAltDesc].reverse() // altitude croissante (lac → glacier)
  const n = ordered.length
  const x = (i: number) => PAD.l + (i / (n - 1)) * innerW
  const y = (alt: number) => baseY - (alt / ALT_MAX) * innerH

  const pts: Pt[] = ordered.map((l, i) => ({ x: x(i), y: y(l.elevation) }))
  const ridge = smoothPath(pts)
  const fill = areaPath(pts, baseY)
  const grid = [0, 1000, 2000, 3000]

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="ap-mass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.22" />
            <stop offset="48%" stopColor="#22d3ee" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#fb7185" stopOpacity="0.16" />
          </linearGradient>
          <linearGradient id="ap-ridge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="55%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#a5b4fc" />
          </linearGradient>
          <filter id="ap-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Lignes d'altitude */}
        {grid.map((g) => (
          <g key={g}>
            <line
              x1={PAD.l}
              x2={W - PAD.r}
              y1={y(g)}
              y2={y(g)}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={1}
              strokeDasharray={g === 0 ? '0' : '3 6'}
            />
            <text x={PAD.l - 14} y={y(g) + 4} textAnchor="end" className="tnum" fill="rgba(231,236,245,0.4)" fontSize={12}>
              {g.toLocaleString('fr-CH')} m
            </text>
          </g>
        ))}

        {/* Masse de la montagne */}
        <motion.path
          d={fill}
          fill="url(#ap-mass)"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        />
        {/* Crête */}
        <motion.path
          d={ridge}
          fill="none"
          stroke="url(#ap-ridge)"
          strokeWidth={2.5}
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.9 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
        />

        {/* Lieux */}
        {ordered.map((l, i) => {
          const px = x(i)
          const py = y(l.elevation)
          const col = tempColor(l.current.temp)
          const anchor = i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'
          return (
            <g key={l.slug}>
              {/* tige */}
              <motion.line
                x1={px}
                x2={px}
                y1={baseY}
                y2={py}
                stroke={col}
                strokeOpacity={0.28}
                strokeWidth={1.5}
                strokeDasharray="2 5"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: 0.5 + i * 0.07, duration: 0.5 }}
              />
              {/* halo + point */}
              <motion.circle
                cx={px}
                cy={py}
                r={9}
                fill={col}
                filter="url(#ap-glow)"
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: 0.55 + i * 0.07, type: 'spring', stiffness: 320, damping: 18 }}
                style={{ transformOrigin: `${px}px ${py}px` }}
              />
              <circle cx={px} cy={py} r={3.5} fill="#0a0f1c" opacity={0.85} />
              {/* température */}
              <motion.text
                x={px}
                y={py - 18}
                textAnchor="middle"
                className="tnum"
                fill={col}
                fontSize={22}
                fontWeight={800}
                style={halo}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: 0.65 + i * 0.06, duration: 0.5 }}
              >
                {Math.round(l.current.temp)}°
              </motion.text>
              {/* nom + altitude */}
              <motion.g
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: 0.72 + i * 0.06, duration: 0.5 }}
              >
                <text x={px} y={baseY + 24} textAnchor={anchor} fill="#e7ecf5" fontSize={13} fontWeight={600}>
                  {SHORT[l.slug] ?? l.name}
                </text>
                <text x={px} y={baseY + 42} textAnchor={anchor} className="tnum" fill="rgba(231,236,245,0.45)" fontSize={12}>
                  {l.elevation.toLocaleString('fr-CH')} m
                </text>
              </motion.g>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
