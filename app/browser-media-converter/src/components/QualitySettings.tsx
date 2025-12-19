/**
 * Quality settings component for controlling conversion parameters
 */

import { useState, useEffect } from 'react';
import type {
	QualityProfile,
	QualityPreset,
	VideoQualitySettings,
	AudioQualitySettings,
} from '../types/quality.types';
import { getQualityPreset } from '../constants/qualityPresets';

interface QualitySettingsProps {
	/** Current quality profile */
	qualityProfile: QualityProfile;
	/** Callback when quality profile changes */
	onQualityChange: (profile: QualityProfile) => void;
	/** Whether settings are disabled */
	disabled?: boolean;
	/** Whether source has video track */
	hasVideo?: boolean;
	/** Whether source has audio track */
	hasAudio?: boolean;
}

const PRESET_DESCRIPTIONS: Record<Exclude<QualityPreset, 'custom'>, string> = {
	high: 'Best quality, larger file size (8 Mbps video, 256 kbps audio)',
	balanced: 'Good quality, moderate size (2.5 Mbps video, 128 kbps audio)',
	small: 'Smaller files, lower quality (1 Mbps video, 96 kbps audio)',
};

export function QualitySettings({
	qualityProfile,
	onQualityChange,
	disabled = false,
	hasVideo = true,
	hasAudio = true,
}: QualitySettingsProps) {
	const [showAdvanced, setShowAdvanced] = useState(qualityProfile.preset === 'custom');
	const [warnings, setWarnings] = useState<string[]>([]);

	const handlePresetChange = (preset: QualityPreset) => {
		if (preset === 'custom') {
			setShowAdvanced(true);
			// Start with current settings when switching to custom
			onQualityChange({
				...qualityProfile,
				preset: 'custom',
			});
		} else {
			setShowAdvanced(false);
			// Apply preset settings
			const presetProfile = getQualityPreset(preset);
			onQualityChange(presetProfile);
		}
	};

	const handleVideoSettingChange = (
		field: keyof VideoQualitySettings,
		value: number | string | null,
	) => {
		onQualityChange({
			...qualityProfile,
			video: {
				...(qualityProfile.video || {
					width: null,
					height: null,
					bitrate: null,
					frameRate: null,
					codec: null,
				}),
				[field]: value === '' ? null : value,
			},
		});
	};

	const handleAudioSettingChange = (
		field: keyof AudioQualitySettings,
		value: number | string | null,
	) => {
		onQualityChange({
			...qualityProfile,
			audio: {
				...(qualityProfile.audio || {
					sampleRate: null,
					bitrate: null,
					channels: null,
					codec: null,
				}),
				[field]: value === '' ? null : value,
			},
		});
	};

	// Validate quality settings and update warnings
	useEffect(() => {
		const newWarnings: string[] = [];

		if (qualityProfile.preset !== 'custom') {
			setWarnings([]);
			return;
		}

		// Video validation
		if (hasVideo && qualityProfile.video) {
			const { width, height, bitrate, frameRate } = qualityProfile.video;

			// Extreme video bitrate warnings
			if (bitrate !== null) {
				if (bitrate > 50_000_000) {
					// >50 Mbps
					newWarnings.push(
						'Very high video bitrate (>50 Mbps) may cause slow encoding and large files.',
					);
				} else if (bitrate < 500_000) {
					// <500 kbps
					newWarnings.push('Very low video bitrate (<500 kbps) may result in poor quality.');
				}
			}

			// Resolution warnings
			if (width !== null && height !== null) {
				const totalPixels = width * height;
				if (totalPixels > 8294400) {
					// >4K (3840x2160)
					newWarnings.push('Resolution exceeds 4K - may be slow to encode on some devices.');
				} else if (totalPixels < 76800) {
					// <320x240
					newWarnings.push('Very low resolution (<320x240) - output may look pixelated.');
				}
			}

			// Frame rate warnings
			if (frameRate !== null) {
				if (frameRate > 120) {
					newWarnings.push('Very high frame rate (>120 fps) may not be supported by all players.');
				} else if (frameRate < 15) {
					newWarnings.push('Low frame rate (<15 fps) may appear choppy.');
				}
			}

			// Dimension validation
			if ((width !== null && width <= 0) || (height !== null && height <= 0)) {
				newWarnings.push('Width and height must be greater than 0.');
			}
			if (bitrate !== null && bitrate <= 0) {
				newWarnings.push('Video bitrate must be greater than 0.');
			}
			if (frameRate !== null && frameRate <= 0) {
				newWarnings.push('Frame rate must be greater than 0.');
			}
		}

		// Audio validation
		if (hasAudio && qualityProfile.audio) {
			const { sampleRate, bitrate, channels } = qualityProfile.audio;

			// Audio bitrate warnings
			if (bitrate !== null) {
				if (bitrate > 512_000) {
					// >512 kbps
					newWarnings.push('Very high audio bitrate (>512 kbps) - diminishing returns on quality.');
				} else if (bitrate < 64_000) {
					// <64 kbps
					newWarnings.push('Very low audio bitrate (<64 kbps) may sound distorted.');
				}
			}

			// Sample rate warnings
			if (sampleRate !== null) {
				if (sampleRate > 96000) {
					// >96 kHz
					newWarnings.push('Very high sample rate (>96 kHz) - larger files with minimal benefit.');
				} else if (sampleRate < 22050) {
					// <22.05 kHz
					newWarnings.push('Low sample rate (<22 kHz) - may affect audio quality.');
				}
			}

			// Validation errors
			if (sampleRate !== null && sampleRate <= 0) {
				newWarnings.push('Sample rate must be greater than 0.');
			}
			if (bitrate !== null && bitrate <= 0) {
				newWarnings.push('Audio bitrate must be greater than 0.');
			}
			if (channels !== null && channels < 1) {
				newWarnings.push('Channels must be at least 1.');
			}
		}

		setWarnings(newWarnings);
	}, [qualityProfile, hasVideo, hasAudio]);

	return (
		<div className="form-control w-full space-y-4">
			{/* Preset Selection */}
			<fieldset>
				<legend className="label">
					<span className="label-text font-medium">Quality Preset</span>
				</legend>
				<div className="space-y-2">
					{/* Preset Radio Buttons */}
					<div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Quality preset selection">
						{(['high', 'balanced', 'small'] as const).map(preset => (
							<label
								key={preset}
								className={`
									flex-1 min-w-[150px] cursor-pointer rounded-lg border-2 p-3 transition-all
									${
							qualityProfile.preset === preset
								? 'border-primary bg-primary/10'
								: 'border-base-300 hover:border-base-content/20'
							}
									${disabled ? 'opacity-50 cursor-not-allowed' : ''}
								`}
							>
								<input
									type="radio"
									name="quality-preset"
									value={preset}
									checked={qualityProfile.preset === preset}
									onChange={e => handlePresetChange(e.target.value as QualityPreset)}
									disabled={disabled}
									className="radio radio-primary radio-sm mr-2"
									aria-describedby={`preset-${preset}-desc`}
								/>
								<div>
									<div className="font-medium capitalize">{preset}</div>
									<div id={`preset-${preset}-desc`} className="text-xs text-base-content/70 mt-1">
										{PRESET_DESCRIPTIONS[preset]}
									</div>
								</div>
							</label>
						))}
					</div>

					{/* Custom Preset Toggle */}
					<div>
						<label
							className={`
								cursor-pointer rounded-lg border-2 p-3 transition-all flex items-start
								${
		qualityProfile.preset === 'custom'
			? 'border-primary bg-primary/10'
			: 'border-base-300 hover:border-base-content/20'
		}
								${disabled ? 'opacity-50 cursor-not-allowed' : ''}
							`}
						>
							<input
								type="radio"
								name="quality-preset"
								value="custom"
								checked={qualityProfile.preset === 'custom'}
								onChange={e => handlePresetChange(e.target.value as QualityPreset)}
								disabled={disabled}
								className="radio radio-primary radio-sm mr-2"
								aria-describedby="preset-custom-desc"
							/>
							<div>
								<div className="font-medium">Custom</div>
								<div id="preset-custom-desc" className="text-xs text-base-content/70 mt-1">
									Manually configure video and audio settings
								</div>
							</div>
						</label>
					</div>
				</div>
			</fieldset>

			{/* Advanced Settings (shown when Custom is selected) */}
			{showAdvanced && qualityProfile.preset === 'custom' && (
				<div className="space-y-4 rounded-lg border border-base-300 p-4 bg-base-200/50">
					<div className="flex justify-between items-center">
						<h3 className="font-medium text-sm">Advanced Settings</h3>
						<span className="text-xs text-base-content/60">
							Leave blank to preserve source settings
						</span>
					</div>

					{/* Video Settings */}
					{hasVideo && (
						<div className="space-y-3">
							<h4 className="font-medium text-sm text-base-content/80">Video Quality</h4>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
								{/* Width */}
								<div className="form-control">
									<label className="label py-1">
										<span className="label-text text-xs">Width (px)</span>
									</label>
									<input
										type="number"
										placeholder="Auto"
										value={qualityProfile.video?.width ?? ''}
										onChange={e =>
											handleVideoSettingChange(
												'width',
												e.target.value ? parseInt(e.target.value) : null,
											)}
										disabled={disabled}
										min={1}
										className="input input-bordered input-sm w-full"
										aria-describedby={warnings.length > 0 ? 'quality-warnings' : undefined}
										aria-invalid={warnings.length > 0}
									/>
								</div>

								{/* Height */}
								<div className="form-control">
									<label className="label py-1">
										<span className="label-text text-xs">Height (px)</span>
									</label>
									<input
										type="number"
										placeholder="Auto"
										value={qualityProfile.video?.height ?? ''}
										onChange={e =>
											handleVideoSettingChange(
												'height',
												e.target.value ? parseInt(e.target.value) : null,
											)}
										disabled={disabled}
										min={1}
										className="input input-bordered input-sm w-full"
									/>
								</div>

								{/* Bitrate */}
								<div className="form-control">
									<label className="label py-1">
										<span className="label-text text-xs">Bitrate (Mbps)</span>
									</label>
									<input
										type="number"
										placeholder="Auto"
										value={
											qualityProfile.video?.bitrate
												? (qualityProfile.video.bitrate / 1_000_000).toFixed(1)
												: ''
										}
										onChange={e =>
											handleVideoSettingChange(
												'bitrate',
												e.target.value ? parseFloat(e.target.value) * 1_000_000 : null,
											)}
										disabled={disabled}
										min={0.1}
										step={0.1}
										className="input input-bordered input-sm w-full"
									/>
								</div>

								{/* Frame Rate */}
								<div className="form-control">
									<label className="label py-1">
										<span className="label-text text-xs">Frame Rate (fps)</span>
									</label>
									<input
										type="number"
										placeholder="Auto"
										value={qualityProfile.video?.frameRate ?? ''}
										onChange={e =>
											handleVideoSettingChange(
												'frameRate',
												e.target.value ? parseFloat(e.target.value) : null,
											)}
										disabled={disabled}
										min={1}
										step={0.1}
										className="input input-bordered input-sm w-full"
									/>
								</div>
							</div>
						</div>
					)}

					{/* Audio Settings */}
					{hasAudio && (
						<div className="space-y-3">
							<h4 className="font-medium text-sm text-base-content/80">Audio Quality</h4>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
								{/* Sample Rate */}
								<div className="form-control">
									<label className="label py-1">
										<span className="label-text text-xs">Sample Rate (kHz)</span>
									</label>
									<input
										type="number"
										placeholder="Auto"
										value={
											qualityProfile.audio?.sampleRate
												? (qualityProfile.audio.sampleRate / 1000).toFixed(1)
												: ''
										}
										onChange={e =>
											handleAudioSettingChange(
												'sampleRate',
												e.target.value ? parseFloat(e.target.value) * 1000 : null,
											)}
										disabled={disabled}
										min={8}
										step={0.1}
										className="input input-bordered input-sm w-full"
									/>
								</div>

								{/* Bitrate */}
								<div className="form-control">
									<label className="label py-1">
										<span className="label-text text-xs">Bitrate (kbps)</span>
									</label>
									<input
										type="number"
										placeholder="Auto"
										value={
											qualityProfile.audio?.bitrate
												? (qualityProfile.audio.bitrate / 1000).toFixed(0)
												: ''
										}
										onChange={e =>
											handleAudioSettingChange(
												'bitrate',
												e.target.value ? parseInt(e.target.value) * 1000 : null,
											)}
										disabled={disabled}
										min={32}
										className="input input-bordered input-sm w-full"
									/>
								</div>

								{/* Channels */}
								<div className="form-control">
									<label className="label py-1">
										<span className="label-text text-xs">Channels</span>
									</label>
									<select
										value={qualityProfile.audio?.channels ?? ''}
										onChange={e =>
											handleAudioSettingChange(
												'channels',
												e.target.value ? parseInt(e.target.value) : null,
											)}
										disabled={disabled}
										className="select select-bordered select-sm w-full"
									>
										<option value="">Auto</option>
										<option value="1">Mono (1)</option>
										<option value="2">Stereo (2)</option>
									</select>
								</div>
							</div>
						</div>
					)}
				</div>
			)}

			{/* Help Text */}
			{!showAdvanced && (
				<div className="alert alert-info text-xs">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						className="stroke-current shrink-0 w-4 h-4"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						>
						</path>
					</svg>
					<span>
						Higher quality settings result in larger file sizes. Balanced is recommended for most
						use cases.
					</span>
				</div>
			)}

			{/* Validation Warnings */}
			{warnings.length > 0 && (
				<div id="quality-warnings" className="alert alert-warning text-xs" role="alert" aria-live="polite">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						className="stroke-current shrink-0 w-4 h-4"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						>
						</path>
					</svg>
					<div className="flex-1">
						<div className="font-medium">Quality Setting Warnings:</div>
						<ul className="list-disc list-inside mt-1 space-y-1">
							{warnings.map((warning, index) => (
								<li key={index}>{warning}</li>
							))}
						</ul>
					</div>
				</div>
			)}
		</div>
	);
}
