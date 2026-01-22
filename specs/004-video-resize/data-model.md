# Data Model: Video Resize Feature

**Feature**: 004-video-resize
**Date**: 2026-01-21

## Entities

### 1. ResolutionPreset

Représente un preset de résolution prédéfini.

```typescript
/**
 * Identifiant unique d'un preset de résolution
 */
type ResolutionPresetId =
  | 'original'  // Pas de redimensionnement
  | '4k'        // 3840×2160
  | '1440p'     // 2560×1440
  | '1080p'     // 1920×1080
  | '720p'      // 1280×720
  | '480p'      // 854×480
  | '360p'      // 640×360
  | 'custom';   // Dimensions personnalisées

/**
 * Définition d'un preset de résolution
 */
interface ResolutionPreset {
  /** Identifiant unique */
  id: ResolutionPresetId;

  /** Nom d'affichage (ex: "1080p (Full HD)") */
  label: string;

  /** Description courte pour tooltip */
  description: string;

  /** Largeur cible en pixels (null pour 'original' et 'custom') */
  width: number | null;

  /** Hauteur cible en pixels (null pour 'original' et 'custom') */
  height: number | null;

  /** Hauteur de référence pour adaptation ratio (ex: 1080 pour 1080p) */
  referenceHeight: number | null;
}
```

### 2. ResizeConfiguration

Configuration complète du redimensionnement sélectionnée par l'utilisateur.

```typescript
/**
 * Configuration de redimensionnement appliquée à une conversion
 */
interface ResizeConfiguration {
  /** Preset sélectionné */
  presetId: ResolutionPresetId;

  /** Largeur cible finale (calculée) */
  targetWidth: number | null;

  /** Hauteur cible finale (calculée) */
  targetHeight: number | null;

  /** Préserver le ratio d'aspect automatiquement */
  maintainAspectRatio: boolean;

  /** Largeur personnalisée (mode custom uniquement) */
  customWidth: number | null;

  /** Hauteur personnalisée (mode custom uniquement) */
  customHeight: number | null;
}
```

### 3. DimensionValidationResult

Résultat de la validation des dimensions.

```typescript
/**
 * Niveau de sévérité d'un message de validation
 */
type ValidationSeverity = 'error' | 'warning' | 'info';

/**
 * Message de validation individuel
 */
interface ValidationMessage {
  /** Niveau de sévérité */
  severity: ValidationSeverity;

  /** Code d'erreur pour i18n */
  code: string;

  /** Message lisible par l'utilisateur */
  message: string;
}

/**
 * Résultat complet de validation des dimensions
 */
interface DimensionValidationResult {
  /** Validation passée (pas d'erreurs bloquantes) */
  isValid: boolean;

  /** Dimensions ajustées (nombres pairs) */
  adjustedWidth: number | null;
  adjustedHeight: number | null;

  /** Messages de validation */
  messages: ValidationMessage[];
}
```

### 4. DimensionCalculationInput

Entrée pour le calcul des dimensions.

```typescript
/**
 * Données source pour le calcul des dimensions cibles
 */
interface DimensionCalculationInput {
  /** Largeur source de la vidéo */
  sourceWidth: number;

  /** Hauteur source de la vidéo */
  sourceHeight: number;

  /** Preset sélectionné */
  preset: ResolutionPreset;

  /** Largeur personnalisée (si mode custom) */
  customWidth?: number | null;

  /** Hauteur personnalisée (si mode custom) */
  customHeight?: number | null;

  /** Préserver le ratio d'aspect */
  maintainAspectRatio: boolean;
}
```

---

## Relations

```
MediaFile.metadata (existing)
    │
    ├── width: number | null
    └── height: number | null
           │
           ▼
DimensionCalculationInput
           │
           ▼
    ┌──────┴──────┐
    │             │
    ▼             ▼
ResolutionPreset  ResizeConfiguration
                       │
                       ▼
              DimensionValidationResult
                       │
                       ▼
              VideoQualitySettings.width/height (existing)
                       │
                       ▼
              ConversionVideoOptions (mediabunny)
```

