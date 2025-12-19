/**
 * Hook to warn user before navigating away during active operations
 */

import { useEffect } from 'react';

/**
 * Prevent user from accidentally navigating away during active conversion
 * @param enabled Whether to enable the warning
 * @param message Custom warning message (optional)
 */
export function useBeforeUnload(enabled: boolean, message?: string): void {
	useEffect(() => {
		if (!enabled) {
			return;
		}

		const handleBeforeUnload = (event: BeforeUnloadEvent): string => {
			// Modern browsers ignore custom messages and show a generic warning
			// We still set returnValue for compatibility
			event.preventDefault();
			const msg = message || 'Conversion in progress. Are you sure you want to leave?';
			event.returnValue = msg;
			return msg;
		};

		window.addEventListener('beforeunload', handleBeforeUnload);

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	}, [enabled, message]);
}
