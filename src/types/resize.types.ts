/**
 * Types for video resize functionality
 */

/**
 * Identifiant unique d'un preset de résolution
 */
export type ResolutionPresetId =
	| 'original' // Pas de redimensionnement
	| '4k' // 3840×2160
	| '1440p' // 2560×1440
	| '1080p' // 1920×1080
	| '720p' // 1280×720
	| '480p' // 854×480
	| '360p' // 640×360
	| 'custom'; // Dimensions personnalisées

/**
 * Définition d'un preset de résolution
 */
export interface ResolutionPreset {
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

/**
 * Configuration de redimensionnement appliquée à une conversion
 */
export interface ResizeConfiguration {
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

/**
 * Niveau de sévérité d'un message de validation
 */
export type ValidationSeverity = 'error' | 'warning' | 'info';

/**
 * Message de validation individuel
 */
export interface ValidationMessage {
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
export interface DimensionValidationResult {
	/** Validation passée (pas d'erreurs bloquantes) */
	isValid: boolean;

	/** Dimensions ajustées (nombres pairs) */
	adjustedWidth: number | null;
	adjustedHeight: number | null;

	/** Messages de validation */
	messages: ValidationMessage[];
}

/**
 * Données source pour le calcul des dimensions cibles
 */
export interface DimensionCalculationInput {
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
