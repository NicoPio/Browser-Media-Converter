/**
 * Service for generating video thumbnails in the browser
 */

export interface ThumbnailOptions {
	maxWidth?: number;
	maxHeight?: number;
	seekPercent?: number;
	quality?: number;
}

const DEFAULT_OPTIONS: Required<ThumbnailOptions> = {
	maxWidth: 320,
	maxHeight: 180,
	seekPercent: 0.1,
	quality: 0.8,
};

/**
 * Detect if running in Safari browser
 */
function isSafari(): boolean {
	const ua = navigator.userAgent;
	return /^((?!chrome|android).)*safari/i.test(ua);
}

export async function generateThumbnail(
	file: File,
	options: ThumbnailOptions = {},
): Promise<string | null> {
	const opts = { ...DEFAULT_OPTIONS, ...options };

	if (!file.type.startsWith('video/')) {
		return null;
	}

	return new Promise((resolve) => {
		const video = document.createElement('video');
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');

		if (!ctx) {
			resolve(null);
			return;
		}

		const objectUrl = URL.createObjectURL(file);
		let hasResolved = false;
		let timeoutId: ReturnType<typeof setTimeout> | null = null;

		const cleanup = () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
				timeoutId = null;
			}
			URL.revokeObjectURL(objectUrl);
			video.removeAttribute('src');
			video.load();
		};

		const handleError = () => {
			if (hasResolved) return;
			hasResolved = true;
			cleanup();
			resolve(null);
		};

		const captureFrame = () => {
			if (hasResolved) return;

			const videoWidth = video.videoWidth;
			const videoHeight = video.videoHeight;

			if (videoWidth === 0 || videoHeight === 0) {
				hasResolved = true;
				cleanup();
				resolve(null);
				return;
			}

			const aspectRatio = videoWidth / videoHeight;
			let width = opts.maxWidth;
			let height = width / aspectRatio;

			if (height > opts.maxHeight) {
				height = opts.maxHeight;
				width = height * aspectRatio;
			}

			canvas.width = width;
			canvas.height = height;

			ctx.drawImage(video, 0, 0, width, height);

			const dataUrl = canvas.toDataURL('image/jpeg', opts.quality);
			hasResolved = true;
			cleanup();
			resolve(dataUrl);
		};

		video.addEventListener('error', handleError);

		video.addEventListener('loadedmetadata', () => {
			if (hasResolved) return;

			const seekTime = video.duration * opts.seekPercent;
			video.currentTime = Math.min(seekTime, video.duration);
		});

		video.addEventListener('seeked', () => {
			if (hasResolved) return;

			// Safari needs a small delay after seeked event before canvas can capture the frame
			if (isSafari()) {
				setTimeout(captureFrame, 100);
			} else {
				captureFrame();
			}
		});

		// Safari fallback: if seeked doesn't fire, try capturing on loadeddata or canplay
		video.addEventListener('loadeddata', () => {
			if (hasResolved) return;

			// For Safari, set a timeout to capture frame if seeked hasn't fired
			if (isSafari()) {
				timeoutId = setTimeout(() => {
					if (!hasResolved && video.readyState >= 2) {
						// Try to seek again, or capture current frame
						if (video.currentTime === 0) {
							const seekTime = video.duration * opts.seekPercent;
							video.currentTime = Math.min(seekTime, video.duration);
						}
						// Give it another chance, then capture
						setTimeout(() => {
							if (!hasResolved) {
								captureFrame();
							}
						}, 200);
					}
				}, 500);
			}
		});

		// Global timeout fallback - capture whatever frame we have after 3 seconds
		setTimeout(() => {
			if (!hasResolved && video.readyState >= 2) {
				captureFrame();
			} else if (!hasResolved) {
				handleError();
			}
		}, 3000);

		video.preload = 'auto'; // Changed from 'metadata' for better Safari compatibility
		video.muted = true;
		video.playsInline = true;
		// Safari-specific: crossOrigin helps with some video sources
		video.crossOrigin = 'anonymous';
		video.src = objectUrl;
		// Safari: explicitly trigger load
		video.load();
	});
}

export async function generateThumbnailSmall(file: File): Promise<string | null> {
	return generateThumbnail(file, {
		maxWidth: 64,
		maxHeight: 64,
		seekPercent: 0.1,
		quality: 0.7,
	});
}
