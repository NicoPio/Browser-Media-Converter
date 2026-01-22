# Quickstart: Video Resize Feature

**Feature**: 004-video-resize
**Date**: 2026-01-21

Ce guide permet de démarrer rapidement l'implémentation de la fonctionnalité de redimensionnement vidéo.

## Prérequis

- Node.js 18+
- npm ou pnpm
- Navigateur avec support WebCodecs (Chrome 94+, Edge 94+, Firefox 130+)

## Setup

```bash
# Cloner et installer (si pas déjà fait)
cd /Volumes/ExternalMac/Dev/mediabunny
npm install

# Démarrer le serveur de développement
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

## Structure des fichiers à créer

```bash
# Créer les nouveaux fichiers
touch src/types/resize.types.ts
touch src/constants/resolutionPresets.ts
touch src/utils/dimensions.ts
touch src/components/ResizeControls.tsx
touch src/hooks/useResizeCalculator.ts
touch tests/unit/dimensions.test.ts
touch tests/component/ResizeControls.test.tsx
```

## Ordre d'implémentation recommandé

### 1. Types (resize.types.ts)

Commencer par les types car tout le reste en dépend:

```typescript
// src/types/resize.types.ts
export type ResolutionPresetId = 'original' | '4k' | '1440p' | '1080p' | '720p' | '480p' | '360p' | 'custom';

export interface ResolutionPreset {
  id: ResolutionPresetId;
  label: string;
  description: string;
  width: number | null;
  height: number | null;
  referenceHeight: number | null;
}

export interface ResizeConfiguration {
  presetId: ResolutionPresetId;
  targetWidth: number | null;
  targetHeight: number | null;
  maintainAspectRatio: boolean;
  customWidth: number | null;
  customHeight: number | null;
}
```

### 2. Constantes (resolutionPresets.ts)

Définir les presets:

```typescript
// src/constants/resolutionPresets.ts
import type { ResolutionPreset } from '../types/resize.types';

export const RESOLUTION_PRESETS: ResolutionPreset[] = [
  { id: 'original', label: 'Original', description: 'Conserver la résolution source', width: null, height: null, referenceHeight: null },
  { id: '4k', label: '4K (2160p)', description: 'Ultra HD - 3840×2160', width: 3840, height: 2160, referenceHeight: 2160 },
  { id: '1440p', label: '1440p (QHD)', description: '2560×1440', width: 2560, height: 1440, referenceHeight: 1440 },
  { id: '1080p', label: '1080p (Full HD)', description: '1920×1080', width: 1920, height: 1080, referenceHeight: 1080 },
  { id: '720p', label: '720p (HD)', description: '1280×720', width: 1280, height: 720, referenceHeight: 720 },
  { id: '480p', label: '480p (SD)', description: '854×480', width: 854, height: 480, referenceHeight: 480 },
  { id: '360p', label: '360p', description: '640×360', width: 640, height: 360, referenceHeight: 360 },
  { id: 'custom', label: 'Personnalisé', description: 'Dimensions personnalisées', width: null, height: null, referenceHeight: null },
];

export const DEFAULT_RESIZE_CONFIG: ResizeConfiguration = {
  presetId: 'original',
  targetWidth: null,
  targetHeight: null,
  maintainAspectRatio: true,
  customWidth: null,
  customHeight: null,
};
```

### 3. Utilitaires (dimensions.ts)

Fonctions de calcul:

```typescript
// src/utils/dimensions.ts

/** Arrondir au nombre pair inférieur */
export function toEvenNumber(n: number): number {
  return Math.floor(n / 2) * 2;
}

/** Calculer le ratio d'aspect */
export function calculateAspectRatio(width: number, height: number): number {
  return width / height;
}

/** Calculer les dimensions cibles en préservant le ratio */
export function calculateTargetDimensions(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number | null,
  targetHeight: number | null,
  maintainAspectRatio: boolean
): { width: number; height: number } {
  const ratio = calculateAspectRatio(sourceWidth, sourceHeight);

  let finalWidth: number;
  let finalHeight: number;

  if (targetWidth && targetHeight && !maintainAspectRatio) {
    finalWidth = targetWidth;
    finalHeight = targetHeight;
  } else if (targetWidth && !targetHeight) {
    finalWidth = targetWidth;
    finalHeight = Math.round(targetWidth / ratio);
  } else if (targetHeight && !targetWidth) {
    finalHeight = targetHeight;
    finalWidth = Math.round(targetHeight * ratio);
  } else if (targetHeight) {
    // Utiliser la hauteur comme référence pour les presets
    finalHeight = targetHeight;
    finalWidth = Math.round(targetHeight * ratio);
  } else {
    return { width: sourceWidth, height: sourceHeight };
  }

  return {
    width: toEvenNumber(finalWidth),
    height: toEvenNumber(finalHeight),
  };
}

/** Vérifier si c'est un upscaling */
export function isUpscaling(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number
): boolean {
  return targetWidth > sourceWidth || targetHeight > sourceHeight;
}
```

### 4. Tests unitaires

```typescript
// tests/unit/dimensions.test.ts
import { describe, it, expect } from 'vitest';
import { toEvenNumber, calculateTargetDimensions, isUpscaling } from '../../src/utils/dimensions';

describe('toEvenNumber', () => {
  it('returns same number if already even', () => {
    expect(toEvenNumber(1920)).toBe(1920);
  });

  it('rounds down odd numbers', () => {
    expect(toEvenNumber(1921)).toBe(1920);
  });
});

describe('calculateTargetDimensions', () => {
  it('preserves aspect ratio when targeting height', () => {
    const result = calculateTargetDimensions(1920, 1080, null, 720, true);
    expect(result).toEqual({ width: 1280, height: 720 });
  });

  it('handles vertical video (9:16)', () => {
    const result = calculateTargetDimensions(1080, 1920, null, 1280, true);
    expect(result.height).toBe(1280);
    expect(result.width).toBe(720);
  });
});

describe('isUpscaling', () => {
  it('returns true when target is larger', () => {
    expect(isUpscaling(1280, 720, 1920, 1080)).toBe(true);
  });

  it('returns false when target is smaller', () => {
    expect(isUpscaling(1920, 1080, 1280, 720)).toBe(false);
  });
});
```

### 5. Composant UI

Voir le plan détaillé dans `plan.md` pour l'implémentation du composant `ResizeControls`.

## Commandes de test

```bash
# Lancer tous les tests
npm test

# Lancer uniquement les tests unitaires
npm run test:unit

# Lancer les tests en mode watch
npm run test:unit:watch

# Vérifier les types TypeScript
npm run check
```

## Points d'intégration

1. **QualitySettings.tsx**: Importer et utiliser `ResizeControls`
2. **quality.types.ts**: Exporter `ResizeConfiguration` si nécessaire
3. **conversionService.ts**: Aucune modification nécessaire (utilise déjà width/height)

## Checklist de validation

- [ ] Types compilent sans erreur
- [ ] Tests unitaires passent
- [ ] Presets s'affichent dans l'UI
- [ ] Calcul du ratio fonctionne correctement
- [ ] Avertissement upscaling s'affiche
- [ ] Dimensions paires automatiques
- [ ] Mode personnalisé fonctionne
- [ ] Conversion avec redimensionnement produit les dimensions attendues
