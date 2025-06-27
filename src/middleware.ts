// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { PAGE_PATHS, I18N_CONFIG } from '@/lib/constants/config';
import {
	PROTECTED_ROUTES,
	ADMIN_ROUTES,
	PUBLIC_API_ROUTES,
} from '@/lib/middleware/routes';

const LOCALE_REGEX = /^\/[a-z]{2}/;
const STATIC_ASSETS_REGEX =
	/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/;

const intlMiddleware = createIntlMiddleware(routing);

const matchesRoutes = (
	pathname: string,
	routes: readonly string[],
): boolean => {
	const pathWithoutLocale = pathname.replace(LOCALE_REGEX, '') || '/';

	return routes.some((route) =>
		route === '/'
			? pathWithoutLocale === '/'
			: pathWithoutLocale.startsWith(route),
	);
};

const isProtectedRoute = (pathname: string): boolean =>
	matchesRoutes(pathname, PROTECTED_ROUTES);
const isAdminRoute = (pathname: string): boolean =>
	matchesRoutes(pathname, ADMIN_ROUTES);
const isPublicApiRoute = (pathname: string): boolean =>
	matchesRoutes(pathname, PUBLIC_API_ROUTES);

const getLocaleFromPathname = (pathname: string): string => {
	const possibleLocale = pathname.split('/')[1];

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

const hasValidSession = (request: NextRequest): boolean => {
	const sessionToken =
		request.cookies.get('next-auth.session-token') ||
		request.cookies.get('__Secure-next-auth.session-token');

	return !!sessionToken?.value;
};

const isAdmin = (request: NextRequest): boolean =>
	request.cookies.get('user-role')?.value === 'ADMIN';

const handleApiRoute = async (request: NextRequest): Promise<NextResponse> => {
	const { pathname } = request.nextUrl;
	const { method } = request;

	if (method === 'OPTIONS') return new NextResponse(null, { status: 200 });
	if (pathname.startsWith('/api/auth/') || isPublicApiRoute(pathname))
		return NextResponse.next();

	const hasSession = hasValidSession(request);
	if (!hasSession)
		return NextResponse.json(
			{ error: 'Authentication required' },
			{ status: 401 },
		);

	if (pathname.startsWith('/api/admin/') && !isAdmin(request)) {
		return NextResponse.json(
			{ error: 'Admin access required' },
			{ status: 403 },
		);
	}

	return NextResponse.next();
};

const handlePageRoute = async (request: NextRequest): Promise<NextResponse> => {
	const { pathname } = request.nextUrl;
	const isAuthenticated = hasValidSession(request);
	const pathWithoutLocale = pathname.replace(LOCALE_REGEX, '') || '/';

	if (pathWithoutLocale === PAGE_PATHS.AUTH_LOGIN && isAuthenticated) {
		return NextResponse.redirect(
			createLocalizedUrl(request, PAGE_PATHS.DASHBOARD),
		);
	}

	if (isProtectedRoute(pathname) && !isAuthenticated) {
		const loginUrl = createLocalizedUrl(request, PAGE_PATHS.AUTH_LOGIN);
		loginUrl.searchParams.set('callbackUrl', request.url);

		return NextResponse.redirect(loginUrl);
	}

	if (isAdminRoute(pathname)) {
		if (!isAuthenticated) {
			const loginUrl = createLocalizedUrl(request, PAGE_PATHS.AUTH_LOGIN);
			loginUrl.searchParams.set('callbackUrl', request.url);

			return NextResponse.redirect(loginUrl);
		}

		if (!isAdmin(request)) {
			return NextResponse.redirect(
				createLocalizedUrl(request, PAGE_PATHS.DASHBOARD),
			);
		}
	}

	return intlMiddleware(request);
};

const addPerformanceHeaders = (
	response: NextResponse,
	pathname: string,
): NextResponse => {
	const isStatic =
		STATIC_ASSETS_REGEX.test(pathname) || pathname.startsWith('/_next/static');
	const isApi = pathname.startsWith('/api/');

	const securityHeaders: Record<string, string> = {
		'X-Frame-Options': 'DENY',
		'X-Content-Type-Options': 'nosniff',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
		'X-XSS-Protection': '1; mode=block',
		'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
	};

	if (process.env.NODE_ENV === 'production') {
		securityHeaders['Strict-Transport-Security'] =
			'max-age=31536000; includeSubDomains; preload';
	}

	Object.entries(securityHeaders).forEach(([key, value]) => {
		response.headers.set(key, value);
	});

	if (isStatic) {
		response.headers.set(
			'Cache-Control',
			'public, max-age=31536000, immutable',
		);
		response.headers.set('Content-Encoding', 'gzip');
	} else if (isApi) {
		response.headers.set(
			'Cache-Control',
			'no-cache, no-store, must-revalidate',
		);
		response.headers.set('Pragma', 'no-cache');
		response.headers.set('Expires', '0');
	} else {
		response.headers.set(
			'Cache-Control',
			'public, max-age=3600, must-revalidate',
		);
	}

	if (!isApi) {
		response.headers.set('Content-Encoding', 'gzip');
		response.headers.set('Vary', 'Accept-Encoding');
	}

	return response;
};

const middleware = async (request: NextRequest): Promise<NextResponse> => {
	const { pathname } = request.nextUrl;

	if (
		pathname.includes('/_next/') ||
		pathname.includes('/api/auth/') ||
		STATIC_ASSETS_REGEX.test(pathname)
	) {
		const response = NextResponse.next();

		return addPerformanceHeaders(response, pathname);
	}

	const response = pathname.startsWith('/api/')
		? await handleApiRoute(request)
		: await handlePageRoute(request);

	return addPerformanceHeaders(response, pathname);
};

export default middleware;

export const config = {
	matcher: [
		'/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.json).*)',
		'/api/(.*)',
	],
};
