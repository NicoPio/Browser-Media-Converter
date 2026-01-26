import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateFilename, createBlobUrl, revokeBlobUrl } from '../../src/services/downloadService';
import type { ConversionResult } from '../../src/types/conversion.types';

describe('Download Service', () => {
	describe('generateFilename', () => {
		it('should replace extension with target extension', () => {
			expect(generateFilename('video.mp4', '.webm')).toBe('video.webm');
			expect(generateFilename('audio.wav', '.mp3')).toBe('audio.mp3');
		});

		it('should handle extension without leading dot', () => {
			expect(generateFilename('video.mp4', 'webm')).toBe('video.webm');
			expect(generateFilename('audio.wav', 'mp3')).toBe('audio.mp3');
		});

		it('should handle filenames with multiple dots', () => {
			expect(generateFilename('my.video.file.mp4', '.webm')).toBe('my.video.file.webm');
			expect(generateFilename('version.1.0.mp4', '.mkv')).toBe('version.1.0.mkv');
		});

		it('should handle filenames without extension', () => {
			expect(generateFilename('noextension', '.mp4')).toBe('noextension.mp4');
		});

		it('should handle hidden files (starting with dot)', () => {
			expect(generateFilename('.hidden.mp4', '.webm')).toBe('.hidden.webm');
		});

		it('should handle empty extension', () => {
			expect(generateFilename('video.mp4', '')).toBe('video.');
		});

		it('should handle various format extensions', () => {
			expect(generateFilename('test.avi', '.mp4')).toBe('test.mp4');
			expect(generateFilename('test.mkv', '.mov')).toBe('test.mov');
			expect(generateFilename('test.flac', '.ogg')).toBe('test.ogg');
		});
	});

	describe('createBlobUrl', () => {
		let mockCreateObjectURL: ReturnType<typeof vi.fn>;

		beforeEach(() => {
			mockCreateObjectURL = vi.fn(() => 'blob:http://localhost/test-blob');
			vi.stubGlobal('URL', {
				createObjectURL: mockCreateObjectURL,
				revokeObjectURL: vi.fn(),
			});
		});

		afterEach(() => {
			vi.unstubAllGlobals();
		});

		it('should create a blob URL from conversion result', () => {
			const result: ConversionResult = {
				blob: new Blob(['test'], { type: 'video/mp4' }),
				filename: 'test.mp4',
				size: 4,
				url: null,
			};

			const url = createBlobUrl(result);
			expect(url).toBe('blob:http://localhost/test-blob');
			expect(mockCreateObjectURL).toHaveBeenCalledWith(result.blob);
		});
	});

	describe('revokeBlobUrl', () => {
		let mockRevokeObjectURL: ReturnType<typeof vi.fn>;

		beforeEach(() => {
			mockRevokeObjectURL = vi.fn();
			vi.stubGlobal('URL', {
				createObjectURL: vi.fn(),
				revokeObjectURL: mockRevokeObjectURL,
			});
		});

		afterEach(() => {
			vi.unstubAllGlobals();
		});

		it('should revoke a blob URL', () => {
			const url = 'blob:http://localhost/test-blob';
			revokeBlobUrl(url);
			expect(mockRevokeObjectURL).toHaveBeenCalledWith(url);
		});

		it('should handle errors gracefully', () => {
			mockRevokeObjectURL.mockImplementation(() => {
				throw new Error('Invalid URL');
			});

			const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

			expect(() => revokeBlobUrl('invalid-url')).not.toThrow();
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});
	});
});
