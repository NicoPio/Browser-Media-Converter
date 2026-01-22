/**
 * Hook for real-time dimension calculations
 */

import { useMemo } from 'react';
import type { ResizeConfiguration, DimensionValidationResult } from '../types/resize.types';
import { RESOLUTION_PRESETS, getPresetById } from '../constants/resolutionPresets';
import {
	calculateTargetDimensions,
	calculatePresetDimensions,
	validateDimensions,
	isUpscaling,
	formatDimensions,
	calculateSizeChangePercent,
} from '../utils/dimensions';

interface UseResizeCalculatorProps {
	/** Source video width */
	sourceWidth: number | null;
	/** Source video height */
	sourceHeight: number | null;
	/** Current resize configuration */
	config: ResizeConfiguration;
}

interface UseResizeCalculatorResult {
	/** Calculated target width */
	targetWidth: number | null;
	/** Calculated target height */
	targetHeight: number | null;
	/** Whether this is an upscaling operation */
	isUpscale: boolean;
	/** Validation result with adjusted dimensions and messages */
	validation: DimensionValidationResult;
	/** Formatted source dimensions string */
	sourceFormatted: string;
	/** Formatted target dimensions string */
	targetFormatted: string;
	/** Percentage change in pixel count */
	sizeChangePercent: number | null;
	/** Whether resize is active (not original) */
	isResizeActive: boolean;
}

/**
 * Hook that calculates target dimensions based on resize configuration
 */
export function useResizeCalculator({
	sourceWidth,
	sourceHeight,
	config,
}: UseResizeCalculatorProps): UseResizeCalculatorResult {
	return useMemo(() => {
		// Default values when source is unknown
		if (sourceWidth === null || sourceHeight === null) {
			return {
				targetWidth: null,
				targetHeight: null,
				isUpscale: false,
				validation: { isValid: true, adjustedWidth: null, adjustedHeight: null, messages: [] },
				sourceFormatted: 'Unknown',
				targetFormatted: 'Original',
				sizeChangePercent: null,
				isResizeActive: config.presetId !== 'original',
			};
		}

		let targetWidth: number | null = null;
		let targetHeight: number | null = null;

		// Calculate dimensions based on preset or custom
		if (config.presetId === 'original') {
			// No resize
			targetWidth = null;
			targetHeight = null;
		} else if (config.presetId === 'custom') {
			// Custom dimensions
			if (config.customWidth !== null || config.customHeight !== null) {
				const result = calculateTargetDimensions(
					sourceWidth,
					sourceHeight,
					config.customWidth,
					config.customHeight,
					config.maintainAspectRatio,
				);
				targetWidth = result.width;
				targetHeight = result.height;
			}
		} else {
			// Preset dimensions
			const preset = getPresetById(config.presetId);
			if (preset) {
				const result = calculatePresetDimensions(sourceWidth, sourceHeight, preset);
				targetWidth = result.width;
				targetHeight = result.height;
			}
		}

		// Validate dimensions
		const validation = validateDimensions(
			targetWidth,
			targetHeight,
			sourceWidth,
			sourceHeight,
		);

		// Use adjusted dimensions if available
		const finalWidth = validation.adjustedWidth ?? targetWidth;
		const finalHeight = validation.adjustedHeight ?? targetHeight;

		// Check if upscaling
		const isUpscale = finalWidth !== null && finalHeight !== null
			? isUpscaling(sourceWidth, sourceHeight, finalWidth, finalHeight)
			: false;

		// Format strings
		const sourceFormatted = formatDimensions(sourceWidth, sourceHeight);
		const targetFormatted = finalWidth !== null && finalHeight !== null
			? formatDimensions(finalWidth, finalHeight)
			: 'Original';

		// Calculate size change percentage
		const sizeChangePercent = finalWidth !== null && finalHeight !== null
			? calculateSizeChangePercent(sourceWidth, sourceHeight, finalWidth, finalHeight)
			: null;

		return {
			targetWidth: finalWidth,
			targetHeight: finalHeight,
			isUpscale,
			validation,
			sourceFormatted,
			targetFormatted,
			sizeChangePercent,
			isResizeActive: config.presetId !== 'original',
		};
	}, [sourceWidth, sourceHeight, config]);
}

/**
 * Get available presets with upscale indicators
 */
export function useAvailablePresets(sourceHeight: number | null) {
	return useMemo(() => {
		return RESOLUTION_PRESETS.map(preset => ({
			...preset,
			isUpscale: sourceHeight !== null &&
				preset.referenceHeight !== null &&
				preset.referenceHeight > sourceHeight,
		}));
	}, [sourceHeight]);
}
