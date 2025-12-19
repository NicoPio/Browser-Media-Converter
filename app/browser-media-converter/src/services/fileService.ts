/**
 * File validation and format compatibility service
 */

import type { MediaFile } from '../types/media.types';
import type { OutputFormat, OutputFormatWithSupport, FormatType } from '../constants/formats';
import { OUTPUT_FORMATS, getAudioFormats } from '../constants/formats';
import { validateFileSize } from '../utils/validation';
import { isFormatSupported } from './codecSupportService';

/**
 * File validation result
 */
export interface FileValidationResult {
	/** Whether file is valid */
	valid: boolean;
	/** Error message if invalid */
	error?: string;
	/** Warnings (non-blocking issues) */
	warnings?: string[];
}

/**
 * Supported MIME types for input files
 */
const SUPPORTED_MIME_TYPES = [
	// Video
	'video/mp4',
	'video/quicktime',
	'video/webm',
	'video/x-matroska',
	// Audio
	'audio/wav',
	'audio/wave',
	'audio/x-wav',
	'audio/mpeg',
	'audio/mp3',
	'audio/ogg',
	'audio/aac',
	'audio/flac',
	'audio/x-flac',
	// Generic
	'application/octet-stream', // Browser may use this for unknown types
];

/**
 * Validate a file for conversion
 * @param file File to validate
 * @returns Validation result with error/warning messages
 */
export function validateFile(file: File): FileValidationResult {
	const warnings: string[] = [];

	// Check file size
	if (file.size === 0) {
		return {
			valid: false,
			error: 'File is empty (0 bytes).',
		};
	}

	const sizeValidation = validateFileSize(file.size);
	if (!sizeValidation.valid) {
		return {
			valid: false,
			error: sizeValidation.warning || 'File is too large.',
		};
	}
	if (sizeValidation.warning) {
		warnings.push(sizeValidation.warning);
	}

	// Check MIME type (basic check - mediabunny will do deeper validation)
	if (file.type && !SUPPORTED_MIME_TYPES.includes(file.type)) {
		warnings.push(
			`File type "${file.type}" may not be supported. The converter will attempt to process it, but it may fail.`,
		);
	}

	return {
		valid: true,
		warnings: warnings.length > 0 ? warnings : undefined,
	};
}

/**
 * Get supported output formats for a given source file
 * @param file Source media file with metadata
 * @returns Array of compatible output formats
 */
export function getSupportedOutputFormats(file: MediaFile): OutputFormat[] {
	if (!file.metadata) {
		// No metadata yet - return all formats
		return OUTPUT_FORMATS;
	}

	const { hasVideo, hasAudio } = file.metadata;

	if (hasVideo && hasAudio) {
		// File has both video and audio - all formats supported
		return OUTPUT_FORMATS;
	} else if (hasVideo && !hasAudio) {
		// Video only - can convert to video formats or extract to audio formats
		return OUTPUT_FORMATS;
	} else if (!hasVideo && hasAudio) {
		// Audio only - can convert to audio formats, but not to video formats
		return getAudioFormats();
	}

	// No tracks detected - return all formats and let mediabunny handle it
	return OUTPUT_FORMATS;
}

/**
 * Check if a specific conversion is supported
 * @param sourceFormat Source format type (e.g., "mp4", "webm")
 * @param targetFormat Target format type
 * @returns Whether the conversion is supported
 */
export function isConversionSupported(sourceFormat: string, targetFormat: FormatType): boolean {
	// For now, mediabunny supports most conversions
	// The main restriction is: audio-only files cannot be converted to video formats

	// If source is unknown, assume it's supported
	if (!sourceFormat) {
		return true;
	}

	// Check if target is video-only format
	const targetFormatObj = OUTPUT_FORMATS.find(f => f.format === targetFormat);
	if (!targetFormatObj) {
		return false;
	}

	// If target supports audio and doesn't require video, it's always supported
	if (targetFormatObj.supportsAudio && !targetFormatObj.supportsVideo) {
		return true;
	}

	// For video formats, we need video in the source (mediabunny will verify)
	// This is a basic check - detailed validation happens in metadataService
	return true;
}

/**
 * Get supported output formats with codec encodability information
 * @param file Source media file with metadata
 * @returns Array of formats with isEncodable flag indicating browser support
 */
export async function getSupportedOutputFormatsWithEncodability(
	file: MediaFile,
): Promise<OutputFormatWithSupport[]> {
	const formats = getSupportedOutputFormats(file);

	const formatsWithSupport = await Promise.all(
		formats.map(async (format) => {
			const isEncodable = await isFormatSupported(format);
			return {
				...format,
				isEncodable,
			};
		}),
	);

	return formatsWithSupport;
}
