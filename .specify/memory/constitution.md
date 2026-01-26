# Browser-media-converter Apps Constitution

## Core Principles

### I. Client-Side Only (NON-NÉGOCIABLE)
Toutes les opérations de traitement média DOIVENT s'exécuter dans le navigateur.
Aucune donnée utilisateur (fichiers, métadonnées) ne DOIT être envoyée à un serveur.
Cette règle garantit la confidentialité des données utilisateur.

### II. Zero External Dependencies (Library Core)
La librairie mediabunny (package npm) ne DOIT pas avoir de dépendances npm externes.
Les applications dans `app/` PEUVENT utiliser des dépendances tierces (React, Tailwind, etc.).
Cette séparation permet un core léger et tree-shakable.

### III. Accessibility First
Toutes les interfaces DOIVENT respecter WCAG 2.1 AA minimum :
- Navigation clavier complète
- Labels ARIA appropriés
- Contraste suffisant (4.5:1 pour texte normal)
- Messages d'erreur accessibles aux lecteurs d'écran

### IV. Progressive Enhancement
Les fonctionnalités avancées (WebCodecs API) DOIVENT dégrader gracieusement.
Un message clair DOIT informer l'utilisateur si son navigateur n'est pas supporté.
Les fonctionnalités de base doivent fonctionner sur tous les navigateurs modernes.

### V. Test Coverage
- Nouveaux composants UI DOIVENT avoir des tests unitaires
- Nouvelles fonctionnalités DOIVENT avoir des tests E2E
- Les tests existants ne DOIVENT pas être supprimés sans justification

### VI. Error Handling
- Toutes les erreurs DOIVENT afficher un message utilisateur compréhensible
- Les erreurs techniques DOIVENT être loggées en console pour debugging
- L'application ne DOIT jamais crasher silencieusement

## Technology Standards

### Frontend Applications
- TypeScript strict mode obligatoire
- React 18+ avec hooks fonctionnels
- Tailwind CSS v4 + DaisyUI pour le styling
- Vitest pour tests unitaires, Playwright pour E2E

### Formats Supportés
- Conteneurs: MP4, MOV, WebM, MKV, WAVE, MP3, Ogg, ADTS, FLAC
- Codecs: Selon support WebCodecs du navigateur

## Governance

- Cette constitution s'applique à toutes les features dans `specs/`
- Toute violation DOIT être documentée et justifiée dans le plan de la feature
- Modifications de la constitution requièrent une mise à jour explicite de ce document
- Les principes marqués "NON-NÉGOCIABLE" ne peuvent être contournés

**Version**: 1.0.0 | **Ratified**: 2026-01-26 | **Last Amended**: 2026-01-26
