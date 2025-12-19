/**
 * User settings hook with localStorage persistence
 */

import { useState, useEffect, useCallback } from 'react';

interface AppSettings {
	autoCleanupAfterDownload: boolean;
	showOnboardingHints: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
	autoCleanupAfterDownload: true, // Auto-cleanup enabled by default
	showOnboardingHints: true, // Show hints for first-time users
};

const STORAGE_KEY = 'browser-media-converter-settings';

/**
 * Load settings from localStorage
 */
function loadSettings(): AppSettings {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			const parsed = JSON.parse(stored);
			return { ...DEFAULT_SETTINGS, ...parsed };
		}
	} catch (error) {
		console.warn('Failed to load settings from localStorage:', error);
	}
	return DEFAULT_SETTINGS;
}

/**
 * Save settings to localStorage
 */
function saveSettings(settings: AppSettings): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
	} catch (error) {
		console.warn('Failed to save settings to localStorage:', error);
	}
}

/**
 * Hook to manage user settings with localStorage persistence
 */
export function useSettings() {
	const [settings, setSettings] = useState<AppSettings>(loadSettings);

	// Persist settings whenever they change
	useEffect(() => {
		saveSettings(settings);
	}, [settings]);

	const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
		setSettings(prev => ({ ...prev, [key]: value }));
	}, []);

	const resetSettings = useCallback(() => {
		setSettings(DEFAULT_SETTINGS);
	}, []);

	return {
		settings,
		updateSetting,
		resetSettings,
	};
}
