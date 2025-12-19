/**
 * Conversion Queue Context for global queue state management
 */

import { createContext, useContext, ReactNode } from 'react';
import { useConversionQueue } from '../hooks/useConversionQueue';
import type { ConversionQueue, QueueStatistics, ConversionJob } from '../types/conversion.types';

interface ConversionQueueContextType {
	queue: ConversionQueue;
	statistics: QueueStatistics;
	addJob: (job: ConversionJob) => void;
	removeJob: (jobId: string) => void;
	startQueue: () => Promise<void>;
	cancelJob: (jobId: string) => Promise<void>;
	cancelAll: () => Promise<void>;
	clearCompleted: () => void;
	clearAll: () => void;
}

const ConversionQueueContext = createContext<ConversionQueueContextType | null>(null);

interface ConversionQueueProviderProps {
	children: ReactNode;
}

/**
 * Provider component that wraps the app with conversion queue state
 */
export function ConversionQueueProvider({ children }: ConversionQueueProviderProps) {
	const queueState = useConversionQueue();

	return (
		<ConversionQueueContext.Provider value={queueState}>
			{children}
		</ConversionQueueContext.Provider>
	);
}

/**
 * Hook to access the conversion queue context
 * @throws Error if used outside of ConversionQueueProvider
 */
export function useConversionQueueContext() {
	const context = useContext(ConversionQueueContext);

	if (!context) {
		throw new Error('useConversionQueueContext must be used within a ConversionQueueProvider');
	}

	return context;
}
