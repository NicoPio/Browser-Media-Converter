/**
 * Unit tests for dimension calculation utilities
 */

import { describe, it, expect } from 'vitest';
import {
	toEvenNumber,
	calculateAspectRatio,
	calculateTargetDimensions,
	calculatePresetDimensions,
	isUpscaling,
	validateDimensions,
	formatDimensions,
	calculateSizeChangePercent,
} from '../../src/utils/dimensions';
import { RESOLUTION_PRESETS } from '../../src/constants/resolutionPresets';

describe('toEvenNumber', () => {
	it('returns same number if already even', () => {
		expect(toEvenNumber(1920)).toBe(1920);
		expect(toEvenNumber(1080)).toBe(1080);
		expect(toEvenNumber(0)).toBe(0);
	});

	it('rounds down odd numbers to even', () => {
		expect(toEvenNumber(1921)).toBe(1920);
		expect(toEvenNumber(1081)).toBe(1080);
		expect(toEvenNumber(1)).toBe(0);
		expect(toEvenNumber(3)).toBe(2);
	});

	it('handles negative numbers', () => {
		expect(toEvenNumber(-1)).toBe(-2);
		expect(toEvenNumber(-2)).toBe(-2);
	});
});

describe('calculateAspectRatio', () => {
	it('calculates 16:9 ratio correctly', () => {
		expect(calculateAspectRatio(1920, 1080)).toBeCloseTo(16 / 9, 5);
		expect(calculateAspectRatio(1280, 720)).toBeCloseTo(16 / 9, 5);
	});

	it('calculates 4:3 ratio correctly', () => {
		expect(calculateAspectRatio(1440, 1080)).toBeCloseTo(4 / 3, 5);
		expect(calculateAspectRatio(640, 480)).toBeCloseTo(4 / 3, 5);
	});

	it('calculates 9:16 (vertical) ratio correctly', () => {
		expect(calculateAspectRatio(1080, 1920)).toBeCloseTo(9 / 16, 5);
	});

	it('handles zero height', () => {
		expect(calculateAspectRatio(1920, 0)).toBe(0);
	});
});

describe('calculateTargetDimensions', () => {
	it('returns source dimensions when no target specified', () => {
		const result = calculateTargetDimensions(1920, 1080, null, null, true);
		expect(result).toEqual({ width: 1920, height: 1080 });
	});

	it('preserves aspect ratio when targeting height only', () => {
		const result = calculateTargetDimensions(1920, 1080, null, 720, true);
		expect(result).toEqual({ width: 1280, height: 720 });
	});

	it('preserves aspect ratio when targeting width only', () => {
		const result = calculateTargetDimensions(1920, 1080, 1280, null, true);
		expect(result).toEqual({ width: 1280, height: 720 });
	});

	it('handles vertical videos (9:16) correctly', () => {
		const result = calculateTargetDimensions(1080, 1920, null, 1280, true);
		expect(result.height).toBe(1280);
		expect(result.width).toBe(720);
	});

	it('allows non-ratio-preserving resize', () => {
		const result = calculateTargetDimensions(1920, 1080, 640, 480, false);
		expect(result).toEqual({ width: 640, height: 480 });
	});

	it('ensures even numbers in output', () => {
		const result = calculateTargetDimensions(1921, 1081, null, 721, true);
		expect(result.width % 2).toBe(0);
		expect(result.height % 2).toBe(0);
	});
});

describe('calculatePresetDimensions', () => {
	it('returns source for original preset', () => {
		const preset = RESOLUTION_PRESETS.find(p => p.id === 'original')!;
		const result = calculatePresetDimensions(1920, 1080, preset);
		expect(result).toEqual({ width: 1920, height: 1080 });
	});

	it('calculates 720p correctly for 16:9 source', () => {
		const preset = RESOLUTION_PRESETS.find(p => p.id === '720p')!;
		const result = calculatePresetDimensions(1920, 1080, preset);
		expect(result).toEqual({ width: 1280, height: 720 });
	});

	it('calculates 720p correctly for 4:3 source', () => {
		const preset = RESOLUTION_PRESETS.find(p => p.id === '720p')!;
		const result = calculatePresetDimensions(1440, 1080, preset);
		expect(result.height).toBe(720);
		// Width should be 960 for 4:3 ratio at 720p height
		expect(result.width).toBe(960);
	});

	it('handles vertical video presets', () => {
		const preset = RESOLUTION_PRESETS.find(p => p.id === '720p')!;
		const result = calculatePresetDimensions(1080, 1920, preset);
		expect(result.height).toBe(720);
		// Width should be 404 (9:16 ratio at 720 height, rounded to even)
		expect(result.width).toBe(404);
	});
});

