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
		md: 'h-3',
		lg: 'h-5',
	};

	const ariaLabel = status ? `${status}: ${clampedProgress}% complete` : `${clampedProgress}% complete`;

	return (
		<div className="w-full">
			{(status || showPercentage) && (
				<div className="mb-3 flex items-center justify-between" aria-live="polite" aria-atomic="true">
					{status && (
						<span className="text-sm text-base-content/60 flex items-center gap-2">
							{clampedProgress < 100 ? (
								<motion.span
									animate={{ rotate: 360 }}
									transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
								>
									<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor">
										<path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
									</svg>
								</motion.span>
							) : (
								<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-success" viewBox="0 0 20 20" fill="currentColor">
									<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
								</svg>
							)}
							{status}
						</span>
					)}
					{showPercentage && (
						<motion.span
							className="text-lg font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"
							key={clampedProgress}
							initial={{ scale: 1.2, opacity: 0.5 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{ duration: 0.2 }}
						>
							{clampedProgress}%
						</motion.span>
					)}
				</div>
			)}

			<div className={`w-full bg-base-content/10 rounded-full overflow-hidden ${sizeClasses[size]} relative`}>
				<motion.div
					className="progress-warm h-full relative overflow-hidden rounded-full"
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
							className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
							animate={{ x: ['-100%', '200%'] }}
							transition={{
								duration: 1.2,
								repeat: Number.POSITIVE_INFINITY,
								ease: 'linear',
							}}
						/>
					)}
				</motion.div>

				{clampedProgress === 100 && (
					<motion.div
						className="absolute inset-0 rounded-full"
						initial={{ opacity: 0 }}
						animate={{ opacity: [0, 0.5, 0] }}
						transition={{ duration: 0.6 }}
						style={{
							background: 'linear-gradient(90deg, oklch(0.72 0.19 145), oklch(0.80 0.18 60))',
							boxShadow: '0 0 20px oklch(0.72 0.19 145 / 0.5)',
						}}
					/>
				)}
			</div>
		</div>
	);
}
