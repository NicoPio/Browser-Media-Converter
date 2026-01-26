# Feature Specification: Video Resize

**Feature Branch**: `004-video-resize`
**Created**: 2026-01-21
**Status**: Draft
**Input**: User description: "Ajouter une fonctionnalité de redimensionnement d'une vidéo. Toutes les fonctionnalités s'exécutent côté navigateur, rien n'est téléchargé sur serveur."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Quick Resize with Preset Resolution (Priority: P1)

Un utilisateur souhaite rapidement redimensionner une vidéo vers une résolution standard (720p, 1080p, 480p, etc.) pour l'optimiser pour un usage spécifique (partage sur réseaux sociaux, envoi par email, etc.).

**Why this priority**: C'est le cas d'usage le plus courant. La majorité des utilisateurs veulent simplement choisir une résolution prédéfinie sans avoir à calculer les dimensions exactes. Cela représente le chemin le plus rapide vers la valeur utilisateur.

**Independent Test**: Peut être testé en chargeant une vidéo 4K, en sélectionnant le preset "720p", en lançant la conversion, et en vérifiant que la vidéo de sortie a une résolution de 1280x720.

**Acceptance Scenarios**:

1. **Given** une vidéo 1920x1080 est chargée, **When** l'utilisateur sélectionne le preset "720p" et lance la conversion, **Then** la vidéo de sortie a une résolution de 1280x720 avec le ratio d'aspect préservé.

2. **Given** une vidéo 4K (3840x2160) est chargée, **When** l'utilisateur sélectionne le preset "1080p", **Then** la vidéo de sortie est redimensionnée à 1920x1080 et la qualité visuelle reste acceptable.

3. **Given** une vidéo est chargée, **When** l'utilisateur sélectionne un preset de résolution supérieure à la source, **Then** le système affiche un avertissement que l'upscaling n'améliore pas la qualité.

---

### User Story 2 - Preserve Aspect Ratio by Default (Priority: P1)

Un utilisateur redimensionne une vidéo et s'attend à ce que le ratio d'aspect soit préservé automatiquement pour éviter une déformation de l'image.

**Why this priority**: La préservation du ratio d'aspect est fondamentale pour une bonne expérience utilisateur. Sans cette fonctionnalité, les vidéos seraient déformées, ce qui serait inacceptable.

**Independent Test**: Peut être testé en chargeant une vidéo 16:9, en modifiant uniquement la largeur, et en vérifiant que la hauteur est automatiquement ajustée pour maintenir le ratio 16:9.

**Acceptance Scenarios**:

1. **Given** une vidéo 1920x1080 (16:9) est chargée et l'option "Préserver le ratio" est activée (par défaut), **When** l'utilisateur modifie la largeur à 1280, **Then** la hauteur est automatiquement calculée à 720.

2. **Given** une vidéo 1080x1920 (9:16, verticale) est chargée, **When** l'utilisateur sélectionne un preset 720p, **Then** la vidéo est redimensionnée à 720x1280 (ratio vertical préservé).

3. **Given** une vidéo avec un ratio non standard (exemple: 2.35:1 cinéma) est chargée, **When** l'utilisateur redimensionne, **Then** le ratio original est préservé avec précision.

---

### User Story 3 - Custom Dimensions Input (Priority: P2)

Un utilisateur avancé souhaite spécifier des dimensions personnalisées exactes pour répondre à des besoins spécifiques (thumbnail, format spécifique pour une plateforme, etc.).

**Why this priority**: Important pour les utilisateurs avancés mais moins fréquent que l'utilisation de presets. La majorité des utilisateurs utiliseront les presets plutôt que des valeurs personnalisées.

**Independent Test**: Peut être testé en chargeant une vidéo, en entrant manuellement 640x480 dans les champs de dimensions, et en vérifiant la sortie.

**Acceptance Scenarios**:

1. **Given** une vidéo est chargée et l'utilisateur est en mode personnalisé, **When** l'utilisateur entre 640 pour la largeur et 480 pour la hauteur, **Then** la vidéo de sortie a exactement ces dimensions.

