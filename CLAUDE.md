# CLAUDE.md

Ce fichier guide Claude Code (claude.com/code) lorsqu'il travaille dans ce dépôt.

## Projet

`demo-webinar` — dépôt de démonstration utilisé pour un webinaire présentant Claude Code.

> ⚠️ Le dépôt est en cours d'initialisation : le code applicatif sera ajouté au fur et à mesure.
> Mets cette section à jour (stack, structure, commandes build/test/lint) dès que le projet prend forme.

## Configuration Claude Code

Les plugins suivants sont activés au niveau du projet (`.claude/settings.json`). Ils s'installent
automatiquement au démarrage d'une session — y compris sur Claude Code web — tant que le réseau peut
joindre les marketplaces (GitHub est dans l'allowlist par défaut) :

| Plugin            | Marketplace             | Rôle                                                                       |
| ----------------- | ----------------------- | -------------------------------------------------------------------------- |
| `frontend-design` | `claude-plugins-official` (intégré) | Interfaces front-end soignées, évite l'esthétique « IA générique ».        |
| `superpowers`     | `superpowers-dev` (`obra/superpowers`) | Boîte à outils de skills / agents par Jesse Vincent (obra).        |

- Appliquer un changement de plugins dans une session en cours : `/reload-plugins`
- Gérer les plugins : `/plugin`

## Conventions

_À compléter quand le code arrive_ : commandes de build/test/lint, structure des dossiers, style de code.