describe('isUpscaling', () => {
	it('returns true when target is larger', () => {
		expect(isUpscaling(1280, 720, 1920, 1080)).toBe(true);
	});

	it('returns true when only width is larger', () => {
		expect(isUpscaling(1280, 720, 1920, 720)).toBe(true);
	});

	it('returns true when only height is larger', () => {
		expect(isUpscaling(1280, 720, 1280, 1080)).toBe(true);
	});

	it('returns false when target is smaller', () => {
		expect(isUpscaling(1920, 1080, 1280, 720)).toBe(false);
	});

	it('returns false when target is same size', () => {
		expect(isUpscaling(1920, 1080, 1920, 1080)).toBe(false);
	});
});

describe('validateDimensions', () => {
	it('returns valid for null dimensions', () => {
		const result = validateDimensions(null, null);
		expect(result.isValid).toBe(true);
		expect(result.messages).toHaveLength(0);
	});

	it('returns error for zero width', () => {
		const result = validateDimensions(0, 720);
		expect(result.isValid).toBe(false);
		expect(result.messages.some(m => m.code === 'INVALID_WIDTH')).toBe(true);
	});

	it('returns error for negative dimensions', () => {
		const result = validateDimensions(-100, 720);
		expect(result.isValid).toBe(false);
		expect(result.messages.some(m => m.code === 'INVALID_WIDTH')).toBe(true);
	});

	it('returns error for dimensions below minimum', () => {
		const result = validateDimensions(10, 720);
		expect(result.isValid).toBe(false);
		expect(result.messages.some(m => m.code === 'WIDTH_TOO_SMALL')).toBe(true);
	});

	it('returns error for dimensions above maximum', () => {
		const result = validateDimensions(8000, 5000);
		expect(result.isValid).toBe(false);
		expect(result.messages.some(m => m.code === 'WIDTH_TOO_LARGE')).toBe(true);
		expect(result.messages.some(m => m.code === 'HEIGHT_TOO_LARGE')).toBe(true);
	});

	it('adjusts odd dimensions to even', () => {
		const result = validateDimensions(1921, 1081);
		expect(result.adjustedWidth).toBe(1920);
		expect(result.adjustedHeight).toBe(1080);
		expect(result.messages.some(m => m.code === 'WIDTH_ADJUSTED')).toBe(true);
	});

	it('warns about upscaling', () => {
		const result = validateDimensions(1920, 1080, 1280, 720);
		expect(result.isValid).toBe(true);
		expect(result.messages.some(m => m.code === 'UPSCALING')).toBe(true);
	});

	it('warns about low resolution', () => {
		const result = validateDimensions(200, 150);
		expect(result.isValid).toBe(true);
		expect(result.messages.some(m => m.code === 'LOW_RESOLUTION')).toBe(true);
	});

	it('warns about very high resolution', () => {
		const result = validateDimensions(5000, 3000);
		expect(result.isValid).toBe(true);
		expect(result.messages.some(m => m.code === 'HIGH_RESOLUTION')).toBe(true);
	});
});

describe('formatDimensions', () => {
	it('formats dimensions correctly', () => {
		expect(formatDimensions(1920, 1080)).toBe('1920×1080');
		expect(formatDimensions(1280, 720)).toBe('1280×720');
	});

	it('returns Original for null dimensions', () => {
		expect(formatDimensions(null, null)).toBe('Original');
		expect(formatDimensions(null, 720)).toBe('Original');
		expect(formatDimensions(1280, null)).toBe('Original');
	});
});

describe('calculateSizeChangePercent', () => {
	it('calculates reduction percentage', () => {
		// 1920x1080 = 2,073,600 pixels
		// 1280x720 = 921,600 pixels
		// Change: -55.56%
		const result = calculateSizeChangePercent(1920, 1080, 1280, 720);
		expect(result).toBe(-56);
	});

	it('calculates increase percentage', () => {
		const result = calculateSizeChangePercent(1280, 720, 1920, 1080);
		expect(result).toBe(125);
	});

	it('returns 0 for same dimensions', () => {
		const result = calculateSizeChangePercent(1920, 1080, 1920, 1080);
		expect(result).toBe(0);
	});
});
