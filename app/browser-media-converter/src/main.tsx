import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ConversionQueueProvider } from './contexts/ConversionQueueContext';
import './index.css';
import { canEncodeAudio } from 'mediabunny';
import { registerMp3Encoder } from '@mediabunny/mp3-encoder';
import { isAudioCodecSupported, clearCodecSupportCache } from './services/codecSupportService';

// Initialize encoder support and detect codec capabilities
(async () => {
	console.log('[Init] Checking codec support...');

	// Register MP3 encoder if browser doesn't support it natively
	if (!(await canEncodeAudio('mp3'))) {
		console.log('[Init] Registering MP3 encoder (browser does not support native MP3 encoding)');
		registerMp3Encoder();
		// Clear cache after registering encoder so it re-checks MP3 support
		clearCodecSupportCache();
	} else {
		console.log('[Init] Using native MP3 encoding support');
	}

	// Check AAC encoding support
	const aacSupported = await isAudioCodecSupported('aac');
	console.log(`[Init] AAC encoding: ${aacSupported ? '✓ Supported' : '✗ Not supported'}`);

	// Check other common codecs
	const opusSupported = await isAudioCodecSupported('opus');
	console.log(`[Init] Opus encoding: ${opusSupported ? '✓ Supported' : '✗ Not supported'}`);

	const root = document.getElementById('root');

	if (!root) {
		throw new Error('Root element not found');
	}

	ReactDOM.createRoot(root).render(
		<React.StrictMode>
			<ErrorBoundary>
				<ConversionQueueProvider>
					<App />
				</ConversionQueueProvider>
			</ErrorBoundary>
		</React.StrictMode>,
	);
})();
