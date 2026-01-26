import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateFile, getSupportedOutputFormats, isConversionSupported } from '../../src/services/fileService';
import type { MediaFile } from '../../src/types/media.types';
import { OUTPUT_FORMATS } from '../../src/constants/formats';

describe('File Service', () => {
	describe('validateFile', () => {
		function createMockFile(options: { name?: string; size?: number; type?: string } = {}): File {
			const { name = 'test.mp4', size = 1024, type = 'video/mp4' } = options;
			const file = new File([''], name, { type });
			Object.defineProperty(file, 'size', { value: size });
			return file;
		}

		it('should return valid for a normal video file', () => {
			const file = createMockFile({ size: 10 * 1024 * 1024, type: 'video/mp4' });
			const result = validateFile(file);
			expect(result.valid).toBe(true);
			expect(result.error).toBeUndefined();
		});

		it('should return invalid for empty file', () => {
			const file = createMockFile({ size: 0 });
			const result = validateFile(file);
			expect(result.valid).toBe(false);
			expect(result.error).toContain('empty');
		});

		it('should return warning for unsupported MIME type', () => {
			const file = createMockFile({ type: 'video/avi' });
			const result = validateFile(file);
			expect(result.valid).toBe(true);
			expect(result.warnings).toBeDefined();
			expect(result.warnings?.some(w => w.includes('may not be supported'))).toBe(true);
		});

		it('should accept common video MIME types', () => {
			const videoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'];
			for (const type of videoTypes) {
				const file = createMockFile({ type, size: 1024 });
				const result = validateFile(file);
				expect(result.valid).toBe(true);
				expect(result.warnings?.some(w => w.includes('may not be supported'))).toBeFalsy();
			}
		});

		it('should accept common audio MIME types', () => {
			const audioTypes = ['audio/wav', 'audio/mpeg', 'audio/ogg', 'audio/flac'];
			for (const type of audioTypes) {
				const file = createMockFile({ type, size: 1024 });
				const result = validateFile(file);
				expect(result.valid).toBe(true);
			}
		});

		it('should accept application/octet-stream', () => {
			const file = createMockFile({ type: 'application/octet-stream', size: 1024 });
			const result = validateFile(file);
			expect(result.valid).toBe(true);
		});

		it('should return invalid for files > 2GB', () => {
			const file = createMockFile({ size: 2.5 * 1024 * 1024 * 1024 });
			const result = validateFile(file);
			expect(result.valid).toBe(false);
			expect(result.error).toContain('2GB');
		});

		it('should return warning for large files', () => {
			const file = createMockFile({ size: 600 * 1024 * 1024 });
			const result = validateFile(file);
			expect(result.valid).toBe(true);
			expect(result.warnings).toBeDefined();
			expect(result.warnings?.some(w => w.includes('500MB'))).toBe(true);
		});
	});

	describe('getSupportedOutputFormats', () => {
		function createMockMediaFile(options: {
			hasVideo?: boolean;
			hasAudio?: boolean;
			hasMetadata?: boolean;
		} = {}): MediaFile {
			const { hasVideo = true, hasAudio = true, hasMetadata = true } = options;
			return {
				id: 'test-id',
				file: new File([''], 'test.mp4'),
				name: 'test.mp4',
				size: 1024,
				type: 'video/mp4',
				metadata: hasMetadata ? {
					format: 'mp4',
					duration: 10,
					hasVideo,
					hasAudio,
					width: hasVideo ? 1920 : undefined,
					height: hasVideo ? 1080 : undefined,
				} : undefined,
			};
		}

		it('should return all formats when no metadata', () => {
			const file = createMockMediaFile({ hasMetadata: false });
			const formats = getSupportedOutputFormats(file);
			expect(formats).toEqual(OUTPUT_FORMATS);
		});

		it('should return all formats for video+audio file', () => {
			const file = createMockMediaFile({ hasVideo: true, hasAudio: true });
			const formats = getSupportedOutputFormats(file);
			expect(formats).toEqual(OUTPUT_FORMATS);
		});

		it('should return all formats for video-only file', () => {
			const file = createMockMediaFile({ hasVideo: true, hasAudio: false });
			const formats = getSupportedOutputFormats(file);
			expect(formats).toEqual(OUTPUT_FORMATS);
		});

		it('should return audio-only formats for audio-only file', () => {
			const file = createMockMediaFile({ hasVideo: false, hasAudio: true });
			const formats = getSupportedOutputFormats(file);

			const formatTypes = formats.map(f => f.format);
			expect(formatTypes).not.toContain('same');
			expect(formatTypes).toContain('mp3');
			expect(formatTypes).toContain('wav');
			expect(formatTypes).toContain('ogg');
			expect(formatTypes).toContain('aac');
			expect(formatTypes).toContain('flac');

			for (const format of formats) {
				expect(format.supportsAudio).toBe(true);
			}
		});

		it('should return all formats when no tracks detected', () => {
			const file = createMockMediaFile({ hasVideo: false, hasAudio: false });
			const formats = getSupportedOutputFormats(file);
			expect(formats).toEqual(OUTPUT_FORMATS);
		});
	});

	describe('isConversionSupported', () => {
		it('should return true for empty source format', () => {
			expect(isConversionSupported('', 'mp4')).toBe(true);
		});

		it('should return true for video to video conversion', () => {
			expect(isConversionSupported('mp4', 'webm')).toBe(true);
			expect(isConversionSupported('webm', 'mp4')).toBe(true);
		});

		it('should return true for video to audio conversion', () => {
			expect(isConversionSupported('mp4', 'mp3')).toBe(true);
			expect(isConversionSupported('webm', 'wav')).toBe(true);
		});

		it('should return true for audio to audio conversion', () => {
			expect(isConversionSupported('mp3', 'wav')).toBe(true);
			expect(isConversionSupported('wav', 'ogg')).toBe(true);
		});

		it('should return false for unknown target format', () => {
			expect(isConversionSupported('mp4', 'invalid' as any)).toBe(false);
		});

		it('should return true for same format conversion', () => {
			expect(isConversionSupported('mp4', 'same')).toBe(true);
		});
	});
});
