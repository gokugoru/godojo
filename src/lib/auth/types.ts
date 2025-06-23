/**
 * Shared authentication types for type safety across client and server
 */

import type { UserRole as PrismaUserRole } from '@prisma/client';

// Re-export Prisma role type for consistency
export type UserRole = PrismaUserRole;

// User type for client-side (from NextAuth session)
export interface SessionUser {
	id: string;
	email: string;
	name?: string;
	image?: string;
	username: string;
	role: UserRole;
}

// Auth result type for server actions
export interface AuthResult {
	success: boolean;
	error?: string;
	user?: {
		id: string;
		email: string;
		username: string;
		name?: string;
		role: UserRole;
	};
}

// Type guard for checking user roles
export function hasRole(
	user: { role: string } | null | undefined,
	requiredRole: UserRole,
): user is { role: UserRole } {
	if (!user) return false;

	return user.role === requiredRole || user.role === 'ADMIN';
}

// Type guard for checking if user is admin
export function isAdmin(
	user: { role: string } | null | undefined,
): user is { role: 'ADMIN' } {
	return user?.role === 'ADMIN';
}

// Type guard for checking if user has moderator or admin role
export function isModerator(
	user: { role: string } | null | undefined,
): user is { role: 'MODERATOR' | 'ADMIN' } {
	return user?.role === 'MODERATOR' || user?.role === 'ADMIN';
}

// Form data types
export interface LoginCredentials {
	email: string;
	password: string;
}

export interface RegisterCredentials extends LoginCredentials {
	username: string;
	name?: string;
}

// OAuth provider types
export type OAuthProvider = 'github' | 'google';

// Session status types
export type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated';
