/**
 * Main application component - Browser Media Converter
 * Supports both single-file and batch conversion modes
 */

import { useEffect, useState, useCallback, useMemo, lazy, Suspense } from 'react';
import { isWebCodecsSupported } from './utils/validation';
import { extractMetadata } from './services/metadataService';
import { createBlobUrl, revokeBlobUrl, downloadAsZip } from './services/downloadService';
import { estimateOutputSize } from './services/conversionService';
import { useMediaConverter } from './hooks/useMediaConverter';
import { useFileValidator } from './hooks/useFileValidator';
import { useBeforeUnload } from './hooks/useBeforeUnload';
import { useSettings } from './hooks/useSettings';
import { useConversionQueueContext } from './contexts/ConversionQueueContext';
import { FileDropZone } from './components/FileDropZone';
import { FileList } from './components/FileList';
import { FormatSelector } from './components/FormatSelector';
import { ProgressBar } from './components/ProgressBar';
import { DownloadButton } from './components/DownloadButton';
import { ErrorMessage } from './components/ErrorMessage';
import { SettingsMenu } from './components/SettingsMenu';
import { OnboardingHints } from './components/OnboardingHints';

// Lazy load heavy components for better initial load time
const QualitySettings = lazy(() =>
	import('./components/QualitySettings').then(m => ({ default: m.QualitySettings })),
);
const FileMetadata = lazy(() =>
	import('./components/FileMetadata').then(m => ({ default: m.FileMetadata })),
);
const ConversionQueue = lazy(() =>
	import('./components/ConversionQueue').then(m => ({ default: m.ConversionQueue })),
);
import type { MediaFile } from './types/media.types';
import type { OutputFormat, OutputFormatWithSupport } from './constants/formats';
import type { ConversionResult, ConversionJob } from './types/conversion.types';
import type { QualityProfile } from './types/quality.types';
import { OUTPUT_FORMATS } from './constants/formats';
import { DEFAULT_QUALITY } from './constants/qualityPresets';
import { formatBytes } from './utils/fileSize';

type AppMode = 'single' | 'batch';

