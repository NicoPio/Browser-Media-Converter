/**
 * Output format selector component
 */

import { useState } from 'react';
import type { OutputFormat, OutputFormatWithSupport } from '../constants/formats';

interface FormatSelectorProps {
	/** Available output formats */
	formats: OutputFormatWithSupport[];
	/** Currently selected format */
	selectedFormat: OutputFormat | null;
	/** Callback when format is selected */
	onFormatSelect: (format: OutputFormat) => void;
	/** Whether the selector is disabled */
	disabled?: boolean;
	/** Show detailed format information */
	showDetails?: boolean;
}

export function FormatSelector({
	formats,
	selectedFormat,
	onFormatSelect,
	disabled = false,
	showDetails = true,
}: FormatSelectorProps) {
	const [showTooltip, setShowTooltip] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const format = formats.find(f => f.format === e.target.value);
		if (format) {
			onFormatSelect(format);
		}
	};

	// Group formats by type
	const videoFormats = formats.filter(f => f.supportsVideo);
	const audioFormats = formats.filter(f => !f.supportsVideo && f.supportsAudio);

	return (
		<div className="form-control w-full">
			<label htmlFor="format-select" className="label">
				<span className="label-text font-medium">Output Format</span>
				{showDetails && (
					<button
						type="button"
						className="label-text-alt link link-hover"
						onClick={() => setShowTooltip(!showTooltip)}
						aria-expanded={showTooltip}
						aria-controls="format-guide"
					>
						{showTooltip ? 'Hide' : 'Show'}
						{' '}
						format guide
					</button>
				)}
			</label>

			<select
				id="format-select"
				className="select select-bordered w-full"
				value={selectedFormat?.format || ''}
				onChange={handleChange}
				disabled={disabled || formats.length === 0}
				aria-label="Select output format"
				aria-describedby={selectedFormat ? 'format-description' : undefined}
			>
				<option value="" disabled>
					{formats.length === 0 ? 'No compatible formats' : 'Select output format'}
				</option>

				{videoFormats.length > 0 && (
					<optgroup label="Video Formats">
						{videoFormats.map(format => (
							<option
								key={format.format}
								value={format.format}
								disabled={!format.isEncodable}
							>
								{format.displayName}
								{' '}
								(
								{format.extension}
								)
								{!format.isEncodable && ' - Non supporté'}
							</option>
						))}
					</optgroup>
				)}

				{audioFormats.length > 0 && (
					<optgroup label="Audio Formats">
						{audioFormats.map(format => (
							<option
								key={format.format}
								value={format.format}
								disabled={!format.isEncodable}
							>
								{format.displayName}
								{' '}
								(
								{format.extension}
								)
								{!format.isEncodable && ' - Non supporté'}
							</option>
						))}
					</optgroup>
				)}
			</select>

			{selectedFormat && (
				<>
					{!('isEncodable' in selectedFormat) || (selectedFormat as OutputFormatWithSupport).isEncodable
						? (
								<label className="label">
									<span id="format-description" className="label-text-alt text-base-content/60">
										{selectedFormat.description}
									</span>
								</label>
							)
						: (
								<div className="alert alert-warning mt-2 text-xs">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-5 w-5 shrink-0 stroke-current"
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
										<strong>Format non supporté :</strong>
										{' '}
										Votre navigateur ne peut pas encoder le format
										{' '}
										{selectedFormat.displayName}
										. Veuillez choisir un autre format (MP3, Opus, WAV recommandés).
									</span>
								</div>
							)}

					{showDetails && (
						<div className="mt-2 rounded-md bg-base-200/50 p-3 text-sm">
							<div className="flex items-start gap-2">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-4 w-4 shrink-0 text-info"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								<div className="flex-1">
									<p className="text-xs text-base-content/70">
										<span className="font-medium">Recommended codecs:</span>
										{' '}
										{selectedFormat.recommendedCodecs.video.length > 0 && (
											<span>
												Video:
												{' '}
												{selectedFormat.recommendedCodecs.video.join(', ')}
												{selectedFormat.recommendedCodecs.audio.length > 0 && ' • '}
											</span>
										)}
										{selectedFormat.recommendedCodecs.audio.length > 0 && (
											<span>
												Audio:
												{selectedFormat.recommendedCodecs.audio.join(', ')}
											</span>
										)}
									</p>
								</div>
							</div>
						</div>
					)}
				</>
			)}

			{showTooltip && (
				<div id="format-guide" className="alert alert-info mt-3 text-xs" role="region" aria-label="Format guide">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						className="h-5 w-5 shrink-0 stroke-current"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						>
						</path>
					</svg>
					<div className="text-left">
						<p className="font-medium">Quick Guide:</p>
						<ul className="mt-1 space-y-1">
							<li>
								<strong>MP4/MOV:</strong>
								{' '}
								Best for universal compatibility and sharing
							</li>
							<li>
								<strong>WebM:</strong>
								{' '}
								Optimized for web playback, open-source
							</li>
							<li>
								<strong>MKV:</strong>
								{' '}
								Flexible container, great for archiving
							</li>
							<li>
								<strong>WAV/FLAC:</strong>
								{' '}
								Lossless audio, perfect quality
							</li>
							<li>
								<strong>MP3/AAC:</strong>
								{' '}
								Compressed audio, smaller files
							</li>
						</ul>
					</div>
				</div>
			)}
		</div>
	);
}
