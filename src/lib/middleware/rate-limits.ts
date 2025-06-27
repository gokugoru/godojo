// src/lib/middleware/rate-limit.ts
import { NextRequest } from 'next/server';
import { rateLimiters } from '@/lib/redis';

interface RateLimitResult {
	success: boolean;
	remaining: number;
	resetTime?: number;
}

export const getClientIP = (request: NextRequest): string => {
	const cfConnectingIP = request.headers.get('cf-connecting-ip');
	const realIP = request.headers.get('x-real-ip');
	const forwarded = request.headers.get('x-forwarded-for');

	return cfConnectingIP || realIP || forwarded?.split(',')[0] || 'unknown';
};

const getRateLimiterForPath = (pathname: string) => {
	if (pathname.includes('/auth/')) {
		return rateLimiters.auth;
	}

	if (pathname.includes('/export/')) {
		return rateLimiters.export;
	}

	return rateLimiters.api;
};

export const checkRateLimit = async (
	request: NextRequest,
	userId?: string,
): Promise<RateLimitResult> => {
	try {
		const ip = getClientIP(request);
		const { pathname } = request.nextUrl;
		const rateLimiter = getRateLimiterForPath(pathname);
		const key = userId ? `user:${userId}` : `ip:${ip}`;

		const result = await rateLimiter.limit(key);

		return {
			success: result.success,
			remaining: result.remaining,
			resetTime: result.reset,
		};
	} catch (error) {
		console.error('Rate limit check failed:', error);

		return { success: true, remaining: 1000 };
	}
};

export const createRateLimitHeaders = (result: RateLimitResult) => ({
	'X-RateLimit-Remaining': result.remaining.toString(),
	'X-RateLimit-Reset': result.resetTime?.toString() || '',
	'Retry-After': result.success ? '' : '60',
});