function App() {
	// Browser support check
	const [isSupported, setIsSupported] = useState<boolean | null>(null);

	// Mode detection
	const [mode, setMode] = useState<AppMode>('single');

	// File state
	const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([]);
	const [isLoadingMetadata] = useState(false);

	// Format selection
	const [selectedFormat, setSelectedFormat] = useState<OutputFormat | null>(null);
	const [availableFormats, setAvailableFormats] = useState<OutputFormatWithSupport[]>(
		OUTPUT_FORMATS.map(f => ({ ...f, isEncodable: true })),
	);

	// Quality settings
	const [qualityProfile, setQualityProfile] = useState<QualityProfile>(DEFAULT_QUALITY);

	// Single-file conversion state
	const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);

	// Batch conversion context
	const queueContext = useConversionQueueContext();

	// Settings
	const { settings, updateSetting } = useSettings();

	// Hooks
	const { convert, cancel, progress, converting, error: conversionError } = useMediaConverter();
	const { validateFile, getSupportedFormatsWithEncodability } = useFileValidator();
	const [validationError, setValidationError] = useState<Error | null>(null);

	// Warn before unload during conversion
	useBeforeUnload(
		converting || queueContext.statistics.isProcessing,
		'Conversion in progress. Are you sure you want to leave?',
	);

	// Check browser support on mount
	useEffect(() => {
		setIsSupported(isWebCodecsSupported());
	}, []);

	// Single file shortcut
	const selectedFile = selectedFiles.length === 1 ? selectedFiles[0] : null;

	// Handle file selection
	const handleFileSelect = useCallback(
		async (file: File) => {
			setValidationError(null);

			// Validate file
			const validation = validateFile(file);
			if (!validation.valid) {
				setValidationError(new Error(validation.error));
				return;
			}

			// Show warnings if any
			if (validation.warnings && validation.warnings.length > 0) {
				console.warn('File validation warnings:', validation.warnings);
			}

			// Create MediaFile object
			const mediaFile: MediaFile = {
				id: crypto.randomUUID(),
				name: file.name,
				size: file.size,
				type: file.type,
				file,
				metadata: null,
				createdAt: new Date(),
			};

			// Add to files array
			setSelectedFiles((prev) => {
				const newFiles = [...prev, mediaFile];
				// Auto-detect mode based on file count
				setMode(newFiles.length > 1 ? 'batch' : 'single');
				return newFiles;
			});

			// Extract metadata in background
			try {
				const metadata = await extractMetadata(file);
				mediaFile.metadata = metadata;
				setSelectedFiles(prev => prev.map(f => (f.id === mediaFile.id ? { ...f, metadata } : f)));

				// Update available formats based on first file's metadata and codec support
				if (selectedFiles.length === 0) {
					const formats = await getSupportedFormatsWithEncodability(mediaFile);
					setAvailableFormats(formats);
					console.log('[Formats] Available formats:', formats.filter(f => f.isEncodable).map(f => f.format));
					const unsupportedFormats = formats.filter(f => !f.isEncodable);
					if (unsupportedFormats.length > 0) {
						console.log('[Formats] Unsupported formats:', unsupportedFormats.map(f => f.format));
					}
				}
			} catch (error) {
				console.error('Failed to extract metadata:', error);
			}
		},
		[validateFile, getSupportedFormatsWithEncodability, selectedFiles.length],
	);

	// Handle file removal
	const handleRemoveFile = useCallback((fileId: string) => {
		setSelectedFiles((prev) => {
			const newFiles = prev.filter(f => f.id !== fileId);
			setMode(newFiles.length > 1 ? 'batch' : 'single');
			return newFiles;
		});
	}, []);

	// Handle single-file conversion
	const handleConvertSingle = useCallback(async () => {
		if (!selectedFile || !selectedFormat) return;

		setConversionResult(null);
		setValidationError(null);

		try {
			const result = await convert({
				sourceFile: selectedFile,
				targetFormat: selectedFormat,
				qualityProfile,
			});

			result.url = createBlobUrl(result);
			setConversionResult(result);
		} catch (error) {
			console.error('Conversion failed:', error);
		}
	}, [selectedFile, selectedFormat, convert]);

	// Handle batch conversion
	const handleConvertBatch = useCallback(async () => {
		if (selectedFiles.length === 0 || !selectedFormat) return;

		// Clear previous queue
		queueContext.clearAll();

		// Create jobs for all files
		selectedFiles.forEach((file) => {
			const job: ConversionJob = {
				id: file.id,
				sourceFile: file,
				targetFormat: selectedFormat,
				qualityProfile,
				status: 'queued',
				progress: 0,
				error: null,
				result: null,
				startedAt: null,
				completedAt: null,
				estimatedDuration: null,
			};
			queueContext.addJob(job);
		});

		// Start processing
		await queueContext.startQueue();
	}, [selectedFiles, selectedFormat, queueContext]);

	// Handle download all as ZIP
	const handleDownloadAllAsZip = useCallback(async () => {
		const completedJobs = queueContext.queue.jobs.filter(j => j.status === 'completed' && j.result);

		if (completedJobs.length === 0) return;

		const results = completedJobs.map(j => j.result!);
		await downloadAsZip(results, 'converted-files.zip');
	}, [queueContext.queue.jobs]);

	// Cleanup Blob URL on unmount or when result changes
	useEffect(() => {
		return () => {
			if (conversionResult?.url) {
				revokeBlobUrl(conversionResult.url);
			}
		};
	}, [conversionResult]);

	// Handle reset
	const handleReset = useCallback(() => {
		if (conversionResult?.url) {
			revokeBlobUrl(conversionResult.url);
		}
		setSelectedFiles([]);
		setSelectedFormat(null);
		setConversionResult(null);
		setValidationError(null);
		setAvailableFormats(OUTPUT_FORMATS.map(f => ({ ...f, isEncodable: true })));
		setMode('single');
		queueContext.clearAll();
	}, [conversionResult, queueContext]);

	// Handle single file download complete (auto-cleanup if enabled)
	const handleSingleFileDownloadComplete = useCallback(() => {
		if (settings.autoCleanupAfterDownload) {
			// Auto-cleanup: reset to initial state after successful download
			setTimeout(() => {
				handleReset();
			}, 1000);
		}
	}, [settings.autoCleanupAfterDownload, handleReset]);

	// Handle batch file download complete (auto-cleanup if enabled)
	const handleBatchFileDownloadComplete = useCallback((jobId: string) => {
		if (settings.autoCleanupAfterDownload) {
			// Remove the downloaded job from the queue
			queueContext.removeJob(jobId);
		}
	}, [settings.autoCleanupAfterDownload, queueContext]);

	// Estimate output size (for single file)
	const estimatedSize = useMemo(() => {
		if (!selectedFile || !selectedFormat) return null;
		return estimateOutputSize(selectedFile, qualityProfile);
	}, [selectedFile, selectedFormat, qualityProfile]);

	// Loading state
	if (isSupported === null) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-base-200">
				<div className="text-center">
					<span className="loading loading-spinner loading-lg"></span>
					<p className="mt-4 text-lg">Checking browser capabilities...</p>
				</div>
			</div>
		);
	}

	// Unsupported browser
	if (!isSupported) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-base-200">
				<div className="card w-96 bg-base-100 shadow-xl">
					<div className="card-body">
						<h2 className="card-title text-error">Browser Not Supported</h2>
						<p>
							This application requires WebCodecs API support. Please use one of the following
							browsers:
						</p>
						<ul className="list-inside list-disc space-y-1 text-sm">
							<li>Chrome 94+</li>
							<li>Edge 94+</li>
							<li>Firefox 130+</li>
							<li>Safari 16.4+</li>
						</ul>
						{!self.isSecureContext && (
							<div className="alert alert-warning mt-4">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-6 w-6 shrink-0 stroke-current"
									fill="none"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
									/>
								</svg>
								<span>HTTPS is required. This app must be served over a secure connection.</span>
							</div>
						)}
					</div>
				</div>
			</div>
		);
	}

	// Main application
	const error = validationError || conversionError;
	const isBatchMode = mode === 'batch';
	const hasFiles = selectedFiles.length > 0;
	const hasQueueJobs = queueContext.queue.jobs.length > 0;
	const completedJobs = queueContext.queue.jobs.filter(j => j.status === 'completed');
	const canConvert
		= hasFiles && selectedFormat && !converting && !queueContext.statistics.isProcessing && !isLoadingMetadata;
	const showProgress = converting || (progress > 0 && progress < 100);

	return (
		<div className="min-h-screen bg-base-200 p-4">
			<div className="mx-auto max-w-4xl">
				{/* Header */}
				<header className="mb-8">
					<div className="flex items-start justify-between mb-4">
						<div className="flex-1 text-center">
							<h1 className="text-4xl font-bold text-primary">Browser Media Converter</h1>
							<p className="mt-2 text-base-content/70">Convert video and audio files directly in your browser</p>
							<p className="mt-1 text-sm text-base-content/50">Powered by mediabunny</p>
						</div>
						<div className="flex-shrink-0">
							<SettingsMenu
								autoCleanupAfterDownload={settings.autoCleanupAfterDownload}
								showOnboardingHints={settings.showOnboardingHints}
								onAutoCleanupChange={(enabled) => updateSetting('autoCleanupAfterDownload', enabled)}
								onShowHintsChange={(enabled) => updateSetting('showOnboardingHints', enabled)}
							/>
						</div>
					</div>
				</header>

				{/* Main Content */}
				<main className="space-y-6">
					{/* Onboarding Hints */}
					<OnboardingHints show={settings.showOnboardingHints && !hasFiles && !hasQueueJobs} />

					{/* Error Display */}
					{error && (
						<ErrorMessage
							error={error}
							onDismiss={() => {
								setValidationError(null);
							}}
						/>
					)}

					{/* File Selection */}
					{!hasFiles && !hasQueueJobs && (
						<div className="card bg-base-100 shadow-xl">
							<div className="card-body">
								<FileDropZone
									onFileSelect={handleFileSelect}
									multiple={true}
									disabled={converting || queueContext.statistics.isProcessing}
								/>
							</div>
						</div>
					)}

					{/* Files Selected */}
					{hasFiles && !hasQueueJobs && (
						<div className="card bg-base-100 shadow-xl">
							<div className="card-body">
								<div className="flex items-center justify-between mb-4">
									<h2 className="card-title">
										{isBatchMode ? `Selected Files (${selectedFiles.length})` : 'Selected File'}
									</h2>
									<button className="btn btn-ghost btn-sm" onClick={handleReset} aria-label="Clear all selected files">
										Clear All
									</button>
								</div>

								{/* Batch: File List */}
								{isBatchMode && (
									<FileList
										files={selectedFiles}
										onRemove={handleRemoveFile}
										disabled={converting || queueContext.statistics.isProcessing}
									/>
								)}

								{/* Single: File Info */}
								{!isBatchMode && selectedFile && (
									<div className="alert">
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
											>
											</path>
										</svg>
										<div className="flex-1">
											<p className="font-medium">{selectedFile.name}</p>
											<p className="text-sm opacity-70">
												Size:
												{' '}
												{(selectedFile.size / 1024 / 1024).toFixed(2)}
												{' '}
												MB
											</p>
										</div>
									</div>
								)}

								{/* Single: Metadata */}
								{!isBatchMode && selectedFile?.metadata && (
									<div className="mt-4">
										<Suspense fallback={<div className="skeleton h-32 w-full"></div>}>
											<FileMetadata file={selectedFile} />
										</Suspense>
									</div>
								)}

								{/* Format Selection */}
								<div className="mt-4">
									<FormatSelector
										formats={availableFormats}
										selectedFormat={selectedFormat}
										onFormatSelect={setSelectedFormat}
										disabled={converting || queueContext.statistics.isProcessing}
									/>
								</div>

								{/* Quality Settings */}
								{selectedFormat && (
									<div className="mt-4">
										<Suspense fallback={<div className="skeleton h-64 w-full"></div>}>
											<QualitySettings
												qualityProfile={qualityProfile}
												onQualityChange={setQualityProfile}
												disabled={converting || queueContext.statistics.isProcessing}
												hasVideo={selectedFile?.metadata?.hasVideo ?? selectedFormat.supportsVideo}
												hasAudio={selectedFile?.metadata?.hasAudio ?? selectedFormat.supportsAudio}
											/>
										</Suspense>
									</div>
								)}

								{/* Single: Estimated Size */}
								{!isBatchMode && selectedFormat && estimatedSize && (
									<div className="mt-3 flex items-center gap-2 rounded-md bg-base-200/50 p-3 text-sm">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-5 w-5 text-info"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
											/>
										</svg>
										<div className="flex-1">
											<span className="text-base-content/70">Estimated output size: </span>
											<span className="font-medium">{formatBytes(estimatedSize)}</span>
											<span className="ml-2 text-xs text-base-content/60">
												(
												{((estimatedSize / selectedFile!.size) * 100).toFixed(0)}
												% of original)
											</span>
										</div>
									</div>
								)}

								{/* Convert Button */}
								<div className="card-actions justify-end mt-4">
									<button
										className="btn btn-primary"
										onClick={() => void (isBatchMode ? handleConvertBatch() : handleConvertSingle())}
										disabled={!canConvert}
										aria-label={isBatchMode ? `Convert all ${selectedFiles.length} files to ${selectedFormat?.displayName || 'selected format'}` : `Convert file to ${selectedFormat?.displayName || 'selected format'}`}
									>
										{isBatchMode ? `Convert All (${selectedFiles.length})` : 'Convert'}
									</button>
								</div>

								{/* Single: Progress */}
								{!isBatchMode && showProgress && (
									<div className="mt-4">
										<ProgressBar progress={progress} status={converting ? 'Converting...' : 'Finalizing...'} />
										{converting && (
											<div className="mt-2 flex justify-end">
												<button className="btn btn-error btn-sm" onClick={() => void cancel()} aria-label="Cancel conversion">
													Cancel
												</button>
											</div>
										)}
									</div>
								)}

								{/* Single: Result */}
								{!isBatchMode && conversionResult && (
									<div className="mt-4">
										<div className="alert alert-success">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="h-6 w-6 shrink-0 stroke-current"
												fill="none"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
												/>
											</svg>
											<span>Conversion complete!</span>
										</div>

										<div className="mt-4 flex gap-2">
											<DownloadButton
												result={conversionResult}
												className="flex-1"
												onDownloadComplete={handleSingleFileDownloadComplete}
											/>
											<button className="btn btn-outline" onClick={handleReset} aria-label="Convert another file">
												Convert Another
											</button>
										</div>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Batch: Queue Display */}
					{hasQueueJobs && (
						<div className="card bg-base-100 shadow-xl">
							<div className="card-body">
								<div className="flex items-center justify-between mb-4">
									<div>
										<h2 className="card-title">Conversion Queue</h2>
										<p className="text-sm text-base-content/60">
											{queueContext.statistics.completedCount}
											{' '}
											of
											{queueContext.statistics.totalJobs}
											{' '}
											completed
										</p>
									</div>
									<div className="flex gap-2">
										{completedJobs.length > 0 && !queueContext.statistics.isProcessing && (
											<button className="btn btn-outline btn-sm" onClick={queueContext.clearCompleted} aria-label="Clear completed conversions from queue">
												Clear Completed
											</button>
										)}
										{!queueContext.statistics.isProcessing && (
											<button className="btn btn-ghost btn-sm" onClick={handleReset} aria-label="Clear all conversions and start over">
												Clear All
											</button>
										)}
									</div>
								</div>

								{/* Overall Progress */}
								{queueContext.statistics.isProcessing && (
									<div className="mb-4">
										<ProgressBar
											progress={queueContext.statistics.overallProgress}
											status={`Processing ${queueContext.statistics.activeCount} of ${queueContext.statistics.totalJobs}...`}
										/>
									</div>
								)}

								{/* Job List */}
								<Suspense fallback={<div className="skeleton h-96 w-full"></div>}>
									<ConversionQueue
										jobs={queueContext.queue.jobs}
										onCancel={queueContext.cancelJob}
										onRemove={queueContext.removeJob}
										onDownloadComplete={handleBatchFileDownloadComplete}
										disabled={queueContext.statistics.isProcessing}
									/>
								</Suspense>

								{/* Batch Actions */}
								{completedJobs.length > 1 && !queueContext.statistics.isProcessing && (
									<div className="mt-4 flex gap-2">
										<button
											className="btn btn-success flex-1"
											onClick={() => void handleDownloadAllAsZip()}
											aria-label={`Download all ${completedJobs.length} converted files as a ZIP archive`}
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
											Download All as ZIP
										</button>
										<button className="btn btn-outline" onClick={handleReset} aria-label="Clear all conversions and start over">
											Start Over
										</button>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Info Card */}
					<div className="card bg-base-100/50 shadow">
						<div className="card-body py-4">
							<p className="text-center text-sm text-base-content/60">
								Your files are processed entirely in your browser. Nothing is uploaded to any server.
							</p>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}

export default App;
