/**
 * File size formatting utilities
 */

/**
 * Format bytes to human-readable string
 * @param bytes File size in bytes
 * @param decimals Number of decimal places (default: 2)
 * @returns Formatted string like "1.23 MB"
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
	if (bytes === 0) return '0 Bytes';

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Format bytes to a compact representation
 * @param bytes File size in bytes
 * @returns Compact string like "1.2M"
 */
export function formatBytesCompact(bytes: number): string {
	if (bytes === 0) return '0B';

	const k = 1024;
	const sizes = ['B', 'K', 'M', 'G', 'T'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	if (i === 0) {
		return `${bytes}B`;
	}

	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))}${sizes[i]}`;
}

/**
 * Parse formatted file size string to bytes
 * @param sizeStr Size string like "1.5 MB"
 * @returns Size in bytes
 */
export function parseSizeString(sizeStr: string): number {
	const units: Record<string, number> = {
		B: 1,
		KB: 1024,
		K: 1024,
		MB: 1024 * 1024,
		M: 1024 * 1024,
		GB: 1024 * 1024 * 1024,
		G: 1024 * 1024 * 1024,
		TB: 1024 * 1024 * 1024 * 1024,
		T: 1024 * 1024 * 1024 * 1024,
	};

	const match = sizeStr.match(/^([\d.]+)\s*([A-Z]+)$/i);
	if (!match) {
		return 0;
	}

	const [, numStr, unit] = match;
	const num = parseFloat(numStr);
	const multiplier = units[unit.toUpperCase()] || 1;

	return num * multiplier;
}
