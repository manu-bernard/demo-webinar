# Données figées

Si ta démo a besoin de données externes (API, scraping, fichiers distants…),
récupère-les **au moment du build** et consolide-les ici en fichiers `.json`.

La démo en ligne lit uniquement ces fichiers statiques et ne fait **aucun appel
réseau au runtime** → elle ne peut pas casser, même si l'API d'origine tombe.

```ts
import items from '../data/items.json'
```
