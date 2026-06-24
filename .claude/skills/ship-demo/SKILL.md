---
name: ship-demo
description: Finalise et déploie une démo, puis renvoie le message final (temps + lien + récap + 🎉). À utiliser quand la démo est terminée et inspectée. Enchaîne build figé, vignette, galerie, commit, push, vérif live.
---

# Expédier une démo

## 1. Build figé + vignette + galerie
```bash
npm run demo:ship <slug>
```
Construit la démo en statique (`public/demos/<slug>/`), génère la vignette,
met à jour `registry.json` + la galerie, affiche le **temps écoulé** et le **lien**.

## 2. Déployer
```bash
git add -A && git commit -m "demo: <slug>" && git push   # sur main (branche déployée)
```
Puis déclenche le déploiement avec l'outil MCP avqn-os **`coolify_deploy`** :
`coolify_deploy(uuid="iscw4c0owc8w0ssw804ocw00")`. Coolify reconstruit une petite image
nginx servant `public/` (quelques secondes ; aucune autre démo touchée).

## 3. Smoke test du live (léger)
Le rendu est DÉJÀ validé en local au Chromium (skill `inspect`) — c'est là que tu testes
à fond. En ligne, un simple contrôle suffit. Attends ~20–40 s, puis :
```bash
npm run demo:verify <slug>
```
Doit afficher `HTTP 200` + « la démo est bien servie en ligne ». Si KO : attends un peu
(déploiement encore en cours) ou relance `coolify_deploy`. Pas de screenshot du live.

## 4. Message final à Manu
Court, avec un emoji de fête. Exactement ce format :
> 🎉 **&lt;Titre&gt;** — fait en **&lt;temps&gt;**.
> 🔗 https://demo.avqn.ch/demos/&lt;slug&gt;/
> _&lt;une phrase : ce que fait la démo&gt;_

Rien d'autre. Pas de pavé, pas de liste d'étapes.
