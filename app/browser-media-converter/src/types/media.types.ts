/**
 * Media file types for the browser media converter
 */

/**
 * Metadata extracted from a media file using mediabunny
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
