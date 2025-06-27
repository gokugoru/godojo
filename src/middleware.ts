import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { auth } from '@/lib/auth/auth';
import { routing } from '@/i18n/routing';
import { rateLimiters } from '@/lib/redis';
import { checkAccess } from '@/lib/edge-config';
import { PAGE_PATHS, REDIRECTS, I18N_CONFIG } from '@/lib/constants/config';
import type { UserRole } from '@prisma/client';

const LOCALE_REGEX = /^\/[a-z]{2}/;
const MAINTENANCE_PAGE = '/maintenance';
const BANNED_USER_PAGE = '/auth/banned';
const RETRY_AFTER_SECONDS = '60';
const RATE_LIMIT_WINDOW = '3600';

const PROTECTED_ROUTES = [
	'/dashboard',
	'/profile',
	'/settings',
	'/bookmarks',
	'/progress',
] as const;

const ADMIN_ROUTES = ['/admin'] as const;

const PUBLIC_API_ROUTES = ['/api/auth', '/api/health'] as const;

const PROTECTED_API_ROUTES = [
	'/api/user',
	'/api/progress',
	'/api/bookmarks',
] as const;

const ADMIN_API_ROUTES = ['/api/admin'] as const;

const ROLE_HIERARCHY: Record<UserRole, UserRole[]> = {
	ADMIN: ['ADMIN', 'MODERATOR', 'USER'],
	MODERATOR: ['MODERATOR', 'USER'],
	INSTRUCTOR: ['INSTRUCTOR', 'USER'],
	USER: ['USER'],
};

interface RateLimitResult {
	success: boolean;
	remaining?: number;
}

const intlMiddleware = createIntlMiddleware(routing);

const matchesRoutes = (
	pathname: string,
	routes: readonly string[],
): boolean => {
	const pathWithoutLocale = pathname.replace(LOCALE_REGEX, '') || '/';

	return routes.some((route) => {
		if (route === '/') return pathWithoutLocale === '/';

		return pathWithoutLocale.startsWith(route);
	});
};

const isProtectedRoute = (pathname: string): boolean =>
	matchesRoutes(pathname, PROTECTED_ROUTES);

const isAdminRoute = (pathname: string): boolean =>
	matchesRoutes(pathname, ADMIN_ROUTES);

const isProtectedApiRoute = (pathname: string): boolean =>
	matchesRoutes(pathname, PROTECTED_API_ROUTES);

const isAdminApiRoute = (pathname: string): boolean =>
	matchesRoutes(pathname, ADMIN_API_ROUTES);

const isPublicApiRoute = (pathname: string): boolean =>
	matchesRoutes(pathname, PUBLIC_API_ROUTES);

const hasPermission = (
	userRole: UserRole | undefined,
	requiredRole: UserRole,
): boolean => {
	if (!userRole) return false;

	const allowedRoles = ROLE_HIERARCHY[requiredRole] || [];

	return allowedRoles.includes(userRole);
};

const getLocaleFromPathname = (pathname: string): string => {
	const segments = pathname.split('/');
	const possibleLocale = segments[1];

	return I18N_CONFIG.SUPPORTED_LOCALES.includes(possibleLocale as any)
		? possibleLocale
		: I18N_CONFIG.DEFAULT_LOCALE;
};

const createLocalizedUrl = (request: NextRequest, path: string): URL => {
	const locale = getLocaleFromPathname(request.nextUrl.pathname);
	const baseUrl = new URL(request.url);
	baseUrl.pathname = `/${locale}${path}`;

	return baseUrl;
};

