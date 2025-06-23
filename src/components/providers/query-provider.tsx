'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, ReactNode } from 'react';

interface QueryProviderProps {
	children: ReactNode;
}

const QueryProvider = ({ children }: QueryProviderProps) => {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						// Stale time for fast UX
						staleTime: 5 * 60 * 1000, // 5 minutes
						// Cache time for memory management
						gcTime: 10 * 60 * 1000, // 10 minutes
						// Retry configuration
						retry: (failureCount, error: any) => {
							// Don't retry on auth errors
							if (error?.status === 401 || error?.status === 403) {
								return false;
							}

							return failureCount < 3;
						},
						// Refetch configuration for better UX
						refetchOnMount: false, // Rely on cache
						refetchOnWindowFocus: false, // Don't refetch on focus
						refetchOnReconnect: true, // Refetch when back online
					},
					mutations: {
						// No retry for mutations by default
						retry: false,
						// Use optimistic updates
						networkMode: 'online',
					},
				},
			}),
	);

	return (
		<QueryClientProvider client={queryClient}>
			{children}
			{process.env.NODE_ENV === 'development' && (
				<ReactQueryDevtools initialIsOpen={false} position='top' />
			)}
		</QueryClientProvider>
	);
};

export default QueryProvider;
