export const USER_ROLES = {
	USER: 'USER',
	MODERATOR: 'MODERATOR',
	ADMIN: 'ADMIN',
	CONTRIBUTOR: 'CONTRIBUTOR',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const API_PATHS = {
	EXPORT: '/api/export',
	AUTH: '/api/auth',
	ADMIN: '/api/admin',
	USER: '/api/user',
	PROGRESS: '/api/progress',
	BOOKMARKS: '/api/bookmarks',
	COMMENTS: '/api/comments',
	FEEDBACK: '/api/feedback',
	HEALTH: '/api/health',
} as const;

export const PAGE_PATHS = {
	HOME: '/',
	DASHBOARD: '/dashboard',
	PROFILE: '/profile',
	SETTINGS: '/settings',
	BOOKMARKS: '/bookmarks',
	PROGRESS: '/progress',
	EXPORT: '/export',
	ADMIN: '/admin',
	MODERATE: '/moderate',
	LOGIN: '/auth/login',
	REGISTER: '/auth/register',
	ERROR: '/auth/error',
	VERIFY: '/auth/verify',
} as const;

export const ROUTES_CONFIG = {
	protected: [
		PAGE_PATHS.DASHBOARD,
		PAGE_PATHS.PROFILE,
		PAGE_PATHS.SETTINGS,
		PAGE_PATHS.BOOKMARKS,
		PAGE_PATHS.PROGRESS,
		PAGE_PATHS.EXPORT,
	],
	admin: [PAGE_PATHS.ADMIN],
	moderator: [
		PAGE_PATHS.MODERATE,
		'/admin/content',
		'/admin/feedback',
		'/admin/comments',
	],
	public: [
		PAGE_PATHS.HOME,
		PAGE_PATHS.LOGIN,
		PAGE_PATHS.REGISTER,
		PAGE_PATHS.ERROR,
		PAGE_PATHS.VERIFY,
	],
	api: {
		protected: [
			API_PATHS.USER,
			API_PATHS.PROGRESS,
			API_PATHS.BOOKMARKS,
			API_PATHS.COMMENTS,
			API_PATHS.FEEDBACK,
			API_PATHS.EXPORT,
		],
		admin: [API_PATHS.ADMIN],
		public: [API_PATHS.AUTH, API_PATHS.HEALTH],
	},
} as const;

export const RATE_LIMITS = {
	default: 100,
	export: 10,
	auth: 20,
	admin: 200,
	window: 60000,
} as const;

export const REDIRECTS = {
	afterLogin: PAGE_PATHS.DASHBOARD,
	loginPage: PAGE_PATHS.LOGIN,
	accessDenied: PAGE_PATHS.DASHBOARD,
} as const;

export const SECURITY_HEADERS = {
	'X-Frame-Options': 'DENY',
	'X-Content-Type-Options': 'nosniff',
	'Referrer-Policy': 'strict-origin-when-cross-origin',
	'X-XSS-Protection': '1; mode=block',
} as const;

export const ROLE_HIERARCHY: Record<UserRole, UserRole[]> = {
	[USER_ROLES.USER]: [USER_ROLES.USER],
	[USER_ROLES.MODERATOR]: [USER_ROLES.USER, USER_ROLES.MODERATOR],
	[USER_ROLES.ADMIN]: [USER_ROLES.USER, USER_ROLES.MODERATOR, USER_ROLES.ADMIN],
	[USER_ROLES.CONTRIBUTOR]: [USER_ROLES.USER, USER_ROLES.CONTRIBUTOR],
};
