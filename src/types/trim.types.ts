/**
 * Types for video trim functionality
 */

/**
 * Configuration for trimming video/audio
 */
export interface TrimConfiguration {
	/** Whether trimming is enabled */
	enabled: boolean;
	/** Start time in seconds */
	startTime: number;
	/** End time in seconds (null = end of media) */
	endTime: number | null;
}

/**
 * Default trim configuration (disabled)
 */
export const DEFAULT_TRIM_CONFIG: TrimConfiguration = {
	enabled: false,
	startTime: 0,
	endTime: null,
};
