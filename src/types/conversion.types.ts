/**
 * Conversion types for managing file conversion jobs and queues
 */

import type { MediaFile } from './media.types';
import type { OutputFormat } from '../constants/formats';
import type { QualityProfile } from './quality.types';

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
export class ConversionError extends Error {
	type: ConversionErrorType;
	originalError?: Error;
	userMessage: string;

	constructor(type: ConversionErrorType, userMessage: string, originalError?: Error) {
		super(userMessage);
		this.name = 'ConversionError';
		this.type = type;
		this.userMessage = userMessage;
		this.originalError = originalError;
	}
}
