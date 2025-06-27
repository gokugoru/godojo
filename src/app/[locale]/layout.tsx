// src/app/[locale]/layout.tsx
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
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ClientProviders } from '@/components/client-providers';
import {
	generateI18nSEOMetadata,
	i18nSEOConfigs,
} from '@/lib/seo/i18n-metadata';
import { generateStructuredData } from '@/lib/seo/structured-data';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
	display: 'swap',
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
	display: 'swap',
});

export const generateStaticParams = () => {
	return routing.locales.map((locale) => ({ locale }));
};

interface PublicLayoutProps {
	children: ReactNode;
	params: Promise<{ locale: string }>;
}

export async function generateMetadata({
	params,
}: PublicLayoutProps): Promise<Metadata> {
	const { locale } = await params;

	if (!hasLocale(routing.locales, locale)) {
		return {
			title: 'Page Not Found',
			robots: { index: false, follow: false },
		};
	}

	return await generateI18nSEOMetadata(i18nSEOConfigs.home, locale);
}

const PublicRootLayout = async ({ children, params }: PublicLayoutProps) => {
	const { locale } = await params;

	if (!hasLocale(routing.locales, locale)) {
		notFound();
	}

	setRequestLocale(locale);

	let messages;

	try {
		messages = (await import(`../../../messages/${locale}.json`)).default;
	} catch (error) {
		console.error(`Failed to load messages for locale: ${locale}`, error);
		messages = (await import('../../../messages/en.json')).default;
	}

	const structuredData = [
		generateStructuredData({ type: 'WebSite' }),
		generateStructuredData({ type: 'Organization' }),
	];

	return (
		<html lang={locale} dir='ltr' suppressHydrationWarning>
			<head>
				<script
					type='application/ld+json'
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(structuredData),
					}}
				/>

				<link rel='preconnect' href='https://fonts.googleapis.com' />
				<link
					rel='preconnect'
					href='https://fonts.gstatic.com'
					crossOrigin='anonymous'
				/>
				<link rel='preconnect' href='https://vitals.vercel-analytics.com' />

				<link rel='dns-prefetch' href='//fonts.googleapis.com' />
				<link rel='dns-prefetch' href='//vercel-analytics.com' />

				<meta name='language' content={locale} />
				<meta name='content-language' content={locale} />
				<meta name='geo.region' content={locale === 'ru' ? 'RU' : 'US'} />
				<meta
					name='geo.placename'
					content={locale === 'ru' ? 'Russia' : 'United States'}
				/>

				<meta name='google' content='notranslate' />

				<meta name='rating' content='general' />
				<meta name='audience' content='all' />
				<meta name='subject' content='Programming Education' />

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

				<meta name='msapplication-TileColor' content='#0066cc' />
				<meta name='msapplication-config' content='/icons/browserconfig.xml' />

				<meta httpEquiv='X-Content-Type-Options' content='nosniff' />
				<meta httpEquiv='X-Frame-Options' content='DENY' />
				<meta httpEquiv='X-XSS-Protection' content='1; mode=block' />

				<link rel='prefetch' href='/chapters' />
				<link rel='prefetch' href='/topic' />
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<ClientProviders locale={locale} messages={messages}>
					<Header />

					<main className='min-h-screen bg-white' role='main'>
						{children}
					</main>
				</ClientProviders>

				<Analytics />
				<SpeedInsights />

				<script
					dangerouslySetInnerHTML={{
						__html: `
              if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
                try {
                  const observer = new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                      if (process.env.NODE_ENV === 'development') {
                        if (entry.entryType === 'largest-contentful-paint') {
                          console.log('LCP:', entry.startTime);
                        }
                        if (entry.entryType === 'first-input') {
                          console.log('FID:', entry.processingStart - entry.startTime);
                        }
                        if (entry.entryType === 'layout-shift') {
                          console.log('CLS:', entry.value);
                        }
                      }
                    });
                  });
                  
                  observer.observe({ 
                    entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] 
                  });
                } catch (e) {
                  console.warn('Performance Observer not supported:', e);
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
