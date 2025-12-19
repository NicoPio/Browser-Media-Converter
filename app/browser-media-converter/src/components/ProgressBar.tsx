/**
 * Progress bar component for conversion progress
 */

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
				<div
					className={`bg-primary h-full transition-all duration-300 ease-out ${clampedProgress > 0 && clampedProgress < 100 ? 'animate-progress-pulse' : ''}`}
					style={{ width: `${clampedProgress}%` }}
					role="progressbar"
					aria-valuenow={clampedProgress}
					aria-valuemin={0}
					aria-valuemax={100}
					aria-label={ariaLabel}
				/>
			</div>
		</div>
	);
}
