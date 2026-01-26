import { describe, it, expect } from 'vitest';
import {
	OUTPUT_FORMATS,
	SAME_AS_INPUT_FORMAT,
	getFormatByType,
	getVideoFormats,
	getAudioFormats,
	mapSourceFormatToFormatType,
	resolveOutputFormat,
} from '../../src/constants/formats';
import type { FormatType } from '../../src/constants/formats';

describe('Format Constants', () => {
	describe('OUTPUT_FORMATS', () => {
		it('should contain all expected formats', () => {
			const formatTypes = OUTPUT_FORMATS.map(f => f.format);
			expect(formatTypes).toContain('same');
			expect(formatTypes).toContain('mp4');
			expect(formatTypes).toContain('mov');
			expect(formatTypes).toContain('webm');
			expect(formatTypes).toContain('mkv');
			expect(formatTypes).toContain('wav');
			expect(formatTypes).toContain('mp3');
			expect(formatTypes).toContain('ogg');
			expect(formatTypes).toContain('aac');
			expect(formatTypes).toContain('flac');
		});

		it('should have valid structure for all formats', () => {
			for (const format of OUTPUT_FORMATS) {
				expect(format.format).toBeDefined();
				expect(format.displayName).toBeDefined();
				expect(format.description).toBeDefined();
				expect(typeof format.supportsVideo).toBe('boolean');
				expect(typeof format.supportsAudio).toBe('boolean');
				expect(format.recommendedCodecs).toBeDefined();
				expect(Array.isArray(format.recommendedCodecs.video)).toBe(true);
				expect(Array.isArray(format.recommendedCodecs.audio)).toBe(true);
			}
		});

		it('should have correct video/audio support flags', () => {
			const mp4 = OUTPUT_FORMATS.find(f => f.format === 'mp4');
			expect(mp4?.supportsVideo).toBe(true);
			expect(mp4?.supportsAudio).toBe(true);

			const mp3 = OUTPUT_FORMATS.find(f => f.format === 'mp3');
			expect(mp3?.supportsVideo).toBe(false);
			expect(mp3?.supportsAudio).toBe(true);

			const wav = OUTPUT_FORMATS.find(f => f.format === 'wav');
			expect(wav?.supportsVideo).toBe(false);
			expect(wav?.supportsAudio).toBe(true);
		});
	});

	describe('SAME_AS_INPUT_FORMAT', () => {
		it('should have correct properties', () => {
			expect(SAME_AS_INPUT_FORMAT.format).toBe('same');
			expect(SAME_AS_INPUT_FORMAT.extension).toBe('');
			expect(SAME_AS_INPUT_FORMAT.mimeType).toBe('');
			expect(SAME_AS_INPUT_FORMAT.supportsVideo).toBe(true);
			expect(SAME_AS_INPUT_FORMAT.supportsAudio).toBe(true);
		});

		it('should have empty recommended codecs', () => {
			expect(SAME_AS_INPUT_FORMAT.recommendedCodecs.video).toEqual([]);
			expect(SAME_AS_INPUT_FORMAT.recommendedCodecs.audio).toEqual([]);
		});
	});
});

describe('getFormatByType', () => {
	it('should return correct format for valid type', () => {
		const mp4 = getFormatByType('mp4');
		expect(mp4).toBeDefined();
		expect(mp4?.format).toBe('mp4');
		expect(mp4?.extension).toBe('.mp4');
		expect(mp4?.mimeType).toBe('video/mp4');
	});

	it('should return same format', () => {
		const same = getFormatByType('same');
		expect(same).toBeDefined();
		expect(same?.format).toBe('same');
	});

	it('should return audio formats', () => {
		const mp3 = getFormatByType('mp3');
		expect(mp3).toBeDefined();
		expect(mp3?.format).toBe('mp3');
		expect(mp3?.supportsVideo).toBe(false);

		const flac = getFormatByType('flac');
		expect(flac).toBeDefined();
		expect(flac?.format).toBe('flac');
	});

	it('should return undefined for invalid type', () => {
		const invalid = getFormatByType('invalid' as FormatType);
		expect(invalid).toBeUndefined();
	});
});

