import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import tsEslint from '@typescript-eslint/eslint-plugin';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-plugin-prettier';
import unusedImports from 'eslint-plugin-unused-imports';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: {
		env: {
			browser: true,
			es2021: true,
		},
	},
});

const eslintConfig = [
	...compat.extends(
		'next/core-web-vitals',
		'next/typescript',
		'eslint:recommended',
		'plugin:react/recommended',
		'plugin:import/typescript',
		'plugin:@typescript-eslint/recommended',
		'plugin:prettier/recommended',
		'prettier',
	),
	{
		ignores: ['next.config.js', '.next', 'src/lib/db.ts', 'build-utilities/*'],
	},
	{
		plugins: {
			'@typescript-eslint': tsEslint,
			react,
			'react-hooks': reactHooks,
			prettier,
			'unused-imports': unusedImports,
		},
		rules: {
			'react/prop-types': 'off',
			'react/react-in-jsx-scope': 'off',
			'require-jsdoc': 'off',
			'no-unused-vars': 'off',
			'unused-imports/no-unused-imports': 'warn',
			'unused-imports/no-unused-vars': [
				'warn',
				{
					vars: 'all',
					varsIgnorePattern: '^_',
					args: 'after-used',
					argsIgnorePattern: '^_',
				},
			],
			'react-hooks/exhaustive-deps': 'off',
			'import/prefer-default-export': 'off',
			'react-hooks/rules-of-hooks': 'off',
			'react/require-default-props': 'off',
			'react/jsx-uses-react': 'error',
			'react/jsx-props-no-spreading': 'off',
			'no-shadow': 'off',
			'@typescript-eslint/no-non-null-assertion': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'prefer-destructuring': ['error', { object: true, array: false }],
			'react/no-array-index-key': ['warn'],
			'block-spacing': 'error',
			'react/function-component-definition': [
				'warn',
				{
					namedComponents: ['arrow-function'],
				},
			],
			'jsx-a11y/label-has-associated-control': [
				'error',
				{
					required: {
						some: ['nesting', 'id'],
					},
				},
			],
			'jsx-a11y/label-has-for': [
				'error',
				{
					required: {
						some: ['nesting', 'id'],
					},
				},
			],
			'prettier/prettier': ['error', { singleQuote: true }],
			quotes: [
				'error',
				'single',
				{
					avoidEscape: true,
				},
			],
			'import/extensions': [
				'error',
				'ignorePackages',
				{
					js: 'never',
					jsx: 'never',
					ts: 'never',
					tsx: 'never',
					'': 'never',
				},
			],
			'padding-line-between-statements': [
				'error',
				{ blankLine: 'always', prev: '*', next: 'return' },
				{ blankLine: 'always', prev: '*', next: 'block-like' },
				{ blankLine: 'always', prev: 'block-like', next: '*' },
			],
		},
		settings: {
			react: {
				version: 'detect',
			},
		},
	},
];

export default eslintConfig;
