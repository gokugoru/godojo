// src/lib/auth/types.ts
import type { UserRole as PrismaUserRole } from '@prisma/client';

export type UserRole = PrismaUserRole;
export type OAuthProvider = 'github' | 'google';
export type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated';

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

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface RegisterCredentials extends LoginCredentials {
	username: string;
	name?: string;
}

export interface AuthFormData {
	email: string;
	password: string;
	name: string;
	confirmPassword: string;
	username?: string;
}

export interface LoginData {
	email: string;
	password: string;
}

export interface RegisterData {
	email: string;
	password: string;
	name: string;
	confirmPassword: string;
	username?: string;
}

export interface AuthError {
	message: string;
	code?: string;
	field?: string;
}

export interface OAuthResult extends AuthResult {
	provider?: OAuthProvider;
}

export interface SignOutResult {
	success: boolean;
	redirectTo?: string;
	error?: string;
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

export const canModerate = (
	user: { role: string } | null | undefined,
): boolean => isModerator(user);

export const getUserRoleHierarchy = (): Record<UserRole, number> => ({
	USER: 1,
	INSTRUCTOR: 2,
	MODERATOR: 3,
	ADMIN: 4,
});

export const hasMinimumRole = (
	user: { role: string } | null | undefined,
	minimumRole: UserRole,
): boolean => {
	if (!user) return false;

	const hierarchy = getUserRoleHierarchy();
	const userLevel = hierarchy[user.role as UserRole] || 0;
	const requiredLevel = hierarchy[minimumRole];

	return userLevel >= requiredLevel;
};
