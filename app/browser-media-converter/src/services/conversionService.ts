/**
 * Media conversion service using mediabunny
 */

import {
	Input,
	Output,
	Conversion,
	BlobSource,
	BufferTarget,
	ALL_FORMATS,
	Mp4OutputFormat,
	MovOutputFormat,
	WebMOutputFormat,
	MkvOutputFormat,
	WavOutputFormat,
	Mp3OutputFormat,
	OggOutputFormat,
	AdtsOutputFormat,
	FlacOutputFormat,
} from 'mediabunny';

import type { MediaFile } from '../types/media.types';
import type { ConversionResult, ConversionConfig } from '../types/conversion.types';
import type { QualityProfile } from '../types/quality.types';
import type { FormatType, OutputFormat } from '../constants/formats';
import { ConversionError, ConversionErrorType } from '../types/conversion.types';
import { generateFilename } from './downloadService';

/**
 * Active conversions map for cancellation support
 */
const activeConversions = new Map<string, Conversion>();

/**
 * Convert a media file using mediabunny
 * @param config Conversion configuration
 * @returns Promise resolving to conversion result
 * @throws ConversionError if conversion fails
 */
export async function convert(config: ConversionConfig): Promise<ConversionResult> {
	const { sourceFile, targetFormat, qualityProfile, onProgress } = config;

	try {
		// Create input from source file
		const source = new BlobSource(sourceFile.file);
		const input = new Input({
			source,
			formats: ALL_FORMATS,
		});

		// Create output with target format
		const target = new BufferTarget();

		const outputFormat = getOutputFormatClass(targetFormat.format);

		const output = new Output({
			target,
			format: outputFormat,
		});

		// Configure video settings from quality profile

		const videoConfig = await getVideoConfig(input, qualityProfile, targetFormat);

		// Configure audio settings from quality profile

		const audioConfig = await getAudioConfig(input, qualityProfile, targetFormat);

		// Initialize conversion (mediabunny API uses any types)

		const conversion = await Conversion.init({
			input,
			output,

			video: videoConfig,

			audio: audioConfig,
		});

		// Store for cancellation support
		const conversionId = sourceFile.id;
		activeConversions.set(conversionId, conversion);

		// Wire up progress callback
		if (onProgress) {
			conversion.onProgress = onProgress;
		}

		// Execute conversion
		await conversion.execute();

		// Clean up
		activeConversions.delete(conversionId);

		// Get output buffer
		const buffer = output.target.buffer;
		if (!buffer || buffer.byteLength === 0) {
			throw new ConversionError(
				ConversionErrorType.MEDIABUNNY_ERROR,
				'Conversion produced an empty output file.',
			);
		}

		// Create Blob from buffer
		const blob = new Blob([buffer], { type: targetFormat.mimeType });

		// Generate output filename
		const filename = generateFilename(sourceFile.name, targetFormat.extension);

		return {
			blob,
			filename,
			size: blob.size,
			url: null, // URL will be created when needed
		};
	} catch (error) {
		if (error instanceof ConversionError) {
			throw error;
		}

		// Map mediabunny errors to ConversionErrors
		const message = error instanceof Error ? error.message : 'Unknown conversion error';

		if (message.includes('codec') || message.includes('format')) {
			throw new ConversionError(ConversionErrorType.UNSUPPORTED_FORMAT, message, error as Error);
		}

		if (message.includes('memory') || message.includes('allocation')) {
			throw new ConversionError(ConversionErrorType.OUT_OF_MEMORY, message, error as Error);
		}

		throw new ConversionError(ConversionErrorType.MEDIABUNNY_ERROR, message, error as Error);
	}
}

/**
 * Cancel an active conversion
 * @param jobId Job identifier (corresponds to sourceFile.id)
 * @returns Promise resolving when cancellation complete
 */
export async function cancel(jobId: string): Promise<void> {
	const conversion = activeConversions.get(jobId);
	if (conversion) {
		// mediabunny Conversion class should have a cancel/abort method
		// For now, we'll just remove it from our map
		activeConversions.delete(jobId);

		// If mediabunny supports cancellation:
		// await conversion.cancel();
	}
}

