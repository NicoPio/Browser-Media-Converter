/**
 * Main media conversion hook
 */

import { useState, useCallback, useRef } from 'react';
import type { ConversionConfig, ConversionResult } from '../types/conversion.types';
import { convert as convertService, cancel as cancelService } from '../services/conversionService';
import { ConversionError, ConversionErrorType } from '../types/conversion.types';

/**
 * Hook for managing media conversion with progress tracking and error handling
 */
export function useMediaConverter() {
	const [converting, setConverting] = useState(false);
	const [progress, setProgress] = useState(0);
	const [error, setError] = useState<Error | null>(null);
	const currentJobIdRef = useRef<string | null>(null);

	const convert = useCallback(async (config: ConversionConfig): Promise<ConversionResult> => {
		setConverting(true);
		setProgress(0);
		setError(null);
		currentJobIdRef.current = config.sourceFile.id;

		try {
			// Wire up progress callback
			const configWithProgress: ConversionConfig = {
				...config,
				onProgress: (p: number) => {
					setProgress(Math.round(p * 100));
					config.onProgress?.(p);
				},
			};

			const result = await convertService(configWithProgress);

			setProgress(100);
			setConverting(false);
			currentJobIdRef.current = null;

			return result;
		} catch (err) {
			setConverting(false);
			currentJobIdRef.current = null;

			const error = err instanceof Error ? err : new Error('Unknown conversion error');
			setError(error);

			throw error;
		}
	}, []);

	const cancel = useCallback(async (): Promise<void> => {
		if (currentJobIdRef.current) {
			try {
				await cancelService(currentJobIdRef.current);
				setConverting(false);
				setProgress(0);
				setError(
					new ConversionError(
						ConversionErrorType.CANCELLED,
						'Conversion was cancelled by user.',
					),
				);
			} catch (err) {
				console.error('Failed to cancel conversion:', err);
			} finally {
				currentJobIdRef.current = null;
			}
		}
	}, []);

	return {
		convert,
		cancel,
		progress,
		converting,
		error,
	};
}
