import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://godojo.dev';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatDuration(minutes: number): string {
	if (minutes < 60) {
		return `${minutes}м`;
	}

	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;

	if (remainingMinutes === 0) {
		return `${hours}ч`;
	}

	return `${hours}ч ${remainingMinutes}м`;
}

export function formatNumber(num: number): string {
	if (num >= 1000000) {
		return `${(num / 1000000).toFixed(1)}M`;
	}

	if (num >= 1000) {
		return `${(num / 1000).toFixed(1)}K`;
	}

	return num.toString();
}

export const getBaseUrl = (): string => BASE_URL;