/**
 * Estimate output file size based on quality profile
 * @param sourceFile Source media file
 * @param qualityProfile Quality settings
 * @returns Estimated output size in bytes
 */
export function estimateOutputSize(sourceFile: MediaFile, qualityProfile: QualityProfile): number {
	if (!sourceFile.metadata) {
		return sourceFile.size; // No metadata, return source size as estimate
	}

	const { duration, hasVideo, hasAudio } = sourceFile.metadata;

	let estimatedBitrate = 0;

	// Estimate video bitrate
	if (hasVideo && qualityProfile.video?.bitrate) {
		estimatedBitrate += qualityProfile.video.bitrate;
	} else if (hasVideo) {
		// Default video bitrate if not specified
		estimatedBitrate += 2_500_000; // 2.5 Mbps
	}

	// Estimate audio bitrate
	if (hasAudio && qualityProfile.audio?.bitrate) {
		estimatedBitrate += qualityProfile.audio.bitrate;
	} else if (hasAudio) {
		// Default audio bitrate if not specified
		estimatedBitrate += 128_000; // 128 kbps
	}

	// Calculate estimated size: (bitrate * duration) / 8 bits per byte
	const estimatedSize = (estimatedBitrate * duration) / 8;

	// Add 10% overhead for container format
	return Math.ceil(estimatedSize * 1.1);
}

/**
 * Get mediabunny output format class for format type
 * Returns mediabunny format class (types not exported by library)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getOutputFormatClass(formatType: FormatType): any {
	switch (formatType) {
		case 'mp4':
			return new Mp4OutputFormat();
		case 'mov':
			return new MovOutputFormat();
		case 'webm':
			return new WebMOutputFormat();
		case 'mkv':
			return new MkvOutputFormat();
		case 'wav':
			return new WavOutputFormat();
		case 'mp3':
			return new Mp3OutputFormat();
		case 'ogg':
			return new OggOutputFormat();
		case 'aac':
			return new AdtsOutputFormat();
		case 'flac':
			return new FlacOutputFormat();
		default:
			throw new Error(`Unsupported output format: ${formatType}`);
	}
}

/**
 * Get video configuration from quality profile
 * Returns mediabunny video config (types not exported by library)
 */

async function getVideoConfig(
	input: Input,
	qualityProfile: QualityProfile,
	targetFormat: OutputFormat,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
	// If target format doesn't support video, don't provide video config
	if (!targetFormat.supportsVideo) {
		return undefined;
	}

	const videoTracks = await input.getVideoTracks();
	if (!videoTracks.length) {
		return undefined; // No video tracks
	}

	const videoSettings = qualityProfile.video;
	if (!videoSettings) {
		return undefined; // Use defaults
	}

	return {
		width: videoSettings.width ?? undefined,
		height: videoSettings.height ?? undefined,
		bitrate: videoSettings.bitrate ?? undefined,
		framerate: videoSettings.frameRate ?? undefined,
		codec: videoSettings.codec ?? undefined,
	};
}

/**
 * Get audio configuration from quality profile
 * Returns mediabunny audio config (types not exported by library)
 */

async function getAudioConfig(
	input: Input,
	qualityProfile: QualityProfile,
	targetFormat: OutputFormat,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
	// If target format doesn't support audio, don't provide audio config
	if (!targetFormat.supportsAudio) {
		return undefined;
	}

	const audioTracks = await input.getAudioTracks();
	if (!audioTracks.length) {
		return undefined; // No audio tracks
	}

	const audioSettings = qualityProfile.audio;
	if (!audioSettings) {
		return undefined; // Use defaults
	}

	return {
		sampleRate: audioSettings.sampleRate ?? undefined,
		bitrate: audioSettings.bitrate ?? undefined,
		numberOfChannels: audioSettings.channels ?? undefined,
		codec: audioSettings.codec ?? undefined,
	};
}
