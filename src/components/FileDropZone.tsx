import { useCallback, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface FileDropZoneProps {
	onFileSelect: (file: File) => void | Promise<void>;
	multiple?: boolean;
	disabled?: boolean;
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
					files.forEach(file => void onFileSelect(file));
				} else {
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
				relative flex min-h-72 cursor-pointer flex-col items-center justify-center
				rounded-3xl border-2 border-dashed p-10 transition-all overflow-hidden
				${isDragging
		? 'border-primary bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20 glow-warm'
		: 'border-base-content/20 hover:border-primary/60 hover:bg-base-200/30'}
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
			}}
			whileHover={!disabled ? { scale: 1.01 } : {}}
			whileTap={!disabled ? { scale: 0.99 } : {}}
			transition={{ duration: 0.2, ease: 'easeOut' }}
		>
			{isDragging && (
				<motion.div
					className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
				/>
			)}

			<input
				ref={fileInputRef}
				type="file"
				accept={accept}
				multiple={multiple}
				onChange={handleFileInputChange}
				className="hidden"
				disabled={disabled}
			/>

			<motion.div
				className={`
					relative mb-6 flex h-24 w-24 items-center justify-center rounded-full
					${isDragging
		? 'bg-gradient-to-br from-primary via-secondary to-accent'
		: 'bg-gradient-to-br from-primary/80 to-secondary/80'}
				`}
				animate={{
					y: isDragging ? [0, -12, 0] : 0,
					scale: isDragging ? [1, 1.1, 1] : 1,
				}}
				transition={{
					duration: 1.2,
					repeat: isDragging ? Number.POSITIVE_INFINITY : 0,
					ease: 'easeInOut',
				}}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="h-12 w-12 text-white"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth={1.5}
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
					/>
				</svg>
			</motion.div>

			<motion.div
				className="text-center z-10"
				animate={{ opacity: isDragging ? 0.9 : 1 }}
			>
				<p className="text-xl font-semibold text-base-content mb-2">
					{isDragging ? (
						<span className="text-primary">
							Drop {multiple ? 'files' : 'file'} here
						</span>
					) : (
						<span>
							Drop {multiple ? 'files' : 'a file'} or{' '}
							<span className="text-primary">browse</span>
						</span>
					)}
				</p>
				<p className="text-sm text-base-content/50">
					MP4, MOV, WebM, MKV, WAV, MP3, Ogg, FLAC
				</p>
			</motion.div>

			<div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
				<motion.div
					className="flex items-center gap-1.5 rounded-full bg-base-content/5 px-3 py-1.5"
					whileHover={{ scale: 1.05 }}
				>
					<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor">
						<path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
					</svg>
					<span className="text-xs font-medium text-base-content/70">Video</span>
				</motion.div>
				<motion.div
					className="flex items-center gap-1.5 rounded-full bg-base-content/5 px-3 py-1.5"
					whileHover={{ scale: 1.05 }}
				>
					<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent" viewBox="0 0 20 20" fill="currentColor">
						<path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
					</svg>
					<span className="text-xs font-medium text-base-content/70">Audio</span>
				</motion.div>
			</div>
		</motion.div>
	);
}
