/**
 * GIF encoding service using gif.js
 * Converts video to animated GIF by extracting frames and encoding them
 */

import GIF from 'gif.js';
import type {
	GifConfiguration,
	GifEncodingProgress,
	GifEncodingResult,
} from '../types/gif.types';
import { DEFAULT_GIF_CONFIG } from '../types/gif.types';

/**
 * Extract frames from a video file at specified intervals
 */
async function extractFrames(
	file: File,
	config: GifConfiguration,
	onProgress?: (progress: GifEncodingProgress) => void,
): Promise<{ frames: ImageData[]; width: number; height: number }> {
	return new Promise((resolve, reject) => {
		const video = document.createElement('video');
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');

		if (!ctx) {
			reject(new Error('Failed to get canvas 2D context'));
			return;
		}

		video.muted = true;
		video.playsInline = true;
		video.preload = 'auto';

		const frames: ImageData[] = [];
		let frameCount = 0;
		let totalFrames = 0;

		const frameInterval = 1 / config.fps;

		video.onloadedmetadata = () => {
			const duration = video.duration;
			const endTime = config.endTime ?? duration;
			const actualEndTime = Math.min(endTime, duration);
			const clipDuration = actualEndTime - config.startTime;
			const limitedDuration = config.maxDuration
				? Math.min(clipDuration, config.maxDuration)
				: clipDuration;

			totalFrames = Math.ceil(limitedDuration * config.fps);

			let targetWidth = config.width ?? video.videoWidth;
			let targetHeight = config.height ?? video.videoHeight;

			if (config.maintainAspectRatio) {
				const aspectRatio = video.videoWidth / video.videoHeight;
				if (config.width && !config.height) {
					targetHeight = Math.round(config.width / aspectRatio);
				} else if (config.height && !config.width) {
					targetWidth = Math.round(config.height * aspectRatio);
				} else if (!config.width && !config.height) {
					const maxDimension = 480;
					if (video.videoWidth > video.videoHeight) {
						targetWidth = Math.min(video.videoWidth, maxDimension);
						targetHeight = Math.round(targetWidth / aspectRatio);
					} else {
						targetHeight = Math.min(video.videoHeight, maxDimension);
						targetWidth = Math.round(targetHeight * aspectRatio);
					}
				}
			}

			targetWidth = Math.round(targetWidth / 2) * 2;
			targetHeight = Math.round(targetHeight / 2) * 2;

			canvas.width = targetWidth;
			canvas.height = targetHeight;

			const captureFrame = () => {
				if (frameCount >= totalFrames) {
					resolve({ frames, width: targetWidth, height: targetHeight });
					return;
				}

				video.currentTime = config.startTime + frameCount * frameInterval;
			};

			video.onseeked = () => {
				ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
				const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
				frames.push(imageData);
				frameCount++;

				if (onProgress) {
					onProgress({
						phase: 'extracting',
						progress: Math.round((frameCount / totalFrames) * 50),
						currentFrame: frameCount,
						totalFrames,
					});
				}

				captureFrame();
			};

			captureFrame();
		};

		video.onerror = () => {
			reject(new Error('Failed to load video for GIF conversion'));
		};

		video.src = URL.createObjectURL(file);
	});
}

/**
 * Encode frames to GIF using gif.js
 */
async function encodeGif(
	frames: ImageData[],
	width: number,
	height: number,
	config: GifConfiguration,
	onProgress?: (progress: GifEncodingProgress) => void,
): Promise<Blob> {
	return new Promise((resolve, reject) => {
		const gif = new GIF({
			workers: 4,
			quality: config.colorQuality,
			width,
			height,
			workerScript: '/gif.worker.js',
			dither: config.dithering,
		});

		frames.forEach((frame, index) => {
			gif.addFrame(frame, { delay: Math.round(1000 / config.fps) });

			if (onProgress && index % 5 === 0) {
				onProgress({
					phase: 'encoding',
					progress: 50 + Math.round((index / frames.length) * 40),
					currentFrame: index,
					totalFrames: frames.length,
				});
			}
		});

		gif.on('finished', (blob: Blob) => {
			if (onProgress) {
				onProgress({
					phase: 'finalizing',
					progress: 100,
					currentFrame: frames.length,
					totalFrames: frames.length,
				});
			}
			resolve(blob);
		});

		gif.on('abort', () => {
			reject(new Error('GIF encoding was aborted'));
		});

		gif.render();
	});
}

