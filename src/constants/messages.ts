/**
 * User-friendly error and info messages
 */

import { ConversionErrorType } from '../types/conversion.types';

/**
 * Get user-friendly error message for error type
 */
export function getErrorMessage(errorType: ConversionErrorType): string {
	switch (errorType) {
		case ConversionErrorType.VALIDATION_ERROR:
			return 'The selected file could not be validated. Please check the file format and try again.';

		case ConversionErrorType.UNSUPPORTED_FORMAT:
			return 'This file format or codec is not supported for conversion. Please try a different file.';

		case ConversionErrorType.BROWSER_NOT_SUPPORTED:
			return 'Your browser does not support media conversion. Please upgrade to Chrome 94+, Edge 94+, Firefox 130+, or Safari 16.4+.';

		case ConversionErrorType.INVALID_FILE:
			return 'The file appears to be corrupted or invalid. Please try a different file.';

		case ConversionErrorType.OUT_OF_MEMORY:
			return 'Your browser ran out of memory. Try closing other tabs or using a smaller file.';

		case ConversionErrorType.MEDIABUNNY_ERROR:
			return 'An error occurred during conversion. Please try again or contact support if the issue persists.';

		case ConversionErrorType.CANCELLED:
			return 'Conversion was cancelled by user.';

		case ConversionErrorType.UNKNOWN_ERROR:
		default:
			return 'An unexpected error occurred. Please try again.';
	}
}

/**
 * File size warning messages
 */
export const FILE_SIZE_MESSAGES = {
	LARGE_FILE: 'Large file detected (>100MB). Conversion may take some time. Consider closing other tabs for best performance.',
	VERY_LARGE_FILE:
		'Very large file detected (>500MB). Conversion may be slow and could fail on devices with limited memory. Monitor your browser carefully.',
	HUGE_FILE:
		'Extremely large file (>1GB). Conversion may fail due to browser memory limitations. Consider using a smaller file or desktop software.',
};

/**
 * General info messages
 */
export const INFO_MESSAGES = {
	HTTPS_REQUIRED: 'This application requires a secure connection (HTTPS) to access media conversion features.',
	WEBCODECS_CHECKING: 'Checking browser capabilities...',
	CONVERSION_STARTING: 'Starting conversion...',
	CONVERSION_COMPLETE: 'Conversion complete! Your file is ready to download.',
	EXTRACTING_METADATA: 'Analyzing file...',
	BATCH_PROCESSING: 'Processing batch conversion...',
	NO_FILES_SELECTED: 'No files selected. Drag and drop files or click to browse.',
	UNSUPPORTED_COMBINATION: 'This source and target format combination is not supported.',
};

/**
 * Get file size warning based on size in bytes
 */
export function getFileSizeWarning(sizeBytes: number): string | null {
	const MB_100 = 100 * 1024 * 1024;
	const MB_500 = 500 * 1024 * 1024;
	const GB_1 = 1024 * 1024 * 1024;

	if (sizeBytes > GB_1) {
		return FILE_SIZE_MESSAGES.HUGE_FILE;
	} else if (sizeBytes > MB_500) {
		return FILE_SIZE_MESSAGES.VERY_LARGE_FILE;
	} else if (sizeBytes > MB_100) {
		return FILE_SIZE_MESSAGES.LARGE_FILE;
	}

	return null;
}
