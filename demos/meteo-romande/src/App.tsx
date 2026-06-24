import { useState } from 'react'
import { Hero } from './components/Hero'
import { Section } from './components/Section'
import { Ranking } from './components/Ranking'
import { AltitudeScatter } from './components/AltitudeScatter'
import { Evolution } from './components/Evolution'
import { weather, locations, lowest, highest, coldest } from './lib/data'
import { releveLabel, monthLong, fmt1, fmt0 } from './lib/format'
import { linreg } from './lib/chart'

export default function App() {
  // Lieu mis en avant, partagé entre les graphiques (survol croisé).
  const [active, setActive] = useState<string | null>(null)

  const { a } = linreg(locations.map((l) => l.alt), locations.map((l) => l.current.temp))
  const lapse = Math.abs(a) * 100

  return (
    <div className="min-h-full bg-[#070a14] text-white antialiased">
      <Hero />

      <main>
        <Section
          id="now"
          eyebrow="En direct"
          title="La température, lieu par lieu"
          intro={
            <>
              Relevé du {releveLabel(weather.releve.iso)}. Les huit lieux triés du plus chaud au plus froid —
              la couleur suit le thermomètre, du rouge brûlant au bleu glacé.
            </>
          }
        >
          <Ranking active={active} setActive={setActive} />
        </Section>

        <Section
          id="altitude"
          eyebrow="La clé"
          title="Plus on monte, plus ça tombe"
          intro={
            <>
              Chaque point est un lieu, placé selon sa température et son altitude. La pente est sans appel :
              on perd près de <strong className="font-semibold text-white/80">{fmt1(lapse)} °C tous les 100 mètres</strong> de
              dénivelé. {coldest.name}, perché à {fmt0(coldest.alt)} m, reste le plus frais.
            </>
          }
        >
          <AltitudeScatter active={active} setActive={setActive} />
        </Section>

        <Section
          id="evolution"
          eyebrow="Dans le temps"
          title="Trois fenêtres sur le thermomètre"
          intro={
            <>
              Vingt-quatre heures, sept jours, douze mois. Les mêmes huit courbes superposées : l'été les
              rassemble, l'hiver les écarte quand les sommets plongent sous zéro.
            </>
          }
        >
          <Evolution active={active} setActive={setActive} />
        </Section>
      </main>

      <Footer />
    </div>
  )
}

function Footer() {
  const gen = weather.generatedAt.slice(0, 10)
  const genMonth = monthLong(gen.slice(0, 7))
  const day = Number(gen.slice(8, 10))
  return (
    <footer className="mx-auto w-full max-w-6xl px-5 pb-16 pt-8 sm:px-8">
      <div className="rounded-3xl border border-white/8 bg-white/[0.02] p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-white/80">Du lac aux sommets</div>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-white/45">
              Du Léman ({lowest.name}, {fmt0(lowest.alt)} m) aux glaciers ({highest.name}, {fmt0(highest.alt)} m).
              Données <span className="text-white/60">figées au build</span> le {day} {genMonth} — la page en ligne
              ne fait aucun appel réseau.
            </p>
          </div>
          <div className="text-sm text-white/45 sm:text-right">
            <div>
              Source ·{' '}
              <a href="https://open-meteo.com" target="_blank" rel="noreferrer" className="text-white/70 underline-offset-2 hover:underline">
                Open-Meteo
              </a>{' '}
              (CC BY 4.0)
            </div>
            <div className="mt-1">Relevé du {releveLabel(weather.releve.iso)}</div>
            <div className="mt-1 text-white/30">demo.avqn.ch</div>
          </div>
        </div>
      </div>
    </footer>
  )
}
