import { describe, it, expect } from 'vitest';
import { estimateOutputSize } from '../../src/services/conversionService';
import type { MediaFile } from '../../src/types/media.types';
import type { QualityProfile } from '../../src/types/quality.types';

describe('Conversion Service', () => {
	describe('estimateOutputSize', () => {
		function createMockMediaFile(options: {
			size?: number;
			duration?: number;
			hasVideo?: boolean;
			hasAudio?: boolean;
			hasMetadata?: boolean;
		} = {}): MediaFile {
			const {
				size = 10_000_000,
				duration = 60,
				hasVideo = true,
				hasAudio = true,
				hasMetadata = true,
			} = options;

			return {
				id: 'test-id',
				file: new File([''], 'test.mp4'),
				name: 'test.mp4',
				size,
				type: 'video/mp4',
				metadata: hasMetadata ? {
					format: 'mp4',
					duration,
					hasVideo,
					hasAudio,
					width: hasVideo ? 1920 : undefined,
					height: hasVideo ? 1080 : undefined,
				} : undefined,
			};
		}

		function createQualityProfile(options: {
			videoBitrate?: number | null;
			audioBitrate?: number | null;
		} = {}): QualityProfile {
			const { videoBitrate = 2_500_000, audioBitrate = 128_000 } = options;
			return {
				preset: 'balanced',
				video: videoBitrate !== null ? {
					width: null,
					height: null,
					bitrate: videoBitrate,
					frameRate: null,
					codec: null,
				} : undefined,
				audio: audioBitrate !== null ? {
					sampleRate: null,
					bitrate: audioBitrate,
					channels: null,
					codec: null,
				} : undefined,
			};
		}

		it('should return source size when no metadata', () => {
			const file = createMockMediaFile({ size: 5_000_000, hasMetadata: false });
			const quality = createQualityProfile();
			const estimate = estimateOutputSize(file, quality);
			expect(estimate).toBe(5_000_000);
		});

		it('should calculate size based on video and audio bitrate', () => {
			const file = createMockMediaFile({ duration: 60, hasVideo: true, hasAudio: true });
			const quality = createQualityProfile({ videoBitrate: 2_000_000, audioBitrate: 128_000 });

			const estimate = estimateOutputSize(file, quality);

			// Expected: (2_000_000 + 128_000) * 60 / 8 * 1.1 = 17,556,000
			const expected = ((2_000_000 + 128_000) * 60 / 8) * 1.1;
			expect(estimate).toBe(Math.ceil(expected));
		});

		it('should use default video bitrate when not specified', () => {
			const file = createMockMediaFile({ duration: 60, hasVideo: true, hasAudio: false });
			const quality = createQualityProfile({ videoBitrate: null, audioBitrate: null });

			const estimate = estimateOutputSize(file, quality);

			// Default video bitrate: 2.5 Mbps
			// Expected: 2_500_000 * 60 / 8 * 1.1 = 20,625,000
			const expected = (2_500_000 * 60 / 8) * 1.1;
			expect(estimate).toBe(Math.ceil(expected));
		});

		it('should use default audio bitrate when not specified', () => {
			const file = createMockMediaFile({ duration: 60, hasVideo: false, hasAudio: true });
			const quality = createQualityProfile({ videoBitrate: null, audioBitrate: null });

			const estimate = estimateOutputSize(file, quality);

			// Default audio bitrate: 128 kbps
			// Expected: 128_000 * 60 / 8 * 1.1 = 1,056,000
			const expected = (128_000 * 60 / 8) * 1.1;
			expect(estimate).toBe(Math.ceil(expected));
		});

		it('should handle video-only file', () => {
			const file = createMockMediaFile({ duration: 120, hasVideo: true, hasAudio: false });
			const quality = createQualityProfile({ videoBitrate: 8_000_000, audioBitrate: null });

			const estimate = estimateOutputSize(file, quality);

			// Expected: 8_000_000 * 120 / 8 * 1.1 = 132,000,000
			const expected = (8_000_000 * 120 / 8) * 1.1;
			expect(estimate).toBe(Math.ceil(expected));
		});

		it('should handle audio-only file', () => {
			const file = createMockMediaFile({ duration: 180, hasVideo: false, hasAudio: true });
			const quality = createQualityProfile({ videoBitrate: null, audioBitrate: 256_000 });

			const estimate = estimateOutputSize(file, quality);

			// Expected: 256_000 * 180 / 8 * 1.1 = 6,336,000
			const expected = (256_000 * 180 / 8) * 1.1;
			expect(estimate).toBe(Math.ceil(expected));
		});

		it('should handle short duration', () => {
			const file = createMockMediaFile({ duration: 5, hasVideo: true, hasAudio: true });
			const quality = createQualityProfile({ videoBitrate: 2_000_000, audioBitrate: 128_000 });

			const estimate = estimateOutputSize(file, quality);

			// Expected: (2_000_000 + 128_000) * 5 / 8 * 1.1 = 1,463,000
			const expected = ((2_000_000 + 128_000) * 5 / 8) * 1.1;
			expect(estimate).toBe(Math.ceil(expected));
		});

		it('should handle long duration', () => {
			const file = createMockMediaFile({ duration: 3600, hasVideo: true, hasAudio: true });
			const quality = createQualityProfile({ videoBitrate: 1_000_000, audioBitrate: 96_000 });

			const estimate = estimateOutputSize(file, quality);

			// Expected: (1_000_000 + 96_000) * 3600 / 8 * 1.1 = 542,520,000
			const expected = ((1_000_000 + 96_000) * 3600 / 8) * 1.1;
			expect(estimate).toBe(Math.ceil(expected));
		});

		it('should include 10% overhead for container format', () => {
			const file = createMockMediaFile({ duration: 100, hasVideo: true, hasAudio: false });
			const quality = createQualityProfile({ videoBitrate: 1_000_000, audioBitrate: null });

			const estimate = estimateOutputSize(file, quality);

			// Base: 1_000_000 * 100 / 8 = 12_500_000
			// With overhead: 12_500_000 * 1.1 = 13_750_000
			const base = (1_000_000 * 100) / 8;
			const withOverhead = base * 1.1;
			expect(estimate).toBe(Math.ceil(withOverhead));
		});
	});
});
