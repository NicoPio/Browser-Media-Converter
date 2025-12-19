/**
 * Conversion queue management hook for batch processing
 */

import { useState, useCallback, useRef } from 'react';
import type { ConversionJob, ConversionQueue, QueueStatistics } from '../types/conversion.types';
import { convert as convertService, cancel as cancelService } from '../services/conversionService';
import { ConversionError, ConversionErrorType } from '../types/conversion.types';

/**
 * Hook for managing a queue of conversion jobs
 */
export function useConversionQueue() {
	const [queue, setQueue] = useState<ConversionQueue>({
		jobs: [],
		activeJob: null,
		maxConcurrent: 1, // Process one at a time for simplicity
	});

	const processingRef = useRef(false);

	/**
	 * Add a job to the queue
	 */
	const addJob = useCallback((job: ConversionJob) => {
		setQueue(prev => ({
			...prev,
			jobs: [...prev.jobs, job],
		}));
	}, []);

	/**
	 * Remove a job from the queue
	 */
	const removeJob = useCallback((jobId: string) => {
		setQueue(prev => ({
			...prev,
			jobs: prev.jobs.filter(j => j.id !== jobId),
			activeJob: prev.activeJob?.id === jobId ? null : prev.activeJob,
		}));
	}, []);

	/**
	 * Update a specific job in the queue
	 */
	const updateJob = useCallback((jobId: string, updates: Partial<ConversionJob>) => {
		setQueue(prev => ({
			...prev,
			jobs: prev.jobs.map(j => (j.id === jobId ? { ...j, ...updates } : j)),
			activeJob: prev.activeJob?.id === jobId ? { ...prev.activeJob, ...updates } : prev.activeJob,
		}));
	}, []);

	/**
	 * Start processing the queue
	 */
	const startQueue = useCallback(async () => {
		if (processingRef.current) return;

		processingRef.current = true;

		// Process jobs sequentially
		while (true) {
			// Get fresh state
			let nextJob: ConversionJob | undefined;

			setQueue((prev) => {
				nextJob = prev.jobs.find(j => j.status === 'queued');
				if (!nextJob) {
					return prev;
				}

				// Mark as initializing
				return {
					...prev,
					activeJob: nextJob,
					jobs: prev.jobs.map(j =>
						j.id === nextJob!.id
							? { ...j, status: 'initializing' as const, startedAt: new Date() }
							: j,
					),
				};
			});

			if (!nextJob) break;

			try {
				// Update to converting status
				updateJob(nextJob.id, { status: 'converting' });

				// Perform conversion with progress tracking
				const result = await convertService({
					sourceFile: nextJob.sourceFile,
					targetFormat: nextJob.targetFormat,
					qualityProfile: nextJob.qualityProfile,
					onProgress: (progress) => {
						updateJob(nextJob!.id, { progress: Math.round(progress * 100) });
					},
				});

				// Update to completed
				updateJob(nextJob.id, {
					status: 'completed',
					progress: 100,
					result,
					completedAt: new Date(),
				});
			} catch (error) {
				// Mark as failed but continue with next job
				const conversionError = error instanceof Error ? error : new Error('Unknown error');
				updateJob(nextJob.id, {
					status: 'failed',
					error: conversionError,
					completedAt: new Date(),
				});
			}

			// Clear active job
			setQueue(prev => ({ ...prev, activeJob: null }));
		}

		processingRef.current = false;
	}, [updateJob]);

	/**
	 * Cancel a specific job
	 */
	const cancelJob = useCallback(
		async (jobId: string) => {
			const job = queue.jobs.find(j => j.id === jobId);
			if (!job) return;

			if (job.status === 'converting' || job.status === 'initializing') {
				try {
					await cancelService(jobId);
				} catch (error) {
					console.error('Failed to cancel job:', error);
				}
			}

			updateJob(jobId, {
				status: 'cancelled',
				error: new ConversionError(ConversionErrorType.CANCELLED, 'Conversion was cancelled by user.'),
				completedAt: new Date(),
			});
		},
		[queue.jobs, updateJob],
	);

	/**
	 * Cancel all jobs (queued and active)
	 */
	const cancelAll = useCallback(async () => {
		const jobsToCancel = queue.jobs.filter(
			j => j.status === 'queued' || j.status === 'initializing' || j.status === 'converting',
		);

		for (const job of jobsToCancel) {
			await cancelJob(job.id);
		}

		processingRef.current = false;
	}, [queue.jobs, cancelJob]);

	/**
	 * Clear completed jobs from the queue
	 */
	const clearCompleted = useCallback(() => {
		setQueue(prev => ({
			...prev,
			jobs: prev.jobs.filter(j => j.status !== 'completed'),
		}));
	}, []);

	/**
	 * Clear all jobs from the queue
	 */
	const clearAll = useCallback(() => {
		setQueue({
			jobs: [],
			activeJob: null,
			maxConcurrent: 1,
		});
		processingRef.current = false;
	}, []);

	/**
	 * Compute queue statistics
	 */
	const statistics: QueueStatistics = {
		totalJobs: queue.jobs.length,
		completedCount: queue.jobs.filter(j => j.status === 'completed').length,
		failedCount: queue.jobs.filter(j => j.status === 'failed').length,
		queuedCount: queue.jobs.filter(j => j.status === 'queued').length,
		activeCount: queue.jobs.filter(
			j => j.status === 'initializing' || j.status === 'converting' || j.status === 'finalizing',
		).length,
		overallProgress:
			queue.jobs.length > 0
				? Math.round(queue.jobs.reduce((sum, j) => sum + j.progress, 0) / queue.jobs.length)
				: 0,
		isProcessing: processingRef.current || queue.activeJob !== null,
		isComplete: queue.jobs.length > 0 && queue.jobs.every(j => j.status === 'completed' || j.status === 'failed'),
	};

	return {
		queue,
		statistics,
		addJob,
		removeJob,
		startQueue,
		cancelJob,
		cancelAll,
		clearCompleted,
		clearAll,
	};
}
