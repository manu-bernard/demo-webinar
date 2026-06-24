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
git add -A && git commit -m "demo: <slug>" && git push
```
Le push déclenche l'auto-deploy Coolify (resync de `public/`). Aucune autre démo
n'est reconstruite.

## 3. Vérifier le LIVE (obligatoire)
Attends ~30–60 s que le déploiement passe, puis :
```bash
npm run demo:shot https://demo.avqn.ch/demos/<slug>/ --name <slug>-live
```
Ouvre la capture (Read) et confirme que la démo s'affiche bien en ligne.
Si KO : diagnostique (déploiement Coolify), corrige, repousse.

## 4. Message final à Manu
Court, avec un emoji de fête. Exactement ce format :
> 🎉 **&lt;Titre&gt;** — fait en **&lt;temps&gt;**.
> 🔗 https://demo.avqn.ch/demos/&lt;slug&gt;/
> _&lt;une phrase : ce que fait la démo&gt;_

Rien d'autre. Pas de pavé, pas de liste d'étapes.
