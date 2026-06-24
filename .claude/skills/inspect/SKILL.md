---
name: inspect
description: Capture et inspecte une démo au screenshot (desktop + mobile) avant de l'expédier. À utiliser pour vérifier alignements, espacements, couleurs, contrastes, débordements. Indispensable avant ship-demo.
---

# Inspecter au screenshot

Tu DOIS regarder ton travail avant de le livrer. Ton œil, c'est Playwright.

## Capturer
Serveur de dev lancé (`npm run demo:dev <slug>`), puis :
```bash
npm run demo:shot http://localhost:5173 --name <slug>
```
Écrit `.shots/<slug>-desktop.png` et `.shots/<slug>-mobile.png`.
**Ouvre-les avec l'outil Read** — tu peux voir les images.

## Inspecter méthodiquement
Pour CHAQUE capture (desktop ET mobile) :
- **Alignement** : marges cohérentes, rien qui déborde, grilles droites.
- **Espacement** : ça respire, pas d'éléments collés ni de vides béants.
- **Couleurs / contraste** : texte lisible, hiérarchie visuelle claire.
- **Typo** : tailles cohérentes, aucun texte coupé ni tronqué.
- **3D / canvas** : bien cadré, aucun z-index qui masque le contenu.
- **Mobile** : zéro débordement horizontal, cibles tactiles correctes.

Note les défauts → corrige → recapture. Répète jusqu'à ce que ce soit net.
Ne livre jamais sans une capture propre en desktop **et** en mobile.
