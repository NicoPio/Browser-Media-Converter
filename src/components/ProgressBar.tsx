/**
 * Progress bar component for conversion progress
 */

import { motion } from 'framer-motion';

interface ProgressBarProps {
	/** Progress percentage (0-100) */
	progress: number;
	/** Optional status message */
	status?: string;
	/** Whether to show the percentage text */
	showPercentage?: boolean;
	/** Size variant */
	size?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({ progress, status, showPercentage = true, size = 'md' }: ProgressBarProps) {
	const clampedProgress = Math.max(0, Math.min(100, progress));

	const sizeClasses = {
		sm: 'h-2',
		md: 'h-4',
		lg: 'h-6',
	};

	const ariaLabel = status ? `${status}: ${clampedProgress}% complete` : `${clampedProgress}% complete`;

	return (
		<div className="w-full">
			{(status || showPercentage) && (
				<div className="mb-2 flex items-center justify-between text-sm" aria-live="polite" aria-atomic="true">
					{status && <span className="text-base-content/70">{status}</span>}
					{showPercentage && (
						<span className="font-medium text-base-content">
							{clampedProgress}
							%
						</span>
					)}
				</div>
			)}

			<div className={`w-full bg-base-300 rounded-full overflow-hidden ${sizeClasses[size]}`}>
				<motion.div
					className="bg-primary h-full relative overflow-hidden"
					initial={{ width: 0 }}
					animate={{ width: `${clampedProgress}%` }}
					transition={{ duration: 0.5, ease: 'easeOut' }}
					role="progressbar"
					aria-valuenow={clampedProgress}
					aria-valuemin={0}
					aria-valuemax={100}
					aria-label={ariaLabel}
				>
					{clampedProgress > 0 && clampedProgress < 100 && (
						<motion.div
							className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
							animate={{ x: ['-100%', '200%'] }}
							transition={{
								duration: 1.5,
								repeat: Number.POSITIVE_INFINITY,
								ease: 'linear',
							}}
						/>
					)}
					{clampedProgress === 100 && (
						<motion.div
							className="absolute inset-0 bg-success"
							initial={{ scale: 0, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{ duration: 0.3, ease: 'backOut' }}
						/>
					)}
				</motion.div>
			</div>
		</div>
	);
}
