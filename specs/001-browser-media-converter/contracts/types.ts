/**
 * Type Contracts: Browser Media Converter
 *
 * This file defines all TypeScript interfaces and types for the browser media converter application.
 * These contracts serve as the API between components, services, and state management.
 *
 * @date 2025-12-17
 * @branch 001-browser-media-converter
 */

// ============================================================================
// Media File Types
// ============================================================================

/**
 * Represents metadata extracted from a media file using mediabunny
 */
export interface MediaFileMetadata {
	/** Container format (e.g., "mp4", "webm", "mov") */
	format: string;
	/** Duration in seconds */
	duration: number;
	/** Whether file contains video track */
	hasVideo: boolean;
	/** Whether file contains audio track */
	hasAudio: boolean;
	/** Video codec (e.g., "h264", "vp9") or null if no video */
	videoCodec: string | null;
	/** Audio codec (e.g., "aac", "opus") or null if no audio */
	audioCodec: string | null;
	/** Video width in pixels or null */
	width: number | null;
	/** Video height in pixels or null */
	height: number | null;
	/** Frame rate (fps) or null */
	frameRate: number | null;
	/** Video bitrate (bits per second) or null */
	videoBitrate: number | null;
	/** Audio bitrate (bits per second) or null */
	audioBitrate: number | null;
	/** Audio sample rate (Hz) or null */
	sampleRate: number | null;
	/** Audio channel count or null */
	channels: number | null;
}

/**
 * Represents an uploaded media file
 */
export interface MediaFile {
	/** Unique identifier */
	id: string;
	/** Original filename */
	name: string;
	/** File size in bytes */
	size: number;
	/** MIME type */
	type: string;
	/** Browser File object */
	file: File;
	/** Extracted metadata (populated asynchronously) */
	metadata: MediaFileMetadata | null;
	/** Upload timestamp */
	createdAt: Date;
}

// ============================================================================
// Output Format Types
// ============================================================================

/**
 * Supported output format types
 */
export type FormatType =
	| 'mp4' // MPEG-4 Part 14
	| 'mov' // QuickTime Movie
	| 'webm' // WebM
	| 'mkv' // Matroska
	| 'wav' // WAVE Audio
	| 'mp3' // MP3 Audio
	| 'ogg' // Ogg Container
	| 'aac' // ADTS AAC
	| 'flac'; // FLAC Audio

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

// ============================================================================
// Quality Profile Types
// ============================================================================

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

// ============================================================================
// Conversion Job Types
// ============================================================================

/**
 * Conversion job status states
 */
export type ConversionStatus =
	| 'queued' // Waiting to start
	| 'initializing' // Loading and analyzing file
	| 'converting' // Active conversion in progress
	| 'finalizing' // Writing output and cleanup
	| 'completed' // Successfully finished
	| 'failed' // Conversion failed with error
	| 'cancelled'; // User cancelled conversion

/**
 * Conversion result containing output file
 */
export interface ConversionResult {
	/** Converted file as Blob */
	blob: Blob;
	/** Suggested filename for download */
	filename: string;
	/** Output file size in bytes */
	size: number;
	/** Temporary Blob URL for download (null until created) */
	url: string | null;
}

/**
 * Represents a single file conversion operation
 */
export interface ConversionJob {
	/** Unique identifier */
	id: string;
	/** Source media file */
	sourceFile: MediaFile;
	/** Target output format */
	targetFormat: OutputFormat;
	/** Quality settings for conversion */
	qualityProfile: QualityProfile;
	/** Current conversion status */
	status: ConversionStatus;
	/** Progress percentage (0-100) */
	progress: number;
	/** Error object if status is "failed" */
	error: Error | null;
	/** Conversion result if status is "completed" */
	result: ConversionResult | null;
	/** When conversion started (null if not started) */
	startedAt: Date | null;
	/** When conversion finished (null if not finished) */
	completedAt: Date | null;
	/** Estimated duration in seconds (null until estimated) */
	estimatedDuration: number | null;
}

/**
 * Manages multiple conversion jobs
 */
export interface ConversionQueue {
	/** All jobs in queue */
	jobs: ConversionJob[];
	/** Currently processing job (null if idle) */
	activeJob: ConversionJob | null;
	/** Maximum concurrent conversions (default: 1) */
	maxConcurrent: number;
}

/**
 * Computed statistics for conversion queue
 */
export interface QueueStatistics {
	/** Total number of jobs */
	totalJobs: number;
	/** Number of completed jobs */
	completedCount: number;
	/** Number of failed jobs */
	failedCount: number;
	/** Number of queued jobs */
	queuedCount: number;
	/** Number of active/processing jobs */
	activeCount: number;
	/** Overall progress across all jobs (0-100) */
	overallProgress: number;
	/** Whether any job is currently processing */
	isProcessing: boolean;
	/** Whether all jobs are completed or failed */
	isComplete: boolean;
}

// ============================================================================
// Service Method Signatures
// ============================================================================

/**
 * Configuration for starting a conversion
 */
export interface ConversionConfig {
	/** Source file to convert */
	sourceFile: MediaFile;
	/** Target output format */
	targetFormat: OutputFormat;
	/** Quality settings */
	qualityProfile: QualityProfile;
	/** Progress callback (0-1) */
	onProgress?: (progress: number) => void;
}

/**
 * Conversion service interface
 */
export interface IConversionService {
	/**
	 * Start a conversion
	 * @param config Conversion configuration
	 * @returns Promise resolving to conversion result
	 * @throws Error if conversion fails
	 */
	convert(config: ConversionConfig): Promise<ConversionResult>;

