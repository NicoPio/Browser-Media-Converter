import { describe, it, expect } from 'vitest';
import {
	HIGH_QUALITY,
	BALANCED_QUALITY,
	SMALL_SIZE,
	DEFAULT_QUALITY,
	getQualityPreset,
} from '../../src/constants/qualityPresets';

describe('Quality Presets', () => {
	describe('HIGH_QUALITY', () => {
		it('should have correct preset name', () => {
			expect(HIGH_QUALITY.preset).toBe('high');
		});

		it('should have high video bitrate (8 Mbps)', () => {
			expect(HIGH_QUALITY.video?.bitrate).toBe(8_000_000);
		});

		it('should have high audio bitrate (256 kbps)', () => {
			expect(HIGH_QUALITY.audio?.bitrate).toBe(256_000);
		});

		it('should preserve original dimensions', () => {
			expect(HIGH_QUALITY.video?.width).toBeNull();
			expect(HIGH_QUALITY.video?.height).toBeNull();
		});

		it('should preserve original frame rate', () => {
			expect(HIGH_QUALITY.video?.frameRate).toBeNull();
		});

		it('should auto-detect codecs', () => {
			expect(HIGH_QUALITY.video?.codec).toBeNull();
			expect(HIGH_QUALITY.audio?.codec).toBeNull();
		});
	});

	describe('BALANCED_QUALITY', () => {
		it('should have correct preset name', () => {
			expect(BALANCED_QUALITY.preset).toBe('balanced');
		});

		it('should have moderate video bitrate (2.5 Mbps)', () => {
			expect(BALANCED_QUALITY.video?.bitrate).toBe(2_500_000);
		});

		it('should have moderate audio bitrate (128 kbps)', () => {
			expect(BALANCED_QUALITY.audio?.bitrate).toBe(128_000);
		});

		it('should preserve original dimensions', () => {
			expect(BALANCED_QUALITY.video?.width).toBeNull();
			expect(BALANCED_QUALITY.video?.height).toBeNull();
		});
	});

	describe('SMALL_SIZE', () => {
		it('should have correct preset name', () => {
			expect(SMALL_SIZE.preset).toBe('small');
		});

		it('should have low video bitrate (1 Mbps)', () => {
			expect(SMALL_SIZE.video?.bitrate).toBe(1_000_000);
		});

		it('should have low audio bitrate (96 kbps)', () => {
			expect(SMALL_SIZE.audio?.bitrate).toBe(96_000);
		});

		it('should preserve original dimensions', () => {
			expect(SMALL_SIZE.video?.width).toBeNull();
			expect(SMALL_SIZE.video?.height).toBeNull();
		});
	});

	describe('DEFAULT_QUALITY', () => {
		it('should be balanced preset', () => {
			expect(DEFAULT_QUALITY).toEqual(BALANCED_QUALITY);
		});
	});

	describe('getQualityPreset', () => {
		it('should return HIGH_QUALITY for "high"', () => {
			const preset = getQualityPreset('high');
			expect(preset).toEqual(HIGH_QUALITY);
			expect(preset.preset).toBe('high');
		});

		it('should return BALANCED_QUALITY for "balanced"', () => {
			const preset = getQualityPreset('balanced');
			expect(preset).toEqual(BALANCED_QUALITY);
			expect(preset.preset).toBe('balanced');
		});

		it('should return SMALL_SIZE for "small"', () => {
			const preset = getQualityPreset('small');
			expect(preset).toEqual(SMALL_SIZE);
			expect(preset.preset).toBe('small');
		});
	});

	describe('Preset Bitrate Hierarchy', () => {
		it('should have decreasing video bitrates from high to small', () => {
			const highBitrate = HIGH_QUALITY.video?.bitrate ?? 0;
			const balancedBitrate = BALANCED_QUALITY.video?.bitrate ?? 0;
			const smallBitrate = SMALL_SIZE.video?.bitrate ?? 0;

			expect(highBitrate).toBeGreaterThan(balancedBitrate);
			expect(balancedBitrate).toBeGreaterThan(smallBitrate);
		});

		it('should have decreasing audio bitrates from high to small', () => {
			const highBitrate = HIGH_QUALITY.audio?.bitrate ?? 0;
			const balancedBitrate = BALANCED_QUALITY.audio?.bitrate ?? 0;
			const smallBitrate = SMALL_SIZE.audio?.bitrate ?? 0;

			expect(highBitrate).toBeGreaterThan(balancedBitrate);
			expect(balancedBitrate).toBeGreaterThan(smallBitrate);
		});
	});
});
