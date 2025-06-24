import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { setRequestLocale } from 'next-intl/server';
import { SessionProvider } from 'next-auth/react';
import QueryProvider from '@/components/providers/query-provider';
import '../../globals.css';
import { ReactNode } from 'react';
import Header from '@/components/header';
import { Analytics } from '@vercel/analytics/next';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'Go Backend Engineer Roadmap 2025',
	description: 'Master the skills needed for top-tier companies',
};

export const generateStaticParams = () => {
	return routing.locales.map((locale) => ({ locale }));
};

interface RootLayoutProps {
	children: ReactNode;
	params: Promise<{ locale: string }>;
}

const RootLayout = async ({ children, params }: RootLayoutProps) => {
	const { locale } = await params;

	if (!hasLocale(routing.locales, locale)) {
		notFound();
	}

	setRequestLocale(locale);

	return (
		<html lang={locale}>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<SessionProvider>
					<QueryProvider>
						<NextIntlClientProvider>
							{/* Header на всех страницах */}
							<Header />
							{/* Основной контент */}
							<main className='min-h-screen bg-white'>{children}</main>
						</NextIntlClientProvider>
					</QueryProvider>
				</SessionProvider>
				<Analytics />
			</body>
		</html>
	);
};

export default RootLayout;
