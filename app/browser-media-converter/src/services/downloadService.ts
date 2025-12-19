/**
 * File download service with Blob URL management and ZIP support
 */

import type { ConversionResult } from '../types/conversion.types';

// Lazy load JSZip only when needed for batch downloads (reduces initial bundle)
async function loadJSZip() {
	const JSZipModule = await import('jszip');
	return JSZipModule.default;
}

/**
 * Download a single converted file
 * @param result Conversion result to download
 */
export function downloadFile(result: ConversionResult): void {
	const url = result.url || createBlobUrl(result);

	// Create temporary download link
	const link = document.createElement('a');
	link.href = url;
	link.download = result.filename;
	link.style.display = 'none';

	// Append to body, click, and remove
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	// Note: We don't revoke the URL here because the download might still be in progress
	// The caller should manage URL revocation after ensuring download started
}

/**
 * Download multiple files as a ZIP archive
 * @param results Array of conversion results
 * @param zipFilename Name for the ZIP file (default: "converted-files.zip")
 * @returns Promise resolving when ZIP is created and download started
 */
export async function downloadAsZip(results: ConversionResult[], zipFilename: string = 'converted-files.zip'): Promise<void> {
	if (results.length === 0) {
		throw new Error('No files to download');
	}

	// Lazy load JSZip only when actually needed
	const JSZip = await loadJSZip();
	const zip = new JSZip();

	// Add each file to the ZIP
	for (const result of results) {
		zip.file(result.filename, result.blob);
	}

	// Generate ZIP file
	const zipBlob = await zip.generateAsync({
		type: 'blob',
		compression: 'DEFLATE',
		compressionOptions: { level: 6 }, // Moderate compression
	});

	// Create download URL
	const url = URL.createObjectURL(zipBlob);

	// Trigger download
	const link = document.createElement('a');
	link.href = url;
	link.download = zipFilename;
	link.style.display = 'none';

	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	// Clean up ZIP Blob URL after a delay
	setTimeout(() => {
		URL.revokeObjectURL(url);
	}, 1000);
}

/**
 * Create a Blob URL for a conversion result
 * @param result Conversion result
 * @returns Blob URL string
 */
export function createBlobUrl(result: ConversionResult): string {
	return URL.createObjectURL(result.blob);
}

/**
 * Revoke a Blob URL to free memory
 * @param url Blob URL to revoke
 */
export function revokeBlobUrl(url: string): void {
	try {
		URL.revokeObjectURL(url);
	} catch (error) {
		console.warn('Failed to revoke Blob URL:', error);
	}
}

/**
 * Generate a filename with a new extension based on the target format
 * @param originalFilename Original filename
 * @param targetExtension New extension (with or without leading dot)
 * @returns New filename with replaced extension
 */
export function generateFilename(originalFilename: string, targetExtension: string): string {
	// Ensure extension has leading dot
	const extension = targetExtension.startsWith('.') ? targetExtension : `.${targetExtension}`;

	// Remove original extension
	const nameWithoutExt = originalFilename.replace(/\.[^/.]+$/, '');

	return `${nameWithoutExt}${extension}`;
}
