/**
 * Types for GIF conversion functionality
 */

/**
 * GIF quality preset
 */
export type GifQualityPreset = 'high' | 'balanced' | 'small';

/**
 * GIF-specific configuration
 */
export interface GifConfiguration {
	/** Frames per second (1-30, default 10) */
	fps: number;

	/** Output width in pixels (null = auto from source) */
	width: number | null;

	/** Output height in pixels (null = auto from source) */
	height: number | null;

	/** Maintain aspect ratio when resizing */
	maintainAspectRatio: boolean;

	/** Quality preset */
	quality: GifQualityPreset;

	/** Start time in seconds (for trimming) */
	startTime: number;

	/** End time in seconds (null = end of video) */
	endTime: number | null;

	/** Maximum duration in seconds (null = no limit) */
	maxDuration: number | null;

	/** Color quality (1-30, lower = better quality but slower) */
	colorQuality: number;

	/** Enable dithering for better color reproduction */
	dithering: boolean;
}

/**
 * Default GIF configuration
 */
export const DEFAULT_GIF_CONFIG: GifConfiguration = {
	fps: 10,
	width: null,
	height: null,
	maintainAspectRatio: true,
	quality: 'balanced',
	startTime: 0,
	endTime: null,
	maxDuration: 15,
	colorQuality: 10,
	dithering: true,
};

/**
 * GIF quality presets with their configurations
 */
export const GIF_QUALITY_PRESETS: Record<GifQualityPreset, Partial<GifConfiguration>> = {
	high: {
		fps: 15,
		colorQuality: 5,
		dithering: true,
	},
	balanced: {
		fps: 10,
		colorQuality: 10,
		dithering: true,
	},
	small: {
		fps: 8,
		colorQuality: 15,
		dithering: false,
	},
};

/**
 * GIF encoding progress information
 */
export interface GifEncodingProgress {
	/** Current phase: 'extracting' | 'encoding' | 'finalizing' */
	phase: 'extracting' | 'encoding' | 'finalizing';

	/** Progress percentage (0-100) */
	progress: number;

	/** Current frame being processed */
	currentFrame: number;

	/** Total frames to process */
	totalFrames: number;
}

/**
 * GIF encoding result
 */
export interface GifEncodingResult {
	/** Encoded GIF as Blob */
	blob: Blob;

	/** Width of the GIF */
	width: number;

	/** Height of the GIF */
	height: number;

	/** Number of frames */
	frameCount: number;

	/** Duration in seconds */
	duration: number;

	/** File size in bytes */
	size: number;
}
