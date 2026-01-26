import { describe, it, expect } from 'vitest';
import {
	RESOLUTION_PRESETS,
	DEFAULT_RESIZE_CONFIG,
	getPresetById,
	getDownscalePresets,
} from '../../src/constants/resolutionPresets';

describe('Resolution Presets', () => {
	describe('RESOLUTION_PRESETS', () => {
		it('should contain all expected presets', () => {
			const presetIds = RESOLUTION_PRESETS.map(p => p.id);
			expect(presetIds).toContain('original');
			expect(presetIds).toContain('4k');
			expect(presetIds).toContain('1440p');
			expect(presetIds).toContain('1080p');
			expect(presetIds).toContain('720p');
			expect(presetIds).toContain('480p');
			expect(presetIds).toContain('360p');
			expect(presetIds).toContain('custom');
		});

		it('should have valid structure for all presets', () => {
			for (const preset of RESOLUTION_PRESETS) {
				expect(preset.id).toBeDefined();
				expect(preset.label).toBeDefined();
				expect(preset.description).toBeDefined();
			}
		});

		it('should have correct dimensions for standard presets', () => {
			const p4k = RESOLUTION_PRESETS.find(p => p.id === '4k');
			expect(p4k?.width).toBe(3840);
			expect(p4k?.height).toBe(2160);
			expect(p4k?.referenceHeight).toBe(2160);

			const p1080 = RESOLUTION_PRESETS.find(p => p.id === '1080p');
			expect(p1080?.width).toBe(1920);
			expect(p1080?.height).toBe(1080);
			expect(p1080?.referenceHeight).toBe(1080);

			const p720 = RESOLUTION_PRESETS.find(p => p.id === '720p');
			expect(p720?.width).toBe(1280);
			expect(p720?.height).toBe(720);
			expect(p720?.referenceHeight).toBe(720);

			const p480 = RESOLUTION_PRESETS.find(p => p.id === '480p');
			expect(p480?.width).toBe(854);
			expect(p480?.height).toBe(480);
			expect(p480?.referenceHeight).toBe(480);

			const p360 = RESOLUTION_PRESETS.find(p => p.id === '360p');
			expect(p360?.width).toBe(640);
			expect(p360?.height).toBe(360);
			expect(p360?.referenceHeight).toBe(360);
		});

		it('should have null dimensions for original preset', () => {
			const original = RESOLUTION_PRESETS.find(p => p.id === 'original');
			expect(original?.width).toBeNull();
			expect(original?.height).toBeNull();
			expect(original?.referenceHeight).toBeNull();
		});

		it('should have null dimensions for custom preset', () => {
			const custom = RESOLUTION_PRESETS.find(p => p.id === 'custom');
			expect(custom?.width).toBeNull();
			expect(custom?.height).toBeNull();
			expect(custom?.referenceHeight).toBeNull();
		});
	});

	describe('DEFAULT_RESIZE_CONFIG', () => {
		it('should use original preset by default', () => {
			expect(DEFAULT_RESIZE_CONFIG.presetId).toBe('original');
		});

		it('should have null target dimensions', () => {
			expect(DEFAULT_RESIZE_CONFIG.targetWidth).toBeNull();
			expect(DEFAULT_RESIZE_CONFIG.targetHeight).toBeNull();
		});

		it('should maintain aspect ratio by default', () => {
			expect(DEFAULT_RESIZE_CONFIG.maintainAspectRatio).toBe(true);
		});

		it('should have null custom dimensions', () => {
			expect(DEFAULT_RESIZE_CONFIG.customWidth).toBeNull();
			expect(DEFAULT_RESIZE_CONFIG.customHeight).toBeNull();
		});
	});

	describe('getPresetById', () => {
		it('should return correct preset for valid ID', () => {
			const preset = getPresetById('1080p');
			expect(preset).toBeDefined();
			expect(preset?.id).toBe('1080p');
			expect(preset?.width).toBe(1920);
			expect(preset?.height).toBe(1080);
		});

		it('should return original preset', () => {
			const preset = getPresetById('original');
			expect(preset).toBeDefined();
			expect(preset?.id).toBe('original');
		});

		it('should return custom preset', () => {
			const preset = getPresetById('custom');
			expect(preset).toBeDefined();
			expect(preset?.id).toBe('custom');
		});

		it('should return undefined for invalid ID', () => {
			const preset = getPresetById('invalid');
			expect(preset).toBeUndefined();
		});

		it('should return undefined for empty string', () => {
			const preset = getPresetById('');
			expect(preset).toBeUndefined();
		});
	});

	describe('getDownscalePresets', () => {
		it('should always include original and custom presets', () => {
			const presets = getDownscalePresets(720);
			const presetIds = presets.map(p => p.id);
			expect(presetIds).toContain('original');
			expect(presetIds).toContain('custom');
		});

		it('should exclude presets larger than source height', () => {
			const presets = getDownscalePresets(720);
			const presetIds = presets.map(p => p.id);
			expect(presetIds).not.toContain('4k');
			expect(presetIds).not.toContain('1440p');
			expect(presetIds).not.toContain('1080p');
		});

		it('should include presets equal to or smaller than source height', () => {
			const presets = getDownscalePresets(720);
			const presetIds = presets.map(p => p.id);
			expect(presetIds).toContain('720p');
			expect(presetIds).toContain('480p');
			expect(presetIds).toContain('360p');
		});

		it('should include all presets for 4K source', () => {
			const presets = getDownscalePresets(2160);
			const presetIds = presets.map(p => p.id);
			expect(presetIds).toContain('4k');
			expect(presetIds).toContain('1440p');
			expect(presetIds).toContain('1080p');
			expect(presetIds).toContain('720p');
			expect(presetIds).toContain('480p');
			expect(presetIds).toContain('360p');
		});

		it('should only include small presets for 480p source', () => {
			const presets = getDownscalePresets(480);
			const presetIds = presets.map(p => p.id);
			expect(presetIds).toContain('480p');
			expect(presetIds).toContain('360p');
			expect(presetIds).not.toContain('720p');
			expect(presetIds).not.toContain('1080p');
		});

		it('should only include original and custom for very small source', () => {
			const presets = getDownscalePresets(200);
			const presetIds = presets.map(p => p.id);
			expect(presetIds).toEqual(['original', 'custom']);
		});
	});
});
