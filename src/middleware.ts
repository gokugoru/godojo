import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { auth } from '@/lib/auth/auth';
import { routing } from '@/i18n/routing';
import {
	USER_ROLES,
	UserRole,
	API_PATHS,
	ROUTES_CONFIG,
	RATE_LIMITS,
	REDIRECTS,
	SECURITY_HEADERS,
	ROLE_HIERARCHY,
} from '@/lib/constants/config';

const intlMiddleware = createIntlMiddleware(routing);

const matchesRoutes = (pathname: string, routes: readonly string[]) => {
	const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '') || '/';

	return routes.some((route) => {
		if (route === '/') return pathWithoutLocale === '/';

		return pathWithoutLocale.startsWith(route);
	});
};

const isProtectedRoute = (pathname: string) =>
	matchesRoutes(pathname, ROUTES_CONFIG.protected);

const isAdminRoute = (pathname: string) =>
	matchesRoutes(pathname, ROUTES_CONFIG.admin);

const isModeratorRoute = (pathname: string) =>
	matchesRoutes(pathname, ROUTES_CONFIG.moderator);

const isProtectedApiRoute = (pathname: string) =>
	matchesRoutes(pathname, ROUTES_CONFIG.api.protected);

const isAdminApiRoute = (pathname: string) =>
	matchesRoutes(pathname, ROUTES_CONFIG.api.admin);

const isPublicApiRoute = (pathname: string) =>
	matchesRoutes(pathname, ROUTES_CONFIG.api.public);

const hasPermission = (
	userRole: string | undefined,
	requiredRole: keyof typeof USER_ROLES,
) => {
	if (!userRole || !(userRole in ROLE_HIERARCHY)) return false;

	return (
		ROLE_HIERARCHY[userRole as UserRole]?.includes(USER_ROLES[requiredRole]) ??
		false
	);
};

const getLocaleFromPathname = (pathname: string) => {
	const segments = pathname.split('/');
	const possibleLocale = segments[1];

	return routing.locales.includes(
		possibleLocale as (typeof routing.locales)[number],
	)
		? possibleLocale
		: routing.defaultLocale;
};

const createLocalizedUrl = (request: NextRequest, path: string) => {
	const locale = getLocaleFromPathname(request.nextUrl.pathname);
	const baseUrl = new URL(request.url);
	baseUrl.pathname = `/${locale}${path}`;

	return baseUrl;
};

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const getRateLimitForPath = (pathname: string) => {
	if (pathname.startsWith(API_PATHS.EXPORT)) return RATE_LIMITS.export;
	if (pathname.startsWith(API_PATHS.AUTH)) return RATE_LIMITS.auth;
	if (pathname.startsWith(API_PATHS.ADMIN)) return RATE_LIMITS.admin;

	return RATE_LIMITS.default;
};

const checkRateLimit = (ip: string, pathname: string) => {
	const limit = getRateLimitForPath(pathname);
	const now = Date.now();
	const windowStart = Math.floor(now / RATE_LIMITS.window);
	const key = `${ip}:${windowStart}`;

	const current = rateLimitMap.get(key) || {
		count: 0,
		resetTime: now + RATE_LIMITS.window,
	};
	current.count++;
	rateLimitMap.set(key, current);

	if (rateLimitMap.size > 1000) {
		for (const [k, v] of rateLimitMap.entries()) {
			if (v.resetTime < now) {
				rateLimitMap.delete(k);
			}
		}
	}

	return current.count <= limit;
};

const getClientIP = (request: NextRequest): string => {
	const forwarded = request.headers.get('x-forwarded-for');
	const realIP = request.headers.get('x-real-ip');
	const cfConnectingIP = request.headers.get('cf-connecting-ip');

	return cfConnectingIP || realIP || forwarded?.split(',')[0] || 'unknown';
};

const handleApiRoute = async (request: NextRequest) => {
	const { pathname } = request.nextUrl;
	const { method } = request;

	if (method === 'OPTIONS') {
		return new NextResponse(null, { status: 200 });
	}

	const ip = getClientIP(request);

	if (!checkRateLimit(ip, pathname)) {
		return NextResponse.json(
			{ error: 'Rate limit exceeded' },
			{ status: 429, headers: { 'Retry-After': '60' } },
		);
	}

	if (isPublicApiRoute(pathname)) {
		return NextResponse.next();
	}

	if (isProtectedApiRoute(pathname) || isAdminApiRoute(pathname)) {
		const session = await auth();

		if (!session?.user) {
			return NextResponse.json(
				{ error: 'Authentication required' },
				{ status: 401 },
			);
		}

		if (
			isAdminApiRoute(pathname) &&
			!hasPermission(session.user.role, 'ADMIN')
		) {
			return NextResponse.json(
				{ error: 'Admin access required' },
				{ status: 403 },
			);
		}
	}

	return NextResponse.next();
};

const handlePageRoute = async (request: NextRequest) => {
	const { pathname } = request.nextUrl;
	const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '') || '/';

	const session = await auth();
	const isAuthenticated = !!session?.user;
	const userRole = session?.user?.role;

	if (pathWithoutLocale === REDIRECTS.loginPage && isAuthenticated) {
		return NextResponse.redirect(
			createLocalizedUrl(request, REDIRECTS.afterLogin),
		);
	}

	if (isProtectedRoute(pathname) && !isAuthenticated) {
		const loginUrl = createLocalizedUrl(request, REDIRECTS.loginPage);
		loginUrl.searchParams.set('callbackUrl', request.url);

		return NextResponse.redirect(loginUrl);
	}

	if (isAdminRoute(pathname) && !hasPermission(userRole, 'ADMIN')) {
		if (!isAuthenticated) {
			const loginUrl = createLocalizedUrl(request, REDIRECTS.loginPage);
			loginUrl.searchParams.set('callbackUrl', request.url);

			return NextResponse.redirect(loginUrl);
		}

		return NextResponse.redirect(
			createLocalizedUrl(request, REDIRECTS.accessDenied),
		);
	}

	if (isModeratorRoute(pathname) && !hasPermission(userRole, 'MODERATOR')) {
		if (!isAuthenticated) {
			const loginUrl = createLocalizedUrl(request, REDIRECTS.loginPage);
			loginUrl.searchParams.set('callbackUrl', request.url);

			return NextResponse.redirect(loginUrl);
		}

		return NextResponse.redirect(
			createLocalizedUrl(request, REDIRECTS.accessDenied),
		);
	}

	return intlMiddleware(request);
};

const addSecurityHeaders = (response: NextResponse) => {
	Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
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

export default async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	if (pathname.startsWith('/api/')) {
		const response = await handleApiRoute(request);

		return addSecurityHeaders(response);
	}

	const response = await handlePageRoute(request);

	return addSecurityHeaders(response);
}

export const config = {
	matcher: [
		'/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
		'/api/(.*)',
	],
};
