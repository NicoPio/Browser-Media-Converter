/**
 * Metadata extraction service using mediabunny
 */

import { Input, BlobSource, ALL_FORMATS } from 'mediabunny';
import type { MediaFileMetadata } from '../types/media.types';

/**
 * Extract metadata from a media file using mediabunny
 * @param file Browser File object to analyze
 * @returns Promise resolving to extracted metadata
 * @throws Error if file cannot be analyzed
 */
export async function extractMetadata(file: File): Promise<MediaFileMetadata> {
	try {
		// Create input from file using BlobSource
		const source = new BlobSource(file);
		const input = new Input({
			source,
			formats: ALL_FORMATS,
		});

		// Extract video track metadata (if present)
		const videoTracks = await input.getVideoTracks();
		const videoTrack = videoTracks[0];
		const hasVideo = !!videoTrack;

		// Extract audio track metadata (if present)
		const audioTracks = await input.getAudioTracks();
		const audioTrack = audioTracks[0];
		const hasAudio = !!audioTrack;

		// Get format and duration
		const format = await input.getFormat();
		const duration = await input.computeDuration();

		// Build metadata object
		const metadata: MediaFileMetadata = {
			format: format?.name || 'unknown',
			duration: duration || 0,
			hasVideo,
			hasAudio,
			videoCodec: videoTrack?.codec || null,
			audioCodec: audioTrack?.codec || null,
			width: videoTrack?.displayWidth || null,
			height: videoTrack?.displayHeight || null,
			frameRate: null, // Frame rate is not available from track metadata
			videoBitrate: null, // Bitrate requires parsing packets
			audioBitrate: null, // Bitrate requires parsing packets
			sampleRate: null, // Sample rate not available from audio track
			channels: null, // Channel count not available from audio track
		};

		return metadata;
	} catch (error) {
		throw new Error(`Failed to extract metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}
