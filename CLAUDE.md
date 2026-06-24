# CLAUDE.md

Guide pour Claude Code (claude.com/code) dans ce dépôt.

## Ce que c'est

`demo-webinar` génère **demo.avqn.ch** : une galerie de mini-sites de démonstration,
chacun **conçu, testé et déployé en autonomie par un agent IA**, à partir d'un seul
prompt, en direct pendant un webinaire.

Chaque démo est un **site statique isolé** dans `demos/<slug>/`, compilé vers
`public/demos/<slug>/`. Le serveur ne sert que `public/` (statique pur) → une démo
livrée ne peut plus casser, et on ne reconstruit jamais d'anciennes démos.

## Ta mission (mode autonome)

Quand Manu te donne un prompt du type « développe une page/démo qui fait X » :

1. **Tu es 100 % autonome. Tu ne poses aucune question.** Tu arbitres toutes les
   décisions de design et de technique toi-même, jusqu'au déploiement vérifié.
2. Tu crées **une nouvelle démo isolée** (nouveau dossier, nouveau lien). Tu ne
   modifies jamais une démo existante, ni le template, ni les scripts partagés.
3. Tu construis, tu **inspectes au screenshot**, tu itères jusqu'à ce que ce soit net.
4. Tu **déploies** et tu **vérifies le live** au screenshot.
5. Tu renvoies **un seul message final** : temps + lien + récap court + 🎉.

### Le pipeline (commandes)
```bash
npm run demo:new <slug> "<Titre>"        # 1. créer la démo (horodate le départ)
npm run demo:dev <slug>                  # 2. dev + hot reload (localhost:5173)
# … tu codes dans demos/<slug>/ …
npm run demo:shot <url> --name <slug>    # 3. inspecter desktop+mobile -> Read les PNG
npm run demo:ship <slug>                 # 4. build figé + vignette + galerie + temps
git add -A && git commit -m "demo: <slug>" && git push   # 5. déployer (auto-deploy)
# 6. vérifier https://demo.avqn.ch/demos/<slug>/ au screenshot
```
Skills dédiés : **`new-demo`**, **`inspect`**, **`ship-demo`**.

## Règles non négociables

**Isolation.** Une démo = un dossier `demos/<slug>/` autosuffisant : son code, son CSS,
ses données. Rien de partagé au runtime. Ne lis/écris jamais hors de ton dossier pendant
une mission (le commit final inclut `public/` et `registry.json`, gérés par les scripts).

**Statique et incassable.** Si la démo a besoin de données externes (API, scraping…),
récupère-les **au build** et fige-les en JSON dans `demos/<slug>/data/`. La démo en ligne
ne fait **aucun appel réseau au runtime**.

**Observe ton travail.** Tu as un œil : Playwright. Tu ne livres jamais sans avoir regardé
au moins une capture propre en desktop **et** mobile. Traque alignements, espacements,
couleurs, contrastes, débordements. (Skill `inspect`.)

**Qualité visuelle.** Front-end moderne et soigné, jamais d'esthétique « IA générique »
(le plugin `frontend-design` est là pour ça). Sobre, net, animé avec goût.

## Message final (format exact)

> 🎉 **&lt;Titre&gt;** — fait en **&lt;temps&gt;**.
> 🔗 https://demo.avqn.ch/demos/&lt;slug&gt;/
> _&lt;une phrase : ce que fait la démo&gt;_

Rien de plus. Pas de pavé, pas de liste d'étapes.

## Définition de « terminé »
- [ ] La démo vit dans `demos/<slug>/`, isolée.
- [ ] Données externes éventuelles figées en JSON.
- [ ] Inspectée au screenshot (desktop + mobile), défauts corrigés.
- [ ] `demo:ship` passé (build + vignette + galerie OK).
- [ ] Poussée, déploiement **vérifié sur le live** au screenshot.
- [ ] Message final envoyé (temps + lien + récap + 🎉).

## Stack & structure

- **Vite + React + TypeScript**, **Tailwind v4**, **Three.js** via `@react-three/fiber`
  + `@react-three/drei` + `@react-three/postprocessing`, **Framer Motion**, **GSAP**,
  **lucide-react**. Tout est déjà installé (un seul `node_modules` à la racine).

```
demos/_template/   point de départ copié par demo:new
demos/<slug>/      une démo : index.html, src/, data/, demo.json
public/            sortie statique servie (galerie + builds + vignettes) — COMMITÉE
registry.json      index des démos (généré)
scripts/           pipeline : new-demo, dev-demo, build-demo, shot, build-home, ship
```

Chaque démo se build sous `base: /demos/<slug>/` → les chemins d'assets sont déjà
corrects en ligne. La galerie `public/index.html` est **générée** par `build-home` :
ne l'édite jamais à la main.

## Déploiement

`git push` → Coolify resync `public/` sur **demo.avqn.ch** (serveur Prod, projet
05-Websites). Statique pur, **un seul conteneur** pour toutes les démos, aucune
reconstruction des anciennes (robuste, et léger en disque).

## Plugins & environnement (`.claude/settings.json`)
- `frontend-design` (marketplace officiel `claude-plugins-official`) — interfaces
  front-end haut de gamme. **Activé.**
- Hook `SessionStart` : installe les deps + le Chromium de Playwright au démarrage
  (sessions web incluses), pour que tu sois opérationnel tout de suite.

## Conventions
- Slug en kebab-case, court, descriptif.
- N'édite le template ou les scripts QUE si Manu demande explicitement d'améliorer le
  système (hors mission de démo).
