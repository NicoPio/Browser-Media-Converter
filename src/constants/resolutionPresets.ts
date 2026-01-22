/**
 * Resolution presets for video resize functionality
 */

import type { ResolutionPreset, ResizeConfiguration } from '../types/resize.types';

/**
 * Available resolution presets
 */
export const RESOLUTION_PRESETS: ResolutionPreset[] = [
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

/**
 * Default resize configuration (no resizing)
 */
export const DEFAULT_RESIZE_CONFIG: ResizeConfiguration = {
	presetId: 'original',
	targetWidth: null,
	targetHeight: null,
	maintainAspectRatio: true,
	customWidth: null,
	customHeight: null,
};

/**
 * Get a preset by its ID
 */
export function getPresetById(id: string): ResolutionPreset | undefined {
	return RESOLUTION_PRESETS.find(preset => preset.id === id);
}

/**
 * Get presets suitable for downscaling from a given resolution
 * Filters out presets that would cause upscaling
 */
export function getDownscalePresets(sourceHeight: number): ResolutionPreset[] {
	return RESOLUTION_PRESETS.filter(preset => {
		if (preset.id === 'original' || preset.id === 'custom') return true;
		return preset.referenceHeight !== null && preset.referenceHeight <= sourceHeight;
	});
}