2. **Given** une vidéo est chargée, **When** l'utilisateur entre uniquement une largeur de 800 (hauteur vide), **Then** la hauteur est calculée automatiquement pour préserver le ratio d'aspect.

3. **Given** une vidéo est chargée, **When** l'utilisateur entre des dimensions invalides (0, négatives, ou non-numériques), **Then** le système affiche un message d'erreur clair et empêche la conversion.

---

### User Story 4 - Visual Preview of Output Dimensions (Priority: P2)

Un utilisateur souhaite voir un aperçu des dimensions finales avant de lancer la conversion pour s'assurer que le résultat correspondra à ses attentes.

**Why this priority**: Améliore significativement l'expérience utilisateur en réduisant les erreurs et conversions inutiles, mais n'est pas bloquant pour la fonctionnalité de base.

**Independent Test**: Peut être testé en chargeant une vidéo et en vérifiant que les dimensions source et cible sont affichées côte à côte.

**Acceptance Scenarios**:

1. **Given** une vidéo 1920x1080 est chargée et l'utilisateur sélectionne le preset 720p, **When** la sélection est faite, **Then** le système affiche "1920×1080 → 1280×720" avec le pourcentage de réduction.

2. **Given** une vidéo est chargée, **When** l'utilisateur modifie les paramètres de redimensionnement, **Then** la prévisualisation des dimensions se met à jour en temps réel.

---

### User Story 5 - Resize Without Re-encoding (Priority: P3)

Un utilisateur souhaite redimensionner sa vidéo tout en conservant d'autres paramètres (codec, bitrate) selon le profil de qualité déjà sélectionné.

**Why this priority**: Fonctionnalité avancée qui offre plus de contrôle, mais la plupart des utilisateurs utiliseront simplement les profils de qualité existants.

**Independent Test**: Peut être testé en vérifiant que les paramètres de qualité (bitrate, codec) restent configurables indépendamment du redimensionnement.

**Acceptance Scenarios**:

1. **Given** une vidéo est chargée avec un profil de qualité "high", **When** l'utilisateur sélectionne un preset de redimensionnement 720p, **Then** les paramètres de bitrate du profil "high" sont appliqués à la vidéo redimensionnée.

2. **Given** une vidéo est chargée, **When** l'utilisateur change le preset de résolution, **Then** les autres paramètres de qualité (audio, bitrate vidéo) ne sont pas modifiés.

---

### Edge Cases

- **Vidéo très petite (< 320px)**: Le système permet le redimensionnement mais affiche un avertissement si la résolution cible est inférieure à 320px.
- **Vidéo très grande (> 4K)**: Le système gère les vidéos 8K mais affiche un avertissement sur les performances d'encodage.
- **Dimensions impaires**: Le système ajuste automatiquement les dimensions à des nombres pairs (requis par certains codecs).
- **Fichier audio uniquement**: Les contrôles de redimensionnement sont désactivés/masqués car non applicables.
- **Ratio d'aspect exotique**: Le système préserve fidèlement tous les ratios, même les plus inhabituels (ex: 4:3, 21:9, 1:1).
- **Upscaling**: Le système affiche un avertissement clair que l'agrandissement n'améliore pas la qualité.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Le système DOIT proposer des presets de résolution prédéfinis (4K/2160p, 1440p, 1080p, 720p, 480p, 360p).

- **FR-002**: Le système DOIT préserver le ratio d'aspect par défaut lors du redimensionnement.

- **FR-003**: Le système DOIT permettre à l'utilisateur de désactiver la préservation du ratio d'aspect pour des dimensions libres.

- **FR-004**: Le système DOIT calculer automatiquement la dimension manquante quand l'utilisateur entre uniquement une largeur ou une hauteur.

- **FR-005**: Le système DOIT afficher les dimensions source et cible côte à côte pour comparaison.

- **FR-006**: Le système DOIT afficher un avertissement si l'utilisateur tente un upscaling (résolution cible > source).

- **FR-007**: Le système DOIT valider les entrées utilisateur (dimensions positives, numériques, dans une plage raisonnable).

