/**
 * Supported output formats and their configurations
 */

/**
 * Supported output format types
 * 'same' represents keeping the same format as the input file
 */
export type FormatType = 'same' | 'mp4' | 'mov' | 'webm' | 'mkv' | 'wav' | 'mp3' | 'ogg' | 'aac' | 'flac';

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
 * Special format for keeping the same format as input (resize only)
 */
export const SAME_AS_INPUT_FORMAT: OutputFormat = {
	format: 'same',
	extension: '',
	mimeType: '',
	displayName: 'Same as input',
	description: 'Keep the original format and codecs. Only apply resize if configured.',
	supportsVideo: true,
	supportsAudio: true,
	recommendedCodecs: {
		video: [],
		audio: [],
	},
};

/**
 * List of all supported output formats
 */
export const OUTPUT_FORMATS: OutputFormat[] = [
	SAME_AS_INPUT_FORMAT,
	{
		format: 'mp4',
		extension: '.mp4',
		mimeType: 'video/mp4',
		displayName: 'MP4 Video',
		description: 'MPEG-4 Part 14 - Universal compatibility, good quality. Best for sharing and web.',
		supportsVideo: true,
		supportsAudio: true,
		recommendedCodecs: {
			video: ['avc', 'hevc'],
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
			video: ['avc', 'hevc'],
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
			video: ['avc', 'hevc', 'vp9', 'av1'],
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

/**
 * Map a source format name to a FormatType
 * Used when resolving 'same' format to the actual input format
 */
export function mapSourceFormatToFormatType(sourceFormat: string): FormatType | null {
	const formatMap: Record<string, FormatType> = {
		'mp4': 'mp4',
		'isobmff': 'mp4',
		'mov': 'mov',
		'quicktime': 'mov',
		'webm': 'webm',
		'matroska': 'mkv',
		'mkv': 'mkv',
		'wav': 'wav',
		'wave': 'wav',
		'mp3': 'mp3',
		'ogg': 'ogg',
		'aac': 'aac',
		'adts': 'aac',
		'flac': 'flac',
	};
	return formatMap[sourceFormat.toLowerCase()] || null;
}

/**
 * Resolve the 'same' format to the actual format based on source metadata
 */
export function resolveOutputFormat(
	targetFormat: OutputFormat,
	sourceFormat: string | undefined,
): OutputFormat {
	if (targetFormat.format !== 'same' || !sourceFormat) {
		return targetFormat;
	}

	const resolvedFormatType = mapSourceFormatToFormatType(sourceFormat);
	if (!resolvedFormatType) {
		return targetFormat;
	}

	const resolvedFormat = getFormatByType(resolvedFormatType);
	return resolvedFormat || targetFormat;
}
