import { useEffect, useState, useCallback, useMemo, lazy, Suspense } from 'react';
import { isWebCodecsSupported } from './utils/validation';
import { extractMetadata } from './services/metadataService';
import { generateThumbnail } from './services/thumbnailService';
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
import type { ResizeConfiguration } from './types/resize.types';
import { OUTPUT_FORMATS } from './constants/formats';
import { DEFAULT_QUALITY } from './constants/qualityPresets';
import { DEFAULT_RESIZE_CONFIG } from './constants/resolutionPresets';
import { formatBytes } from './utils/fileSize';

type AppMode = 'single' | 'batch';

function App() {
	const [isSupported, setIsSupported] = useState<boolean | null>(null);
	const [mode, setMode] = useState<AppMode>('single');
	const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([]);
	const [isLoadingMetadata] = useState(false);
	const [selectedFormat, setSelectedFormat] = useState<OutputFormat | null>(null);
	const [availableFormats, setAvailableFormats] = useState<OutputFormatWithSupport[]>(
		OUTPUT_FORMATS.map(f => ({ ...f, isEncodable: true })),
	);
	const [qualityProfile, setQualityProfile] = useState<QualityProfile>(DEFAULT_QUALITY);
	const [resizeConfig, setResizeConfig] = useState<ResizeConfiguration>(DEFAULT_RESIZE_CONFIG);
	const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);

	const queueContext = useConversionQueueContext();
	const { settings, updateSetting } = useSettings();
	const { convert, cancel, progress, converting, error: conversionError } = useMediaConverter();
	const { validateFile, getSupportedFormatsWithEncodability } = useFileValidator();
	const [validationError, setValidationError] = useState<Error | null>(null);

	useBeforeUnload(
		converting || queueContext.statistics.isProcessing,
		'Conversion in progress. Are you sure you want to leave?',
	);

	useEffect(() => {
		document.documentElement.setAttribute('data-theme', settings.theme);
	}, [settings.theme]);

	useEffect(() => {
		setIsSupported(isWebCodecsSupported());
	}, []);

	const selectedFile = selectedFiles.length === 1 ? selectedFiles[0] : null;

	const handleFileSelect = useCallback(
		async (file: File) => {
			setValidationError(null);
			const validation = validateFile(file);
			if (!validation.valid) {
				setValidationError(new Error(validation.error));
				return;
			}

			const mediaFile: MediaFile = {
				id: crypto.randomUUID(),
				name: file.name,
				size: file.size,
				type: file.type,
				file,
				metadata: null,
				thumbnailUrl: null,
				createdAt: new Date(),
			};

			setSelectedFiles((prev) => {
				const newFiles = [...prev, mediaFile];
				setMode(newFiles.length > 1 ? 'batch' : 'single');
				return newFiles;
			});

			try {
				const [metadata, thumbnailUrl] = await Promise.all([
					extractMetadata(file),
					generateThumbnail(file),
				]);
				setSelectedFiles(prev => prev.map(f => (f.id === mediaFile.id ? { ...f, metadata, thumbnailUrl } : f)));

				if (selectedFiles.length === 0) {
					const updatedFile = { ...mediaFile, metadata };
					const formats = await getSupportedFormatsWithEncodability(updatedFile);
					setAvailableFormats(formats);
				}
			} catch (error) {
				console.error('Failed to extract metadata:', error);
			}
		},
		[validateFile, getSupportedFormatsWithEncodability, selectedFiles.length],
	);

	const handleRemoveFile = useCallback((fileId: string) => {
		setSelectedFiles((prev) => {
			const newFiles = prev.filter(f => f.id !== fileId);
			setMode(newFiles.length > 1 ? 'batch' : 'single');
			return newFiles;
		});
	}, []);

	const handleConvertSingle = useCallback(async () => {
		if (!selectedFile || !selectedFormat) return;
		setConversionResult(null);
		setValidationError(null);

		try {
			const result = await convert({
				sourceFile: selectedFile,
				targetFormat: selectedFormat,
				qualityProfile,
				resizeConfig,
			});
			result.url = createBlobUrl(result);
			setConversionResult(result);
		} catch (error) {
			console.error('Conversion failed:', error);
		}
	}, [selectedFile, selectedFormat, convert, resizeConfig]);

	const handleConvertBatch = useCallback(async () => {
		if (selectedFiles.length === 0 || !selectedFormat) return;

		queueContext.clearAll();
		const jobs = selectedFiles.map((file) => {
			const job: ConversionJob = {
				id: file.id,
				sourceFile: file,
				targetFormat: selectedFormat,
				qualityProfile,
				resizeConfig,
				status: 'queued',
				progress: 0,
				error: null,
				result: null,
				startedAt: null,
				completedAt: null,
				estimatedDuration: null,
			};
			return job;
		});
		queueContext.addJobs(jobs, true);
	}, [selectedFiles, selectedFormat, qualityProfile, queueContext]);

	const handleDownloadAllAsZip = useCallback(async () => {
		const completedJobs = queueContext.queue.jobs.filter(j => j.status === 'completed' && j.result);
		if (completedJobs.length === 0) return;
		const results = completedJobs.map(j => j.result!);
		await downloadAsZip(results, 'converted-files.zip');
	}, [queueContext.queue.jobs]);

	useEffect(() => {
		return () => {
			if (conversionResult?.url) {
				revokeBlobUrl(conversionResult.url);
			}
		};
	}, [conversionResult]);

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
		setResizeConfig(DEFAULT_RESIZE_CONFIG);
		queueContext.clearAll();
	}, [conversionResult, queueContext]);

	const handleSingleFileDownloadComplete = useCallback(() => {
		if (settings.autoCleanupAfterDownload) {
			setTimeout(() => handleReset(), 1000);
		}
	}, [settings.autoCleanupAfterDownload, handleReset]);

	const handleBatchFileDownloadComplete = useCallback((jobId: string) => {
		if (settings.autoCleanupAfterDownload) {
			queueContext.removeJob(jobId);
		}
	}, [settings.autoCleanupAfterDownload, queueContext]);

	const estimatedSize = useMemo(() => {
		if (!selectedFile || !selectedFormat) return null;
		return estimateOutputSize(selectedFile, qualityProfile);
	}, [selectedFile, selectedFormat, qualityProfile]);

	if (isSupported === null) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-base-200">
				<div className="text-center">
					<div className="relative">
						<div className="h-16 w-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin mx-auto" />
					</div>
					<p className="mt-6 text-base-content/70">Checking browser capabilities...</p>
				</div>
			</div>
		);
	}

	if (!isSupported) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-base-200 p-4">
				<div className="card bg-base-100 shadow-2xl max-w-md w-full">
					<div className="card-body text-center">
						<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-error/10">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-error" viewBox="0 0 20 20" fill="currentColor">
								<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
							</svg>
						</div>
						<h2 className="text-xl font-bold">Browser Not Supported</h2>
						<p className="text-sm text-base-content/60 mt-2">
							WebCodecs API required. Please use:
						</p>
						<div className="flex flex-wrap justify-center gap-2 mt-4">
							{['Chrome 94+', 'Edge 94+', 'Firefox 130+', 'Safari 16.4+'].map(browser => (
								<span key={browser} className="badge badge-ghost">{browser}</span>
							))}
						</div>
					</div>
				</div>
			</div>
		);
	}

	const error = validationError || conversionError;
	const isBatchMode = mode === 'batch';
	const hasFiles = selectedFiles.length > 0;
	const hasQueueJobs = queueContext.queue.jobs.length > 0;
	const completedJobs = queueContext.queue.jobs.filter(j => j.status === 'completed');
	const canConvert = hasFiles && selectedFormat && !converting && !queueContext.statistics.isProcessing && !isLoadingMetadata;
	const showProgress = converting || (progress > 0 && progress < 100);

	return (
		<div className="min-h-screen bg-base-200">
			<div className="gradient-glow fixed inset-0 pointer-events-none" />

			<div className="relative mx-auto max-w-3xl px-4 py-8">
				<header className="mb-10 text-center relative">
					<div className="absolute right-0 top-0">
						<SettingsMenu
							autoCleanupAfterDownload={settings.autoCleanupAfterDownload}
							showOnboardingHints={settings.showOnboardingHints}
							theme={settings.theme}
							onAutoCleanupChange={(enabled) => updateSetting('autoCleanupAfterDownload', enabled)}
							onShowHintsChange={(enabled) => updateSetting('showOnboardingHints', enabled)}
							onThemeChange={(theme) => updateSetting('theme', theme)}
						/>
					</div>

					<div className="inline-flex items-center justify-center gap-3 mb-4">
						<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
								<path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
							</svg>
						</div>
					</div>
					<h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
						Media Converter
					</h1>
					<p className="mt-2 text-sm text-base-content/50">
						Convert files locally in your browser
					</p>
				</header>

				<main className="space-y-6">
					<OnboardingHints show={settings.showOnboardingHints && !hasFiles && !hasQueueJobs} />

					{error && (
						<ErrorMessage
							error={error}
							onDismiss={() => setValidationError(null)}
						/>
					)}

					{!hasFiles && !hasQueueJobs && (
						<div className="card liquid-glass shadow-xl rounded-3xl">
							<div className="card-body p-6">
								<FileDropZone
									onFileSelect={handleFileSelect}
									multiple={true}
									disabled={converting || queueContext.statistics.isProcessing}
								/>
							</div>
						</div>
					)}

					{hasFiles && !hasQueueJobs && (
						<div className="card liquid-glass shadow-xl rounded-3xl">
							<div className="card-body p-6">
								<div className="flex items-center justify-between mb-4">
									<div className="flex items-center gap-3">
										<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
											<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
												<path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
											</svg>
										</div>
										<div>
											<h2 className="font-semibold">
												{isBatchMode ? `${selectedFiles.length} Files` : selectedFile?.name}
											</h2>
											{!isBatchMode && selectedFile && (
												<p className="text-xs text-base-content/50">
													{formatBytes(selectedFile.size)}
												</p>
											)}
										</div>
									</div>
									<button
										className="btn btn-ghost btn-sm btn-circle"
										onClick={handleReset}
										aria-label="Clear"
									>
										<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
											<path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
										</svg>
									</button>
								</div>

								{isBatchMode && (
									<FileList
										files={selectedFiles}
										onRemove={handleRemoveFile}
										disabled={converting || queueContext.statistics.isProcessing}
									/>
								)}

								{!isBatchMode && selectedFile?.metadata && (
									<Suspense fallback={<div className="skeleton h-24 w-full rounded-xl"></div>}>
										<FileMetadata file={selectedFile} />
									</Suspense>
								)}

								<div className="divider my-4"></div>

								<FormatSelector
									formats={availableFormats}
									selectedFormat={selectedFormat}
									onFormatSelect={setSelectedFormat}
									disabled={converting || queueContext.statistics.isProcessing}
								/>

								{selectedFormat && (
									<Suspense fallback={<div className="skeleton h-48 w-full rounded-xl mt-4"></div>}>
										<QualitySettings
											qualityProfile={qualityProfile}
											onQualityChange={setQualityProfile}
											disabled={converting || queueContext.statistics.isProcessing}
											hasVideo={(selectedFile?.metadata?.hasVideo ?? true) && selectedFormat.supportsVideo}
											hasAudio={selectedFile?.metadata?.hasAudio ?? selectedFormat.supportsAudio}
											sourceWidth={selectedFile?.metadata?.width ?? null}
											sourceHeight={selectedFile?.metadata?.height ?? null}
											resizeConfig={resizeConfig}
											onResizeChange={setResizeConfig}
										/>
									</Suspense>
								)}

								{!isBatchMode && selectedFormat && estimatedSize && (
									<div className="flex items-center gap-3 mt-4 p-3 rounded-xl bg-base-200/50">
										<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent" viewBox="0 0 20 20" fill="currentColor">
											<path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
											<path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
											<path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
										</svg>
										<div className="flex-1">
											<span className="text-sm text-base-content/60">Est. size: </span>
											<span className="font-medium">{formatBytes(estimatedSize)}</span>
											<span className="text-xs text-base-content/40 ml-1">
												({((estimatedSize / selectedFile!.size) * 100).toFixed(0)}%)
											</span>
										</div>
									</div>
								)}

								<div className="mt-6">
									<button
										className="btn btn-primary w-full gap-2"
										onClick={() => void (isBatchMode ? handleConvertBatch() : handleConvertSingle())}
										disabled={!canConvert}
									>
										<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
											<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
										</svg>
										{isBatchMode ? `Convert ${selectedFiles.length} Files` : 'Convert'}
									</button>
								</div>

								{!isBatchMode && showProgress && (
									<div className="mt-4">
										<ProgressBar progress={progress} status={converting ? 'Converting...' : 'Finalizing...'} />
										{converting && (
											<div className="mt-3 flex justify-end">
												<button
													className="btn btn-ghost btn-sm text-error"
													onClick={() => void cancel()}
												>
													<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
														<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
													</svg>
													Cancel
												</button>
											</div>
										)}
									</div>
								)}

								{!isBatchMode && conversionResult && (
									<div className="mt-4 space-y-4">
										<div className="flex items-center gap-3 p-3 rounded-xl bg-success/10 border border-success/20">
											<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-success" viewBox="0 0 20 20" fill="currentColor">
												<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
											</svg>
											<span className="font-medium text-success">Conversion complete!</span>
										</div>

										<div className="flex gap-2">
											<DownloadButton
												result={conversionResult}
												className="flex-1"
												onDownloadComplete={handleSingleFileDownloadComplete}
											/>
											<button
												className="btn btn-ghost"
												onClick={handleReset}
											>
												<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
													<path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
												</svg>
											</button>
										</div>
									</div>
								)}
							</div>
						</div>
					)}

					{hasQueueJobs && (
						<div className="card liquid-glass shadow-xl rounded-3xl">
							<div className="card-body p-6">
								<div className="flex items-center justify-between mb-4">
									<div className="flex items-center gap-3">
										<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
											<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
												<path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
											</svg>
										</div>
										<div>
											<h2 className="font-semibold">Queue</h2>
											<p className="text-xs text-base-content/50">
												{queueContext.statistics.completedCount}/{queueContext.statistics.totalJobs} done
											</p>
										</div>
									</div>
									<div className="flex gap-1">
										{completedJobs.length > 0 && !queueContext.statistics.isProcessing && (
											<button
												className="btn btn-ghost btn-sm btn-circle"
												onClick={queueContext.clearCompleted}
												aria-label="Clear completed"
											>
												<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
													<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
												</svg>
											</button>
										)}
										{!queueContext.statistics.isProcessing && (
											<button
												className="btn btn-ghost btn-sm btn-circle"
												onClick={handleReset}
												aria-label="Clear all"
											>
												<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
													<path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
												</svg>
											</button>
										)}
									</div>
								</div>

								{queueContext.statistics.isProcessing && (
									<div className="mb-4">
										<ProgressBar
											progress={queueContext.statistics.overallProgress}
											status={queueContext.queue.activeJob?.sourceFile.name || 'Processing...'}
										/>
									</div>
								)}

								<Suspense fallback={<div className="skeleton h-64 w-full rounded-xl"></div>}>
									<ConversionQueue
										jobs={queueContext.queue.jobs}
										onCancel={queueContext.cancelJob}
										onRemove={queueContext.removeJob}
										onDownloadComplete={handleBatchFileDownloadComplete}
										disabled={queueContext.statistics.isProcessing}
									/>
								</Suspense>

								{completedJobs.length > 1 && !queueContext.statistics.isProcessing && (
									<div className="mt-4 flex gap-2">
										<button
											className="btn btn-primary flex-1 gap-2"
											onClick={() => void handleDownloadAllAsZip()}
										>
											<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
												<path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
											</svg>
											Download All (.zip)
										</button>
										<button className="btn btn-ghost" onClick={handleReset}>
											<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
												<path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
											</svg>
										</button>
									</div>
								)}
							</div>
						</div>
					)}

					<footer className="text-center py-4">
						<p className="text-xs text-base-content/40 flex items-center justify-center gap-1.5">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
								<path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
							</svg>
							100% private — files never leave your browser
						</p>
					</footer>
				</main>
			</div>
		</div>
	);
}

export default App;
