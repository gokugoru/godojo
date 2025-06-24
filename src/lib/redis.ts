import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

export const redis = new Redis({
	url: process.env.godojo_KV_REST_API_URL!,
	token: process.env.godojo_KV_REST_API_TOKEN!,
});

export const rateLimiters = {
	api: new Ratelimit({
		redis,
		limiter: Ratelimit.slidingWindow(
			parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE ?? '200'),
			'1 m',
		),
		analytics: true,
	}),

	auth: new Ratelimit({
		redis,
		limiter: Ratelimit.slidingWindow(
			parseInt(process.env.RATE_LIMIT_AUTH_ATTEMPTS ?? '200'),
			'5 m',
		),
		analytics: true,
	}),

	export: new Ratelimit({
		redis,
		limiter: Ratelimit.slidingWindow(
			parseInt(process.env.RATE_LIMIT_EXPORT_REQUESTS ?? '3'),
			'1 h',
		),
		analytics: true,
	}),
};

export const cacheKeys = {
	userSession: (sessionId: string) => `session:${sessionId}`,
	userSessions: (userId: string) => `user:${userId}:sessions`,
	sessionValid: (userId: string) => `session:valid:${userId}`,
	userProgress: (userId: string) => `user:${userId}:progress`,
	userNotifications: (userId: string) => `user:${userId}:notifications`,
	adminStats: () => 'admin:stats',
	moduleContent: (moduleId: string) => `module:${moduleId}:content`,
} as const;

export const cacheTTL = {
	session: parseInt(process.env.CACHE_SESSION_TTL ?? '2592000'),
	userProgress: parseInt(process.env.CACHE_USER_PROGRESS_TTL ?? '600'),
	notifications: 300,
	adminStats: parseInt(process.env.CACHE_ADMIN_STATS_TTL ?? '900'),
	moduleContent: parseInt(process.env.CACHE_MODULE_CONTENT_TTL ?? '3600'),
} as const;

export const cacheUtils = {
	async getUserProgress(userId: string) {
		const key = cacheKeys.userProgress(userId);

		return await redis.get(key);
	},

	async setUserProgress(userId: string, data: any) {
		const key = cacheKeys.userProgress(userId);

		return await redis.setex(key, cacheTTL.userProgress, JSON.stringify(data));
	},

	async invalidateUserProgress(userId: string) {
		const key = cacheKeys.userProgress(userId);

		return await redis.del(key);
	},

	async getAdminStats() {
		const key = cacheKeys.adminStats();

		return await redis.get(key);
	},

	async setAdminStats(data: any) {
		const key = cacheKeys.adminStats();

		return await redis.setex(key, cacheTTL.adminStats, JSON.stringify(data));
	},

	async createSession(sessionId: string, userData: any, userId: string) {
		const sessionKey = cacheKeys.userSession(sessionId);
		const userSessionsKey = cacheKeys.userSessions(userId);

		await redis.setex(sessionKey, cacheTTL.session, JSON.stringify(userData));
		await redis.sadd(userSessionsKey, sessionId);

		return sessionId;
	},

	async invalidateSession(sessionId: string, userId: string) {
		const sessionKey = cacheKeys.userSession(sessionId);
		const userSessionsKey = cacheKeys.userSessions(userId);

		await redis.del(sessionKey);
		await redis.srem(userSessionsKey, sessionId);
	},

	async invalidateAllUserSessions(userId: string) {
		const userSessionsKey = cacheKeys.userSessions(userId);

		try {
			const sessionIds = await redis.smembers(userSessionsKey);

			if (sessionIds.length > 0) {
				const deletePromises = sessionIds.map((sessionId) =>
					redis.del(cacheKeys.userSession(sessionId)),
				);

				await Promise.all([...deletePromises, redis.del(userSessionsKey)]);
			}

			const validKey = cacheKeys.sessionValid(userId);
			await redis.setex(validKey, cacheTTL.session, 'false');
		} catch (error) {
			console.error(`Failed to invalidate sessions for user ${userId}:`, error);
			throw error;
		}
	},

	async isUserSessionValid(userId: string): Promise<boolean> {
		const validKey = cacheKeys.sessionValid(userId);
		const isValid = await redis.get(validKey);

		return isValid !== 'false';
	},

	async markUserSessionValid(userId: string) {
		const validKey = cacheKeys.sessionValid(userId);
		await redis.del(validKey);
	},
};

export const checkRedisHealth = async (): Promise<boolean> => {
	try {
		await redis.ping();

		return true;
	} catch (error) {
		console.error('Redis health check failed:', error);

		return false;
	}
};

export type CacheKey = keyof typeof cacheKeys;
export type CacheTTL = keyof typeof cacheTTL;
