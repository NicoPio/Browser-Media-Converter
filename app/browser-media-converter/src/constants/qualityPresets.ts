/**
 * Predefined quality presets for video and audio conversion
 */

import type { QualityProfile } from '../types/quality.types';

/**
 * High quality preset - 8Mbps video, 256kbps audio
 */
export const HIGH_QUALITY: QualityProfile = {
	preset: 'high',
	video: {
		width: null, // preserve
		height: null, // preserve
		bitrate: 8_000_000, // 8 Mbps
		frameRate: null, // preserve
		codec: null, // auto-detect
	},
	audio: {
		sampleRate: null, // preserve
		bitrate: 256_000, // 256 kbps
		channels: null, // preserve
		codec: null, // auto-detect
	},
};

/**
 * Balanced quality preset - 2.5Mbps video, 128kbps audio
 */
export const BALANCED_QUALITY: QualityProfile = {
	preset: 'balanced',
	video: {
		width: null,
		height: null,
		bitrate: 2_500_000, // 2.5 Mbps
		frameRate: null,
		codec: null,
	},
	audio: {
		sampleRate: null,
		bitrate: 128_000, // 128 kbps
		channels: null,
		codec: null,
	},
};

/**
 * Small file size preset - 1Mbps video, 96kbps audio
 */
export const SMALL_SIZE: QualityProfile = {
	preset: 'small',
	video: {
		width: null,
		height: null,
		bitrate: 1_000_000, // 1 Mbps
		frameRate: null,
		codec: null,
	},
	audio: {
		sampleRate: null,
		bitrate: 96_000, // 96 kbps
		channels: null,
		codec: null,
	},
};

/**
 * Default preset (balanced)
 */
export const DEFAULT_QUALITY = BALANCED_QUALITY;

/**
 * Get quality profile by preset name
 */
export function getQualityPreset(preset: 'high' | 'balanced' | 'small'): QualityProfile {
	switch (preset) {
		case 'high':
			return HIGH_QUALITY;
		case 'balanced':
			return BALANCED_QUALITY;
		case 'small':
			return SMALL_SIZE;
	}
}
