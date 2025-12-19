/**
 * Tooltip component for helpful hints and guidance
 */

import type { ReactNode } from 'react';

interface TooltipProps {
	/** The content to show in the tooltip */
	content: string;
	/** Child element that triggers the tooltip */
	children: ReactNode;
	/** Tooltip position */
	position?: 'top' | 'bottom' | 'left' | 'right';
	/** Whether to show the tooltip */
	show?: boolean;
}

export function Tooltip({ content, children, position = 'top', show = true }: TooltipProps) {
	if (!show) {
		return <>{children}</>;
	}

	const positionClasses = {
		top: 'tooltip-top',
		bottom: 'tooltip-bottom',
		left: 'tooltip-left',
		right: 'tooltip-right',
	};

	return (
		<div className={`tooltip ${positionClasses[position]}`} data-tip={content}>
			{children}
		</div>
	);
}
