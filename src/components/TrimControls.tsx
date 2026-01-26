/**
 * Video trim controls component with dual-handle range slider
 */

import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import type { TrimConfiguration } from '../types/trim.types';
import { formatDuration, parseDurationString } from '../utils/duration';

interface TrimControlsProps {
	config: TrimConfiguration;
	onConfigChange: (config: TrimConfiguration) => void;
	sourceDuration: number | null;
	disabled?: boolean;
	hasVideo?: boolean;
	hasAudio?: boolean;
}

export function TrimControls({
	config,
	onConfigChange,
	sourceDuration,
	disabled = false,
	hasVideo = true,
	hasAudio = true,
}: TrimControlsProps) {
	const [startInput, setStartInput] = useState('');
	const [endInput, setEndInput] = useState('');
	const sliderRef = useRef<HTMLDivElement>(null);
	const [dragging, setDragging] = useState<'start' | 'end' | null>(null);

	const maxDuration = sourceDuration ?? 0;
	const effectiveEndTime = config.endTime ?? maxDuration;

	useEffect(() => {
		setStartInput(formatDuration(config.startTime));
		setEndInput(formatDuration(effectiveEndTime));
	}, [config.startTime, effectiveEndTime]);

	const trimmedDuration = useMemo(() => {
		return effectiveEndTime - config.startTime;
	}, [config.startTime, effectiveEndTime]);

	const handleToggle = useCallback(() => {
		onConfigChange({
			...config,
			enabled: !config.enabled,
			startTime: 0,
			endTime: null,
		});
	}, [config, onConfigChange]);

	const handleStartTimeChange = useCallback(
		(value: number) => {
			const clamped = Math.max(0, Math.min(value, effectiveEndTime - 0.1));
			onConfigChange({
				...config,
				startTime: clamped,
			});
		},
		[config, effectiveEndTime, onConfigChange],
	);

	const handleEndTimeChange = useCallback(
		(value: number) => {
			const clamped = Math.max(config.startTime + 0.1, Math.min(value, maxDuration));
			onConfigChange({
				...config,
				endTime: clamped >= maxDuration ? null : clamped,
			});
		},
		[config, maxDuration, onConfigChange],
	);

	const handleStartInputBlur = useCallback(() => {
		const parsed = parseDurationString(startInput);
		if (!isNaN(parsed) && parsed >= 0) {
			handleStartTimeChange(parsed);
		} else {
			setStartInput(formatDuration(config.startTime));
		}
	}, [startInput, config.startTime, handleStartTimeChange]);

	const handleEndInputBlur = useCallback(() => {
		const parsed = parseDurationString(endInput);
		if (!isNaN(parsed) && parsed > 0) {
			handleEndTimeChange(parsed);
		} else {
			setEndInput(formatDuration(effectiveEndTime));
		}
	}, [endInput, effectiveEndTime, handleEndTimeChange]);

	const handleInputKeyDown = useCallback(
		(e: React.KeyboardEvent, type: 'start' | 'end') => {
			if (e.key === 'Enter') {
				if (type === 'start') {
					handleStartInputBlur();
				} else {
					handleEndInputBlur();
				}
			}
		},
		[handleStartInputBlur, handleEndInputBlur],
	);

	const getPositionFromMouse = useCallback(
		(clientX: number): number => {
			if (!sliderRef.current || maxDuration === 0) return 0;
			const rect = sliderRef.current.getBoundingClientRect();
			const percent = (clientX - rect.left) / rect.width;
			return Math.max(0, Math.min(1, percent)) * maxDuration;
		},
		[maxDuration],
	);

	const handleSliderMouseDown = useCallback(
		(e: React.MouseEvent, handle: 'start' | 'end') => {
			if (disabled || !config.enabled) return;
			e.preventDefault();
			setDragging(handle);
		},
		[disabled, config.enabled],
	);

	useEffect(() => {
		if (!dragging) return;

		const handleMouseMove = (e: MouseEvent) => {
			const position = getPositionFromMouse(e.clientX);
			if (dragging === 'start') {
				handleStartTimeChange(position);
			} else {
				handleEndTimeChange(position);
			}
		};

		const handleMouseUp = () => {
			setDragging(null);
		};

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};
	}, [dragging, getPositionFromMouse, handleStartTimeChange, handleEndTimeChange]);

	const startPercent = maxDuration > 0 ? (config.startTime / maxDuration) * 100 : 0;
	const endPercent = maxDuration > 0 ? (effectiveEndTime / maxDuration) * 100 : 100;

	if ((!hasVideo && !hasAudio) || sourceDuration === null || sourceDuration <= 0) {
		return null;
	}

	const mediaType = hasVideo ? 'Video' : 'Audio';

	return (
		<div className="form-control w-full space-y-4">
			<fieldset>
				<legend className="label">
					<h3 className="label-text font-medium text-xl my-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
						Trim {mediaType}
					</h3>
				</legend>

				<label className="flex items-center gap-3 cursor-pointer">
					<input
						type="checkbox"
						checked={config.enabled}
						onChange={handleToggle}
						disabled={disabled}
						className="toggle toggle-primary"
						aria-label="Enable video trimming"
					/>
					<span className="label-text">Enable trimming</span>
				</label>
			</fieldset>

			{config.enabled && (
				<div className="space-y-4 rounded-lg border border-base-300 p-4 bg-base-200/50">
					{/* Range Slider */}
					<div className="space-y-2">
						<label className="label py-1">
							<span className="label-text text-sm font-medium">Select Range</span>
							<span className="label-text-alt text-xs text-base-content/60">
								{formatDuration(trimmedDuration)} selected
							</span>
						</label>

						{/* Slider Track */}
						<div
							ref={sliderRef}
							className={`relative h-8 rounded-lg bg-base-300 ${disabled ? 'opacity-50' : 'cursor-pointer'}`}
							role="slider"
							aria-valuemin={0}
							aria-valuemax={maxDuration}
							aria-valuenow={config.startTime}
							aria-label="Trim range selector"
						>
							{/* Selected Range */}
							<div
								className="absolute top-0 h-full bg-primary/30 rounded-lg"
								style={{
									left: `${startPercent}%`,
									width: `${endPercent - startPercent}%`,
								}}
							/>

							{/* Start Handle */}
							<div
								className={`absolute top-0 h-full w-4 -ml-2 flex items-center justify-center cursor-ew-resize z-10 ${dragging === 'start' ? 'z-20' : ''}`}
								style={{ left: `${startPercent}%` }}
								onMouseDown={e => handleSliderMouseDown(e, 'start')}
								role="slider"
								aria-label="Start time handle"
								aria-valuenow={config.startTime}
								tabIndex={disabled ? -1 : 0}
							>
								<div
									className={`w-3 h-6 rounded-sm transition-colors ${
										dragging === 'start'
											? 'bg-primary scale-110'
											: 'bg-primary/80 hover:bg-primary'
									}`}
								/>
							</div>

							{/* End Handle */}
							<div
								className={`absolute top-0 h-full w-4 -ml-2 flex items-center justify-center cursor-ew-resize z-10 ${dragging === 'end' ? 'z-20' : ''}`}
								style={{ left: `${endPercent}%` }}
								onMouseDown={e => handleSliderMouseDown(e, 'end')}
								role="slider"
								aria-label="End time handle"
								aria-valuenow={effectiveEndTime}
								tabIndex={disabled ? -1 : 0}
							>
								<div
									className={`w-3 h-6 rounded-sm transition-colors ${
										dragging === 'end'
											? 'bg-secondary scale-110'
											: 'bg-secondary/80 hover:bg-secondary'
									}`}
								/>
							</div>

							{/* Time markers */}
							<div className="absolute -bottom-5 left-0 text-xs text-base-content/50">
								0:00
							</div>
							<div className="absolute -bottom-5 right-0 text-xs text-base-content/50">
								{formatDuration(maxDuration)}
							</div>
						</div>
					</div>

					{/* Time Inputs */}
					<div className="grid grid-cols-2 gap-4 mt-8">
						<div className="form-control">
							<label className="label py-1">
								<span className="label-text text-xs">Start Time</span>
							</label>
							<input
								type="text"
								value={startInput}
								onChange={e => setStartInput(e.target.value)}
								onBlur={handleStartInputBlur}
								onKeyDown={e => handleInputKeyDown(e, 'start')}
								disabled={disabled}
								placeholder="0:00"
								className="input input-bordered input-sm w-full font-mono"
								aria-label="Start time (MM:SS or HH:MM:SS)"
							/>
						</div>

						<div className="form-control">
							<label className="label py-1">
								<span className="label-text text-xs">End Time</span>
							</label>
							<input
								type="text"
								value={endInput}
								onChange={e => setEndInput(e.target.value)}
								onBlur={handleEndInputBlur}
								onKeyDown={e => handleInputKeyDown(e, 'end')}
								disabled={disabled}
								placeholder={formatDuration(maxDuration)}
								className="input input-bordered input-sm w-full font-mono"
								aria-label="End time (MM:SS or HH:MM:SS)"
							/>
						</div>
					</div>

					{/* Preview */}
					<div
						className="flex items-center justify-center gap-4 p-3 rounded-lg bg-base-200"
						role="status"
						aria-live="polite"
					>
						<div className="text-center">
							<div className="text-xs text-base-content/60">Original</div>
							<div className="text-sm font-mono">{formatDuration(maxDuration)}</div>
						</div>
						<span className="text-base-content/50">→</span>
						<div className="text-center">
							<div className="text-xs text-base-content/60">Trimmed</div>
							<div className="text-sm font-mono text-primary font-medium">
								{formatDuration(trimmedDuration)}
							</div>
						</div>
						{trimmedDuration !== maxDuration && (
							<span
								className={`text-xs px-2 py-0.5 rounded-full ${
									trimmedDuration < maxDuration
										? 'bg-success/20 text-success'
										: 'bg-warning/20 text-warning'
								}`}
							>
								-{Math.round(((maxDuration - trimmedDuration) / maxDuration) * 100)}%
							</span>
						)}
					</div>

					{/* Warnings */}
					{trimmedDuration < 1 && (
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
							<span>Trimmed duration is very short (less than 1 second).</span>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
