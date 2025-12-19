/**
 * File list component for batch uploads
 */

import type { MediaFile } from '../types/media.types';
import { formatBytes } from '../utils/fileSize';

interface FileListProps {
	/** Array of uploaded files */
	files: MediaFile[];
	/** Callback when a file is removed */
	onRemove?: (fileId: string) => void;
	/** Whether actions are disabled */
	disabled?: boolean;
}

export function FileList({ files, onRemove, disabled = false }: FileListProps) {
	if (files.length === 0) {
		return null;
	}

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-medium text-base-content/90">
					Selected Files (
					{files.length}
					)
				</h3>
			</div>

			<div className="space-y-2">
				{files.map(file => (
					<div
						key={file.id}
						className="flex items-center gap-3 rounded-lg border border-base-300 bg-base-100 p-3 transition-colors hover:bg-base-200/50"
					>
						<div className="flex-shrink-0">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-6 w-6 text-base-content/60"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
								/>
							</svg>
						</div>

						<div className="flex-1 min-w-0">
							<p className="truncate text-sm font-medium text-base-content">
								{file.name}
							</p>
							<div className="flex items-center gap-2 text-xs text-base-content/60">
								<span>{formatBytes(file.size)}</span>
								{file.metadata && (
									<>
										<span>•</span>
										<span>{file.metadata.format.toUpperCase()}</span>
										{file.metadata.hasVideo && file.metadata.hasAudio && (
											<>
												<span>•</span>
												<span>Video + Audio</span>
											</>
										)}
										{file.metadata.hasVideo && !file.metadata.hasAudio && (
											<>
												<span>•</span>
												<span>Video Only</span>
											</>
										)}
										{!file.metadata.hasVideo && file.metadata.hasAudio && (
											<>
												<span>•</span>
												<span>Audio Only</span>
											</>
										)}
									</>
								)}
							</div>
						</div>

						{onRemove && !disabled && (
							<button
								className="btn btn-ghost btn-sm btn-circle"
								onClick={() => onRemove(file.id)}
								aria-label="Remove file"
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
				))}
			</div>
		</div>
	);
}
