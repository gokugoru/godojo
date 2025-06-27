'use client';

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from 'next-themes';
import QueryProvider from '@/components/providers/query-provider';
import { ToastProvider } from '@/components/providers/toast-provider';

interface ClientProvidersProps {
	children: ReactNode;
	locale: string;
	messages: Record<string, any>;
}

export const ClientProviders = ({
	children,
	locale,
	messages,
}: ClientProvidersProps) => {
	return (
		<SessionProvider
			refetchInterval={5 * 60}
			refetchOnWindowFocus={true}
			refetchWhenOffline={false}
		>
			<NextIntlClientProvider
				locale={locale}
				messages={messages}
				timeZone='UTC'
			>
				<QueryProvider>
					<ThemeProvider
						attribute='class'
						defaultTheme='system'
						enableSystem={true}
						storageKey='godojo-theme'
						disableTransitionOnChange={false}
					>
						{children}
						<ToastProvider />
					</ThemeProvider>
				</QueryProvider>
			</NextIntlClientProvider>
		</SessionProvider>
	);
};
