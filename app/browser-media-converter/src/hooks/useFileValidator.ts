/**
 * File validation hook wrapping fileService
 */

import { useCallback } from 'react';
import type { MediaFile } from '../types/media.types';
import type { OutputFormat, OutputFormatWithSupport, FormatType } from '../constants/formats';
import {
	validateFile as validateFileService,
	getSupportedOutputFormats,
	getSupportedOutputFormatsWithEncodability,
	isConversionSupported,
} from '../services/fileService';
import type { FileValidationResult } from '../services/fileService';

/**
 * Hook for file validation and format compatibility checks
 */
export function useFileValidator() {
	const validateFile = useCallback((file: File): FileValidationResult => {
		return validateFileService(file);
	}, []);

	const getSupportedFormats = useCallback((file: MediaFile): OutputFormat[] => {
		return getSupportedOutputFormats(file);
	}, []);

	const getSupportedFormatsWithEncodability = useCallback(
		async (file: MediaFile): Promise<OutputFormatWithSupport[]> => {
			return getSupportedOutputFormatsWithEncodability(file);
		},
		[],
	);

	const checkConversionSupport = useCallback((sourceFormat: string, targetFormat: FormatType): boolean => {
		return isConversionSupported(sourceFormat, targetFormat);
	}, []);

	return {
		validateFile,
		getSupportedFormats,
		getSupportedFormatsWithEncodability,
		isConversionSupported: checkConversionSupport,
	};
}
