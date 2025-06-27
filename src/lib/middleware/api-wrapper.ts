// src/lib/middleware/api-wrapper.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/server';
import { isUserAdmin, canAccessModerator } from '@/lib/auth/utils';
import { checkRateLimit, createRateLimitHeaders } from './rate-limits';
import { checkFullAccess } from './access-control';
import type { UserRole } from '@/lib/auth/types';

interface ApiMiddlewareOptions {
	requireAuth?: boolean;
	requireAdmin?: boolean;
	requireModerator?: boolean;
	allowedRoles?: UserRole[];
	checkRateLimit?: boolean;
	checkAccess?: boolean;
}

export const withApiMiddleware = (
	handler: (req: NextRequest) => Promise<NextResponse> | NextResponse,
	options: ApiMiddlewareOptions = {},
) => {
	return async (req: NextRequest): Promise<NextResponse> => {
		try {
			// Handle CORS preflight
			if (req.method === 'OPTIONS') {
				return new NextResponse(null, { status: 200 });
			}

			// Check access controls first (lightweight)
			if (options.checkAccess) {
				const accessResult = await checkFullAccess(req);

				if (!accessResult.isAllowed) {
					const status = accessResult.isMaintenanceMode ? 503 : 403;

					return NextResponse.json({ error: accessResult.reason }, { status });
				}
			}

			// Get session if needed
			let session = null;

			if (
				options.requireAuth ||
				options.requireAdmin ||
				options.requireModerator ||
				options.allowedRoles ||
				options.checkRateLimit
			) {
				session = await getServerSession();
			}

			// Check authentication
			if (options.requireAuth && !session?.user) {
				return NextResponse.json(
					{ error: 'Authentication required' },
					{ status: 401 },
				);
			}

			// Check admin access
			if (options.requireAdmin && session?.user) {
				if (!isUserAdmin(session.user.role)) {
					return NextResponse.json(
						{ error: 'Admin access required' },
						{ status: 403 },
					);
				}
			}

			// Check moderator access
			if (options.requireModerator && session?.user) {
				if (!canAccessModerator(session.user.role)) {
					return NextResponse.json(
						{ error: 'Moderator access required' },
						{ status: 403 },
					);
				}
			}

			// Check specific roles
			if (options.allowedRoles && session?.user) {
				const hasValidRole = options.allowedRoles.includes(
					session.user.role as UserRole,
				);

				if (!hasValidRole) {
					return NextResponse.json(
						{ error: 'Insufficient permissions' },
						{ status: 403 },
					);
				}
			}

			// Check rate limits
			if (options.checkRateLimit) {
				const rateLimitResult = await checkRateLimit(req, session?.user?.id);

				if (!rateLimitResult.success) {
					const headers = createRateLimitHeaders(rateLimitResult);

					return NextResponse.json(
						{
							error: 'Rate limit exceeded',
							remaining: rateLimitResult.remaining,
						},
						{ status: 429, headers },
					);
				}
			}

			// Call the actual handler
			return await handler(req);
		} catch (error) {
			console.error('API middleware error:', error);

			return NextResponse.json(
				{ error: 'Internal server error' },
				{ status: 500 },
			);
		}
	};
};

// Convenience wrappers
export const withAuth = (
	handler: (req: NextRequest) => Promise<NextResponse> | NextResponse,
) => withApiMiddleware(handler, { requireAuth: true, checkRateLimit: true });

export const withAdmin = (
	handler: (req: NextRequest) => Promise<NextResponse> | NextResponse,
) =>
	withApiMiddleware(handler, {
		requireAdmin: true,
		checkRateLimit: true,
		checkAccess: true,
	});

export const withModerator = (
	handler: (req: NextRequest) => Promise<NextResponse> | NextResponse,
) =>
	withApiMiddleware(handler, { requireModerator: true, checkRateLimit: true });

export const withRateLimit = (
	handler: (req: NextRequest) => Promise<NextResponse> | NextResponse,
) => withApiMiddleware(handler, { checkRateLimit: true });

export const withAccessControl = (
	handler: (req: NextRequest) => Promise<NextResponse> | NextResponse,
) => withApiMiddleware(handler, { checkAccess: true });
