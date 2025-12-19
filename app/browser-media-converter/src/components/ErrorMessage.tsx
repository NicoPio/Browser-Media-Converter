/**
 * Error message display component
 */

import { ConversionError, ConversionErrorType } from '../types/conversion.types';

interface ErrorMessageProps {
	/** Error to display */
	error: Error | null;
	/** Callback to dismiss/clear the error */
	onDismiss?: () => void;
	/** Whether to show the dismiss button */
	showDismiss?: boolean;
}

export function ErrorMessage({ error, onDismiss, showDismiss = true }: ErrorMessageProps) {
	if (!error) {
		return null;
	}

	// Get user-friendly message
	let userMessage: string;
	let errorType: ConversionErrorType | null = null;

	if (error instanceof ConversionError) {
		userMessage = error.userMessage;
		errorType = error.type;
	} else {
		userMessage = error.message || 'An unexpected error occurred.';
	}

	// Determine alert type based on error
	const isWarning
		= errorType === ConversionErrorType.VALIDATION_ERROR
			|| errorType === ConversionErrorType.CANCELLED;

	const alertClass = isWarning ? 'alert-warning' : 'alert-error';
	const ariaLive = isWarning ? 'polite' : 'assertive';

	return (
		<div className={`alert ${alertClass} shadow-lg`} role="alert" aria-live={ariaLive} aria-atomic="true">
			<div className="flex-1">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="h-6 w-6 flex-shrink-0 stroke-current"
					fill="none"
					viewBox="0 0 24 24"
				>
					{isWarning
						? (
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
								/>
							)
						: (
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							)}
				</svg>
				<div className="ml-3">
					<h3 className="font-bold">{isWarning ? 'Warning' : 'Error'}</h3>
					<p className="text-sm">{userMessage}</p>
					{error instanceof ConversionError && error.originalError && (
						<details className="mt-2">
							<summary className="cursor-pointer text-xs opacity-70 hover:opacity-100">
								Technical Details
							</summary>
							<pre className="mt-1 text-xs opacity-70 overflow-x-auto">
								{error.originalError.message}
							</pre>
						</details>
					)}
				</div>
			</div>
			{showDismiss && onDismiss && (
				<button
					className="btn btn-sm btn-ghost"
					onClick={onDismiss}
					aria-label="Dismiss error"
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
	);
}
