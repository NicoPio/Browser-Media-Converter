# Implementation Plan: Video Resize

**Branch**: `004-video-resize` | **Date**: 2026-01-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-video-resize/spec.md`

## Summary

Ajouter une fonctionnalité de redimensionnement vidéo avec des presets de résolution prédéfinis (4K, 1440p, 1080p, 720p, 480p, 360p) et la possibilité de définir des dimensions personnalisées. La fonctionnalité préservera le ratio d'aspect par défaut et s'intègrera dans l'interface existante des paramètres de qualité. Tout le traitement s'effectue côté navigateur via l'API WebCodecs et mediabunny.

## Technical Context

**Language/Version**: TypeScript 5.9.3
**Primary Dependencies**: React 18.3.1, mediabunny ^1.27.0, Tailwind CSS v4, DaisyUI 5, Framer Motion 12
**Storage**: N/A (tout en mémoire navigateur, pas de persistance nécessaire pour cette fonctionnalité)
**Testing**: Vitest (unit + component), Playwright (e2e)
**Target Platform**: Navigateurs modernes avec support WebCodecs (Chrome 94+, Edge 94+, Firefox 130+, Safari 16.4+)
**Project Type**: Single-page application React
**Performance Goals**: Affichage des dimensions calculées en < 500ms, support vidéos jusqu'à 8K
**Constraints**: Traitement 100% navigateur, pas d'envoi de données serveur, dimensions paires requises par codecs
**Scale/Scope**: Ajout d'un composant UI + utilitaires de calcul de dimensions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Note**: La constitution du projet est un template non renseigné. Les principes suivants sont déduits du CLAUDE.md et des patterns existants :

| Principe | Status | Notes |
|----------|--------|-------|
| Zero-dependency core | ✅ PASS | Pas de nouvelle dépendance externe requise |
| Browser + Node compatibility | ✅ PASS | Feature browser-only (app React) |
| Tree-shakability | ✅ PASS | Nouveaux modules exportés séparément |
| Streaming-capable | N/A | Redimensionnement utilise l'API existante |
| TSDoc documentation | ✅ À RESPECTER | Tous les nouveaux types/fonctions documentés |

## Project Structure

### Documentation (this feature)

```text
specs/004-video-resize/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── QualitySettings.tsx      # [MODIFY] Ajouter section resize presets
│   └── ResizeControls.tsx       # [NEW] Composant contrôles redimensionnement
├── constants/
│   ├── qualityPresets.ts        # [EXISTING] Quality presets
│   └── resolutionPresets.ts     # [NEW] Resolution presets (4K, 1080p, etc.)
├── types/
│   ├── quality.types.ts         # [MODIFY] Ajouter ResizeConfiguration
│   └── resize.types.ts          # [NEW] Types dédiés au redimensionnement
├── utils/
│   └── dimensions.ts            # [NEW] Calculs ratio, validation, ajustement pair
├── hooks/
│   └── useResizeCalculator.ts   # [NEW] Hook pour calculs dimensions temps réel
└── services/
    └── conversionService.ts     # [EXISTING] Déjà supporte width/height

tests/
├── unit/
│   └── dimensions.test.ts       # [NEW] Tests utilitaires dimensions
└── component/
    └── ResizeControls.test.tsx  # [NEW] Tests composant
```

**Structure Decision**: Single project React - les nouveaux fichiers s'intègrent dans la structure existante. Le composant `ResizeControls` sera intégré dans `QualitySettings` existant.

## Complexity Tracking

Aucune violation de constitution détectée. La fonctionnalité suit les patterns existants.

---

## Phase 0: Research Summary

Voir [research.md](./research.md) pour les détails complets.

### Décisions clés

1. **Presets de résolution**: 6 presets standards basés sur 16:9 (4K, 1440p, 1080p, 720p, 480p, 360p)
2. **Calcul de ratio**: Utiliser le ratio source pour calculer les dimensions cibles
3. **Ajustement pair**: Arrondir au nombre pair inférieur pour compatibilité codec
4. **Integration UI**: Ajouter une section "Resolution" dans QualitySettings existant

---

## Phase 1: Design Artifacts

### 1.1 Data Model

Voir [data-model.md](./data-model.md) pour le modèle complet.

### 1.2 API Contracts

Cette feature est 100% frontend, pas d'API REST. Les "contrats" sont les interfaces TypeScript définies dans `data-model.md`.

### 1.3 Component Architecture

```text
QualitySettings (existing)
├── Quality Preset Section (existing)
├── [NEW] Resolution Section
│   ├── ResizeControls
│   │   ├── Preset Selector (dropdown)
│   │   ├── Custom Dimensions (inputs)
│   │   ├── Aspect Ratio Lock Toggle
│   │   └── Dimension Preview (source → target)
│   └── Warnings Display
└── Advanced Settings Section (existing, already has width/height)
```

---

## Implementation Approach

### Phase 1: Core Types & Utilities (P1)

1. Créer `src/types/resize.types.ts` - Types ResolutionPreset, ResizeConfig
2. Créer `src/constants/resolutionPresets.ts` - Presets 4K → 360p
3. Créer `src/utils/dimensions.ts` - Fonctions de calcul dimensions

### Phase 2: UI Components (P1)

4. Créer `src/components/ResizeControls.tsx` - Composant contrôles
5. Modifier `src/components/QualitySettings.tsx` - Intégrer ResizeControls
6. Mettre à jour `src/types/quality.types.ts` - Ajouter resizeConfig

### Phase 3: Hook & Integration (P2)

7. Créer `src/hooks/useResizeCalculator.ts` - Calculs temps réel
8. Connecter au flux de conversion existant

### Phase 4: Tests (P1-P2)

9. Tests unitaires pour dimensions.ts
10. Tests composant pour ResizeControls

---

## Risk Assessment

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| mediabunny ne supporte pas toutes les résolutions | Faible | Moyen | API déjà utilisée avec width/height dans QualitySettings |
| Performances calcul temps réel | Faible | Faible | Calculs simples, debounce si nécessaire |
| Incompatibilité dimensions impaires | Moyen | Moyen | Ajustement automatique aux nombres pairs |
| UX confusion preset vs custom | Moyen | Faible | Clear visual separation, default to presets |

---

## Dependencies

- **mediabunny**: Déjà supporte `width` et `height` dans `ConversionVideoOptions` ✅
- **QualitySettings existant**: A déjà des champs width/height en mode custom ✅
- **MediaFileMetadata**: Expose déjà `width` et `height` source ✅

---

## Success Validation

La fonctionnalité sera considérée complète quand :

1. ✅ Un utilisateur peut sélectionner un preset de résolution en < 3 clics
2. ✅ Le ratio d'aspect est préservé automatiquement par défaut
3. ✅ Les dimensions finales sont affichées avant conversion
4. ✅ Un avertissement s'affiche pour l'upscaling
5. ✅ Les dimensions sont ajustées aux nombres pairs automatiquement
6. ✅ Tous les tests passent
