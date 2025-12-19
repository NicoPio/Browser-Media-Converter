/**
 * Settings menu component for user preferences
 */

import { useState } from 'react';

interface SettingsMenuProps {
	autoCleanupAfterDownload: boolean;
	showOnboardingHints: boolean;
	onAutoCleanupChange: (enabled: boolean) => void;
	onShowHintsChange: (enabled: boolean) => void;
}

export function SettingsMenu({
	autoCleanupAfterDownload,
	showOnboardingHints,
	onAutoCleanupChange,
	onShowHintsChange,
}: SettingsMenuProps) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="dropdown dropdown-end">
			<button
				className="btn btn-ghost btn-sm btn-circle"
				onClick={() => setIsOpen(!isOpen)}
				aria-label="Open settings menu"
				aria-expanded={isOpen}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
					/>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
					/>
				</svg>
			</button>

			{isOpen && (
				<div
					className="dropdown-content menu bg-base-100 rounded-box z-50 w-72 p-4 shadow-xl border border-base-300 mt-2"
					role="menu"
				>
					<h3 className="font-bold text-lg mb-3">Settings</h3>

					{/* Auto-cleanup setting */}
					<div className="form-control mb-3">
						<label className="label cursor-pointer justify-start gap-3" htmlFor="auto-cleanup">
							<input
								id="auto-cleanup"
								type="checkbox"
								className="toggle toggle-primary"
								checked={autoCleanupAfterDownload}
								onChange={(e) => onAutoCleanupChange(e.target.checked)}
								aria-label="Auto-cleanup after download"
							/>
							<div className="flex-1">
								<span className="label-text font-medium">Auto-cleanup downloads</span>
								<p className="text-xs text-base-content/60 mt-1">
									Automatically remove completed conversions after downloading
								</p>
							</div>
						</label>
					</div>

					{/* Show hints setting */}
					<div className="form-control">
						<label className="label cursor-pointer justify-start gap-3" htmlFor="show-hints">
							<input
								id="show-hints"
								type="checkbox"
								className="toggle toggle-primary"
								checked={showOnboardingHints}
								onChange={(e) => onShowHintsChange(e.target.checked)}
								aria-label="Show onboarding hints"
							/>
							<div className="flex-1">
								<span className="label-text font-medium">Show helpful hints</span>
								<p className="text-xs text-base-content/60 mt-1">
									Display tooltips and guidance for first-time users
								</p>
							</div>
						</label>
					</div>

					<div className="divider my-2"></div>

					<button
						className="btn btn-ghost btn-sm w-full justify-start"
						onClick={() => setIsOpen(false)}
						aria-label="Close settings menu"
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
						Close
					</button>
				</div>
			)}
		</div>
	);
}
