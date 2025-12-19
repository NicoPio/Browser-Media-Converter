import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactRefresh from 'eslint-plugin-react-refresh';

export default tseslint.config(
	{
		ignores: ['dist', 'node_modules', '.eslintrc.cjs'],
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	{
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			parser: tseslint.parser,
			parserOptions: {
				project: ['./tsconfig.json', './tsconfig.node.json'],
			},
		},
		plugins: {
			'react-refresh': reactRefresh,
		},
		rules: {
			'react-refresh/only-export-components': [
				'warn',
				{ allowConstantExport: true },
			],
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
		},
	}
);
