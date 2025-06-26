// src/app/[locale]/(public)/layout.tsx
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { setRequestLocale } from 'next-intl/server';
import '../globals.css';
import { ReactNode } from 'react';
import Header from '@/components/header';
import { Analytics } from '@vercel/analytics/next';
import { ClientProviders } from '@/components/client-providers';
import {
	generateI18nSEOMetadata,
	i18nSEOConfigs,
} from '@/lib/seo/i18n-metadata';
import { generateStructuredData } from '@/lib/seo/structured-data';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const generateStaticParams = () => {
	return routing.locales.map((locale) => ({ locale }));
};

interface PublicLayoutProps {
	children: ReactNode;
	params: Promise<{ locale: string }>;
}

/**
 * Generate SEO metadata for public layout with proper translations
 * This layout is ONLY for public pages that should be indexed
 */
export async function generateMetadata({
	params,
}: PublicLayoutProps): Promise<Metadata> {
	const { locale } = await params;

	// Validate locale
	if (!hasLocale(routing.locales, locale)) {
		return {
			title: 'Page Not Found',
			robots: { index: false, follow: false },
		};
	}

	// Generate localized SEO metadata for homepage
	return await generateI18nSEOMetadata(i18nSEOConfigs.home, locale);
}

const PublicRootLayout = async ({ children, params }: PublicLayoutProps) => {
	const { locale } = await params;
	const messages = (await import(`../../../messages/${locale}.json`)).default;

	if (!hasLocale(routing.locales, locale)) {
		notFound();
	}

	setRequestLocale(locale);

	// Generate structured data for the website
	const structuredData = [
		generateStructuredData({ type: 'WebSite' }),
		generateStructuredData({ type: 'Organization' }),
	];

	return (
		<html lang={locale} dir='ltr' suppressHydrationWarning>
			<head>
				{/* JSON-LD Structured Data */}
				<script
					type='application/ld+json'
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(structuredData),
					}}
				/>

				{/* Preconnect to external domains for performance */}
				<link rel='preconnect' href='https://fonts.googleapis.com' />
				<link
					rel='preconnect'
					href='https://fonts.gstatic.com'
					crossOrigin=''
				/>
				<link rel='preconnect' href='https://vitals.vercel-analytics.com' />

				{/* DNS prefetch for performance */}
				<link rel='dns-prefetch' href='//fonts.googleapis.com' />
				<link rel='dns-prefetch' href='//cdnjs.cloudflare.com' />

				{/* Language and region targeting */}
				<meta name='language' content={locale} />
				<meta name='content-language' content={locale} />
				<meta name='geo.region' content={locale === 'ru' ? 'RU' : 'US'} />
				<meta
					name='geo.placename'
					content={locale === 'ru' ? 'Russia' : 'United States'}
				/>

				{/* Prevent automatic translation by browsers */}
				<meta name='google' content='notranslate' />

				{/* Educational content classification */}
				<meta name='rating' content='general' />
				<meta name='audience' content='all' />
				<meta name='subject' content='Programming Education' />

				{/* Apple Touch Icons */}
				<link
					rel='apple-touch-icon'
					sizes='180x180'
					href='/icons/apple-touch-icon.png'
				/>
				<link
					rel='icon'
					type='image/png'
					sizes='32x32'
					href='/icons/favicon-32x32.png'
				/>
				<link
					rel='icon'
					type='image/png'
					sizes='16x16'
					href='/icons/favicon-16x16.png'
				/>

				{/* Theme colors for different color schemes */}
				<meta
					name='theme-color'
					content='#0066cc'
					media='(prefers-color-scheme: light)'
				/>
				<meta
					name='theme-color'
					content='#1a365d'
					media='(prefers-color-scheme: dark)'
				/>

				{/* Microsoft Tile Config */}
				<meta name='msapplication-TileColor' content='#0066cc' />
				<meta name='msapplication-config' content='/icons/browserconfig.xml' />

				{/* Security headers */}
				<meta httpEquiv='X-Content-Type-Options' content='nosniff' />
				<meta httpEquiv='X-Frame-Options' content='DENY' />
				<meta httpEquiv='X-XSS-Protection' content='1; mode=block' />

				{/* Performance hints */}
				<link rel='prefetch' href='/modules' />
				<link rel='prefetch' href='/topic' />
				<title></title>
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<ClientProviders locale={locale} messages={messages}>
					{/* Header on all public pages */}
					<Header />

					{/* Main content with proper semantic markup */}
					<main className='min-h-screen bg-white' role='main'>
						{children}
					</main>

					{/* Footer could go here */}
				</ClientProviders>

				{/* Analytics only in production */}
				{process.env.NODE_ENV === 'production' && <Analytics />}

				{/* Performance monitoring for Core Web Vitals */}
				<script
					dangerouslySetInnerHTML={{
						__html: `
              // Monitor Core Web Vitals
              if ('PerformanceObserver' in window) {
                const observer = new PerformanceObserver((list) => {
                  list.getEntries().forEach((entry) => {
                    if (entry.entryType === 'largest-contentful-paint') {
                      console.log('LCP:', entry.startTime);
                    }
                    if (entry.entryType === 'first-input') {
                      console.log('FID:', entry.processingStart - entry.startTime);
                    }
                    if (entry.entryType === 'layout-shift') {
                      console.log('CLS:', entry.value);
                    }
                  });
                });
                
                try {
                  observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
                } catch (e) {
                  // Ignore errors in older browsers
                }
              }
            `,
					}}
				/>
			</body>
		</html>
	);
};

export default PublicRootLayout;
