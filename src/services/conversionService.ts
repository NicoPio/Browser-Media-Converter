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
import type { ConversionVideoOptions, ConversionAudioOptions } from 'mediabunny';

import type { MediaFile } from '../types/media.types';
import type { ConversionResult, ConversionConfig } from '../types/conversion.types';
import type { QualityProfile } from '../types/quality.types';
import type { ResizeConfiguration } from '../types/resize.types';
import type { FormatType, OutputFormat } from '../constants/formats';
import { resolveOutputFormat, mapSourceFormatToFormatType } from '../constants/formats';
import { ConversionError, ConversionErrorType } from '../types/conversion.types';
import { generateFilename } from './downloadService';
import { calculatePresetDimensions, calculateTargetDimensions } from '../utils/dimensions';
import { getPresetById } from '../constants/resolutionPresets';
import { convertToGif } from './gifService';
import type { GifConfiguration } from '../types/gif.types';
import type { TrimConfiguration } from '../types/trim.types';

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
	const { sourceFile, targetFormat, qualityProfile, resizeConfig, onProgress, gifConfig, trimConfig } = config;

	// Handle GIF conversion separately (not supported by mediabunny)
	if (targetFormat.format === 'gif') {
		return convertToGifFormat(sourceFile, resizeConfig, gifConfig, trimConfig, onProgress);
	}

	try {
		// Create input from source file
		const source = new BlobSource(sourceFile.file);
		const input = new Input({
			source,
			formats: ALL_FORMATS,
		});

		// Resolve 'same' format to actual format based on input metadata
		const resolvedFormat = resolveOutputFormat(targetFormat, sourceFile.metadata?.format);

		// Create output with target format
		const target = new BufferTarget();

		const outputFormat = getOutputFormatClass(resolvedFormat.format, sourceFile.metadata?.format);

		const output = new Output({
			target,
			format: outputFormat,
		});

		// Configure video settings from quality profile and resize config

		const videoConfig = await getVideoConfig(input, qualityProfile, resolvedFormat, resizeConfig);

		// Configure audio settings from quality profile

		const audioConfig = await getAudioConfig(input, qualityProfile, resolvedFormat);

		// Build trim options if enabled
		const trim = getTrimOptions(trimConfig);

		// Initialize conversion (mediabunny API uses any types)

		const conversion = await Conversion.init({
			input,
			output,
			trim,
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
		const blob = new Blob([buffer], { type: resolvedFormat.mimeType });

		// Generate output filename
		const filename = generateFilename(sourceFile.name, resolvedFormat.extension);

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
		try {
			await conversion.cancel();
		} catch (error) {
			console.error('Error cancelling conversion:', error);
		} finally {
			activeConversions.delete(jobId);
		}
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
function getOutputFormatClass(formatType: FormatType, sourceFormat?: string): any {
	// Handle 'same' format by mapping to actual format from source
	let actualFormatType = formatType;
	if (formatType === 'same' && sourceFormat) {
		const mapped = mapSourceFormatToFormatType(sourceFormat);
		if (mapped) {
			actualFormatType = mapped;
		} else {
			throw new Error(`Cannot determine output format from source format: ${sourceFormat}`);
		}
	} else if (formatType === 'same') {
		throw new Error('Cannot use "same" format without source metadata');
	}

	switch (actualFormatType) {
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
			throw new Error(`Unsupported output format: ${actualFormatType}`);
	}
}

/**
 * Get video configuration from quality profile and resize config
 * Returns mediabunny video config (types not exported by library)
 */

async function getVideoConfig(
	input: Input,
	qualityProfile: QualityProfile,
	targetFormat: OutputFormat,
	resizeConfig?: ResizeConfiguration,
): Promise<ConversionVideoOptions | undefined> {
	// If target format doesn't support video, don't provide video config
	if (!targetFormat.supportsVideo) {
		return undefined;
	}

	const videoTracks = await input.getVideoTracks();
	if (!videoTracks.length) {
		return undefined; // No video tracks
	}

	const videoSettings = qualityProfile.video;

	// Calculate resize dimensions if resizeConfig is provided
	let resizeWidth: number | undefined;
	let resizeHeight: number | undefined;

	if (resizeConfig && resizeConfig.presetId !== 'original') {
		// Get source dimensions from first video track (use displayWidth/Height for proper rotation handling)
		const firstTrack = videoTracks[0];
		const sourceWidth = firstTrack.displayWidth;
		const sourceHeight = firstTrack.displayHeight;

		if (sourceWidth && sourceHeight) {
			if (resizeConfig.presetId === 'custom') {
				// Custom dimensions
				if (resizeConfig.customWidth !== null || resizeConfig.customHeight !== null) {
					const result = calculateTargetDimensions(
						sourceWidth,
						sourceHeight,
						resizeConfig.customWidth,
						resizeConfig.customHeight,
						resizeConfig.maintainAspectRatio,
					);
					resizeWidth = result.width;
					resizeHeight = result.height;
				}
			} else {
				// Preset dimensions
				const preset = getPresetById(resizeConfig.presetId);
				if (preset) {
					const result = calculatePresetDimensions(sourceWidth, sourceHeight, preset);
					resizeWidth = result.width;
					resizeHeight = result.height;
				}
			}
		}
	}

	// If no resize and no quality settings, use defaults
	if (!videoSettings && resizeWidth === undefined && resizeHeight === undefined) {
		return undefined;
	}

	// Determine final dimensions
	const finalWidth = resizeWidth ?? videoSettings?.width ?? undefined;
	const finalHeight = resizeHeight ?? videoSettings?.height ?? undefined;

	// When both width and height are provided, fit is required by mediabunny
	// Use 'contain' to preserve aspect ratio (letterboxing if needed)
	const fit = (finalWidth !== undefined && finalHeight !== undefined) ? 'contain' as const : undefined;

	return {
		// Resize dimensions take precedence over quality profile dimensions
		width: finalWidth,
		height: finalHeight,
		fit,
		bitrate: videoSettings?.bitrate ?? undefined,
		frameRate: videoSettings?.frameRate ?? undefined,
		codec: videoSettings?.codec ?? undefined,
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
): Promise<ConversionAudioOptions | undefined> {
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

/**
 * Build trim options for mediabunny Conversion
 */
function getTrimOptions(
	trimConfig?: TrimConfiguration,
): { start?: number; end?: number } | undefined {
	if (!trimConfig?.enabled) {
		return undefined;
	}

	const hasStartTrim = trimConfig.startTime > 0;
	const hasEndTrim = trimConfig.endTime !== null;

	if (!hasStartTrim && !hasEndTrim) {
		return undefined;
	}

	const trim: { start?: number; end?: number } = {};

	if (hasStartTrim) {
		trim.start = trimConfig.startTime;
	}

	if (hasEndTrim) {
		trim.end = trimConfig.endTime!;
	}

	return trim;
}

/**
 * Convert a video file to GIF format
 */
async function convertToGifFormat(
	sourceFile: MediaFile,
	resizeConfig?: ResizeConfiguration,
	gifConfig?: Partial<GifConfiguration>,
	trimConfig?: TrimConfiguration,
	onProgress?: (progress: number) => void,
): Promise<ConversionResult> {
	try {
		const config: Partial<GifConfiguration> = { ...gifConfig };

		// Apply trim config to GIF config
		if (trimConfig?.enabled) {
			config.startTime = trimConfig.startTime;
			config.endTime = trimConfig.endTime ?? undefined;
		}

		if (resizeConfig && resizeConfig.presetId !== 'original') {
			if (resizeConfig.presetId === 'custom') {
				config.width = resizeConfig.customWidth ?? undefined;
				config.height = resizeConfig.customHeight ?? undefined;
			} else {
				const preset = getPresetById(resizeConfig.presetId);
				if (preset?.referenceHeight) {
					config.height = preset.referenceHeight;
				}
			}
			config.maintainAspectRatio = resizeConfig.maintainAspectRatio;
		}

		const result = await convertToGif(
			sourceFile.file,
			config,
			onProgress ? (p) => onProgress(p.progress / 100) : undefined,
		);

		const filename = generateFilename(sourceFile.name, '.gif');

		return {
			blob: result.blob,
			filename,
			size: result.size,
			url: null,
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : 'GIF conversion failed';
		throw new ConversionError(ConversionErrorType.MEDIABUNNY_ERROR, message, error as Error);
	}
}
