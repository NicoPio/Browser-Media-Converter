/**
 * File drop zone component with drag-and-drop and file picker
 */

import { useCallback, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface FileDropZoneProps {
	/** Callback when file is selected (can be async) */
	onFileSelect: (file: File) => void | Promise<void>;
	/** Whether to accept multiple files (default: false for US1) */
	multiple?: boolean;
	/** Whether the drop zone is disabled */
	disabled?: boolean;
	/** Custom accepted file types (MIME types or extensions) */
	accept?: string;
}

export function FileDropZone({
	onFileSelect,
	multiple = false,
	disabled = false,
	accept = 'video/*,audio/*',
}: FileDropZoneProps) {
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleDragOver = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			if (disabled) return;

			e.preventDefault();
			e.stopPropagation();
			setIsDragging(true);
		},
		[disabled],
	);

	const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			e.stopPropagation();
			setIsDragging(false);

			if (disabled) return;

			const files = Array.from(e.dataTransfer.files);
			if (files.length > 0) {
				if (multiple) {
					// For batch mode, handle multiple files
					files.forEach(file => void onFileSelect(file));
				} else {
					// For single file mode, take the first file
					void onFileSelect(files[0]);
				}
			}
		},
		[disabled, multiple, onFileSelect],
	);

	const handleFileInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const files = e.target.files;
			if (!files || files.length === 0) return;

			if (multiple) {
				Array.from(files).forEach(file => void onFileSelect(file));
			} else {
				void onFileSelect(files[0]);
			}

			// Reset input so same file can be selected again
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
		},
		[multiple, onFileSelect],
	);

	const handleClick = useCallback(() => {
		if (disabled) return;
		fileInputRef.current?.click();
	}, [disabled]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLDivElement>) => {
			if (disabled) return;

			// Trigger file picker on Enter or Space
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				fileInputRef.current?.click();
			}
		},
		[disabled],
	);

	return (
		<motion.div
			className={`
				relative flex min-h-64 cursor-pointer flex-col items-center justify-center
				rounded-lg border-2 border-dashed p-8 transition-colors
				${isDragging ? 'border-primary bg-primary/10' : 'border-base-300 hover:border-primary/50 hover:bg-base-200/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'}
				${disabled ? 'cursor-not-allowed opacity-50' : ''}
			`}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			role="button"
			tabIndex={disabled ? -1 : 0}
			aria-label={multiple ? 'Drop files here or click to browse' : 'Drop file here or click to browse'}
			aria-disabled={disabled}
			animate={{
				scale: isDragging ? 1.02 : 1,
				boxShadow: isDragging
					? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
					: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
			}}
			whileHover={!disabled ? { scale: 1.01 } : {}}
			whileTap={!disabled ? { scale: 0.99 } : {}}
			transition={{ duration: 0.2, ease: 'easeOut' }}
		>
			<input
				ref={fileInputRef}
				type="file"
				accept={accept}
				multiple={multiple}
				onChange={handleFileInputChange}
				className="hidden"
				disabled={disabled}
			/>

			<motion.svg
				xmlns="http://www.w3.org/2000/svg"
				className={`h-16 w-16 mb-4 ${isDragging ? 'text-primary' : 'text-base-content/40'}`}
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				animate={{
					y: isDragging ? [0, -8, 0] : 0,
					opacity: isDragging ? [1, 0.7, 1] : 1,
				}}
				transition={{
					duration: 1,
					repeat: isDragging ? Number.POSITIVE_INFINITY : 0,
					ease: 'easeInOut',
				}}
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={1.5}
					d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
				/>
			</motion.svg>

			<p className="text-lg font-medium text-base-content">
				{isDragging
					? (
							<span className="text-primary">
								Drop
								{multiple ? 'files' : 'file'}
								{' '}
								here
							</span>
						)
					: (
							<span>
								Drag & drop
								{' '}
								{multiple ? 'files' : 'a file'}
								{' '}
								here
							</span>
						)}
			</p>
			<p className="mt-2 text-sm text-base-content/60">or click to browse</p>

			<div className="mt-4 text-xs text-base-content/50">
				<p>Supported: MP4, MOV, WebM, MKV, WAV, MP3, Ogg, AAC, FLAC</p>
			</div>
		</motion.div>
	);
}
