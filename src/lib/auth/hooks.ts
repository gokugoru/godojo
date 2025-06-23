'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
	registerUser,
	loginUser,
	signInWithProvider,
	signOutUser,
	getCurrentUser,
} from '@/actions/auth';
import type { UserRole } from '@prisma/client';

// Query keys for consistent caching
export const authKeys = {
	all: ['auth'] as const,
	sessions: () => [...authKeys.all, 'session'] as const,
	user: (id?: string) => [...authKeys.all, 'user', id] as const,
} as const;

/**
 * Primary auth hook using NextAuth session
 */
export function useAuth() {
	const { data: session, status } = useSession();

	return {
		user: session?.user || null,
		isLoading: status === 'loading',
		isAuthenticated: !!session?.user,
		session,
		status,
	};
}

/**
 * Enhanced user data with React Query caching
 * Combines NextAuth session with additional user data from database
 */
export function useCurrentUser() {
	const { user, isAuthenticated, isLoading: sessionLoading } = useAuth();

	return useQuery({
		queryKey: authKeys.user(user?.id),
		queryFn: getCurrentUser,
		enabled: isAuthenticated && !!user?.id && !sessionLoading,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
		retry: 1,
		// Use session data as initial data
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
}

/**
 * Registration mutation with optimistic updates
 */
export function useRegister() {
	const queryClient = useQueryClient();
	const router = useRouter();

	return useMutation({
		mutationFn: registerUser,
		onSuccess: (result) => {
			if (result.success && result.user) {
				// Update user cache optimistically
				queryClient.setQueryData(authKeys.user(result.user.id), result.user);

				// Invalidate session to trigger NextAuth refresh
				queryClient.invalidateQueries({ queryKey: ['session'] });

				// Navigate to dashboard
				router.push('/dashboard');
				router.refresh();
			}
		},
		onError: (error) => {
			console.error('Registration error:', error);
		},
	});
}

/**
 * Login mutation
 */
export function useLogin() {
	const queryClient = useQueryClient();
	const router = useRouter();

	return useMutation({
		mutationFn: loginUser,
		onSuccess: (result) => {
			if (result.success) {
				// Invalidate all auth-related queries
				queryClient.invalidateQueries({ queryKey: authKeys.all });
				queryClient.invalidateQueries({ queryKey: ['session'] });

				// Navigate to dashboard
				router.push('/dashboard');
				router.refresh();
			}
		},
		onError: (error) => {
			console.error('Login error:', error);
		},
	});
}

/**
 * OAuth sign in mutation
 */
export function useOAuthSignIn() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (provider: 'github' | 'google') => signInWithProvider(provider),
		onSuccess: () => {
			// Invalidate auth queries to refresh data
			queryClient.invalidateQueries({ queryKey: authKeys.all });
			queryClient.invalidateQueries({ queryKey: ['session'] });
		},
		onError: (error) => {
			console.error('OAuth sign in error:', error);
		},
	});
}

/**
 * Sign out mutation
 */
export function useSignOut() {
	const queryClient = useQueryClient();
	const router = useRouter();

	return useMutation({
		mutationFn: signOutUser,
		onSuccess: () => {
			// Clear all cached data
			queryClient.clear();

			// Navigate to home
			router.push('/');
			router.refresh();
		},
		onError: (error) => {
			console.error('Sign out error:', error);
		},
	});
}

/**
 * Auth guard hook for protected pages
 * Automatically redirects to login if not authenticated
 */
export function useAuthGuard() {
	const { user, isLoading, isAuthenticated } = useAuth();
	const router = useRouter();

	// Redirect to login if not authenticated and not loading
	if (!isLoading && !isAuthenticated) {
		router.push('/auth/login');

		return { user: null, isLoading: false, isAuthenticated: false };
	}

	return {
		user,
		isLoading,
		isAuthenticated,
	};
}

/**
 * Role-based authorization guard with proper typing
 * Now works correctly with NextAuth module augmentation
 */
export function useRoleGuard(requiredRole: UserRole = 'ADMIN') {
	const { user, isLoading, isAuthenticated } = useAuth();
	const router = useRouter();

	// TypeScript now correctly sees user.role as UserRole union type
	const hasPermission = (() => {
		if (!user) return false;

		// Now this comparison works without TS2367 error!
		if (user.role === 'ADMIN') return true;

		if (requiredRole === 'MODERATOR') {
			return user.role === 'MODERATOR' || (user.role as string) === 'ADMIN';
		}

		return user.role === requiredRole;
	})();

	// Redirect if no permission
	if (!isLoading && isAuthenticated && !hasPermission) {
		router.push('/dashboard');

		return { user, isLoading: false, hasPermission: false };
	}

	return {
		user,
		isLoading,
		hasPermission: isAuthenticated && hasPermission,
	};
}

/**
 * Authentication status hook
 * Useful for conditional rendering
 */
export function useAuthStatus() {
	const { status } = useSession();

	return {
		isLoading: status === 'loading',
		isAuthenticated: status === 'authenticated',
		isUnauthenticated: status === 'unauthenticated',
	};
}

/**
 * Prefetch auth data hook
 * Useful for performance optimization
 */
export function usePrefetchAuth() {
	const queryClient = useQueryClient();
	const { user, isAuthenticated } = useAuth();

	const prefetchUser = () => {
		if (user?.id && isAuthenticated) {
			queryClient.prefetchQuery({
				queryKey: authKeys.user(user.id),
				queryFn: getCurrentUser,
				staleTime: 5 * 60 * 1000,
			});
		}
	};

	return {
		prefetchUser,
		isAuthenticated,
	};
}
