/**
 * Dimension calculation utilities for video resize
 */

import type {
	DimensionValidationResult,
	ValidationMessage,
	ResolutionPreset,
} from '../types/resize.types';

/**
 * Round a number to the nearest even number (floor)
 * Required for codec compatibility (H.264/H.265 work with 2x2 macroblocks)
 */
export function toEvenNumber(n: number): number {
	return Math.floor(n / 2) * 2;
}

/**
 * Calculate aspect ratio from dimensions
 */
export function calculateAspectRatio(width: number, height: number): number {
	if (height === 0) return 0;
	return width / height;
}

/**
 * Calculate target dimensions while preserving aspect ratio
 */
export function calculateTargetDimensions(
	sourceWidth: number,
	sourceHeight: number,
	targetWidth: number | null,
	targetHeight: number | null,
	maintainAspectRatio: boolean,
): { width: number; height: number } {
	// No resize requested
	if (targetWidth === null && targetHeight === null) {
		return { width: sourceWidth, height: sourceHeight };
	}

	const ratio = calculateAspectRatio(sourceWidth, sourceHeight);

	let finalWidth: number;
	let finalHeight: number;

	if (targetWidth !== null && targetHeight !== null && !maintainAspectRatio) {
		// Both dimensions specified, don't preserve ratio
		finalWidth = targetWidth;
		finalHeight = targetHeight;
	} else if (targetWidth !== null && (targetHeight === null || maintainAspectRatio)) {
		// Width specified, calculate height
		finalWidth = targetWidth;
		finalHeight = Math.round(targetWidth / ratio);
	} else if (targetHeight !== null) {
		// Height specified (or both with ratio preserved), calculate width
		finalHeight = targetHeight;
		finalWidth = Math.round(targetHeight * ratio);
	} else {
		return { width: sourceWidth, height: sourceHeight };
	}

	// Ensure even numbers for codec compatibility
	return {
		width: toEvenNumber(finalWidth),
		height: toEvenNumber(finalHeight),
	};
}

/**
 * Calculate target dimensions from a resolution preset
 */
export function calculatePresetDimensions(
	sourceWidth: number,
	sourceHeight: number,
	preset: ResolutionPreset,
): { width: number; height: number } {
	// Original = no change
	if (preset.id === 'original' || preset.referenceHeight === null) {
		return { width: sourceWidth, height: sourceHeight };
	}

	// Use reference height to calculate dimensions while preserving ratio
	return calculateTargetDimensions(
		sourceWidth,
		sourceHeight,
		null,
		preset.referenceHeight,
		true,
	);
}

/**
 * Check if the target resolution would be an upscale (enlargement)
 */
export function isUpscaling(
	sourceWidth: number,
	sourceHeight: number,
	targetWidth: number,
	targetHeight: number,
): boolean {
	return targetWidth > sourceWidth || targetHeight > sourceHeight;
}

/**
 * Check if dimensions are within minimum bounds
 */
export function isBelowMinimum(width: number, height: number, minDimension: number = 16): boolean {
	return width < minDimension || height < minDimension;
}

/**
 * Check if dimensions are within maximum bounds
 */
export function isAboveMaximum(
	width: number,
	height: number,
	maxWidth: number = 7680,
	maxHeight: number = 4320,
): boolean {
	return width > maxWidth || height > maxHeight;
}

/**
 * Validate dimensions and return adjusted values with messages
 */
