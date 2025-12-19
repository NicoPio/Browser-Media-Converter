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
		<div className="alert alert-info shadow-lg mb-6">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				className="h-6 w-6 shrink-0 stroke-current"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="2"
					d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
			<div className="flex-1">
				<h3 className="font-bold">Welcome to Browser Media Converter! 👋</h3>
				<div className="text-sm mt-2 space-y-1">
					<p>
						<strong>Quick start:</strong>
						{' '}
						Drag and drop a video or audio file to begin
					</p>
					<p>
						<strong>Privacy-first:</strong>
						{' '}
						All conversions happen locally in your browser - no uploads!
					</p>
					<p>
						<strong>Supported formats:</strong>
						{' '}
						MP4, MOV, WebM, MKV, WAV, MP3, Ogg, AAC, FLAC
					</p>
					<p className="text-xs text-base-content/70 mt-2">
						💡 Tip: You can convert multiple files at once by dropping several files together
					</p>
				</div>
			</div>
			<button
				className="btn btn-sm btn-ghost"
				onClick={handleDismiss}
				aria-label="Dismiss onboarding hints"
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
		</div>
	);
}
