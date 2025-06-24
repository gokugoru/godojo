// @/lib/edge-config.ts
/**
 * Edge Config client for Go Dojo with development fallbacks
 */

import { get } from '@vercel/edge-config';

// Type definitions for Edge Config data
interface GoDojoEdgeConfig {
	features: {
		adminPanel: boolean;
		userProgress: boolean;
		bookmarks: boolean;
		achievements: boolean;
		bookExport: boolean;
		aiAssistant: boolean;
		liveChat: boolean;
		videoLessons: boolean;
		syntaxHighlighting: boolean;
		darkMode: boolean;
		offlineMode: boolean;
	};

	security: {
		blockedIPs: string[];
		bannedUsers: string[];
		maintenanceMode: boolean;
		emergencyLockdown: boolean;
	};

	rateLimits: {
		apiRequestsPerMinute: number;
		authAttemptsPerHour: number;
		exportRequestsPerHour: number;
		uploadRequestsPerDay: number;
	};

	courses: {
		[courseId: string]: {
			isPublished: boolean;
			isPremium: boolean;
			difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
			estimatedHours: number;
			prerequisites: string[];
		};
	};

	notifications: {
		globalMessage?: {
			type: 'info' | 'warning' | 'error' | 'success';
			message: string;
			link?: string;
			expiry?: string;
		};
		adminAlerts: boolean;
		userNotifications: boolean;
	};

	maintenance: {
		isScheduled: boolean;
		startTime?: string;
		endTime?: string;
		message?: string;
	};
}

// Default configuration fallback
const defaultConfig: GoDojoEdgeConfig = {
	features: {
		adminPanel: true,
		userProgress: true,
		bookmarks: true,
		achievements: true,
		bookExport: true,
		aiAssistant: false,
		liveChat: false,
		videoLessons: false,
		syntaxHighlighting: true,
		darkMode: true,
		offlineMode: false,
	},

	security: {
		blockedIPs: [],
		bannedUsers: [],
		maintenanceMode: false,
		emergencyLockdown: false,
	},

	rateLimits: {
		apiRequestsPerMinute: 100,
		authAttemptsPerHour: 5,
		exportRequestsPerHour: 3,
		uploadRequestsPerDay: 20,
	},

	courses: {},

	notifications: {
		adminAlerts: true,
		userNotifications: true,
	},

	maintenance: {
		isScheduled: false,
	},
};

/**
 * Checks if Edge Config is properly configured
 */
const isEdgeConfigAvailable = (): boolean => {
	return Boolean(process.env.EDGE_CONFIG);
};

/**
 * Safely gets data from Edge Config with fallback
 */
const safeGet = async <T>(key: string, fallback: T): Promise<T> => {
	if (!isEdgeConfigAvailable()) {
		console.warn(`Edge Config not available, using fallback for key: ${key}`);

		return fallback;
	}

	try {
		const result = await get<T>(key);

		return result ?? fallback;
	} catch (error) {
		console.error(`Edge Config error for key ${key}:`, error);

		return fallback;
	}
};

// Edge Config utilities
export const edgeConfig = {
	/**
	 * Get feature flag status
	 */
	async getFeature(
		featureName: keyof GoDojoEdgeConfig['features'],
	): Promise<boolean> {
		const features = await safeGet('features', defaultConfig.features);

		return features[featureName];
	},

	/**
	 * Get all feature flags
	 */
	async getFeatures(): Promise<GoDojoEdgeConfig['features']> {
		return await safeGet('features', defaultConfig.features);
	},

	/**
	 * Check if IP is blocked
	 */
	async isIPBlocked(ip: string): Promise<boolean> {
		const security = await safeGet('security', defaultConfig.security);

		return security.blockedIPs.includes(ip);
	},

	/**
	 * Check if user is banned
	 */
	async isUserBanned(userId: string): Promise<boolean> {
		const security = await safeGet('security', defaultConfig.security);

		return security.bannedUsers.includes(userId);
	},

	/**
	 * Check if maintenance mode is active
	 */
	async isMaintenanceMode(): Promise<boolean> {
		const [security, maintenance] = await Promise.all([
			safeGet('security', defaultConfig.security),
			safeGet('maintenance', defaultConfig.maintenance),
		]);

		// Emergency lockdown overrides everything
		if (security.emergencyLockdown) return true;

		// Regular maintenance mode
		if (security.maintenanceMode) return true;

		// Scheduled maintenance
		if (
			maintenance.isScheduled &&
			maintenance.startTime &&
			maintenance.endTime
		) {
			const now = new Date();
			const start = new Date(maintenance.startTime);
			const end = new Date(maintenance.endTime);

			return now >= start && now <= end;
		}

		return false;
	},

	/**
	 * Get rate limit for specific type
	 */
	async getRateLimit(
		type: keyof GoDojoEdgeConfig['rateLimits'],
	): Promise<number> {
		const rateLimits = await safeGet('rateLimits', defaultConfig.rateLimits);

		return rateLimits[type];
	},

	/**
	 * Get course configuration
	 */
	async getCourseConfig(courseId: string) {
		const courses = await safeGet('courses', defaultConfig.courses);

		return courses[courseId] ?? null;
	},

	/**
	 * Get global notification message
	 */
	async getGlobalMessage() {
		const notifications = await safeGet(
			'notifications',
			defaultConfig.notifications,
		);
		const message = notifications.globalMessage;

		// Check if message has expired
		if (message?.expiry) {
			const now = new Date();
			const expiry = new Date(message.expiry);
			if (now > expiry) return null;
		}

		return message ?? null;
	},

	/**
	 * Get entire configuration (use sparingly)
	 */
	async getFullConfig(): Promise<GoDojoEdgeConfig> {
		if (!isEdgeConfigAvailable()) {
			console.warn('Edge Config not available, using default configuration');

			return defaultConfig;
		}

		try {
			const [
				features,
				security,
				rateLimits,
				courses,
				notifications,
				maintenance,
			] = await Promise.all([
				safeGet('features', defaultConfig.features),
				safeGet('security', defaultConfig.security),
				safeGet('rateLimits', defaultConfig.rateLimits),
				safeGet('courses', defaultConfig.courses),
				safeGet('notifications', defaultConfig.notifications),
				safeGet('maintenance', defaultConfig.maintenance),
			]);

			return {
				features,
				security,
				rateLimits,
				courses,
				notifications,
				maintenance,
			};
		} catch (error) {
			console.error('Error getting full Edge Config:', error);

			return defaultConfig;
		}
	},
};

// Helper functions for Next.js middleware
export async function checkAccess(ip: string, userId?: string) {
	const [isMaintenanceMode, isIPBlocked, isUserBanned] = await Promise.all([
		edgeConfig.isMaintenanceMode(),
		edgeConfig.isIPBlocked(ip),
		userId ? edgeConfig.isUserBanned(userId) : Promise.resolve(false),
	]);

	return {
		isMaintenanceMode,
		isIPBlocked,
		isUserBanned,
		hasAccess: !isMaintenanceMode && !isIPBlocked && !isUserBanned,
	};
}

// Type exports
export type { GoDojoEdgeConfig };
