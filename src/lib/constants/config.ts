// @/lib/constants/config.ts
const isServerSide = process.env.CHECK_SERVER === 'true';

export const APP_CONFIG = {
	name: 'Go Dojo',
	description: 'Modern educational platform for learning Go programming',
	version: '1.0.0',
	author: 'Go Dojo Team',
	url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
} as const;

export const PAGE_PATHS = {
	HOME: '/',
	MODULES: '/modules',
	AUTH_LOGIN: '/auth/login',
	AUTH_REGISTER: '/auth/register',
	AUTH_ERROR: '/auth/error',
	DASHBOARD: '/dashboard',
	PROFILE: '/profile',
	SETTINGS: '/settings',
	ADMIN: '/admin',
	ADMIN_USERS: '/admin/users',
	ADMIN_MODULES: '/admin/modules',
	ADMIN_STATS: '/admin/stats',
	MODULE: (slug: string) => `/modules/${slug}`,
	TOPIC: (slug: string) => `/topic/${slug}`,
	SECTION: (moduleSlug: string, sectionSlug: string) =>
		`/modules/${moduleSlug}/${sectionSlug}`,
} as const;

export const REDIRECTS = {
	afterLogin: PAGE_PATHS.DASHBOARD,
	afterLogout: PAGE_PATHS.HOME,
	unauthorized: PAGE_PATHS.AUTH_LOGIN,
	adminOnly: PAGE_PATHS.DASHBOARD,
	afterRegister: PAGE_PATHS.DASHBOARD,
} as const;

export const API_ENDPOINTS = {
	AUTH_LOGIN: '/api/auth/signin',
	AUTH_LOGOUT: '/api/auth/signout',
	AUTH_SESSION: '/api/auth/session',
	USER_PROFILE: '/api/user/profile',
	USER_PROGRESS: '/api/user/progress',
	USER_BOOKMARKS: '/api/user/bookmarks',
	ADMIN_STATS: '/api/admin/stats',
	ADMIN_USERS: '/api/admin/users',
	ADMIN_MODULES: '/api/admin/modules',
	MODULES: '/api/modules',
	MODULE_DETAIL: (id: string) => `/api/modules/${id}`,
	TOPICS: '/api/topics',
	TOPIC_DETAIL: (id: string) => `/api/topics/${id}`,
	PROGRESS_UPDATE: '/api/progress/update',
	PROGRESS_BULK: '/api/progress/bulk',
} as const;

export const CACHE_CONFIG = {
	SESSION_TTL: 30 * 24 * 60 * 60,
	USER_PROGRESS_TTL: 10 * 60,
	USER_PROFILE_TTL: 15 * 60,
	ADMIN_STATS_TTL: 15 * 60,
	MODULE_CONTENT_TTL: 60 * 60,
	TOPIC_CONTENT_TTL: 60 * 60,
	STATIC_DATA_TTL: 24 * 60 * 60,
} as const;

export const RATE_LIMITS = {
	API_REQUESTS_PER_MINUTE: parseInt(process.env.RATE_LIMIT_API ?? '200'),
	AUTH_ATTEMPTS_PER_15MIN: parseInt(process.env.RATE_LIMIT_AUTH ?? '200'),
	REGISTER_ATTEMPTS_PER_HOUR: parseInt(process.env.RATE_LIMIT_REGISTER ?? '5'),
	EXPORT_REQUESTS_PER_HOUR: parseInt(process.env.RATE_LIMIT_EXPORT ?? '3'),
	PASSWORD_RESET_PER_HOUR: parseInt(
		process.env.RATE_LIMIT_PASSWORD_RESET ?? '3',
	),
} as const;

export const SECURITY_CONFIG = {
	PASSWORD_MIN_LENGTH: 8,
	PASSWORD_REQUIRE_UPPERCASE: true,
	PASSWORD_REQUIRE_LOWERCASE: true,
	PASSWORD_REQUIRE_NUMBERS: true,
	PASSWORD_REQUIRE_SYMBOLS: false,
	SESSION_COOKIE_SECURE: process.env.NODE_ENV === 'production',
	SESSION_COOKIE_HTTP_ONLY: true,
	SESSION_COOKIE_SAME_SITE: 'lax' as const,
	CSRF_TOKEN_LENGTH: 32,
	RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,
} as const;

export const FEATURES = {
	OAUTH_GITHUB_ENABLED: process.env.NEXT_PUBLIC_OAUTH_GITHUB_ENABLED === 'true',
	OAUTH_GOOGLE_ENABLED: process.env.NEXT_PUBLIC_OAUTH_GOOGLE_ENABLED === 'true',
	EMAIL_VERIFICATION_ENABLED:
		process.env.NEXT_PUBLIC_EMAIL_VERIFICATION === 'true',
	MODULES_ENABLED: true,
	BOOKMARKS_ENABLED: true,
	ACHIEVEMENTS_ENABLED: true,
	COMMENTS_ENABLED: process.env.NEXT_PUBLIC_COMMENTS_ENABLED === 'true',
	PDF_EXPORT_ENABLED: process.env.NEXT_PUBLIC_PDF_EXPORT === 'true',
	EPUB_EXPORT_ENABLED: process.env.NEXT_PUBLIC_EPUB_EXPORT === 'true',
	ADMIN_DASHBOARD_ENABLED: true,
	USER_MANAGEMENT_ENABLED: true,
	ANALYTICS_ENABLED: process.env.NEXT_PUBLIC_ANALYTICS === 'true',
	DEBUG_MODE: process.env.NODE_ENV === 'development',
	MOCK_DATA_ENABLED: process.env.NEXT_PUBLIC_MOCK_DATA === 'true',
} as const;

