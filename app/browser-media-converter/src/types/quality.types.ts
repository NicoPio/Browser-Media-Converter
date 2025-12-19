/**
 * Quality profile types for defining conversion quality parameters
 */

/**
 * Predefined quality presets
 */
export type QualityPreset =
	| 'high' // High quality, larger file size
	| 'balanced' // Balanced quality and size (default)
	| 'small' // Smaller file size, lower quality
	| 'custom'; // User-defined settings

/**
 * Video quality settings
 */
export interface VideoQualitySettings {
	/** Output width in pixels (null = preserve) */
	width: number | null;
	/** Output height in pixels (null = preserve) */
	height: number | null;
	/** Video bitrate in bits per second (null = auto) */
	bitrate: number | null;
	/** Frame rate in fps (null = preserve) */
	frameRate: number | null;
	/** Video codec (e.g., "h264", "vp9", null = auto) */
	codec: string | null;
}

/**
 * Audio quality settings
 */
export interface AudioQualitySettings {
	/** Sample rate in Hz (null = preserve) */
	sampleRate: number | null;
	/** Audio bitrate in bits per second (null = auto) */
	bitrate: number | null;
	/** Channel count: 1=mono, 2=stereo (null = preserve) */
	channels: number | null;
	/** Audio codec (e.g., "aac", "opus", null = auto) */
	codec: string | null;
}

/**
 * Complete quality profile for conversion
 */
export interface QualityProfile {
	/** Selected preset (or "custom" for manual settings) */
	preset: QualityPreset | null;
	/** Video quality settings (null if not applicable) */
	video: VideoQualitySettings | null;
	/** Audio quality settings (null if not applicable) */
	audio: AudioQualitySettings | null;
}
