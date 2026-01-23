/**
 * File metadata display component
 */

import type { MediaFile } from '../types/media.types';
import { formatBytes } from '../utils/fileSize';
import { formatDuration } from '../utils/duration';
import { VideoThumbnail } from './VideoThumbnail';

interface FileMetadataProps {
	/** Media file with metadata */
	file: MediaFile;
	/** Whether to show in compact mode */
	compact?: boolean;
}

export function FileMetadata({ file, compact = false }: FileMetadataProps) {
	const { metadata } = file;

	if (!metadata) {
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
				<div className="flex flex-col sm:flex-row gap-4">
					<div className="flex-shrink-0 flex justify-center">
						<div className="skeleton w-full sm:w-48 h-32 rounded-lg"></div>
					</div>
					<div className="flex-1">
						<div className="mb-3 flex items-center gap-2">
							<h3 className="text-sm font-semibold text-base-content/90">File Information</h3>
							<span className="loading loading-spinner loading-xs"></span>
						</div>
						<div className="grid grid-cols-2 gap-2">
							{Array.from({ length: 6 }).map((_, i) => (
								<div key={i}>
									<div className="skeleton mb-1 h-3 w-16"></div>
									<div className="skeleton h-4 w-24"></div>
								</div>
							))}
						</div>
					</div>
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

	const infoItems = [
		{ label: 'Format', value: metadata.format.toUpperCase() },
		metadata.duration > 0 && { label: 'Duration', value: formatDuration(metadata.duration) },
		{ label: 'File Size', value: formatBytes(file.size) },
		{
			label: 'Tracks',
			value: hasVideo && hasAudio ? 'Video + Audio'
				: hasVideo ? 'Video Only'
				: hasAudio ? 'Audio Only'
				: 'Unknown',
		},
		hasVideo && metadata.width && metadata.height && {
			label: 'Resolution',
			value: `${metadata.width}x${metadata.height}${
				metadata.height >= 2160 ? ' (4K)'
				: metadata.height >= 1080 ? ' (Full HD)'
				: metadata.height >= 720 ? ' (HD)'
				: ''
			}`,
		},
		hasVideo && metadata.videoCodec && { label: 'Video Codec', value: metadata.videoCodec.toUpperCase() },
		hasVideo && metadata.frameRate && { label: 'Frame Rate', value: `${metadata.frameRate.toFixed(2)} fps` },
		hasVideo && metadata.videoBitrate && { label: 'Video Bitrate', value: `${(metadata.videoBitrate / 1_000_000).toFixed(2)} Mbps` },
		hasAudio && metadata.audioCodec && { label: 'Audio Codec', value: metadata.audioCodec.toUpperCase() },
		hasAudio && metadata.sampleRate && { label: 'Sample Rate', value: `${(metadata.sampleRate / 1000).toFixed(1)} kHz` },
		hasAudio && metadata.channels && {
			label: 'Channels',
			value: metadata.channels === 1 ? 'Mono' : metadata.channels === 2 ? 'Stereo' : `${metadata.channels} Channels`,
		},
		hasAudio && metadata.audioBitrate && { label: 'Audio Bitrate', value: `${(metadata.audioBitrate / 1000).toFixed(0)} kbps` },
	].filter(Boolean) as { label: string; value: string }[];

	return (
		<div className="rounded-lg border border-base-300 bg-base-200/50 p-4">
			<div className="flex flex-col sm:flex-row gap-4">
				{hasVideo && (
					<div className="flex-shrink-0 flex justify-center sm:justify-start">
						<VideoThumbnail
							thumbnailUrl={file.thumbnailUrl}
							alt={`Preview of ${file.name}`}
							size="lg"
							className="w-full sm:w-48"
						/>
					</div>
				)}

				<div className="flex-1 min-w-0">
					<h3 className="mb-3 text-sm font-semibold text-base-content/90">File Information</h3>
					<div className="grid grid-cols-2 gap-x-4 gap-y-2">
						{infoItems.map((item) => (
							<div key={item.label} className="min-w-0">
								<dt className="text-xs text-base-content/60">{item.label}</dt>
								<dd className="text-sm font-medium truncate">{item.value}</dd>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
