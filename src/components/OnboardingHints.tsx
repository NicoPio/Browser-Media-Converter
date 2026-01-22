/**
 * Onboarding hints component for first-time users
 */

import { useState } from 'react';

interface OnboardingHintsProps {
	/** Whether to show hints */
	show: boolean;
	/** Callback when hints are dismissed */
	onDismiss?: () => void;
}

export function OnboardingHints({ show, onDismiss }: OnboardingHintsProps) {
	const [isDismissed, setIsDismissed] = useState(false);

	if (!show || isDismissed) {
		return null;
	}

	const handleDismiss = () => {
		setIsDismissed(true);
		if (onDismiss) {
			onDismiss();
		}
	};

	return (
		<div className="relative mb-6 rounded-xl border border-primary/30 bg-primary/5 backdrop-blur-sm p-4 shadow-lg shadow-primary/5">
			<div className="flex items-start gap-4">
				<div className="shrink-0 rounded-full bg-primary/10 p-2">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						className="h-5 w-5 stroke-primary"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
				<div className="flex-1 min-w-0">
					<h3 className="font-semibold text-base-content">Welcome to Browser Media Converter! 👋</h3>
					<div className="text-sm mt-2 space-y-1.5 text-base-content/80">
						<p>
							<span className="font-medium text-base-content">Quick start:</span>
							{' '}
							Drag and drop a video or audio file to begin
						</p>
						<p>
							<span className="font-medium text-base-content">Privacy-first:</span>
							{' '}
							All conversions happen locally in your browser - no uploads!
						</p>
						<p>
							<span className="font-medium text-base-content">Supported formats:</span>
							{' '}
							MP4, MOV, WebM, MKV, WAV, MP3, Ogg, AAC, FLAC
						</p>
						<p className="text-xs text-base-content/60 mt-3 pt-2 border-t border-base-content/10">
							💡 Tip: You can convert multiple files at once by dropping several files together
						</p>
					</div>
				</div>
				<button
					className="shrink-0 rounded-full p-1.5 hover:bg-base-content/10 transition-colors"
					onClick={handleDismiss}
					aria-label="Dismiss onboarding hints"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-4 w-4 text-base-content/60"
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
			</div>
		</div>
	);
}
