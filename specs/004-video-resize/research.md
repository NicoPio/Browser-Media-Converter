# Research: Video Resize Feature

**Feature**: 004-video-resize
**Date**: 2026-01-21
**Status**: Complete

## 1. Resolution Presets Standards

### Decision: 6 presets standards basés sur l'industrie

| Preset | Résolution (16:9) | Nom d'affichage | Cas d'usage |
|--------|-------------------|-----------------|-------------|
| 4K/UHD | 3840 × 2160 | "4K (2160p)" | Haute qualité, archivage |
| QHD | 2560 × 1440 | "1440p (QHD)" | Gaming, moniteurs modernes |
| Full HD | 1920 × 1080 | "1080p (Full HD)" | Standard web, partage |
| HD | 1280 × 720 | "720p (HD)" | Streaming, mobile |
| SD | 854 × 480 | "480p (SD)" | Bande passante limitée |
| Low | 640 × 360 | "360p" | Previews, thumbnails |

**Rationale**: Ces résolutions sont les standards de l'industrie, supportés par toutes les plateformes (YouTube, Vimeo, réseaux sociaux). Les utilisateurs reconnaissent ces noms instantanément.

**Alternatives considérées**:
- Presets par plateforme (Instagram, TikTok, etc.) → Rejeté car trop spécifique et maintenance difficile
- Presets par taille de fichier → Rejeté car dépend du bitrate, pas de la résolution

## 2. Calcul du Ratio d'Aspect

### Decision: Préserver le ratio source avec calcul automatique

**Algorithme**:
```
ratio = sourceWidth / sourceHeight

Si l'utilisateur spécifie targetWidth:
  targetHeight = round(targetWidth / ratio)

Si l'utilisateur spécifie targetHeight:
  targetWidth = round(targetHeight * ratio)

Ajuster aux nombres pairs:
  targetWidth = targetWidth - (targetWidth % 2)
  targetHeight = targetHeight - (targetHeight % 2)
```

**Rationale**: Préserver le ratio d'aspect évite la déformation. L'ajustement aux nombres pairs est requis par les codecs H.264/H.265 qui travaillent avec des macroblocs de 2x2 minimum.

**Alternatives considérées**:
- Forcer le ratio 16:9 → Rejeté car déforme les vidéos 4:3, 9:16, etc.
- Ajouter des bandes noires (letterboxing) → Rejeté car hors scope (crop/pad = feature séparée)

## 3. Gestion des Ratios Non-Standards

### Decision: Adapter les presets au ratio source

Quand un utilisateur sélectionne "720p" sur une vidéo 4:3 (1440×1080):
- On utilise la hauteur 720 comme référence
- On calcule la largeur: `720 × (4/3) = 960`
- Résultat: 960×720 (préserve le ratio 4:3)

Quand un utilisateur sélectionne "720p" sur une vidéo 9:16 (1080×1920):
- On utilise la plus grande dimension (hauteur)
- On calcule proportionnellement
- Résultat: 720×1280 (préserve le ratio 9:16)

**Rationale**: Les presets représentent une "qualité cible" plutôt qu'une dimension exacte. L'utilisateur attend que "720p" donne une vidéo de qualité HD, peu importe l'orientation.

## 4. Validation des Dimensions

### Decision: Validation stricte avec messages clairs

**Règles de validation**:
| Règle | Condition | Action |
|-------|-----------|--------|
| Dimensions positives | width > 0 && height > 0 | Erreur bloquante |
| Dimensions minimum | width >= 16 && height >= 16 | Erreur bloquante |
| Dimensions maximum | width <= 7680 && height <= 4320 | Avertissement (8K max) |
| Nombres pairs | width % 2 === 0 && height % 2 === 0 | Ajustement automatique |
| Upscaling | target > source | Avertissement non-bloquant |
| Très basse résolution | target < 320 | Avertissement non-bloquant |

**Rationale**: Bloquer les entrées invalides mais permettre les choix utilisateur avec avertissements.

## 5. Intégration UI

### Decision: Section dédiée dans QualitySettings

**Placement**: Entre la sélection de preset qualité et les paramètres avancés.

**Comportement**:
1. Par défaut: "Original" sélectionné (pas de redimensionnement)
2. Quand un preset résolution est choisi, les champs width/height sont mis à jour
3. En mode "Custom", les champs width/height deviennent éditables
4. Le toggle "Lock aspect ratio" contrôle le calcul automatique

**Rationale**: S'intègre naturellement dans le workflow existant. L'utilisateur peut rapidement choisir un preset ou passer en mode avancé.

## 6. Performance Considerations

### Decision: Calculs synchrones sans debounce

Les calculs de dimensions sont instantanés (< 1ms):
- Multiplication/division simple
- Pas de I/O
- Pas d'appel API

**Rationale**: Pas besoin de debounce ou d'optimisation. L'affichage temps réel améliore l'UX.

## 7. Compatibilité mediabunny

### Decision: Utiliser l'API existante

L'API mediabunny supporte déjà le redimensionnement via `ConversionVideoOptions`:

```typescript
// Déjà disponible dans conversionService.ts
return {
  width: videoSettings.width ?? undefined,
  height: videoSettings.height ?? undefined,
  bitrate: videoSettings.bitrate ?? undefined,
  frameRate: videoSettings.frameRate ?? undefined,
  codec: videoSettings.codec ?? undefined,
};
```

**Rationale**: Aucune modification du backend nécessaire. La fonctionnalité est un ajout UI uniquement.

## 8. Accessibilité

### Decision: Full keyboard + screen reader support

**Requirements**:
- Tous les contrôles navigables au clavier
- Labels ARIA pour les champs
- Annonces des changements de dimensions
- Messages d'erreur associés aux champs

**Rationale**: Conformité WCAG 2.1 niveau AA, cohérent avec le reste de l'application.

---

## Summary: No Unknowns Remaining

Toutes les questions de recherche ont été résolues. L'implémentation peut procéder avec confiance.
