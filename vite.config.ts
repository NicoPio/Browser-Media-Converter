import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
	base: process.env.CI ? '/Browser-Media-Converter/' : '/',
	plugins: [
		react(),
		tailwindcss(),
	],
	server: {
		port: 5173,
		open: true,
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	build: {
		target: 'es2020',
		outDir: 'dist',
		sourcemap: true,
		minify: 'terser',
		terserOptions: {
			compress: {
				drop_console: true, // Remove console.logs in production
				drop_debugger: true,
			},
		},
		rollupOptions: {
			output: {
				manualChunks: (id) => {
					// Core dependencies
					if (id.includes('node_modules')) {
						// React vendor bundle
						if (id.includes('react') || id.includes('react-dom')) {
							return 'react-vendor';
						}
						// Lazy-loaded JSZip (for batch downloads)
						if (id.includes('jszip')) {
							return 'jszip';
						}
						// mediabunny - large library
						if (id.includes('mediabunny')) {
							return 'mediabunny';
						}
						// Other node_modules in vendor bundle
						return 'vendor';
					}
					// Split components by feature
					if (id.includes('/src/components/')) {
						if (id.includes('QualitySettings')) {
							return 'quality';
						}
						if (id.includes('ConversionQueue')) {
							return 'queue';
						}
					}
				},
			},
		},
	},
	optimizeDeps: {
		include: ['react', 'react-dom', 'mediabunny'],
		// JSZip is excluded as it's lazy-loaded
	},
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./tests/setup.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: [
				'node_modules/',
				'tests/',
				'dist/',
				'*.config.*',
			],
		},
	},
});
