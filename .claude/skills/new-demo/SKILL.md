---
name: new-demo
description: Démarre une nouvelle démo isolée à partir du template. À utiliser au tout début d'une mission de démo, avant d'écrire du code. Crée demos/<slug>/ et horodate le départ (pour le temps total).
---

# Nouvelle démo

Crée un mini-site **isolé** à partir de `demos/_template`.

## Commande
```bash
npm run demo:new <slug> "<Titre lisible>"
```
- `<slug>` : court, en kebab-case (ex. `prix-immobilier`, `galaxie-3d`). Il devient l'URL `/demos/<slug>/`. Tu le choisis toi-même d'après la mission, sans demander.
- Le titre s'affiche dans la galerie.

La commande copie le template, écrit `demos/<slug>/demo.json` (avec l'horodatage de
départ servant à calculer le temps total) et règle le `<title>` HTML.

## Ensuite
1. Travaille **uniquement** dans `demos/<slug>/`. Ne touche jamais aux autres démos.
2. Dev : `npm run demo:dev <slug>` → http://localhost:5173
3. Construis la démo demandée : remplace `src/App.tsx`, ajoute composants / CSS / data.
4. Données externes → fige-les en JSON dans `demos/<slug>/data/` (cf. le README du dossier).
5. Inspecte (skill `inspect`), itère, puis expédie (skill `ship-demo`).

Règle d'or : autonomie totale, aucune question. Tu arbitres tout.
