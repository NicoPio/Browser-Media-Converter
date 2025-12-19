/**
 * WebCodecs API detection and validation utilities
 */

/**
 * Check if WebCodecs API is supported in the current browser
 */
export function isWebCodecsSupported(): boolean {
	return (
		typeof window !== 'undefined'
		&& 'VideoEncoder' in window
		&& 'VideoDecoder' in window
		&& 'AudioEncoder' in window
		&& 'AudioDecoder' in window
		&& self.isSecureContext // HTTPS required
	);
}

/**
 * Browser capability check results
 */
export interface BrowserCapabilities {
	/** Whether WebCodecs API is supported */
	webCodecsSupported: boolean;
	/** Whether running in secure context (HTTPS) */
	secureContext: boolean;
	/** Estimated available memory (bytes) - null if not available */
	availableMemory: number | null;
	/** Supported video codecs (basic check) */
	videoCodecs: string[];
	/** Supported audio codecs (basic check) */
	audioCodecs: string[];
}

/**
 * Detect detailed browser capabilities for media conversion
 */
export async function detectCodecCapabilities(): Promise<BrowserCapabilities> {
	const capabilities: BrowserCapabilities = {
		webCodecsSupported: isWebCodecsSupported(),
		secureContext: self.isSecureContext,
		availableMemory: null,
		videoCodecs: [],
		audioCodecs: [],
	};

	// Estimate available memory if performance.memory is available (Chromium)
	// Type definition for non-standard performance.memory API
	interface PerformanceMemory {
		jsHeapSizeLimit: number;
		totalJSHeapSize: number;
		usedJSHeapSize: number;
	}

	interface PerformanceWithMemory extends Performance {
		memory?: PerformanceMemory;
	}

	const perfWithMemory = performance as PerformanceWithMemory;
	if (perfWithMemory.memory?.jsHeapSizeLimit) {
		capabilities.availableMemory = perfWithMemory.memory.jsHeapSizeLimit;
	}

	// If WebCodecs is not supported, return early
	if (!capabilities.webCodecsSupported) {
		return capabilities;
	}

	// Test common video codecs
	const videoCodecsToTest = [
		{ name: 'h264', config: { codec: 'avc1.42001E', width: 640, height: 480 } }, // H.264 Baseline
		{ name: 'h265', config: { codec: 'hev1.1.6.L93.B0', width: 640, height: 480 } }, // H.265
		{ name: 'vp8', config: { codec: 'vp8', width: 640, height: 480 } },
		{ name: 'vp9', config: { codec: 'vp09.00.10.08', width: 640, height: 480 } },
		{ name: 'av1', config: { codec: 'av01.0.00M.08', width: 640, height: 480 } },
	];

	for (const { name, config } of videoCodecsToTest) {
		try {
			const result = await VideoEncoder.isConfigSupported(config);
			if (result.supported) {
				capabilities.videoCodecs.push(name);
			}
		} catch {
			// Codec not supported or error checking
		}
	}

	// Test common audio codecs
	const audioCodecsToTest = [
		{ name: 'aac', config: { codec: 'mp4a.40.2', sampleRate: 48000, numberOfChannels: 2 } },
		{ name: 'opus', config: { codec: 'opus', sampleRate: 48000, numberOfChannels: 2 } },
		{ name: 'vorbis', config: { codec: 'vorbis', sampleRate: 48000, numberOfChannels: 2 } },
		{ name: 'pcm', config: { codec: 'pcm', sampleRate: 48000, numberOfChannels: 2 } },
	];

	for (const { name, config } of audioCodecsToTest) {
		try {
			const result = await AudioEncoder.isConfigSupported(config);
			if (result.supported) {
				capabilities.audioCodecs.push(name);
			}
		} catch {
			// Codec not supported or error checking
		}
	}

	return capabilities;
}

/**
 * Validate file size against browser memory constraints
 */
export function validateFileSize(sizeBytes: number): { valid: boolean; warning?: string } {
	const MB_100 = 100 * 1024 * 1024;
	const MB_500 = 500 * 1024 * 1024;
	const GB_1 = 1024 * 1024 * 1024;
	const GB_2 = 2 * 1024 * 1024 * 1024;

	if (sizeBytes > GB_2) {
		return {
			valid: false,
			warning: 'File is too large (>2GB). Browser memory limitations may prevent conversion.',
		};
	}

	if (sizeBytes > GB_1) {
		return {
			valid: true,
			warning: 'Very large file (>1GB). Conversion may be slow and could fail on low-memory devices.',
		};
	}

	if (sizeBytes > MB_500) {
		return {
			valid: true,
			warning: 'Large file (>500MB). Conversion may take time. Consider closing other tabs.',
		};
	}

	if (sizeBytes > MB_100) {
		return {
			valid: true,
			warning: 'File size is >100MB. Conversion may take some time.',
		};
	}

	return { valid: true };
}
