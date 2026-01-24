/**
 * Video resize controls component
 */

import { useCallback } from 'react';
import type { ResizeConfiguration, ResolutionPresetId } from '../types/resize.types';
import { useResizeCalculator, useAvailablePresets } from '../hooks/useResizeCalculator';

interface ResizeControlsProps {
	/** Current resize configuration */
	config: ResizeConfiguration;
	/** Callback when configuration changes */
	onConfigChange: (config: ResizeConfiguration) => void;
	/** Source video width */
	sourceWidth: number | null;
	/** Source video height */
	sourceHeight: number | null;
	/** Whether the control is disabled */
	disabled?: boolean;
	/** Whether source has video (hide for audio-only) */
	hasVideo?: boolean;
}

export function ResizeControls({
	config,
	onConfigChange,
	sourceWidth,
	sourceHeight,
	disabled = false,
	hasVideo = true,
}: ResizeControlsProps) {
	// Don't render for audio-only files
	if (!hasVideo) {
		return null;
	}

	// Calculate dimensions
	const {
		// targetWidth and targetHeight will be used by conversion logic
		isUpscale,
		validation,
		sourceFormatted,
		targetFormatted,
		sizeChangePercent,
		isResizeActive,
	} = useResizeCalculator({ sourceWidth, sourceHeight, config });

	// Get presets with upscale indicators
	const presets = useAvailablePresets(sourceHeight);

	// Handle preset change
	const handlePresetChange = useCallback(
		(presetId: ResolutionPresetId) => {
			onConfigChange({
				...config,
				presetId,
				// Clear custom dimensions when switching to preset
				customWidth: presetId === 'custom' ? config.customWidth : null,
				customHeight: presetId === 'custom' ? config.customHeight : null,
			});
		},
		[config, onConfigChange],
	);

	// Handle aspect ratio toggle
	const handleAspectRatioToggle = useCallback(() => {
		onConfigChange({
			...config,
			maintainAspectRatio: !config.maintainAspectRatio,
		});
	}, [config, onConfigChange]);

	// Handle custom width change
	const handleWidthChange = useCallback(
		(value: string) => {
			const parsed = value === '' ? null : parseInt(value, 10);
			onConfigChange({
				...config,
				customWidth: isNaN(parsed as number) ? null : parsed,
			});
		},
		[config, onConfigChange],
	);

	// Handle custom height change
	const handleHeightChange = useCallback(
		(value: string) => {
			const parsed = value === '' ? null : parseInt(value, 10);
			onConfigChange({
				...config,
				customHeight: isNaN(parsed as number) ? null : parsed,
			});
		},
		[config, onConfigChange],
	);

	return (
		<div className="form-control w-full space-y-4">
			{/* Resolution Preset Selection */}
			<fieldset>
				<legend className="label">
					<h3 className="label-text font-medium text-xl my-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Output Resolution</h3>
				</legend>
				<div className="space-y-2">
					{/* Preset Radio Buttons */}
					<div
						className="grid grid-cols-2 md:grid-cols-4 gap-2"
						role="radiogroup"
						aria-label="Resolution selection"
					>
						{presets.map(preset => (
							<label
								key={preset.id}
								className={`
									cursor-pointer rounded-lg border-2 p-2 transition-all text-center
									${config.presetId === preset.id
								? 'border-primary bg-primary/10'
								: 'border-base-300 hover:border-base-content/20'}
									${disabled ? 'opacity-50 cursor-not-allowed' : ''}
									${preset.isUpscale ? 'opacity-70' : ''}
								`}
								title={preset.description}
							>
								<input
									type="radio"
									name="resolution-preset"
									value={preset.id}
									checked={config.presetId === preset.id}
									onChange={() => handlePresetChange(preset.id)}
									disabled={disabled}
									className="sr-only"
									aria-describedby={`preset-${preset.id}-desc`}
								/>
								<div className="text-sm font-medium">
									{preset.label}
									{preset.isUpscale && (
										<span className="ml-1 text-warning" title="Upscaling">
											↑
										</span>
									)}
								</div>
								{preset.width && preset.height && (
									<div
										id={`preset-${preset.id}-desc`}
										className="text-xs text-base-content/60"
									>
										{preset.width}×{preset.height}
									</div>
								)}
							</label>
						))}
					</div>
				</div>
			</fieldset>

			{/* Custom Dimensions (shown when custom preset selected) */}
			{config.presetId === 'custom' && (
				<div className="space-y-3 rounded-lg border border-base-300 p-4 bg-base-200/50">
					<div className="flex justify-between items-center">
						<h4 className="font-medium text-sm">Custom Dimensions</h4>
						<label className="flex items-center gap-2 cursor-pointer">
							<span className="text-xs text-base-content/70">Maintain aspect ratio</span>
							<input
								type="checkbox"
								checked={config.maintainAspectRatio}
								onChange={handleAspectRatioToggle}
								disabled={disabled}
								className="toggle toggle-primary toggle-sm"
								aria-label="Maintain aspect ratio"
							/>
						</label>
					</div>

					<div className="grid grid-cols-2 gap-3">
						{/* Width Input */}
						<div className="form-control">
							<label className="label py-1">
								<span className="label-text text-xs">Width (px)</span>
							</label>
							<input
								type="number"
								placeholder={sourceWidth?.toString() ?? 'Auto'}
								value={config.customWidth ?? ''}
								onChange={e => handleWidthChange(e.target.value)}
								disabled={disabled}
								min={16}
								max={7680}
								className="input input-bordered input-sm w-full"
								aria-label="Width in pixels"
							/>
						</div>

						{/* Height Input */}
						<div className="form-control">
							<label className="label py-1">
								<span className="label-text text-xs">Height (px)</span>
							</label>
							<input
								type="number"
								placeholder={sourceHeight?.toString() ?? 'Auto'}
								value={config.customHeight ?? ''}
								onChange={e => handleHeightChange(e.target.value)}
								disabled={disabled}
								min={16}
								max={4320}
								className="input input-bordered input-sm w-full"
								aria-label="Height in pixels"
							/>
						</div>
					</div>
				</div>
			)}

			{/* Dimension Preview */}
			{sourceWidth !== null && sourceHeight !== null && (
				<div
					className="flex items-center justify-center gap-3 p-3 rounded-lg bg-base-200"
					role="status"
					aria-live="polite"
					aria-label="Dimensions preview"
				>
					<span className="text-sm font-mono">{sourceFormatted}</span>
					<span className="text-base-content/50">→</span>
					<span
						className={`text-sm font-mono font-medium ${isUpscale ? 'text-warning' : isResizeActive ? 'text-success' : ''}`}
					>
						{targetFormatted}
					</span>
					{sizeChangePercent !== null && sizeChangePercent !== 0 && (
						<span
							className={`text-xs px-2 py-0.5 rounded-full ${
								sizeChangePercent < 0
									? 'bg-success/20 text-success'
									: 'bg-warning/20 text-warning'
							}`}
						>
							{sizeChangePercent > 0 ? '+' : ''}
							{sizeChangePercent}%
						</span>
					)}
				</div>
			)}

			{/* Warnings */}
			{validation.messages.length > 0 && (
				<div className="space-y-1">
					{validation.messages.map((msg, index) => (
						<div
							key={index}
							className={`text-xs p-2 rounded ${
								msg.severity === 'error'
									? 'bg-error/10 text-error'
									: msg.severity === 'warning'
										? 'bg-warning/10 text-warning'
										: 'bg-info/10 text-info'
							}`}
							role={msg.severity === 'error' ? 'alert' : 'status'}
						>
							{msg.severity === 'warning' && (
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="inline-block w-4 h-4 mr-1"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
									/>
								</svg>
							)}
							{msg.message}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
