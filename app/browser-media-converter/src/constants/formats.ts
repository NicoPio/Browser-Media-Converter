/**
 * Supported output formats and their configurations
 */

/**
 * Supported output format types
 */
export type FormatType = 'mp4' | 'mov' | 'webm' | 'mkv' | 'wav' | 'mp3' | 'ogg' | 'aac' | 'flac';

/**
 * Recommended codecs for a format
 */
export interface RecommendedCodecs {
	/** Recommended video codecs */
	video: string[];
	/** Recommended audio codecs */
	audio: string[];
}

/**
 * Output format definition
 */
export interface OutputFormat {
	/** Format identifier */
	format: FormatType;
	/** File extension (e.g., ".mp4") */
	extension: string;
	/** MIME type (e.g., "video/mp4") */
	mimeType: string;
	/** User-friendly display name */
	displayName: string;
	/** Description of format and use cases */
	description: string;
	/** Whether format supports video tracks */
	supportsVideo: boolean;
	/** Whether format supports audio tracks */
	supportsAudio: boolean;
	/** Recommended codecs for this format */
	recommendedCodecs: RecommendedCodecs;
}

/**
 * Output format with codec encodability information
 */
export interface OutputFormatWithSupport extends OutputFormat {
	/** Whether the browser can encode this format's codecs */
	isEncodable: boolean;
}

/**
 * List of all supported output formats
 */
export const OUTPUT_FORMATS: OutputFormat[] = [
	{
		format: 'mp4',
		extension: '.mp4',
		mimeType: 'video/mp4',
		displayName: 'MP4 Video',
		description: 'MPEG-4 Part 14 - Universal compatibility, good quality. Best for sharing and web.',
		supportsVideo: true,
		supportsAudio: true,
		recommendedCodecs: {
			video: ['h264', 'h265'],
			audio: ['aac', 'mp3'],
		},
	},
	{
		format: 'mov',
		extension: '.mov',
		mimeType: 'video/quicktime',
		displayName: 'MOV Video',
		description: 'QuickTime Movie - High quality, commonly used in video editing. Apple ecosystem.',
		supportsVideo: true,
		supportsAudio: true,
		recommendedCodecs: {
			video: ['h264', 'h265'],
			audio: ['aac'],
		},
	},
	{
		format: 'webm',
		extension: '.webm',
		mimeType: 'video/webm',
		displayName: 'WebM Video',
		description: 'Open format designed for the web. Excellent compression, wide browser support.',
		supportsVideo: true,
		supportsAudio: true,
		recommendedCodecs: {
			video: ['vp8', 'vp9', 'av1'],
			audio: ['opus', 'vorbis'],
		},
	},
	{
		format: 'mkv',
		extension: '.mkv',
		mimeType: 'video/x-matroska',
		displayName: 'MKV Video',
		description: 'Matroska - Flexible container supporting many codecs. Great for archiving.',
		supportsVideo: true,
		supportsAudio: true,
		recommendedCodecs: {
			video: ['h264', 'h265', 'vp9', 'av1'],
			audio: ['aac', 'opus', 'flac'],
		},
	},
	{
		format: 'wav',
		extension: '.wav',
		mimeType: 'audio/wav',
		displayName: 'WAV Audio',
		description: 'Uncompressed audio - Perfect quality, large file size. Professional use.',
		supportsVideo: false,
		supportsAudio: true,
		recommendedCodecs: {
			video: [],
			audio: ['pcm-s16', 'pcm-f32'],
		},
	},
	{
		format: 'mp3',
		extension: '.mp3',
		mimeType: 'audio/mpeg',
		displayName: 'MP3 Audio',
		description: 'Universal audio format - Excellent compatibility, efficient compression.',
		supportsVideo: false,
		supportsAudio: true,
		recommendedCodecs: {
			video: [],
			audio: ['mp3'],
		},
	},
	{
		format: 'ogg',
		extension: '.ogg',
		mimeType: 'audio/ogg',
		displayName: 'Ogg Audio',
		description: 'Open source format - Better quality than MP3 at same bitrate.',
		supportsVideo: false,
		supportsAudio: true,
		recommendedCodecs: {
			video: [],
			audio: ['vorbis', 'opus'],
		},
	},
	{
		format: 'aac',
		extension: '.aac',
		mimeType: 'audio/aac',
		displayName: 'AAC Audio',
		description: 'Advanced Audio Coding - Better quality than MP3, widely supported. ⚠️ Note: AAC encoding may not be supported in your browser.',
		supportsVideo: false,
		supportsAudio: true,
		recommendedCodecs: {
			video: [],
			audio: ['aac'],
		},
	},
	{
		format: 'flac',
		extension: '.flac',
		mimeType: 'audio/flac',
		displayName: 'FLAC Audio',
		description: 'Lossless compression - Perfect quality with smaller size than WAV.',
		supportsVideo: false,
		supportsAudio: true,
		recommendedCodecs: {
			video: [],
			audio: ['flac'],
		},
	},
];

/**
 * Get format by format type
 */
export function getFormatByType(formatType: FormatType): OutputFormat | undefined {
	return OUTPUT_FORMATS.find(f => f.format === formatType);
}

/**
 * Get formats that support video
 */
export function getVideoFormats(): OutputFormat[] {
	return OUTPUT_FORMATS.filter(f => f.supportsVideo);
}

/**
 * Get formats that support audio
 */
export function getAudioFormats(): OutputFormat[] {
	return OUTPUT_FORMATS.filter(f => f.supportsAudio);
}