export function validateDimensions(
	targetWidth: number | null,
	targetHeight: number | null,
	sourceWidth?: number,
	sourceHeight?: number,
): DimensionValidationResult {
	const messages: ValidationMessage[] = [];
	let isValid = true;
	let adjustedWidth = targetWidth;
	let adjustedHeight = targetHeight;

	// If no dimensions provided, valid (no resize)
	if (targetWidth === null && targetHeight === null) {
		return { isValid: true, adjustedWidth: null, adjustedHeight: null, messages: [] };
	}

	// Check for positive values
	if (targetWidth !== null && targetWidth <= 0) {
		messages.push({
			severity: 'error',
			code: 'INVALID_WIDTH',
			message: 'Width must be positive',
		});
		isValid = false;
	}

	if (targetHeight !== null && targetHeight <= 0) {
		messages.push({
			severity: 'error',
			code: 'INVALID_HEIGHT',
			message: 'Height must be positive',
		});
		isValid = false;
	}

	// Don't continue validation if basic checks fail
	if (!isValid) {
		return { isValid, adjustedWidth, adjustedHeight, messages };
	}

	// Ensure non-null for further checks
	const width = targetWidth ?? 0;
	const height = targetHeight ?? 0;

	// Check minimum dimensions
	if (targetWidth !== null && width < 16) {
		messages.push({
			severity: 'error',
			code: 'WIDTH_TOO_SMALL',
			message: 'Minimum width: 16 pixels',
		});
		isValid = false;
	}

	if (targetHeight !== null && height < 16) {
		messages.push({
			severity: 'error',
			code: 'HEIGHT_TOO_SMALL',
			message: 'Minimum height: 16 pixels',
		});
		isValid = false;
	}

	// Check maximum dimensions
	if (targetWidth !== null && width > 7680) {
		messages.push({
			severity: 'error',
			code: 'WIDTH_TOO_LARGE',
			message: 'Maximum width: 7680 pixels (8K)',
		});
		isValid = false;
	}

	if (targetHeight !== null && height > 4320) {
		messages.push({
			severity: 'error',
			code: 'HEIGHT_TOO_LARGE',
			message: 'Maximum height: 4320 pixels (8K)',
		});
		isValid = false;
	}

	// Adjust to even numbers
	if (targetWidth !== null && width % 2 !== 0) {
		adjustedWidth = toEvenNumber(width);
		messages.push({
			severity: 'info',
			code: 'WIDTH_ADJUSTED',
			message: `Width adjusted to ${adjustedWidth} (even number required)`,
		});
	}

	if (targetHeight !== null && height % 2 !== 0) {
		adjustedHeight = toEvenNumber(height);
		messages.push({
			severity: 'info',
			code: 'HEIGHT_ADJUSTED',
			message: `Height adjusted to ${adjustedHeight} (even number required)`,
		});
	}

	// Check for upscaling warning
	if (
		sourceWidth !== undefined &&
		sourceHeight !== undefined &&
		targetWidth !== null &&
		targetHeight !== null
	) {
		if (isUpscaling(sourceWidth, sourceHeight, width, height)) {
			messages.push({
				severity: 'warning',
				code: 'UPSCALING',
				message: 'Upscaling cannot improve quality',
			});
		}
	}

	// Check for very low resolution warning
	if ((targetWidth !== null && width < 320) || (targetHeight !== null && height < 320)) {
		messages.push({
			severity: 'warning',
			code: 'LOW_RESOLUTION',
			message: 'Very low resolution, quality will be degraded',
		});
	}

	// Check for very high resolution warning (> 4K)
	if ((targetWidth !== null && width > 3840) || (targetHeight !== null && height > 2160)) {
		messages.push({
			severity: 'warning',
			code: 'HIGH_RESOLUTION',
			message: 'Very high resolution, encoding may be slow',
		});
	}

	return { isValid, adjustedWidth, adjustedHeight, messages };
}

/**
 * Format dimensions as a display string
 */
export function formatDimensions(width: number | null, height: number | null): string {
	if (width === null || height === null) {
		return 'Original';
	}
	return `${width}×${height}`;
}

/**
 * Calculate the percentage change between source and target
 */
export function calculateSizeChangePercent(
	sourceWidth: number,
	sourceHeight: number,
	targetWidth: number,
	targetHeight: number,
): number {
	const sourcePixels = sourceWidth * sourceHeight;
	const targetPixels = targetWidth * targetHeight;
	return Math.round(((targetPixels - sourcePixels) / sourcePixels) * 100);
}
