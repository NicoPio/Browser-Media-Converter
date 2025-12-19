import { describe, it, expect } from 'vitest';
import { formatBytes, formatBytesCompact, parseSizeString } from '../../src/utils/fileSize';
import { formatDuration, formatDurationCompact, parseDurationString, formatTimeRemaining } from '../../src/utils/duration';

describe('Utility Functions', () => {
	describe('formatBytes', () => {
		it('should format bytes correctly', () => {
			expect(formatBytes(0)).toBe('0 Bytes');
			expect(formatBytes(1024)).toBe('1 KB');
			expect(formatBytes(1048576)).toBe('1 MB');
			expect(formatBytes(1073741824)).toBe('1 GB');
		});

		it('should handle decimal places', () => {
			expect(formatBytes(1536)).toBe('1.5 KB');
			expect(formatBytes(1572864)).toBe('1.5 MB');
		});

		it('should handle custom decimal places', () => {
			expect(formatBytes(1536, 0)).toBe('2 KB');
			expect(formatBytes(1536, 3)).toBe('1.5 KB');
		});
	});

	describe('formatBytesCompact', () => {
		it('should format bytes compactly', () => {
			expect(formatBytesCompact(0)).toBe('0B');
			expect(formatBytesCompact(1024)).toBe('1K');
			expect(formatBytesCompact(1048576)).toBe('1M');
		});
	});

	describe('parseSizeString', () => {
		it('should parse size strings correctly', () => {
			expect(parseSizeString('1 KB')).toBe(1024);
			expect(parseSizeString('1.5 MB')).toBe(1572864);
			expect(parseSizeString('2 GB')).toBe(2147483648);
		});
	});

	describe('formatDuration', () => {
		it('should format seconds correctly', () => {
			expect(formatDuration(0)).toBe('00:00');
			expect(formatDuration(30)).toBe('00:30');
			expect(formatDuration(60)).toBe('01:00');
			expect(formatDuration(90)).toBe('01:30');
		});

		it('should format minutes and hours correctly', () => {
			expect(formatDuration(3600)).toBe('01:00:00');
			expect(formatDuration(3661)).toBe('01:01:01');
		});

		it('should handle invalid values', () => {
			expect(formatDuration(-1)).toBe('00:00');
			expect(formatDuration(Infinity)).toBe('00:00');
		});
	});

	describe('formatDurationCompact', () => {
		it('should format durations compactly', () => {
			expect(formatDurationCompact(0)).toBe('0s');
			expect(formatDurationCompact(30)).toBe('30s');
			expect(formatDurationCompact(90)).toBe('1m 30s');
			expect(formatDurationCompact(3661)).toBe('1h 1m 1s');
		});
	});

	describe('parseDurationString', () => {
		it('should parse duration strings correctly', () => {
			expect(parseDurationString('01:30')).toBe(90);
			expect(parseDurationString('01:00:00')).toBe(3600);
			expect(parseDurationString('01:01:01')).toBe(3661);
		});
	});

	describe('formatTimeRemaining', () => {
		it('should format time remaining appropriately', () => {
			expect(formatTimeRemaining(5)).toBe('Almost done');
			expect(formatTimeRemaining(30)).toBe('Less than a minute');
			expect(formatTimeRemaining(60)).toBe('About a minute left');
			expect(formatTimeRemaining(120)).toBe('About 2 minutes left');
			expect(formatTimeRemaining(3600)).toBe('About 1 hour left');
		});

		it('should handle invalid values', () => {
			expect(formatTimeRemaining(-1)).toBe('Calculating...');
			expect(formatTimeRemaining(Infinity)).toBe('Calculating...');
		});
	});
});
