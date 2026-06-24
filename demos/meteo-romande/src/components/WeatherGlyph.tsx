import { Sun, CloudSun, Cloud, CloudFog, CloudDrizzle, CloudRain, CloudSnow, CloudLightning } from 'lucide-react'
import type { LucideProps } from 'lucide-react'

// Code WMO -> icône lucide.
export default function WeatherGlyph({ code, ...props }: { code: number } & LucideProps) {
  if (code === 0) return <Sun {...props} />
  if (code <= 2) return <CloudSun {...props} />
  if (code === 3) return <Cloud {...props} />
  if (code <= 48) return <CloudFog {...props} />
  if (code <= 57) return <CloudDrizzle {...props} />
  if (code <= 67) return <CloudRain {...props} />
  if (code <= 77) return <CloudSnow {...props} />
  if (code <= 82) return <CloudRain {...props} />
  if (code <= 86) return <CloudSnow {...props} />
  return <CloudLightning {...props} />
}