const getClientIP = (request: NextRequest): string => {
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

const checkRateLimitRedis = async (
	identifier: string,
	pathname: string,
	userId?: string,
): Promise<RateLimitResult> => {
	try {
		const rateLimiter = getRateLimiterForPath(pathname);
		const key = userId ? `user:${userId}` : `ip:${identifier}`;
		const result = await rateLimiter.limit(key);

		return {
			success: result.success,
			remaining: result.remaining,
		};
	} catch (error) {
		console.error('Redis rate limiting error:', error);

		return { success: true };
	}
};

const createRateLimitResponse = (remaining: number): NextResponse => {
	return NextResponse.json(
		{
			error: 'Rate limit exceeded',
			remaining,
		},
		{
			status: 429,
			headers: {
				'Retry-After': RETRY_AFTER_SECONDS,
				'X-RateLimit-Remaining': remaining.toString(),
			},
		},
	);
};

const createMaintenanceResponse = (): NextResponse => {
	return NextResponse.json(
		{ error: 'Service temporarily unavailable' },
		{
			status: 503,
			headers: { 'Retry-After': RATE_LIMIT_WINDOW },
		},
	);
};

const createAccessDeniedResponse = (message: string): NextResponse => {
	return NextResponse.json({ error: message }, { status: 403 });
};

const createAuthRequiredResponse = (): NextResponse => {
	return NextResponse.json(
		{ error: 'Authentication required' },
		{ status: 401 },
	);
};

const handleApiRoute = async (request: NextRequest): Promise<NextResponse> => {
	const { pathname } = request.nextUrl;
	const { method } = request;

	if (method === 'OPTIONS') {
		return new NextResponse(null, { status: 200 });
	}

	if (pathname === '/api/auth/session') {
		return NextResponse.next();
	}

	const ip = getClientIP(request);

	const { isMaintenanceMode, isIPBlocked } = await checkAccess(ip);

	if (isMaintenanceMode) {
		return createMaintenanceResponse();
	}

	if (isIPBlocked) {
		return createAccessDeniedResponse('Access denied');
	}

	const session = await auth();
	const userId = session?.user?.id;

	const rateLimitResult = await checkRateLimitRedis(ip, pathname, userId);

	if (!rateLimitResult.success) {
		return createRateLimitResponse(rateLimitResult.remaining ?? 0);
	}

	if (isPublicApiRoute(pathname)) {
		return NextResponse.next();
	}

	if (isProtectedApiRoute(pathname) || isAdminApiRoute(pathname)) {
		if (!session?.user) {
			return createAuthRequiredResponse();
		}

		const userAccess = await checkAccess(ip, session.user.id);

		if (userAccess.isUserBanned) {
			return createAccessDeniedResponse('User access revoked');
		}

		if (
			isAdminApiRoute(pathname) &&
			!hasPermission(session.user.role, 'ADMIN')
		) {
			return createAccessDeniedResponse('Admin access required');
		}
	}

	return NextResponse.next();
};

const handlePageRoute = async (request: NextRequest): Promise<NextResponse> => {
	const { pathname } = request.nextUrl;
	const pathWithoutLocale = pathname.replace(LOCALE_REGEX, '') || '/';
	const ip = getClientIP(request);

	const { isMaintenanceMode } = await checkAccess(ip);

	if (isMaintenanceMode) {
		return NextResponse.rewrite(new URL(MAINTENANCE_PAGE, request.url));
	}

	const session = await auth();
	const isAuthenticated = !!session?.user;
	const userRole = session?.user?.role;

	if (session?.user?.id) {
		const userAccess = await checkAccess(ip, session.user.id);

		if (userAccess.isUserBanned) {
			return NextResponse.redirect(
				createLocalizedUrl(request, BANNED_USER_PAGE),
			);
		}
	}

	if (pathWithoutLocale === PAGE_PATHS.AUTH_LOGIN && isAuthenticated) {
		return NextResponse.redirect(
			createLocalizedUrl(request, REDIRECTS.afterLogin),
		);
	}

	if (isProtectedRoute(pathname) && !isAuthenticated) {
		const loginUrl = createLocalizedUrl(request, PAGE_PATHS.AUTH_LOGIN);
		loginUrl.searchParams.set('callbackUrl', request.url);

		return NextResponse.redirect(loginUrl);
	}

	if (isAdminRoute(pathname) && !hasPermission(userRole, 'ADMIN')) {
		if (!isAuthenticated) {
			const loginUrl = createLocalizedUrl(request, PAGE_PATHS.AUTH_LOGIN);
			loginUrl.searchParams.set('callbackUrl', request.url);

			return NextResponse.redirect(loginUrl);
		}

		return NextResponse.redirect(
			createLocalizedUrl(request, REDIRECTS.adminOnly),
		);
	}

	return intlMiddleware(request);
};

const addSecurityHeaders = (response: NextResponse): NextResponse => {
	const securityHeaders = {
		'X-Frame-Options': 'DENY',
		'X-Content-Type-Options': 'nosniff',
		'Referrer-Policy': 'origin-when-cross-origin',
		'X-XSS-Protection': '1; mode=block',
	};

	Object.entries(securityHeaders).forEach(([key, value]) => {
		response.headers.set(key, value);
	});

	if (process.env.NODE_ENV === 'production') {
		response.headers.set(
			'Strict-Transport-Security',
			'max-age=31536000; includeSubDomains',
		);
	}

	return response;
};

const middleware = async (request: NextRequest): Promise<NextResponse> => {
	const { pathname } = request.nextUrl;

	const response = pathname.startsWith('/api/')
		? await handleApiRoute(request)
		: await handlePageRoute(request);

	return addSecurityHeaders(response);
};

export default middleware;

export const config = {
	matcher: [
		'/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
		'/api/(.*)',
	],
};
