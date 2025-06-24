import type { UserRole as PrismaUserRole } from '@prisma/client';

export type UserRole = PrismaUserRole;

export interface SessionUser {
	id: string;
	email: string;
	name?: string;
	image?: string;
	username: string;
	role: UserRole;
}

export interface AuthResult {
	success: boolean;
	error?: string;
	redirectTo?: string;
	user?: {
		id: string;
		email: string;
		username: string;
		name?: string;
		role: UserRole;
	};
}

export const hasRole = (
	user: { role: string } | null | undefined,
	requiredRole: UserRole,
): user is { role: UserRole } => {
	if (!user) return false;

	return user.role === requiredRole || user.role === 'ADMIN';
};

export const isAdmin = (
	user: { role: string } | null | undefined,
): user is { role: 'ADMIN' } => user?.role === 'ADMIN';

export const isModerator = (
	user: { role: string } | null | undefined,
): user is { role: 'MODERATOR' | 'ADMIN' } =>
	user?.role === 'MODERATOR' || user?.role === 'ADMIN';

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface RegisterCredentials extends LoginCredentials {
	username: string;
	name?: string;
}

export type OAuthProvider = 'github' | 'google';
export type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated';
