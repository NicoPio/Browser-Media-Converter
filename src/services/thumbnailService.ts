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

		const cleanup = () => {
			URL.revokeObjectURL(objectUrl);
			video.removeAttribute('src');
			video.load();
		};

		const handleError = () => {
			cleanup();
			resolve(null);
		};

		video.addEventListener('error', handleError);
		video.addEventListener('loadedmetadata', () => {
			const seekTime = video.duration * opts.seekPercent;
			video.currentTime = Math.min(seekTime, video.duration);
		});

		video.addEventListener('seeked', () => {
			const videoWidth = video.videoWidth;
			const videoHeight = video.videoHeight;

			if (videoWidth === 0 || videoHeight === 0) {
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
			cleanup();
			resolve(dataUrl);
		});

		video.preload = 'metadata';
		video.muted = true;
		video.playsInline = true;
		video.src = objectUrl;
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
