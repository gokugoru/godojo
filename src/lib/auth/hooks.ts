'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { debounce } from 'lodash';
import {
	registerUser,
	loginUser,
	signInWithProvider,
	signOutUser,
	getCurrentUser,
} from '@/actions/auth';
import { REDIRECTS } from '@/lib/constants/config';
import type { UserRole } from '@prisma/client';

export const authKeys = {
	all: ['auth'] as const,
	sessions: () => [...authKeys.all, 'session'] as const,
	user: (id?: string) => [...authKeys.all, 'user', id] as const,
} as const;

export const useAuth = () => {
	const { data: session, status } = useSession();

	return useMemo(
		() => ({
			user: session?.user || null,
			isLoading: status === 'loading',
			isAuthenticated: !!session?.user,
			session,
			status,
		}),
		[session, status],
	);
};

export const useCurrentUser = () => {
	const { user, isAuthenticated, isLoading: sessionLoading } = useAuth();

	return useQuery({
		queryKey: authKeys.user(user?.id),
		queryFn: getCurrentUser,
		enabled: isAuthenticated && !!user?.id && !sessionLoading,
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		retry: 1,
		initialData: user
			? {
					id: user.id,
					email: user.email,
					name: user.name,
					image: user.image,
					username: user.username,
					role: user.role,
				}
			: undefined,
	});
};

export const useRegister = () => {
	const queryClient = useQueryClient();
	const router = useRouter();

	return useMutation({
		mutationFn: registerUser,
		onSuccess: (result) => {
			if (result.success) {
				if (result.user) {
					queryClient.setQueryData(authKeys.user(result.user.id), result.user);
				}

				queryClient.invalidateQueries({ queryKey: ['session'] });

				if (result.redirectTo) {
					router.push(result.redirectTo);
					router.refresh();
				}
			}
		},
		onError: (error) => {
			console.error('Registration error:', error);
		},
	});
};

export const useLogin = () => {
	const queryClient = useQueryClient();
	const router = useRouter();

	const mutation = useMutation({
		mutationFn: loginUser,
		onSuccess: (result) => {
			if (result.success) {
				queryClient.invalidateQueries({ queryKey: authKeys.all });
				queryClient.invalidateQueries({ queryKey: ['session'] });

				if (result.redirectTo) {
					router.push(result.redirectTo);
					router.refresh();
				}
			}
		},
		onError: (error) => {
			console.error('Login error:', error);
		},
	});

	const debouncedMutate = useCallback(
		debounce(mutation.mutate, 1000, { leading: true, trailing: false }),
		[mutation.mutate],
	);

	return {
		...mutation,
		mutate: debouncedMutate,
		mutateAsync: mutation.mutateAsync,
	};
};

export const useOAuthSignIn = () => {
	const queryClient = useQueryClient();
	const router = useRouter();

	return useMutation({
		mutationFn: (provider: 'github' | 'google') => signInWithProvider(provider),
		onSuccess: (result) => {
			if (result.success) {
				queryClient.invalidateQueries({ queryKey: authKeys.all });
				queryClient.invalidateQueries({ queryKey: ['session'] });

				if (result.redirectTo) {
					router.push(result.redirectTo);
					router.refresh();
				}
			}
		},
		onError: (error) => {
			console.error('OAuth sign in error:', error);
		},
	});
};

export const useSignOut = () => {
	const queryClient = useQueryClient();
	const router = useRouter();

	return useMutation({
		mutationFn: signOutUser,
		onSuccess: (result) => {
			queryClient.clear();

			if (result.success && result.redirectTo) {
				router.push(result.redirectTo);
				router.refresh();
			}
		},
		onError: (error) => {
			console.error('Sign out error:', error);
		},
	});
};

export const useAuthGuard = () => {
	const { user, isLoading, isAuthenticated } = useAuth();
	const router = useRouter();

	if (!isLoading && !isAuthenticated) {
		router.push(REDIRECTS.unauthorized);

		return { user: null, isLoading: false, isAuthenticated: false };
	}

	return {
		user,
		isLoading,
		isAuthenticated,
	};
};

export const useRoleGuard = (requiredRole: UserRole = 'ADMIN') => {
	const { user, isLoading, isAuthenticated } = useAuth();
	const router = useRouter();

	const hasPermission = useMemo(() => {
		if (!user) return false;

		if (user.role === 'ADMIN') return true;

		if (requiredRole === 'MODERATOR') {
			return user.role === 'MODERATOR' || (user.role as string) === 'ADMIN';
		}

		if (requiredRole === 'USER') {
			return ['USER', 'MODERATOR', 'ADMIN'].includes(user.role);
		}

		return (user.role as string) === requiredRole;
	}, [user, requiredRole]);

	if (!isLoading && isAuthenticated && !hasPermission) {
		router.push(REDIRECTS.adminOnly);

		return { user, isLoading: false, hasPermission: false };
	}

	return {
		user,
		isLoading,
		hasPermission: isAuthenticated && hasPermission,
	};
};

export const useAuthStatus = () => {
	const { status } = useSession();

	return useMemo(
		() => ({
			isLoading: status === 'loading',
			isAuthenticated: status === 'authenticated',
			isUnauthenticated: status === 'unauthenticated',
		}),
		[status],
	);
};

export const usePrefetchAuth = () => {
	const queryClient = useQueryClient();
	const { user, isAuthenticated } = useAuth();

	const prefetchUser = useCallback(() => {
		if (user?.id && isAuthenticated) {
			queryClient.prefetchQuery({
				queryKey: authKeys.user(user.id),
				queryFn: getCurrentUser,
				staleTime: 5 * 60 * 1000,
			});
		}
	}, [queryClient, user?.id, isAuthenticated]);

	return {
		prefetchUser,
		isAuthenticated,
	};
};

export const useAuthState = () => {
	const auth = useAuth();
	const status = useAuthStatus();
	const { prefetchUser } = usePrefetchAuth();

	return useMemo(
		() => ({
			...auth,
			...status,
			prefetchUser,
			isAdmin: auth.user?.role === 'ADMIN',
			isModerator: ['ADMIN', 'MODERATOR'].includes(auth.user?.role || ''),
			canModerate: ['ADMIN', 'MODERATOR'].includes(auth.user?.role || ''),
			hasRole: (role: UserRole) => {
				if (!auth.user) return false;
				if (role === 'USER') return true;
				if (role === 'MODERATOR')
					return ['ADMIN', 'MODERATOR'].includes(auth.user.role);
				if (role === 'ADMIN') return auth.user.role === 'ADMIN';

				return false;
			},
		}),
		[auth, status, prefetchUser],
	);
};

export type AuthUser = NonNullable<ReturnType<typeof useAuth>['user']>;
export type AuthStatus = ReturnType<typeof useAuthStatus>;
export type AuthState = ReturnType<typeof useAuthState>;
export type { UserRole } from '@prisma/client';
