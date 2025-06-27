// src/lib/middleware/routes.ts
// Только маршруты для middleware - импортируем из основного config

export const PROTECTED_ROUTES = [
	'/dashboard',
	'/profile',
	'/settings',
	'/bookmarks',
	'/progress',
] as const;

export const ADMIN_ROUTES = ['/admin'] as const;

export const PUBLIC_API_ROUTES = ['/api/auth', '/api/health'] as const;

export const PROTECTED_API_ROUTES = [
	'/api/user',
	'/api/progress',
	'/api/bookmarks',
] as const;

export const ADMIN_API_ROUTES = ['/api/admin'] as const;
