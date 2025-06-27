// src/lib/auth/client-guards.ts
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from './hooks';
import { UserRole, isAdmin, isModerator, hasRole } from './types';

interface ClientGuardOptions {
	redirectTo?: string;
	showToast?: boolean;
	toastMessage?: string;
}

export const useRequireAuth = (options: ClientGuardOptions = {}) => {
	const { user, isLoading, isAuthenticated } = useAuth();
	const router = useRouter();

	const {
		redirectTo = '/auth/login',
		showToast = true,
		toastMessage = 'Для доступа к этой странице необходимо войти в систему',
	} = options;

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			if (showToast) {
				toast.error(toastMessage);
			}

			router.push(redirectTo);
		}
	}, [isLoading, isAuthenticated, router, redirectTo, showToast, toastMessage]);

	return {
		user,
		isLoading,
		isAuthenticated,
		isReady: !isLoading && isAuthenticated,
	};
};

export const useRequireRole = (
	requiredRole: UserRole,
	options: ClientGuardOptions = {},
) => {
	const { user, isLoading, isAuthenticated } = useAuth();
	const router = useRouter();

	const {
		redirectTo = '/dashboard',
		showToast = true,
		toastMessage = `У вас недостаточно прав для доступа к этой странице (требуется роль: ${requiredRole})`,
	} = options;

	const hasPermission = user ? hasRole(user, requiredRole) : false;

	useEffect(() => {
		if (!isLoading && isAuthenticated && !hasPermission) {
			if (showToast) {
				toast.error(toastMessage);
			}

			router.push(redirectTo);
		}
	}, [
		isLoading,
		isAuthenticated,
		hasPermission,
		router,
		redirectTo,
		showToast,
		toastMessage,
	]);

	return {
		user,
		isLoading,
		isAuthenticated,
		hasPermission,
		isReady: !isLoading && isAuthenticated && hasPermission,
	};
};

export const useRequireAdmin = (options: ClientGuardOptions = {}) => {
	const { user, isLoading, isAuthenticated } = useAuth();
	const router = useRouter();

	const {
		redirectTo = '/dashboard',
		showToast = true,
		toastMessage = 'У вас недостаточно прав для доступа к этой странице (требуется роль администратора)',
	} = options;

	const hasPermission = user ? isAdmin(user) : false;

	useEffect(() => {
		if (!isLoading && isAuthenticated && !hasPermission) {
			if (showToast) {
				toast.error(toastMessage);
			}

			router.push(redirectTo);
		}
	}, [
		isLoading,
		isAuthenticated,
		hasPermission,
		router,
		redirectTo,
		showToast,
		toastMessage,
	]);

	return {
		user,
		isLoading,
		isAuthenticated,
		hasPermission,
		isReady: !isLoading && isAuthenticated && hasPermission,
	};
};

export const useRequireModerator = (options: ClientGuardOptions = {}) => {
	const { user, isLoading, isAuthenticated } = useAuth();
	const router = useRouter();

	const {
		redirectTo = '/dashboard',
		showToast = true,
		toastMessage = 'У вас недостаточно прав для доступа к этой странице (требуется роль модератора или выше)',
	} = options;

	const hasPermission = user ? isModerator(user) : false;

	useEffect(() => {
		if (!isLoading && isAuthenticated && !hasPermission) {
			if (showToast) {
				toast.error(toastMessage);
			}

			router.push(redirectTo);
		}
	}, [
		isLoading,
		isAuthenticated,
		hasPermission,
		router,
		redirectTo,
		showToast,
		toastMessage,
	]);

	return {
		user,
		isLoading,
		isAuthenticated,
		hasPermission,
		isReady: !isLoading && isAuthenticated && hasPermission,
	};
};

export const useOptionalAuth = () => {
	const auth = useAuth();

	return {
		...auth,
		isReady: !auth.isLoading,
	};
};

export const useRoleCheck = () => {
	const { user } = useAuth();

	return {
		hasRole: (role: UserRole) => (user ? hasRole(user, role) : false),
		isAdmin: user ? isAdmin(user) : false,
		isModerator: user ? isModerator(user) : false,
		canModerate: user ? isModerator(user) : false,
		user,
	};
};
