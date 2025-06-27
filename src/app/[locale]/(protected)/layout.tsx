import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { setRequestLocale } from 'next-intl/server';
import '../../globals.css';
import { ReactNode } from 'react';
import Header from '@/components/header';
import { ClientProviders } from '@/components/providers/client-providers';

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
	const messages = (await import(`../../../../messages/${locale}.json`))
		.default;

	if (!hasLocale(routing.locales, locale)) {
		notFound();
	}

	setRequestLocale(locale);

	return (
		<html lang={locale} suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<ClientProviders locale={locale} messages={messages}>
					{/* Header на всех страницах */}
					<Header />
					{/* Основной контент */}
					<main className='min-h-screen bg-white'>{children}</main>
				</ClientProviders>
			</body>
		</html>
	);
};

export default RootLayout;