export const UI_CONFIG = {
	SIDEBAR_WIDTH: 280,
	HEADER_HEIGHT: 64,
	FOOTER_HEIGHT: 80,
	MAX_CONTENT_WIDTH: 1200,
	CARD_BORDER_RADIUS: 8,
	ANIMATION_FAST: 150,
	ANIMATION_NORMAL: 300,
	ANIMATION_SLOW: 500,
	Z_INDEX: {
		DROPDOWN: 1000,
		STICKY: 1020,
		FIXED: 1030,
		MODAL_BACKDROP: 1040,
		MODAL: 1050,
		POPOVER: 1060,
		TOOLTIP: 1070,
		TOAST: 1080,
	},
} as const;

export const I18N_CONFIG = {
	DEFAULT_LOCALE: 'en',
	SUPPORTED_LOCALES: ['en', 'ru'] as const,
	LOCALE_LABELS: {
		en: 'English',
		ru: 'Русский',
	},
	RTL_LOCALES: [] as const,
} as const;

export const DB_CONFIG = {
	MAX_CONNECTIONS: parseInt(process.env.DATABASE_MAX_CONNECTIONS ?? '50'),
	CONNECTION_TIMEOUT: parseInt(process.env.DATABASE_TIMEOUT ?? '5000'),
	DEFAULT_PAGE_SIZE: 20,
	MAX_PAGE_SIZE: 100,
	BULK_INSERT_SIZE: 1000,
	BULK_UPDATE_SIZE: 500,
} as const;

export const EXTERNAL_SERVICES = {
	GITHUB_API_URL: 'https://api.github.com',
	GITHUB_WEBHOOK_SECRET: process.env.GITHUB_WEBHOOK_SECRET,
	EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || 'resend',
	FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@godojo.dev',
	ANALYTICS_ID: process.env.NEXT_PUBLIC_ANALYTICS_ID,
	SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
} as const;

export const CONTENT_CONFIG = {
	DEFAULT_BRANCH: 'main',
	CONTENT_PATH: 'content',
	SYNC_INTERVAL_MINUTES: parseInt(process.env.CONTENT_SYNC_INTERVAL ?? '30'),
	MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB ?? '10'),
	ALLOWED_FILE_TYPES: ['.md', '.mdx', '.json'] as const,
	MAX_TITLE_LENGTH: 200,
	MAX_DESCRIPTION_LENGTH: 500,
	MAX_CONTENT_LENGTH: 50000,
} as const;

export const PERFORMANCE_CONFIG = {
	TARGET_LCP_MS: 1500,
	TARGET_FID_MS: 50,
	TARGET_CLS: 0.1,
	TARGET_BUNDLE_SIZE_KB: 650,
	TARGET_API_RESPONSE_MS: 100,
	TARGET_CACHE_HIT_RATE: 0.85,
} as const;

export const ERROR_CONFIG = {
	MAX_RETRIES: 3,
	RETRY_DELAY_MS: 1000,
	EXPONENTIAL_BACKOFF: true,
	REPORT_CLIENT_ERRORS: process.env.NODE_ENV === 'production',
	REPORT_SERVER_ERRORS: true,
	GRACEFUL_DEGRADATION: true,
	FALLBACK_TIMEOUT_MS: 5000,
} as const;

export const DEV_CONFIG = {
	ENABLE_MOCK_AUTH: process.env.ENABLE_MOCK_AUTH === 'true',
	ENABLE_MOCK_API: process.env.ENABLE_MOCK_API === 'true',
	VERBOSE_LOGGING: process.env.VERBOSE_LOGGING === 'true',
	LOG_QUERIES: process.env.LOG_QUERIES === 'true',
	FAST_REFRESH: true,
	MONITOR_PERFORMANCE: process.env.MONITOR_DEV_PERFORMANCE === 'true',
} as const;

export type AppConfig = typeof APP_CONFIG;
export type PagePath = typeof PAGE_PATHS;
export type Redirect = typeof REDIRECTS;
export type ApiEndpoint = typeof API_ENDPOINTS;
export type CacheConfig = typeof CACHE_CONFIG;
export type RateLimit = typeof RATE_LIMITS;
export type SecurityConfig = typeof SECURITY_CONFIG;
export type Feature = typeof FEATURES;
export type UIConfig = typeof UI_CONFIG;
export type I18nConfig = typeof I18N_CONFIG;
export type SupportedLocale = (typeof I18N_CONFIG.SUPPORTED_LOCALES)[number];

if (process.env.NODE_ENV === 'development' && isServerSide) {
	const requiredEnvVars = [
		'DATABASE_URL',
		'NEXTAUTH_SECRET',
		'NEXTAUTH_URL',
	] as const;

	const missingEnvs: string[] = [];

	const missingEnvVars = requiredEnvVars.filter((varName) => {
		if (!process.env[varName] && process.env[varName] !== '') {
			missingEnvs.push(varName);

			return true;
		}
	});

	if (missingEnvs.length) {
		console.warn(
			'⚠️  Missing required environment variables:',
			missingEnvVars.join(', '),
		);
	}
}

export const CONFIG = {
	APP: APP_CONFIG,
	PAGES: PAGE_PATHS,
	REDIRECTS,
	API: API_ENDPOINTS,
	CACHE: CACHE_CONFIG,
	RATE_LIMITS,
	SECURITY: SECURITY_CONFIG,
	FEATURES,
	UI: UI_CONFIG,
	I18N: I18N_CONFIG,
	DB: DB_CONFIG,
	EXTERNAL: EXTERNAL_SERVICES,
	CONTENT: CONTENT_CONFIG,
	PERFORMANCE: PERFORMANCE_CONFIG,
	ERROR: ERROR_CONFIG,
	DEV: DEV_CONFIG,
} as const;
