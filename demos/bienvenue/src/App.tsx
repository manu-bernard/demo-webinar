import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, OrbitControls } from '@react-three/drei'
import { motion } from 'framer-motion'
import type { Mesh } from 'three'

// Démo inaugurale de la galerie. Exemple du type de rendu qu'un agent
// produit. Tout est isolé dans ce dossier : ce composant, le CSS, les données.

function Knot() {
  const ref = useRef<Mesh>(null)
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.4
  })
  return (
    <Float speed={1.4} rotationIntensity={0.6} floatIntensity={1.1}>
      <mesh ref={ref}>
        <torusKnotGeometry args={[1, 0.32, 220, 32]} />
        <meshStandardMaterial color="#7c5cff" metalness={0.6} roughness={0.2} />
      </mesh>
    </Float>
  )
}

export default function App() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0a0a0f] text-white">
      <Canvas className="absolute inset-0" camera={{ position: [0, 0, 5], fov: 50 }}>
        <color attach="background" args={['#0a0a0f']} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={2.2} />
        <pointLight position={[-5, -2, -3]} intensity={30} color="#3bd6ff" />
        <Knot />
        <OrbitControls enablePan={false} enableZoom={false} />
      </Canvas>

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 px-6 text-center">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-medium tracking-wide text-white/70 backdrop-blur"
        >
          Démo inaugurale · demo.avqn.ch
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="max-w-3xl bg-gradient-to-b from-white to-white/55 bg-clip-text text-5xl font-bold leading-tight text-transparent sm:text-7xl"
        >
          Bonjour. 👋
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="max-w-xl text-lg text-white/60"
        >
          Cette galerie se remplit toute seule : un prompt, un agent, un mini-site
          statique conçu, testé et déployé. Celle-ci est la première. 🎉
        </motion.p>
      </div>
    </div>
  )
}