- **FR-008**: Le système DOIT ajuster automatiquement les dimensions à des nombres pairs pour la compatibilité codec.

- **FR-009**: Le système DOIT désactiver les contrôles de redimensionnement pour les fichiers audio uniquement.

- **FR-010**: Le système DOIT effectuer tout le traitement côté navigateur, sans envoi de données vers un serveur.

- **FR-011**: Le système DOIT intégrer les contrôles de redimensionnement dans l'interface existante de paramètres de qualité.

- **FR-012**: Le système DOIT permettre de combiner le redimensionnement avec les autres paramètres de conversion (format, bitrate, etc.).

### Key Entities

- **Resolution Preset**: Représente une résolution prédéfinie avec un nom d'affichage (ex: "720p HD"), une largeur et une hauteur cibles, et un identifiant unique.

- **Resize Configuration**: Configuration de redimensionnement contenant la largeur cible, la hauteur cible, le flag de préservation du ratio, et le preset sélectionné (si applicable).

- **Dimension Validation Result**: Résultat de validation contenant le statut (valide/invalide), les dimensions ajustées (si nécessaire), et les messages d'avertissement éventuels.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Les utilisateurs peuvent redimensionner une vidéo vers un preset en moins de 3 clics après avoir chargé le fichier.

- **SC-002**: 100% des redimensionnements préservent le ratio d'aspect par défaut (sauf si explicitement désactivé par l'utilisateur).

- **SC-003**: Le système affiche les dimensions de sortie prévues en moins de 500ms après toute modification des paramètres.

- **SC-004**: Le système gère des vidéos jusqu'à 8K (7680x4320) sans erreur de traitement.

- **SC-005**: 100% du traitement s'effectue dans le navigateur, vérifiable par l'absence de requêtes réseau contenant des données vidéo.

- **SC-006**: Les dimensions de sortie sont exactes à ±1 pixel près par rapport aux dimensions configurées (ajustement pair si nécessaire).

- **SC-007**: L'interface de redimensionnement est accessible au clavier et compatible avec les lecteurs d'écran.

## Assumptions

- L'API mediabunny supporte déjà le redimensionnement via les options `width` et `height` dans `ConversionVideoOptions` (confirmé dans le code existant).
- Les utilisateurs sont familiers avec les termes de résolution courants (720p, 1080p, 4K).
- Le navigateur dispose de suffisamment de mémoire pour traiter des vidéos haute résolution (responsabilité de l'utilisateur).
- Les presets de résolution sont basés sur le standard 16:9, le système adaptera pour d'autres ratios.

## Test Resources

- **Sample video file**: `src/fixtures/sample-video.mp4` - fichier vidéo de test disponible pour les tests unitaires et d'intégration.

## Clarification: Resolution vs Quality Presets

Cette feature introduit des **Resolution Presets** qui sont distincts des **Quality Presets** existants (feature 001):

| Aspect | Resolution Presets (cette feature) | Quality Presets (feature 001) |
|--------|-----------------------------------|------------------------------|
| **Contrôle** | Dimensions de la vidéo (pixels) | Bitrate et paramètres d'encodage |
| **Exemples** | 720p = 1280×720, 1080p = 1920×1080 | High = 8Mbps, Balanced = 2.5Mbps |
| **Effet** | Taille fichier via nombre de pixels | Taille fichier via compression |
| **Indépendant** | Ne modifie PAS le bitrate/codec | Ne modifie PAS les dimensions |

**Combinaison** : Un utilisateur peut choisir "720p" (resolution) + "High Quality" (quality). Le système applique les deux paramètres indépendamment lors de la conversion.

## Out of Scope

- Recadrage (crop) de la vidéo - fonctionnalité distincte du redimensionnement.
- Ajout de bordures (letterboxing/pillarboxing) - non inclus dans cette fonctionnalité.
- Prévisualisation vidéo en temps réel du résultat redimensionné.
- Redimensionnement par lot avec des dimensions différentes par fichier.
- Upscaling avec amélioration de qualité par IA.
