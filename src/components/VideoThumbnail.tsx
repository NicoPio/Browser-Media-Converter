/**
 * Video thumbnail display component
 */

interface VideoThumbnailProps {
	thumbnailUrl: string | null;
	alt?: string;
	size?: 'sm' | 'md' | 'lg';
	className?: string;
}

const sizeClasses = {
	sm: 'w-12 h-12',
	md: 'w-24 h-24',
	lg: 'h-32',
};

export function VideoThumbnail({
	thumbnailUrl,
	alt = 'Video thumbnail',
	size = 'lg',
	className = '',
}: VideoThumbnailProps) {
	const sizeClass = sizeClasses[size];

	if (!thumbnailUrl) {
		return (
			<div className={`rounded-lg overflow-hidden bg-base-300 flex items-center justify-center ${sizeClass} ${size === 'lg' ? 'aspect-video' : ''} ${className}`}>
				<div className="animate-pulse flex items-center justify-center w-full h-full">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-8 w-8 text-base-content/30"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
						/>
					</svg>
				</div>
			</div>
		);
	}

	return (
		<img
			src={thumbnailUrl}
			alt={alt}
			className={`rounded-lg ${sizeClass} object-cover ${className}`}
		/>
	);
}
