/**
 * GIF-specific settings component
 */

import { useCallback, useMemo } from 'react';
import type { GifConfiguration, GifQualityPreset } from '../types/gif.types';
import { GIF_QUALITY_PRESETS } from '../types/gif.types';
import { estimateGifSize, getRecommendedGifConfig } from '../services/gifService';
import { formatBytes } from '../utils/fileSize';

interface GifSettingsProps {
	config: GifConfiguration;
	onConfigChange: (config: GifConfiguration) => void;
	sourceWidth: number | null;
	sourceHeight: number | null;
	sourceDuration: number | null;
	disabled?: boolean;
}

const QUALITY_DESCRIPTIONS: Record<GifQualityPreset, string> = {
	high: 'Best quality, 15 fps, larger file size',
	balanced: 'Good quality, 10 fps, moderate size',
	small: 'Smaller files, 8 fps, faster encoding',
};

export function GifSettings({
	config,
	onConfigChange,
	sourceWidth,
	sourceHeight,
	sourceDuration,
	disabled = false,
}: GifSettingsProps) {
	const handleQualityChange = useCallback(
		(quality: GifQualityPreset) => {
			const presetConfig = GIF_QUALITY_PRESETS[quality];
			onConfigChange({
				...config,
				...presetConfig,
				quality,
			});
		},
		[config, onConfigChange],
	);

	const handleFpsChange = useCallback(
		(fps: number) => {
			onConfigChange({ ...config, fps: Math.max(1, Math.min(30, fps)) });
		},
		[config, onConfigChange],
	);

	const handleMaxDurationChange = useCallback(
		(duration: number | null) => {
			onConfigChange({ ...config, maxDuration: duration });
		},
		[config, onConfigChange],
	);

	const handleWidthChange = useCallback(
		(width: number | null) => {
			if (config.maintainAspectRatio && width && sourceWidth && sourceHeight) {
				const ratio = sourceWidth / sourceHeight;
				onConfigChange({
					...config,
					width,
					height: Math.round(width / ratio),
				});
			} else {
				onConfigChange({ ...config, width });
			}
		},
		[config, onConfigChange, sourceWidth, sourceHeight],
	);

	const estimatedSize = useMemo(() => {
		if (!sourceWidth || !sourceHeight || !sourceDuration) return null;
		return estimateGifSize(sourceWidth, sourceHeight, sourceDuration, config);
	}, [sourceWidth, sourceHeight, sourceDuration, config]);

	const recommendations = useMemo(() => {
		if (!sourceWidth || !sourceHeight || !sourceDuration) return null;
		return getRecommendedGifConfig(sourceWidth, sourceHeight, sourceDuration);
	}, [sourceWidth, sourceHeight, sourceDuration]);

	const applyRecommendations = useCallback(() => {
		if (recommendations) {
			onConfigChange({ ...config, ...recommendations });
		}
	}, [config, recommendations, onConfigChange]);

	const actualDuration = useMemo(() => {
		if (!sourceDuration) return null;
		return config.maxDuration
			? Math.min(sourceDuration, config.maxDuration)
			: sourceDuration;
	}, [sourceDuration, config.maxDuration]);

	const outputDimensions = useMemo(() => {
		if (!sourceWidth || !sourceHeight) return null;

		let width = config.width ?? sourceWidth;
		let height = config.height ?? sourceHeight;

		if (!config.width && !config.height) {
			const maxDim = 480;
			if (sourceWidth > sourceHeight) {
				width = Math.min(sourceWidth, maxDim);
				height = Math.round(width * (sourceHeight / sourceWidth));
			} else {
				height = Math.min(sourceHeight, maxDim);
				width = Math.round(height * (sourceWidth / sourceHeight));
			}
		}

		return { width: Math.round(width), height: Math.round(height) };
	}, [sourceWidth, sourceHeight, config.width, config.height]);

	return (
		<div className="form-control w-full space-y-4">
			<fieldset>
				<legend className="label">
					<h3 className="label-text font-medium text-xl my-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
						GIF Settings
					</h3>
				</legend>

				{/* Quality Preset Selection */}
				<div className="space-y-2">
					<label className="label py-1">
						<span className="label-text text-sm font-medium">Quality Preset</span>
					</label>
					<div
						className="grid grid-cols-3 gap-2"
						role="radiogroup"
						aria-label="GIF quality preset"
					>
						{(['high', 'balanced', 'small'] as const).map(quality => (
							<label
								key={quality}
								className={`
									cursor-pointer rounded-lg border-2 p-2 transition-all text-center
									${config.quality === quality
										? 'border-primary bg-primary/10'
										: 'border-base-300 hover:border-base-content/20'}
									${disabled ? 'opacity-50 cursor-not-allowed' : ''}
								`}
								title={QUALITY_DESCRIPTIONS[quality]}
							>
								<input
									type="radio"
									name="gif-quality"
									value={quality}
									checked={config.quality === quality}
									onChange={() => handleQualityChange(quality)}
									disabled={disabled}
									className="sr-only"
								/>
								<div className="text-sm font-medium capitalize">{quality}</div>
								<div className="text-xs text-base-content/60">
									{GIF_QUALITY_PRESETS[quality].fps} fps
								</div>
							</label>
						))}
					</div>
				</div>
			</fieldset>

			{/* Advanced Settings */}
			<div className="space-y-3 rounded-lg border border-base-300 p-4 bg-base-200/50">
				<div className="flex justify-between items-center">
					<h4 className="font-medium text-sm">Advanced Settings</h4>
					{recommendations && Object.keys(recommendations).length > 0 && (
						<button
							type="button"
							onClick={applyRecommendations}
							disabled={disabled}
							className="btn btn-xs btn-ghost text-primary"
						>
							Apply Recommended
						</button>
					)}
				</div>

				<div className="grid grid-cols-2 gap-3">
					{/* FPS */}
					<div className="form-control">
						<label className="label py-1">
							<span className="label-text text-xs">Frame Rate (fps)</span>
						</label>
						<input
							type="number"
							value={config.fps}
							onChange={e => handleFpsChange(parseInt(e.target.value) || 10)}
							disabled={disabled}
							min={1}
							max={30}
							className="input input-bordered input-sm w-full"
							aria-label="Frames per second"
						/>
					</div>

					{/* Max Duration */}
					<div className="form-control">
						<label className="label py-1">
							<span className="label-text text-xs">Max Duration (sec)</span>
						</label>
						<input
							type="number"
							value={config.maxDuration ?? ''}
							onChange={e =>
								handleMaxDurationChange(
									e.target.value ? parseInt(e.target.value) : null,
								)}
							disabled={disabled}
							min={1}
							max={60}
							placeholder="No limit"
							className="input input-bordered input-sm w-full"
							aria-label="Maximum duration in seconds"
						/>
					</div>

					{/* Width */}
					<div className="form-control">
						<label className="label py-1">
							<span className="label-text text-xs">Width (px)</span>
						</label>
						<input
							type="number"
							value={config.width ?? ''}
							onChange={e =>
								handleWidthChange(e.target.value ? parseInt(e.target.value) : null)}
							disabled={disabled}
							min={16}
							max={1920}
							placeholder={outputDimensions?.width.toString() ?? 'Auto'}
							className="input input-bordered input-sm w-full"
							aria-label="Output width in pixels"
						/>
					</div>

					{/* Color Quality */}
					<div className="form-control">
						<label className="label py-1">
							<span className="label-text text-xs">Color Quality</span>
						</label>
						<input
							type="range"
							min={1}
							max={30}
							value={31 - config.colorQuality}
							onChange={e =>
								onConfigChange({
									...config,
									colorQuality: 31 - parseInt(e.target.value),
								})}
							disabled={disabled}
							className="range range-primary range-sm"
							aria-label="Color quality (higher = better)"
						/>
						<div className="flex justify-between text-xs text-base-content/50 px-1">
							<span>Lower</span>
							<span>Higher</span>
						</div>
					</div>
				</div>

				{/* Dithering Toggle */}
				<label className="flex items-center gap-2 cursor-pointer">
					<input
						type="checkbox"
						checked={config.dithering}
						onChange={e => onConfigChange({ ...config, dithering: e.target.checked })}
						disabled={disabled}
						className="toggle toggle-primary toggle-sm"
					/>
					<span className="text-sm">Enable dithering (smoother colors)</span>
				</label>
			</div>

			{/* Output Preview */}
			{(outputDimensions || actualDuration || estimatedSize) && (
				<div
					className="flex flex-wrap items-center justify-center gap-4 p-3 rounded-lg bg-base-200"
					role="status"
					aria-live="polite"
				>
					{outputDimensions && (
						<div className="text-center">
							<div className="text-xs text-base-content/60">Output Size</div>
							<div className="text-sm font-mono">
								{outputDimensions.width}×{outputDimensions.height}
							</div>
						</div>
					)}
					{actualDuration && (
						<div className="text-center">
							<div className="text-xs text-base-content/60">Duration</div>
							<div className="text-sm font-mono">{actualDuration.toFixed(1)}s</div>
						</div>
					)}
					{actualDuration && (
						<div className="text-center">
							<div className="text-xs text-base-content/60">Frames</div>
							<div className="text-sm font-mono">
								{Math.ceil(actualDuration * config.fps)}
							</div>
						</div>
					)}
					{estimatedSize && (
						<div className="text-center">
							<div className="text-xs text-base-content/60">Est. Size</div>
							<div className="text-sm font-mono text-warning">
								~{formatBytes(estimatedSize)}
							</div>
						</div>
					)}
				</div>
			)}

			{/* Warnings */}
			{sourceDuration && sourceDuration > 15 && !config.maxDuration && (
				<div className="alert alert-warning text-xs">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="stroke-current shrink-0 h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						/>
					</svg>
					<span>
						Long videos produce large GIFs. Consider setting a max duration (recommended: 15s or less).
					</span>
				</div>
			)}

			{estimatedSize && estimatedSize > 10 * 1024 * 1024 && (
				<div className="alert alert-warning text-xs">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="stroke-current shrink-0 h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						/>
					</svg>
					<span>
						Estimated GIF size is large ({formatBytes(estimatedSize)}). Consider reducing dimensions, duration, or FPS.
					</span>
				</div>
			)}
		</div>
	);
}
