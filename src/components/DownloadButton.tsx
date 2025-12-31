/**
 * Download button component
 */

import { motion } from 'framer-motion';
import type { ConversionResult } from '../types/conversion.types';
import { downloadFile } from '../services/downloadService';
import { formatBytes } from '../utils/fileSize';

interface DownloadButtonProps {
	/** Conversion result to download */
	result: ConversionResult | null;
	/** Whether the button is disabled */
	disabled?: boolean;
	/** Button variant */
	variant?: 'primary' | 'success' | 'secondary';
	/** Button size */
	size?: 'sm' | 'md' | 'lg';
	/** Custom className */
	className?: string;
	/** Callback after download completes */
	onDownloadComplete?: () => void;
}

export function DownloadButton({
	result,
	disabled = false,
	variant = 'success',
	size = 'md',
	className = '',
	onDownloadComplete,
}: DownloadButtonProps) {
	const handleDownload = () => {
		if (result) {
			downloadFile(result);
			// Trigger callback after download starts (small delay to ensure download initiated)
			if (onDownloadComplete) {
				setTimeout(() => {
					onDownloadComplete();
				}, 500);
			}
		}
	};

	const isDisabled = disabled || !result;

	const variantClasses = {
		primary: 'btn-primary',
		success: 'btn-success',
		secondary: 'btn-secondary',
	};

	const sizeClasses = {
		sm: 'btn-sm',
		md: 'btn-md',
		lg: 'btn-lg',
	};

	const ariaLabel = result
		? `Download ${result.filename} (${formatBytes(result.size)})`
		: 'Download (no file available)';

	return (
		<motion.button
			className={`btn ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
			onClick={handleDownload}
			disabled={isDisabled}
			aria-label={ariaLabel}
			whileHover={!isDisabled ? { scale: 1.05 } : {}}
			whileTap={!isDisabled ? { scale: 0.95 } : {}}
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, ease: 'easeOut' }}
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
					d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
				/>
			</svg>
			<span>
				Download
				{result && ` (${formatBytes(result.size)})`}
			</span>
		</motion.button>
	);
}
