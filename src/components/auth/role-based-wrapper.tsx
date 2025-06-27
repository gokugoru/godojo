// src/components/auth/role-based-wrapper.tsx
'use client';

import { memo, type ReactNode } from 'react';
import { useAuth } from '@/lib/auth/hooks';
import { hasRole, isAdmin, isModerator } from '@/lib/auth/types';
import type { UserRole } from '@/lib/auth/types';

interface RoleBasedWrapperProps {
	children: ReactNode;
	requiredRole?: UserRole;
	requireAuth?: boolean;
	requireAdmin?: boolean;
	requireModerator?: boolean;
	allowedRoles?: UserRole[];
	fallback?: ReactNode;
	inverse?: boolean;
}

export const RoleBasedWrapper = memo(
	({
		children,
		requiredRole,
		requireAuth = false,
		requireAdmin = false,
		requireModerator = false,
		allowedRoles,
		fallback = null,
		inverse = false,
	}: RoleBasedWrapperProps) => {
		const { user, isAuthenticated, isLoading } = useAuth();

		if (isLoading) {
			return <>{fallback}</>;
		}

		let shouldRender = true;

		if (requireAuth && !isAuthenticated) {
			shouldRender = false;
		}

		if (requireAdmin && (!user || !isAdmin(user))) {
			shouldRender = false;
		}

		if (requireModerator && (!user || !isModerator(user))) {
			shouldRender = false;
		}

		if (requiredRole && (!user || !hasRole(user, requiredRole))) {
			shouldRender = false;
		}

		if (allowedRoles && user) {
			shouldRender = allowedRoles.some((role) => hasRole(user, role));
		}

		if (inverse) {
			shouldRender = !shouldRender;
		}

		return <>{shouldRender ? children : fallback}</>;
	},
);

export const RequireAuth = memo(
	({
		children,
		fallback = null,
	}: {
		children: ReactNode;
		fallback?: ReactNode;
	}) => (
		<RoleBasedWrapper requireAuth fallback={fallback}>
			{children}
		</RoleBasedWrapper>
	),
);

export const RequireAdmin = memo(
	({
		children,
		fallback = null,
	}: {
		children: ReactNode;
		fallback?: ReactNode;
	}) => (
		<RoleBasedWrapper requireAdmin fallback={fallback}>
			{children}
		</RoleBasedWrapper>
	),
);

export const RequireModerator = memo(
	({
		children,
		fallback = null,
	}: {
		children: ReactNode;
		fallback?: ReactNode;
	}) => (
		<RoleBasedWrapper requireModerator fallback={fallback}>
			{children}
		</RoleBasedWrapper>
	),
);

export const RequireRole = memo(
	({
		role,
		children,
		fallback = null,
	}: {
		role: UserRole;
		children: ReactNode;
		fallback?: ReactNode;
	}) => (
		<RoleBasedWrapper requiredRole={role} fallback={fallback}>
			{children}
		</RoleBasedWrapper>
	),
);

export const RequireAnyRole = memo(
	({
		roles,
		children,
		fallback = null,
	}: {
		roles: UserRole[];
		children: ReactNode;
		fallback?: ReactNode;
	}) => (
		<RoleBasedWrapper allowedRoles={roles} fallback={fallback}>
			{children}
		</RoleBasedWrapper>
	),
);

export const RequireGuest = memo(
	({
		children,
		fallback = null,
	}: {
		children: ReactNode;
		fallback?: ReactNode;
	}) => (
		<RoleBasedWrapper requireAuth inverse fallback={fallback}>
			{children}
		</RoleBasedWrapper>
	),
);

RoleBasedWrapper.displayName = 'RoleBasedWrapper';
RequireAuth.displayName = 'RequireAuth';
RequireAdmin.displayName = 'RequireAdmin';
RequireModerator.displayName = 'RequireModerator';
RequireRole.displayName = 'RequireRole';
RequireAnyRole.displayName = 'RequireAnyRole';
RequireGuest.displayName = 'RequireGuest';
