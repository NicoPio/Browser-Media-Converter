/**
 * File metadata display component
 */

import type { MediaFile } from '../types/media.types';
import { formatBytes } from '../utils/fileSize';
import { formatDuration } from '../utils/duration';

interface FileMetadataProps {
	/** Media file with metadata */
	file: MediaFile;
	/** Whether to show in compact mode */
	compact?: boolean;
}

export function FileMetadata({ file, compact = false }: FileMetadataProps) {
	const { metadata } = file;

	if (!metadata) {
		// Loading skeleton matching the full layout
		if (compact) {
			return (
				<div className="flex items-center gap-2 text-sm">
					<div className="skeleton h-4 w-24"></div>
					<span className="text-base-content/40">•</span>
					<div className="skeleton h-4 w-16"></div>
					<span className="text-base-content/40">•</span>
					<div className="skeleton h-4 w-20"></div>
				</div>
			);
		}

		return (
			<div className="rounded-lg border border-base-300 bg-base-200/50 p-4">
				<div className="mb-3 flex items-center gap-2">
					<h3 className="text-sm font-semibold text-base-content/90">File Information</h3>
					<span className="loading loading-spinner loading-xs"></span>
				</div>

				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					{/* Skeleton items matching actual grid */}
					{Array.from({ length: 6 }).map((_, i) => (
						<div key={i}>
							<div className="skeleton mb-1 h-3 w-20"></div>
							<div className="skeleton h-4 w-32"></div>
						</div>
					))}
				</div>
			</div>
		);
	}

	const { hasVideo, hasAudio } = metadata;

	if (compact) {
		return (
			<div className="text-sm text-base-content/70">
				<span className="font-medium">{metadata.format.toUpperCase()}</span>
				{metadata.duration > 0 && (
					<span>
						{' '}
						•
						{formatDuration(metadata.duration)}
					</span>
				)}
				{hasVideo && metadata.width && metadata.height && (
					<span>
						{' '}
						•
						{metadata.width}
						x
						{metadata.height}
					</span>
				)}
				<span>
					{' '}
					•
					{formatBytes(file.size)}
				</span>
			</div>
		);
	}

	return (
		<div className="rounded-lg border border-base-300 bg-base-200/50 p-4">
			<h3 className="mb-3 text-sm font-semibold text-base-content/90">File Information</h3>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
				{/* Format & Duration */}
				<div>
					<dt className="text-xs text-base-content/60">Format</dt>
					<dd className="text-sm font-medium">{metadata.format.toUpperCase()}</dd>
				</div>

				{metadata.duration > 0 && (
					<div>
						<dt className="text-xs text-base-content/60">Duration</dt>
						<dd className="text-sm font-medium">{formatDuration(metadata.duration)}</dd>
					</div>
				)}

				{/* File Size */}
				<div>
					<dt className="text-xs text-base-content/60">File Size</dt>
					<dd className="text-sm font-medium">{formatBytes(file.size)}</dd>
				</div>

				{/* Track Types */}
				<div>
					<dt className="text-xs text-base-content/60">Tracks</dt>
					<dd className="text-sm font-medium">
						{hasVideo && hasAudio && 'Video + Audio'}
						{hasVideo && !hasAudio && 'Video Only'}
						{!hasVideo && hasAudio && 'Audio Only'}
						{!hasVideo && !hasAudio && 'Unknown'}
					</dd>
				</div>

				{/* Video Details */}
				{hasVideo && (
					<>
						{metadata.width && metadata.height && (
							<div>
								<dt className="text-xs text-base-content/60">Resolution</dt>
								<dd className="text-sm font-medium">
									{metadata.width}
									x
									{metadata.height}
									{metadata.height >= 2160 && ' (4K)'}
									{metadata.height >= 1080 && metadata.height < 2160 && ' (Full HD)'}
									{metadata.height >= 720 && metadata.height < 1080 && ' (HD)'}
								</dd>
							</div>
						)}

						{metadata.videoCodec && (
							<div>
								<dt className="text-xs text-base-content/60">Video Codec</dt>
								<dd className="text-sm font-medium">{metadata.videoCodec.toUpperCase()}</dd>
							</div>
						)}

						{metadata.frameRate && (
							<div>
								<dt className="text-xs text-base-content/60">Frame Rate</dt>
								<dd className="text-sm font-medium">
									{metadata.frameRate.toFixed(2)}
									{' '}
									fps
								</dd>
							</div>
						)}

						{metadata.videoBitrate && (
							<div>
								<dt className="text-xs text-base-content/60">Video Bitrate</dt>
								<dd className="text-sm font-medium">
									{(metadata.videoBitrate / 1_000_000).toFixed(2)}
									{' '}
									Mbps
								</dd>
							</div>
						)}
					</>
				)}

				{/* Audio Details */}
				{hasAudio && (
					<>
						{metadata.audioCodec && (
							<div>
								<dt className="text-xs text-base-content/60">Audio Codec</dt>
								<dd className="text-sm font-medium">{metadata.audioCodec.toUpperCase()}</dd>
							</div>
						)}

						{metadata.sampleRate && (
							<div>
								<dt className="text-xs text-base-content/60">Sample Rate</dt>
								<dd className="text-sm font-medium">
									{(metadata.sampleRate / 1000).toFixed(1)}
									{' '}
									kHz
								</dd>
							</div>
						)}

						{metadata.channels && (
							<div>
								<dt className="text-xs text-base-content/60">Channels</dt>
								<dd className="text-sm font-medium">
									{metadata.channels === 1 && 'Mono'}
									{metadata.channels === 2 && 'Stereo'}
									{metadata.channels > 2 && `${metadata.channels} Channels`}
								</dd>
							</div>
						)}

						{metadata.audioBitrate && (
							<div>
								<dt className="text-xs text-base-content/60">Audio Bitrate</dt>
								<dd className="text-sm font-medium">
									{(metadata.audioBitrate / 1000).toFixed(0)}
									{' '}
									kbps
								</dd>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}
