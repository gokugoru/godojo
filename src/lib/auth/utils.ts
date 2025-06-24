// @/lib/auth/utils.ts

/**
 * Role-based authorization utilities
 * Provides type-safe methods for checking user permissions
 */

import type { UserRole } from './types';

/**
 * Check if user has a specific role or admin role
 * Uses type assertion to avoid TypeScript literal type issues
 */
export function checkUserRole(
	userRole: string | undefined,
	requiredRole: UserRole,
): boolean {
	if (!userRole) return false;

	// Type assertion to treat as string instead of literal type
	const role = userRole as string;

	// Admin has access to everything
	if (role === 'ADMIN') return true;

	// Check specific role
	return role === requiredRole;
}

/**
 * Check if user has admin privileges
 */
export function isUserAdmin(userRole: string | undefined): boolean {
	if (!userRole) return false;

	return (userRole as string) === 'ADMIN';
}

/**
 * Check if user has moderator or admin privileges
 * Uses explicit string checking to avoid TS2367
 */
export function isUserModerator(userRole: string | undefined): boolean {
	if (!userRole) return false;

	const role = userRole as string;

	return role === 'MODERATOR' || role === 'ADMIN';
}

/**
 * Check if user can access admin routes
 */
export function canAccessAdmin(userRole: string | undefined): boolean {
	return isUserAdmin(userRole);
}

/**
 * Check if user can access moderator routes
 */
export function canAccessModerator(userRole: string | undefined): boolean {
	return isUserModerator(userRole);
}

/**
 * Safe role comparison using Set for performance and type safety
 */
export function hasAnyRole(
	userRole: string | undefined,
	allowedRoles: UserRole[],
): boolean {
	if (!userRole) return false;

	const allowedSet = new Set(allowedRoles);

	return allowedSet.has(userRole as UserRole);
}

/**
 * Get user permission level as number for easy comparison
 */
export function getUserPermissionLevel(userRole: string | undefined): number {
	if (!userRole) return 0;

	const role = userRole as string;

	switch (role) {
		case 'ADMIN':
			return 3;
		case 'MODERATOR':
			return 2;
		case 'USER':
			return 1;
		default:
			return 0;
	}
}

/**
 * Check if user has sufficient permission level
 */
export function hasPermissionLevel(
	userRole: string | undefined,
	requiredLevel: number,
): boolean {
	return getUserPermissionLevel(userRole) >= requiredLevel;
}

/**
 * Alternative role checking using includes method
 */
export function userHasRole(
	userRole: string | undefined,
	allowedRoles: string[],
): boolean {
	if (!userRole) return false;

	return allowedRoles.includes(userRole as string);
}
