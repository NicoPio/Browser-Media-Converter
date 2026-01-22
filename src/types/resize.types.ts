/**
 * Types for video resize functionality
 */

/**
 * Unique identifier for a resolution preset
 */
export type ResolutionPresetId =
	| 'original' // No resize
	| '4k' // 3840×2160
	| '1440p' // 2560×1440
	| '1080p' // 1920×1080
	| '720p' // 1280×720
	| '480p' // 854×480
	| '360p' // 640×360
	| 'custom'; // Custom dimensions

/**
 * Definition of a resolution preset
 */
export interface ResolutionPreset {
	/** Unique identifier */
	id: ResolutionPresetId;

	/** Display name (e.g., "1080p (Full HD)") */
	label: string;

	/** Short description for tooltip */
	description: string;

	/** Target width in pixels (null for 'original' and 'custom') */
	width: number | null;

	/** Target height in pixels (null for 'original' and 'custom') */
	height: number | null;

	/** Reference height for aspect ratio adaptation (e.g., 1080 for 1080p) */
	referenceHeight: number | null;
}

/**
 * Resize configuration applied to a conversion
 */
export interface ResizeConfiguration {
	/** Selected preset */
	presetId: ResolutionPresetId;

	/** Final target width (calculated) */
	targetWidth: number | null;

	/** Final target height (calculated) */
	targetHeight: number | null;

	/** Automatically preserve aspect ratio */
	maintainAspectRatio: boolean;

	/** Custom width (custom mode only) */
	customWidth: number | null;

	/** Custom height (custom mode only) */
	customHeight: number | null;
}

/**
 * Severity level of a validation message
 */
export type ValidationSeverity = 'error' | 'warning' | 'info';

/**
 * Individual validation message
 */
export interface ValidationMessage {
	/** Severity level */
	severity: ValidationSeverity;

	/** Error code for i18n */
	code: string;

	/** User-readable message */
	message: string;
}

/**
 * Complete dimension validation result
 */
export interface DimensionValidationResult {
	/** Validation passed (no blocking errors) */
	isValid: boolean;

	/** Adjusted dimensions (even numbers) */
	adjustedWidth: number | null;
	adjustedHeight: number | null;

	/** Validation messages */
	messages: ValidationMessage[];
}

/**
 * Source data for target dimension calculation
 */
export interface DimensionCalculationInput {
	/** Source video width */
	sourceWidth: number;

	/** Source video height */
	sourceHeight: number;

	/** Selected preset */
	preset: ResolutionPreset;

	/** Custom width (if custom mode) */
	customWidth?: number | null;

	/** Custom height (if custom mode) */
	customHeight?: number | null;

	/** Preserve aspect ratio */
	maintainAspectRatio: boolean;
}
