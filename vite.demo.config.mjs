import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'

// Build/dev d'UNE démo, choisie par la variable d'env DEMO_SLUG.
// Chaque démo est compilée isolément dans public/demos/<slug>/ avec son
// propre bundle JS/CSS hashé — rien n'est partagé au runtime.
const slug = process.env.DEMO_SLUG
if (!slug) {
  throw new Error(
    'DEMO_SLUG manquant. Utilise les scripts: `npm run demo:dev <slug>` ou `npm run demo:build <slug>`.',
  )
}

const root = resolve(process.cwd(), 'demos', slug)

export default defineConfig(({ command }) => ({
  root,
  // En build, les assets sont servis sous /demos/<slug>/ ; en dev, à la racine.
  base: command === 'build' ? `/demos/${slug}/` : '/',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: resolve(process.cwd(), 'public', 'demos', slug),
    emptyOutDir: true,
    chunkSizeWarningLimit: 1500,
  },
  server: {
    host: true,
    port: Number(process.env.PORT) || 5173,
    strictPort: false,
  },
}))