---

## Constantes

### RESOLUTION_PRESETS

```typescript
const RESOLUTION_PRESETS: ResolutionPreset[] = [
  {
    id: 'original',
    label: 'Original',
    description: 'Conserver la résolution source',
    width: null,
    height: null,
    referenceHeight: null,
  },
  {
    id: '4k',
    label: '4K (2160p)',
    description: 'Ultra HD - 3840×2160',
    width: 3840,
    height: 2160,
    referenceHeight: 2160,
  },
  {
    id: '1440p',
    label: '1440p (QHD)',
    description: 'Quad HD - 2560×1440',
    width: 2560,
    height: 1440,
    referenceHeight: 1440,
  },
  {
    id: '1080p',
    label: '1080p (Full HD)',
    description: 'Full HD - 1920×1080',
    width: 1920,
    height: 1080,
    referenceHeight: 1080,
  },
  {
    id: '720p',
    label: '720p (HD)',
    description: 'HD - 1280×720',
    width: 1280,
    height: 720,
    referenceHeight: 720,
  },
  {
    id: '480p',
    label: '480p (SD)',
    description: 'Standard Definition - 854×480',
    width: 854,
    height: 480,
    referenceHeight: 480,
  },
  {
    id: '360p',
    label: '360p',
    description: 'Basse résolution - 640×360',
    width: 640,
    height: 360,
    referenceHeight: 360,
  },
  {
    id: 'custom',
    label: 'Personnalisé',
    description: 'Définir des dimensions personnalisées',
    width: null,
    height: null,
    referenceHeight: null,
  },
];
```

---

## Validation Rules

| Champ | Règle | Message |
|-------|-------|---------|
| targetWidth | > 0 | "La largeur doit être positive" |
| targetHeight | > 0 | "La hauteur doit être positive" |
| targetWidth | >= 16 | "Largeur minimum: 16 pixels" |
| targetHeight | >= 16 | "Hauteur minimum: 16 pixels" |
| targetWidth | <= 7680 | "Largeur maximum: 7680 pixels (8K)" |
| targetHeight | <= 4320 | "Hauteur maximum: 4320 pixels (8K)" |
| targetWidth | % 2 === 0 | Auto-ajusté au nombre pair inférieur |
| targetHeight | % 2 === 0 | Auto-ajusté au nombre pair inférieur |
| target > source | N/A | Warning: "L'agrandissement ne peut pas améliorer la qualité" |
| target < 320 | N/A | Warning: "Résolution très basse, la qualité sera dégradée" |

---

## State Transitions

### ResizeConfiguration State Machine

```
┌─────────────┐
│   INITIAL   │ (presetId: 'original')
└──────┬──────┘
       │ User selects preset
       ▼
┌─────────────┐
│   PRESET    │ (presetId: '1080p', etc.)
│  SELECTED   │
└──────┬──────┘
       │ User selects 'custom'
       ▼
┌─────────────┐
│   CUSTOM    │ (presetId: 'custom')
│    MODE     │
└──────┬──────┘
       │ User enters dimensions
       ▼
┌─────────────┐
│  VALIDATED  │ (dimensions calculées et validées)
└─────────────┘
```

---

## Integration Points

### Avec VideoQualitySettings existant

La `ResizeConfiguration` se traduit en `VideoQualitySettings.width` et `VideoQualitySettings.height`:

```typescript
// Mapping ResizeConfiguration → VideoQualitySettings
function applyResizeToQuality(
  resize: ResizeConfiguration,
  quality: VideoQualitySettings
): VideoQualitySettings {
  return {
    ...quality,
    width: resize.targetWidth,
    height: resize.targetHeight,
  };
}
```

### Avec MediaFileMetadata existant

Les dimensions source sont lues depuis `MediaFile.metadata`:

```typescript
// Extraction dimensions source
function getSourceDimensions(file: MediaFile): { width: number; height: number } | null {
  if (!file.metadata?.width || !file.metadata?.height) {
    return null;
  }
  return {
    width: file.metadata.width,
    height: file.metadata.height,
  };
}
```
