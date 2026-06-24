import { motion } from 'framer-motion'

export type Scale = '24h' | '7d' | '12m'

const OPTIONS: { id: Scale; label: string; sub: string }[] = [
  { id: '24h', label: '24 h', sub: 'par heure' },
  { id: '7d', label: '7 jours', sub: 'par jour' },
  { id: '12m', label: '12 mois', sub: 'moyennes' },
]

export function ScaleSelector({ value, onChange }: { value: Scale; onChange: (s: Scale) => void }) {
  return (
    <div className="inline-flex rounded-2xl border border-white/10 bg-white/[0.04] p-1 backdrop-blur-md">
      {OPTIONS.map((o) => {
        const active = o.id === value
        return (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className="relative rounded-xl px-3.5 py-2 text-left transition-colors sm:px-5"
          >
            {active && (
              <motion.span
                layoutId="scalePill"
                className="absolute inset-0 -z-10 rounded-xl bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <span className={`block text-sm font-semibold ${active ? 'text-white' : 'text-white/50'}`}>{o.label}</span>
            <span className={`block text-[10px] ${active ? 'text-white/55' : 'text-white/30'}`}>{o.sub}</span>
          </button>
        )
      })}
    </div>
  )
}