/**
 * Convert a video file to animated GIF
 */
export async function convertToGif(
	file: File,
	config: Partial<GifConfiguration> = {},
	onProgress?: (progress: GifEncodingProgress) => void,
): Promise<GifEncodingResult> {
	const fullConfig: GifConfiguration = { ...DEFAULT_GIF_CONFIG, ...config };

	if (fullConfig.quality !== 'balanced') {
		const presetConfig = (await import('../types/gif.types')).GIF_QUALITY_PRESETS[fullConfig.quality];
		Object.assign(fullConfig, presetConfig);
	}

	const { frames, width, height } = await extractFrames(file, fullConfig, onProgress);

	if (frames.length === 0) {
		throw new Error('No frames extracted from video');
	}

	const blob = await encodeGif(frames, width, height, fullConfig, onProgress);

	return {
		blob,
		width,
		height,
		frameCount: frames.length,
		duration: frames.length / fullConfig.fps,
		size: blob.size,
	};
}

/**
 * Estimate the output size of a GIF based on configuration
 */
export function estimateGifSize(
	sourceWidth: number,
	sourceHeight: number,
	duration: number,
	config: Partial<GifConfiguration> = {},
): number {
	const fullConfig = { ...DEFAULT_GIF_CONFIG, ...config };

	let targetWidth = fullConfig.width ?? Math.min(sourceWidth, 480);
	let targetHeight = fullConfig.height ?? Math.min(sourceHeight, 480);

	if (fullConfig.maintainAspectRatio && sourceWidth && sourceHeight) {
		const ratio = sourceWidth / sourceHeight;
		if (!fullConfig.width && !fullConfig.height) {
			if (sourceWidth > sourceHeight) {
				targetWidth = Math.min(sourceWidth, 480);
				targetHeight = Math.round(targetWidth / ratio);
			} else {
				targetHeight = Math.min(sourceHeight, 480);
				targetWidth = Math.round(targetHeight * ratio);
			}
		}
	}

	const actualDuration = fullConfig.maxDuration
		? Math.min(duration, fullConfig.maxDuration)
		: duration;
	const frameCount = Math.ceil(actualDuration * fullConfig.fps);
	const bytesPerPixel = fullConfig.colorQuality < 10 ? 0.5 : 0.3;
	const estimatedSize = targetWidth * targetHeight * frameCount * bytesPerPixel;

	return Math.round(estimatedSize);
}

/**
 * Get recommended GIF settings based on source video
 */
export function getRecommendedGifConfig(
	sourceWidth: number,
	sourceHeight: number,
	sourceDuration: number,
): Partial<GifConfiguration> {
	const recommendations: Partial<GifConfiguration> = {};

	if (sourceWidth > 640 || sourceHeight > 640) {
		const ratio = sourceWidth / sourceHeight;
		if (sourceWidth > sourceHeight) {
			recommendations.width = 480;
			recommendations.height = Math.round(480 / ratio);
		} else {
			recommendations.height = 480;
			recommendations.width = Math.round(480 * ratio);
		}
	}

	if (sourceDuration > 15) {
		recommendations.maxDuration = 15;
	}

	if (sourceDuration > 10) {
		recommendations.fps = 10;
	} else if (sourceDuration < 3) {
		recommendations.fps = 15;
	}

	return recommendations;
}

/**
 * Check if a file can be converted to GIF
 */
export function canConvertToGif(file: File): boolean {
	const videoTypes = [
		'video/mp4',
		'video/webm',
		'video/quicktime',
		'video/x-matroska',
		'video/ogg',
	];
	return videoTypes.includes(file.type);
}
