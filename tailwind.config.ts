import type { Config } from 'tailwindcss';

const config: Config = {
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{ts,tsx}',
	],
	// В Tailwind v4 больше НЕ НУЖНО theme.extend
	// Все кастомизации идут через CSS variables в globals.css
};

export default config;
