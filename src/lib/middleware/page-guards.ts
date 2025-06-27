// src/lib/middleware/page-guards.ts
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth/server';
import { isUserAdmin, canAccessModerator, hasAnyRole } from '@/lib/auth/utils';
import type { UserRole } from '@/lib/auth/types';

interface PageGuardOptions {
	requireAuth?: boolean;
	requireAdmin?: boolean;
	requireModerator?: boolean;
	allowedRoles?: UserRole[];
	redirectTo?: string;
}

export const withPageGuard = async (options: PageGuardOptions = {}) => {
	const {
		requireAuth = false,
		requireAdmin = false,
		requireModerator = false,
		allowedRoles,
		redirectTo = '/auth/login',
	} = options;

	// Get session
	const session = await getServerSession();
	const isAuthenticated = !!session?.user;

	// Check authentication
	if (
		(requireAuth || requireAdmin || requireModerator || allowedRoles) &&
		!isAuthenticated
	) {
		redirect(redirectTo);
	}

	// Check admin access
	if (requireAdmin && session?.user) {
		if (!isUserAdmin(session.user.role)) {
			redirect('/dashboard'); // Or access denied page
		}
	}

	// Check moderator access
	if (requireModerator && session?.user) {
		if (!canAccessModerator(session.user.role)) {
			if (!isAuthenticated) {
				redirect('/auth/login');
			} else {
				redirect('/dashboard');
			}
		}
	}

	// Check specific roles
	if (allowedRoles && session?.user) {
		if (!hasAnyRole(session.user.role, allowedRoles)) {
			redirect('/dashboard');
		}
	}

	return {
		session,
		user: session?.user,
		isAuthenticated,
	};
};

// Convenience functions
export const requireAuthPage = () => withPageGuard({ requireAuth: true });

export const requireAdminPage = () => withPageGuard({ requireAdmin: true });

export const requireModeratorPage = () =>
	withPageGuard({ requireModerator: true });

export const requireRolePage = (roles: UserRole[]) =>
	withPageGuard({ allowedRoles: roles });

// For use in Server Components
export const getAuthenticatedUser = async () => {
	const { user } = await requireAuthPage();

	return user!; // Safe because requireAuth: true
};

export const getOptionalUser = async () => {
	const { user } = await withPageGuard();

	return user || null;
};