	/**
	 * Cancel an active conversion
	 * @param jobId Job identifier to cancel
	 * @returns Promise resolving when cancellation complete
	 */
	cancel(jobId: string): Promise<void>;

	/**
	 * Extract metadata from a media file
	 * @param file File to analyze
	 * @returns Promise resolving to metadata
	 * @throws Error if file cannot be analyzed
	 */
	extractMetadata(file: File): Promise<MediaFileMetadata>;

	/**
	 * Estimate output file size
	 * @param sourceFile Source file
	 * @param qualityProfile Quality settings
	 * @returns Estimated size in bytes
	 */
	estimateOutputSize(
		sourceFile: MediaFile,
		qualityProfile: QualityProfile
	): number;
}

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
 * File service interface
 */
export interface IFileService {
	/**
	 * Validate a file for conversion
	 * @param file File to validate
	 * @returns Validation result
	 */
	validateFile(file: File): FileValidationResult;

	/**
	 * Get supported formats for a given file
	 * @param file Source file
	 * @returns Array of compatible output formats
	 */
	getSupportedOutputFormats(file: MediaFile): OutputFormat[];

	/**
	 * Check if conversion is supported
	 * @param sourceFormat Source format type
	 * @param targetFormat Target format type
	 * @returns Whether conversion is supported
	 */
	isConversionSupported(
		sourceFormat: string,
		targetFormat: FormatType
	): boolean;
}

/**
 * Download service interface
 */
export interface IDownloadService {
	/**
	 * Download a single file
	 * @param result Conversion result to download
	 */
	downloadFile(result: ConversionResult): void;

	/**
	 * Download multiple files as ZIP
	 * @param results Array of conversion results
	 * @param zipFilename Name for the ZIP file
	 * @returns Promise resolving when ZIP is created and download started
	 */
	downloadAsZip(
		results: ConversionResult[],
		zipFilename: string
	): Promise<void>;

	/**
	 * Create a Blob URL for a result
	 * @param result Conversion result
	 * @returns Blob URL
	 */
	createBlobUrl(result: ConversionResult): string;

	/**
	 * Revoke a Blob URL to free memory
	 * @param url Blob URL to revoke
	 */
	revokeBlobUrl(url: string): void;
}

// ============================================================================
// React Hook Return Types
// ============================================================================

/**
 * Return type for useMediaConverter hook
 */
export interface UseMediaConverterResult {
	/** Start a conversion */
	convert: (config: ConversionConfig) => Promise<ConversionResult>;
	/** Cancel active conversion */
	cancel: () => Promise<void>;
	/** Current progress (0-100) */
	progress: number;
	/** Whether conversion is in progress */
	converting: boolean;
	/** Error if conversion failed */
	error: Error | null;
}

/**
 * Return type for useFileValidator hook
 */
export interface UseFileValidatorResult {
	/** Validate a file */
	validateFile: (file: File) => FileValidationResult;
	/** Get supported formats for file */
	getSupportedFormats: (file: MediaFile) => OutputFormat[];
	/** Check conversion support */
	isConversionSupported: (
		sourceFormat: string,
		targetFormat: FormatType
	) => boolean;
}

/**
 * Return type for useConversionQueue hook
 */
export interface UseConversionQueueResult {
	/** Current queue state */
	queue: ConversionQueue;
	/** Queue statistics */
	statistics: QueueStatistics;
	/** Add job to queue */
	addJob: (job: ConversionJob) => void;
	/** Add multiple jobs to queue atomically */
	addJobs: (jobs: ConversionJob[], autoStart?: boolean) => void;
	/** Remove job from queue */
	removeJob: (jobId: string) => void;
	/** Start processing queue */
	startQueue: () => Promise<void>;
	/** Cancel specific job */
	cancelJob: (jobId: string) => Promise<void>;
	/** Cancel all jobs */
	cancelAll: () => Promise<void>;
	/** Clear completed jobs */
	clearCompleted: () => void;
	/** Clear all jobs */
	clearAll: () => void;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Browser capability check results
 */
export interface BrowserCapabilities {
	/** Whether WebCodecs API is supported */
	webCodecsSupported: boolean;
	/** Whether running in secure context (HTTPS) */
	secureContext: boolean;
	/** Estimated available memory (bytes) */
	availableMemory: number | null;
	/** Supported video codecs */
	videoCodecs: string[];
	/** Supported audio codecs */
	audioCodecs: string[];
}

/**
 * Error types that can occur during conversion
 */
export enum ConversionErrorType {
	/** File validation failed */
	VALIDATION_ERROR = 'VALIDATION_ERROR',
	/** Unsupported format or codec */
	UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
	/** Browser lacks WebCodecs support */
	BROWSER_NOT_SUPPORTED = 'BROWSER_NOT_SUPPORTED',
	/** File is corrupted or invalid */
	INVALID_FILE = 'INVALID_FILE',
	/** Out of memory during conversion */
	OUT_OF_MEMORY = 'OUT_OF_MEMORY',
	/** mediabunny library error */
	MEDIABUNNY_ERROR = 'MEDIABUNNY_ERROR',
	/** User cancelled conversion */
	CANCELLED = 'CANCELLED',
	/** Unknown error */
	UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Structured conversion error
 */
export interface ConversionError extends Error {
	/** Error type */
	type: ConversionErrorType;
	/** Original error if wrapped */
	originalError?: Error;
	/** User-friendly message */
	userMessage: string;
}
