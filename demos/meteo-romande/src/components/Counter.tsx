import { useEffect, useRef, useState } from 'react'
import { animate, useInView } from 'framer-motion'

// Compteur qui anime 0 → valeur quand il entre dans le viewport.
export function Counter({
  value,
  decimals = 0,
  duration = 1.4,
  suffix = '',
  prefix = '',
  className,
}: {
  value: number
  decimals?: number
  duration?: number
  suffix?: string
  prefix?: string
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!inView) return
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (x) => setV(x),
    })
    return () => controls.stop()
  }, [inView, value, duration])
  return (
    <span ref={ref} className={className}>
      {prefix}
      {v.toLocaleString('fr-CH', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  )
}
