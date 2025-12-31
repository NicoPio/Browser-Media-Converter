/**
 * Conversion queue component for displaying batch conversion progress
 */

import { motion, AnimatePresence } from 'framer-motion';
import type { ConversionJob } from '../types/conversion.types';
import { ProgressBar } from './ProgressBar';
import { formatBytes } from '../utils/fileSize';
import { downloadFile } from '../services/downloadService';

interface ConversionQueueProps {
	/** Array of conversion jobs */
	jobs: ConversionJob[];
	/** Callback to cancel a job */
	onCancel?: (jobId: string) => void | Promise<void>;
	/** Callback to remove a job */
	onRemove?: (jobId: string) => void;
	/** Callback after a file is downloaded */
	onDownloadComplete?: (jobId: string) => void;
	/** Whether actions are disabled */
	disabled?: boolean;
}

export function ConversionQueue({ jobs, onCancel, onRemove, onDownloadComplete, disabled = false }: ConversionQueueProps) {
	if (jobs.length === 0) {
		return null;
	}

	const getStatusBadge = (status: ConversionJob['status']) => {
		switch (status) {
			case 'queued':
				return <span className="badge badge-ghost badge-sm">Queued</span>;
			case 'initializing':
				return <span className="badge badge-info badge-sm">Initializing</span>;
			case 'converting':
				return <span className="badge badge-primary badge-sm">Converting</span>;
			case 'finalizing':
				return <span className="badge badge-primary badge-sm">Finalizing</span>;
			case 'completed':
				return <span className="badge badge-success badge-sm">Completed</span>;
			case 'failed':
				return <span className="badge badge-error badge-sm">Failed</span>;
			case 'cancelled':
				return <span className="badge badge-warning badge-sm">Cancelled</span>;
		}
	};

	const isProcessing = (status: ConversionJob['status']) => {
		return status === 'initializing' || status === 'converting' || status === 'finalizing';
	};

	return (
		<div className="space-y-3" role="list" aria-label="Conversion queue">
			<AnimatePresence mode="popLayout">
				{jobs.map((job, index) => (
					<motion.div
						key={job.id}
						className="rounded-lg border border-base-300 bg-base-100 p-4"
						role="listitem"
						layout
						initial={{ opacity: 0, y: 20, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, x: -100, scale: 0.95 }}
						transition={{
							duration: 0.3,
							delay: index * 0.05,
							layout: { duration: 0.3 },
						}}
						whileHover={{ scale: 1.01, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
					>
					{/* File info and status */}
					<div className="flex items-start justify-between gap-3 mb-3">
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2">
								<p className="truncate text-sm font-medium text-base-content">
									{job.sourceFile.name}
								</p>
								<span role="status" aria-label={`Status: ${job.status}`}>
									{getStatusBadge(job.status)}
								</span>
							</div>
							<div className="mt-1 flex items-center gap-2 text-xs text-base-content/60">
								<span>{formatBytes(job.sourceFile.size)}</span>
								<span>→</span>
								<span>{job.targetFormat.displayName}</span>
								{job.result && (
									<>
										<span>•</span>
										<span>{formatBytes(job.result.size)}</span>
									</>
								)}
							</div>
						</div>

						<div className="flex items-center gap-2">
							{job.status === 'completed' && job.result && (
								<button
									className="btn btn-success btn-sm"
									onClick={() => {
										downloadFile(job.result!);
										// Trigger callback after download starts
										if (onDownloadComplete) {
											setTimeout(() => {
												onDownloadComplete(job.id);
											}, 500);
										}
									}}
									disabled={disabled}
									aria-label={`Download ${job.result.filename}`}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-4 w-4"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
										/>
									</svg>
									Download
								</button>
							)}

							{isProcessing(job.status) && onCancel && (
								<button
									className="btn btn-error btn-sm"
									onClick={() => void onCancel(job.id)}
									disabled={disabled}
									aria-label={`Cancel conversion of ${job.sourceFile.name}`}
								>
									Cancel
								</button>
							)}

							{(job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled')
								&& onRemove && (
								<button
									className="btn btn-ghost btn-sm btn-circle"
									onClick={() => onRemove(job.id)}
									disabled={disabled}
									aria-label="Remove job"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-4 w-4"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</button>
							)}
						</div>
					</div>

					{/* Progress bar for active jobs */}
					{isProcessing(job.status) && (
						<>
							<ProgressBar
								progress={job.progress}
								showPercentage={true}
								size="sm"
							/>
							{job.startedAt && (
								<motion.div
									className="mt-2 flex items-center justify-between text-xs text-base-content/60"
									initial={{ opacity: 0, y: -5 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.2 }}
								>
									<span>
										{job.status === 'converting' && 'Converting...'}
										{job.status === 'initializing' && 'Initializing...'}
										{job.status === 'finalizing' && 'Finalizing...'}
									</span>
									{job.progress > 5 && job.estimatedDuration && (
										<span>
											~
											{Math.max(0, Math.round(job.estimatedDuration * (100 - job.progress) / 100))}
											s remaining
										</span>
									)}
								</motion.div>
							)}
						</>
					)}

					{/* Error message for failed jobs */}
					{job.status === 'failed' && job.error && (
						<div className="alert alert-error alert-sm mt-2" role="alert">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-4 w-4 shrink-0 stroke-current"
								fill="none"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<span className="text-xs">{job.error.message}</span>
						</div>
					)}
				</motion.div>
				))}
			</AnimatePresence>
		</div>
	);
}
