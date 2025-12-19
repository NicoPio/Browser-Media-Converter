/**
 * Duration formatting utilities
 */

/**
 * Format duration in seconds to human-readable string (HH:MM:SS or MM:SS)
 * @param seconds Duration in seconds
 * @returns Formatted string like "01:23:45" or "23:45"
 */
export function formatDuration(seconds: number): string {
	if (seconds < 0 || !isFinite(seconds)) {
		return '00:00';
	}

	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = Math.floor(seconds % 60);

	if (hours > 0) {
		return `${padZero(hours)}:${padZero(minutes)}:${padZero(secs)}`;
	} else {
		return `${padZero(minutes)}:${padZero(secs)}`;
	}
}

/**
 * Format duration in seconds to compact form (e.g., "1h 23m", "45s")
 * @param seconds Duration in seconds
 * @returns Compact string
 */
export function formatDurationCompact(seconds: number): string {
	if (seconds < 0 || !isFinite(seconds)) {
		return '0s';
	}

	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = Math.floor(seconds % 60);

	const parts: string[] = [];

	if (hours > 0) {
		parts.push(`${hours}h`);
	}
	if (minutes > 0) {
		parts.push(`${minutes}m`);
	}
	if (secs > 0 || parts.length === 0) {
		parts.push(`${secs}s`);
	}

	return parts.join(' ');
}

/**
 * Parse duration string (HH:MM:SS or MM:SS) to seconds
 * @param durationStr Duration string
 * @returns Duration in seconds
 */
export function parseDurationString(durationStr: string): number {
	const parts = durationStr.split(':').map(p => parseInt(p, 10));

	if (parts.length === 2) {
		// MM:SS
		const [minutes, seconds] = parts;
		return minutes * 60 + seconds;
	} else if (parts.length === 3) {
		// HH:MM:SS
		const [hours, minutes, seconds] = parts;
		return hours * 3600 + minutes * 60 + seconds;
	}

	return 0;
}

/**
 * Format time remaining for progress display
 * @param seconds Seconds remaining
 * @returns User-friendly string like "About 2 minutes left" or "Less than a minute"
 */
export function formatTimeRemaining(seconds: number): string {
	if (seconds < 0 || !isFinite(seconds)) {
		return 'Calculating...';
	}

	if (seconds < 10) {
		return 'Almost done';
	}

	if (seconds < 60) {
		return 'Less than a minute';
	}

	const minutes = Math.ceil(seconds / 60);

	if (minutes === 1) {
		return 'About a minute left';
	}

	if (minutes < 60) {
		return `About ${minutes} minutes left`;
	}

	const hours = Math.ceil(minutes / 60);
	return `About ${hours} hour${hours > 1 ? 's' : ''} left`;
}

/**
 * Pad number with leading zero if needed
 */
function padZero(num: number): string {
	return num.toString().padStart(2, '0');
}