describe('getVideoFormats', () => {
	it('should return only formats that support video', () => {
		const videoFormats = getVideoFormats();
		expect(videoFormats.length).toBeGreaterThan(0);
		for (const format of videoFormats) {
			expect(format.supportsVideo).toBe(true);
		}
	});

	it('should include common video formats', () => {
		const videoFormats = getVideoFormats();
		const formatTypes = videoFormats.map(f => f.format);
		expect(formatTypes).toContain('mp4');
		expect(formatTypes).toContain('webm');
		expect(formatTypes).toContain('mkv');
		expect(formatTypes).toContain('mov');
	});

	it('should not include audio-only formats', () => {
		const videoFormats = getVideoFormats();
		const formatTypes = videoFormats.map(f => f.format);
		expect(formatTypes).not.toContain('mp3');
		expect(formatTypes).not.toContain('wav');
		expect(formatTypes).not.toContain('flac');
	});
});

describe('getAudioFormats', () => {
	it('should return only formats that support audio', () => {
		const audioFormats = getAudioFormats();
		expect(audioFormats.length).toBeGreaterThan(0);
		for (const format of audioFormats) {
			expect(format.supportsAudio).toBe(true);
		}
	});

	it('should include audio-only formats', () => {
		const audioFormats = getAudioFormats();
		const formatTypes = audioFormats.map(f => f.format);
		expect(formatTypes).toContain('mp3');
		expect(formatTypes).toContain('wav');
		expect(formatTypes).toContain('ogg');
		expect(formatTypes).toContain('aac');
		expect(formatTypes).toContain('flac');
	});

	it('should also include video formats (they support audio)', () => {
		const audioFormats = getAudioFormats();
		const formatTypes = audioFormats.map(f => f.format);
		expect(formatTypes).toContain('mp4');
		expect(formatTypes).toContain('webm');
	});
});

describe('mapSourceFormatToFormatType', () => {
	it('should map common format names', () => {
		expect(mapSourceFormatToFormatType('mp4')).toBe('mp4');
		expect(mapSourceFormatToFormatType('mov')).toBe('mov');
		expect(mapSourceFormatToFormatType('webm')).toBe('webm');
		expect(mapSourceFormatToFormatType('mkv')).toBe('mkv');
		expect(mapSourceFormatToFormatType('wav')).toBe('wav');
		expect(mapSourceFormatToFormatType('mp3')).toBe('mp3');
		expect(mapSourceFormatToFormatType('ogg')).toBe('ogg');
		expect(mapSourceFormatToFormatType('aac')).toBe('aac');
		expect(mapSourceFormatToFormatType('flac')).toBe('flac');
	});

	it('should map mediabunny format names', () => {
		expect(mapSourceFormatToFormatType('isobmff')).toBe('mp4');
		expect(mapSourceFormatToFormatType('quicktime')).toBe('mov');
		expect(mapSourceFormatToFormatType('matroska')).toBe('mkv');
		expect(mapSourceFormatToFormatType('wave')).toBe('wav');
		expect(mapSourceFormatToFormatType('adts')).toBe('aac');
	});

	it('should be case-insensitive', () => {
		expect(mapSourceFormatToFormatType('MP4')).toBe('mp4');
		expect(mapSourceFormatToFormatType('WebM')).toBe('webm');
		expect(mapSourceFormatToFormatType('FLAC')).toBe('flac');
	});

	it('should return null for unknown formats', () => {
		expect(mapSourceFormatToFormatType('unknown')).toBeNull();
		expect(mapSourceFormatToFormatType('')).toBeNull();
		expect(mapSourceFormatToFormatType('avi')).toBeNull();
	});
});

describe('resolveOutputFormat', () => {
	it('should return target format when not same', () => {
		const mp4Format = getFormatByType('mp4')!;
		const result = resolveOutputFormat(mp4Format, 'webm');
		expect(result.format).toBe('mp4');
	});

	it('should resolve same format to source format', () => {
		const result = resolveOutputFormat(SAME_AS_INPUT_FORMAT, 'mp4');
		expect(result.format).toBe('mp4');
	});

	it('should resolve same format for mediabunny format names', () => {
		const result = resolveOutputFormat(SAME_AS_INPUT_FORMAT, 'isobmff');
		expect(result.format).toBe('mp4');

		const result2 = resolveOutputFormat(SAME_AS_INPUT_FORMAT, 'matroska');
		expect(result2.format).toBe('mkv');
	});

	it('should return same format when source format is undefined', () => {
		const result = resolveOutputFormat(SAME_AS_INPUT_FORMAT, undefined);
		expect(result.format).toBe('same');
	});

	it('should return same format when source format is unknown', () => {
		const result = resolveOutputFormat(SAME_AS_INPUT_FORMAT, 'unknown');
		expect(result.format).toBe('same');
	});
});
