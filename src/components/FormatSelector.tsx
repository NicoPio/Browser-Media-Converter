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
	const sameFormat = formats.find(f => f.format === 'same');
	const videoFormats = formats.filter(f => f.supportsVideo && f.format !== 'same' && f.format !== 'gif');
	const audioFormats = formats.filter(f => !f.supportsVideo && f.supportsAudio);
	const gifFormat = formats.find(f => f.format === 'gif');

	return (
		<div className="form-control w-full">
			<label htmlFor="format-select" className="label flex justify-between items-center flex-nowrap">
				<h3 className="label-text font-medium my-4 text-xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Output Format</h3>
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

				{sameFormat && (
					<optgroup label="Resize Only">
						<option
							key={sameFormat.format}
							value={sameFormat.format}
							disabled={!sameFormat.isEncodable}
						>
							{sameFormat.displayName}
							{!sameFormat.isEncodable && ' - Not supported'}
						</option>
					</optgroup>
				)}

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
								{!format.isEncodable && ' - Not supported'}
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
								{!format.isEncodable && ' - Not supported'}
							</option>
						))}
					</optgroup>
				)}

				{gifFormat && (
					<optgroup label="Image Formats">
						<option
							key={gifFormat.format}
							value={gifFormat.format}
							disabled={!gifFormat.isEncodable}
						>
							{gifFormat.displayName}
							{' '}
							(
							{gifFormat.extension}
							)
						</option>
					</optgroup>
				)}
			</select>

			{selectedFormat && (
				<>
					{!('isEncodable' in selectedFormat) || (selectedFormat as OutputFormatWithSupport).isEncodable
						? (
								<label className="label mt-4">
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
										<strong>Unsupported format:</strong>
										{' '}
										Your browser cannot encode
										{' '}
										{selectedFormat.displayName}
										{' '}
										format. Please choose another format (MP3, Opus, WAV recommended).
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
				<div
					id="format-guide"
					className="mt-3 rounded-xl border border-primary/30 bg-primary/5 backdrop-blur-sm p-4 shadow-lg shadow-primary/5"
					role="region"
					aria-label="Format guide"
				>
					<div className="flex items-start gap-3">
						<div className="shrink-0 rounded-full bg-primary/10 p-1.5">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								className="h-4 w-4 stroke-primary"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								>
								</path>
							</svg>
						</div>
						<div className="text-left text-xs">
							<p className="font-medium text-base-content">Quick Guide:</p>
							<ul className="mt-1.5 space-y-1 text-base-content/80">
								<li>
									<span className="font-medium text-base-content">MP4/MOV:</span>
									{' '}
									Best for universal compatibility and sharing
								</li>
								<li>
									<span className="font-medium text-base-content">WebM:</span>
									{' '}
									Optimized for web playback, open-source
								</li>
								<li>
									<span className="font-medium text-base-content">MKV:</span>
									{' '}
									Flexible container, great for archiving
								</li>
								<li>
									<span className="font-medium text-base-content">WAV/FLAC:</span>
									{' '}
									Lossless audio, perfect quality
								</li>
								<li>
									<span className="font-medium text-base-content">MP3/AAC:</span>
									{' '}
									Compressed audio, smaller files
								</li>
							</ul>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
