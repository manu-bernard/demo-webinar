import { useLayoutEffect, useRef, useState } from 'react'

// Mesure la largeur d'un conteneur (ResizeObserver) pour des SVG nets,
// avec un texte à taille pixel constante quelle que soit la largeur.
export function useMeasure<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setWidth(el.clientWidth)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, width] as const
}
