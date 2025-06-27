// src/lib/auth/hooks.ts
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { debounce } from 'lodash';
import { toast } from 'sonner';
import {
	signInWithProvider,
	signOutUser,
	getCurrentUser,
} from '@/actions/auth';
import {
	registerUserWithCredentials,
	loginUserWithCredentials,
} from './actions';
import { hasRole, isAdmin, isModerator } from './types';
import type { UserRole, OAuthProvider } from './types';

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
		mutationFn: registerUserWithCredentials,
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
		onError: (error: any) => {
			console.error('Registration error:', error);
			toast.error(
				error?.message ||
					'Произошла ошибка при регистрации. Попробуйте еще раз.',
			);
		},
	});
};

export const useLogin = () => {
	const queryClient = useQueryClient();
	const router = useRouter();

	const mutation = useMutation({
		mutationFn: loginUserWithCredentials,
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
		onError: (error: any) => {
			console.error('Login error:', error);
			const errorMessage =
				error?.message ||
				'Неверный email или пароль. Проверьте данные и попробуйте снова.';
			toast.error(errorMessage);
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
		mutationFn: (provider: OAuthProvider) => signInWithProvider(provider),
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
		onError: (error: any) => {
			console.error('OAuth sign in error:', error);
			const errorMessage =
				error?.message ||
				'Не удалось авторизоваться. Проверьте доступ к интернету и попробуйте снова.';
			toast.error(errorMessage);
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
			toast.success('Вы успешно вышли из системы');

			if (result.success && result.redirectTo) {
				router.push(result.redirectTo);
				router.refresh();
			}
		},
		onError: (error: any) => {
			console.error('Sign out error:', error);
			toast.error('Произошла ошибка при выходе из системы');
		},
	});
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
			isAdmin: auth.user ? isAdmin(auth.user) : false,
			isModerator: auth.user ? isModerator(auth.user) : false,
			canModerate: auth.user ? isModerator(auth.user) : false,
			hasRole: (role: UserRole) => {
				if (!auth.user) return false;

				return hasRole(auth.user, role);
			},
		}),
		[auth, status, prefetchUser],
	);
};

export type AuthUser = NonNullable<ReturnType<typeof useAuth>['user']>;
export type AuthStatus = ReturnType<typeof useAuthStatus>;
export type AuthState = ReturnType<typeof useAuthState>;
