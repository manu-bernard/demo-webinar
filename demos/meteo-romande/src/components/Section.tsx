import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export function Section({
  eyebrow,
  title,
  intro,
  children,
  id,
}: {
  eyebrow: string
  title: ReactNode
  intro?: ReactNode
  children: ReactNode
  id?: string
}) {
  return (
    <section id={id} className="relative mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-12% 0px' }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="mb-10 sm:mb-14"
      >
        <div className="mb-3 flex items-center gap-3">
          <span className="h-px w-8 bg-white/25" />
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">{eyebrow}</span>
        </div>
        <h2 className="max-w-3xl text-balance text-3xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl">
          {title}
        </h2>
        {intro ? <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-white/55 sm:text-lg">{intro}</p> : null}
      </motion.div>
      {children}
    </section>
  )
}
