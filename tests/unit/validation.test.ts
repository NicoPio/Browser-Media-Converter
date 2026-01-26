import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isWebCodecsSupported, validateFileSize } from '../../src/utils/validation';

describe('Validation Utilities', () => {
	describe('validateFileSize', () => {
		const MB = 1024 * 1024;
		const GB = 1024 * 1024 * 1024;

		it('should return valid for small files', () => {
			const result = validateFileSize(10 * MB);
			expect(result.valid).toBe(true);
			expect(result.warning).toBeUndefined();
		});

		it('should return valid with warning for files > 100MB', () => {
			const result = validateFileSize(150 * MB);
			expect(result.valid).toBe(true);
			expect(result.warning).toContain('100MB');
		});

		it('should return valid with warning for files > 500MB', () => {
			const result = validateFileSize(600 * MB);
			expect(result.valid).toBe(true);
			expect(result.warning).toContain('500MB');
		});

		it('should return valid with warning for files > 1GB', () => {
			const result = validateFileSize(1.5 * GB);
			expect(result.valid).toBe(true);
			expect(result.warning).toContain('1GB');
		});

		it('should return invalid for files > 2GB', () => {
			const result = validateFileSize(2.5 * GB);
			expect(result.valid).toBe(false);
			expect(result.warning).toContain('2GB');
		});

		it('should return valid for exactly 100MB', () => {
			const result = validateFileSize(100 * MB);
			expect(result.valid).toBe(true);
			expect(result.warning).toBeUndefined();
		});

		it('should return valid for exactly 2GB', () => {
			const result = validateFileSize(2 * GB);
			expect(result.valid).toBe(true);
			expect(result.warning).toContain('1GB');
		});

		it('should return valid for 0 bytes', () => {
			const result = validateFileSize(0);
			expect(result.valid).toBe(true);
			expect(result.warning).toBeUndefined();
		});
	});

	describe('isWebCodecsSupported', () => {
		const originalWindow = global.window;
		const originalSelf = global.self;

		beforeEach(() => {
			vi.stubGlobal('window', {
				VideoEncoder: class {},
				VideoDecoder: class {},
				AudioEncoder: class {},
				AudioDecoder: class {},
			});
			vi.stubGlobal('self', {
				isSecureContext: true,
			});
		});

		afterEach(() => {
			vi.unstubAllGlobals();
			if (originalWindow) {
				global.window = originalWindow;
			}
			if (originalSelf) {
				global.self = originalSelf;
			}
		});

		it('should return true when all APIs are available and context is secure', () => {
			expect(isWebCodecsSupported()).toBe(true);
		});

		it('should return false when VideoEncoder is missing', () => {
			vi.stubGlobal('window', {
				VideoDecoder: class {},
				AudioEncoder: class {},
				AudioDecoder: class {},
			});
			expect(isWebCodecsSupported()).toBe(false);
		});

		it('should return false when VideoDecoder is missing', () => {
			vi.stubGlobal('window', {
				VideoEncoder: class {},
				AudioEncoder: class {},
				AudioDecoder: class {},
			});
			expect(isWebCodecsSupported()).toBe(false);
		});

		it('should return false when AudioEncoder is missing', () => {
			vi.stubGlobal('window', {
				VideoEncoder: class {},
				VideoDecoder: class {},
				AudioDecoder: class {},
			});
			expect(isWebCodecsSupported()).toBe(false);
		});

		it('should return false when AudioDecoder is missing', () => {
			vi.stubGlobal('window', {
				VideoEncoder: class {},
				VideoDecoder: class {},
				AudioEncoder: class {},
			});
			expect(isWebCodecsSupported()).toBe(false);
		});

		it('should return false when not in secure context', () => {
			vi.stubGlobal('self', {
				isSecureContext: false,
			});
			expect(isWebCodecsSupported()).toBe(false);
		});

		it('should return false when window is undefined', () => {
			vi.stubGlobal('window', undefined);
			expect(isWebCodecsSupported()).toBe(false);
		});
	});
});
