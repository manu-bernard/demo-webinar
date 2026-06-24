import {
  Sun,
  CloudSun,
  Cloud,
  Cloudy,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  type LucideIcon,
} from 'lucide-react'

// Codes météo WMO → icône + libellé court (FR).
export function wmo(code: number): { Icon: LucideIcon; label: string } {
  if (code === 0) return { Icon: Sun, label: 'Ciel clair' }
  if (code === 1) return { Icon: Sun, label: 'Plutôt clair' }
  if (code === 2) return { Icon: CloudSun, label: 'Éclaircies' }
  if (code === 3) return { Icon: Cloudy, label: 'Couvert' }
  if (code === 45 || code === 48) return { Icon: CloudFog, label: 'Brouillard' }
  if (code >= 51 && code <= 57) return { Icon: CloudDrizzle, label: 'Bruine' }
  if (code >= 61 && code <= 67) return { Icon: CloudRain, label: 'Pluie' }
  if (code >= 71 && code <= 77) return { Icon: CloudSnow, label: 'Neige' }
  if (code >= 80 && code <= 82) return { Icon: CloudRain, label: 'Averses' }
  if (code === 85 || code === 86) return { Icon: CloudSnow, label: 'Averses de neige' }
  if (code >= 95) return { Icon: CloudLightning, label: 'Orage' }
  return { Icon: Cloud, label: '—' }
}
