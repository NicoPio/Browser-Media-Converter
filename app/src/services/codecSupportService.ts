/**
 * Codec support detection service
 * Checks which audio/video codecs are encodable in the current browser
 */

import { canEncodeAudio, canEncodeVideo } from 'mediabunny';
import type { OutputFormat } from '../constants/formats';

/**
 * Cache for codec support results
 */
const codecSupportCache = new Map<string, boolean>();

/**
 * Check if a specific audio codec is encodable
 * Results are cached for performance
 */
export async function isAudioCodecSupported(codec: string): Promise<boolean> {
	const cacheKey = `audio:${codec}`;

	if (codecSupportCache.has(cacheKey)) {
		return codecSupportCache.get(cacheKey)!;
	}

	try {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const supported = await canEncodeAudio(codec as any);
		codecSupportCache.set(cacheKey, supported);
		return supported;
	} catch (error) {
		console.warn(`[CodecSupport] Error checking audio codec ${codec}:`, error);
		codecSupportCache.set(cacheKey, false);
		return false;
	}
}

/**
 * Check if a specific video codec is encodable
 * Results are cached for performance
 */
export async function isVideoCodecSupported(codec: string): Promise<boolean> {
	const cacheKey = `video:${codec}`;

	if (codecSupportCache.has(cacheKey)) {
		return codecSupportCache.get(cacheKey)!;
	}

	try {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const supported = await canEncodeVideo(codec as any);
		codecSupportCache.set(cacheKey, supported);
		return supported;
	} catch (error) {
		console.warn(`[CodecSupport] Error checking video codec ${codec}:`, error);
		codecSupportCache.set(cacheKey, false);
		return false;
	}
}

/**
 * Check if an output format is fully supported (all recommended codecs are encodable)
 */
export async function isFormatSupported(format: OutputFormat): Promise<boolean> {
	// Check video codecs if format supports video
	if (format.supportsVideo && format.recommendedCodecs.video.length > 0) {
		const videoSupport = await Promise.all(
			format.recommendedCodecs.video.map(codec => isVideoCodecSupported(codec)),
		);
		// At least one video codec must be supported
		if (!videoSupport.some(supported => supported)) {
			return false;
		}
	}

	// Check audio codecs if format supports audio
	if (format.supportsAudio && format.recommendedCodecs.audio.length > 0) {
		const audioSupport = await Promise.all(
			format.recommendedCodecs.audio.map(codec => isAudioCodecSupported(codec)),
		);
		// At least one audio codec must be supported
		if (!audioSupport.some(supported => supported)) {
			return false;
		}
	}

	return true;
}

/**
 * Get a list of unsupported codecs for a format
 */
export async function getUnsupportedCodecs(format: OutputFormat): Promise<string[]> {
	const unsupported: string[] = [];

	// Check video codecs
	if (format.supportsVideo) {
		for (const codec of format.recommendedCodecs.video) {
			if (!(await isVideoCodecSupported(codec))) {
				unsupported.push(codec);
			}
		}
	}

	// Check audio codecs
	if (format.supportsAudio) {
		for (const codec of format.recommendedCodecs.audio) {
			if (!(await isAudioCodecSupported(codec))) {
				unsupported.push(codec);
			}
		}
	}

	return unsupported;
}

/**
 * Clear the codec support cache (useful for testing or after encoder registration)
 */
export function clearCodecSupportCache(): void {
	codecSupportCache.clear();
}
