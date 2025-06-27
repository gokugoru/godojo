// src/lib/auth/server.ts
import { auth } from './auth';
import { hasAnyRole, isUserAdmin, canAccessModerator } from './utils';
import type { UserRole } from './types';

export const getServerSession = async () => {
	try {
		return await auth();
	} catch (error) {
		console.error('Auth error:', error);

		return null;
	}
};

export const requireAuth = async () => {
	const session = await getServerSession();

	if (!session?.user) {
		throw new Error('Authentication required');
	}

	return session;
};

export const requireAdmin = async () => {
	const session = await requireAuth();

	if (!isUserAdmin(session.user.role)) {
		throw new Error('Admin access required');
	}

	return session;
};

export const requireModerator = async () => {
	const session = await requireAuth();

	if (!canAccessModerator(session.user.role)) {
		throw new Error('Moderator access required');
	}

	return session;
};

export const requireRole = async (role: UserRole) => {
	const session = await requireAuth();

	if (!hasAnyRole(session.user.role, [role])) {
		throw new Error(`${role} access required`);
	}

	return session;
};
