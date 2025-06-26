// src/lib/seo/i18n-metadata.ts
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LocalizedSEOConfig } from '@/lib/seo/types';

/**
 * Generate internationalized SEO metadata with translations
 * Only public pages get hreflang and full SEO treatment
 */
export const generateI18nSEOMetadata = async (
	config: LocalizedSEOConfig,
	locale: string,
): Promise<Metadata> => {
	const t = await getTranslations('seo');
	const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://godojo.dev';

	// Get localized content
	const title = t(config.titleKey);
	const description = t(config.descriptionKey);
	const keywordsString = config.keywordsKey ? t(config.keywordsKey) : '';
	const keywords = keywordsString
		? keywordsString.split(',').map((k) => k.trim())
		: [];

	const canonicalUrl = `${baseUrl}/${locale}${config.path}`;
	const ogImage = config.ogImage || `/images/og-${locale}.png`;
	const fullOgImage = `${baseUrl}${ogImage}`;

	// Only generate alternate URLs for PUBLIC pages
	const alternateLanguages: Record<string, string> = {};

	if (config.isPublic && !config.noIndex) {
		alternateLanguages['x-default'] = `${baseUrl}${config.path}`;
		alternateLanguages.en = `${baseUrl}/en${config.path}`;
		alternateLanguages.ru = `${baseUrl}/ru${config.path}`;
		// Remove current locale to avoid self-reference
		delete alternateLanguages[locale];
	}

	return {
		title: {
			default: title,
			template: '%s | Go Dojo',
		},
		description,
		keywords,

		// Language targeting - only for public pages
		alternates:
			config.isPublic && !config.noIndex
				? {
						canonical: canonicalUrl,
						languages: alternateLanguages,
					}
				: {
						canonical: canonicalUrl, // Still need canonical for private pages
					},

		// Robots
		robots: {
			index: !config.noIndex,
			follow: !config.noIndex,
			googleBot: {
				index: !config.noIndex,
				follow: !config.noIndex,
				'max-video-preview': config.noIndex ? 0 : -1,
				'max-image-preview': config.noIndex ? 'none' : 'large',
				'max-snippet': config.noIndex ? 0 : -1,
			},
		},

		// Open Graph - only for public pages
		openGraph:
			config.isPublic && !config.noIndex
				? {
						title,
						description,
						url: canonicalUrl,
						siteName: 'Go Dojo',
						locale: locale === 'ru' ? 'ru_RU' : 'en_US',
						type: config.ogType || 'website',
						images: [
							{
								url: fullOgImage,
								width: 1200,
								height: 630,
								alt: title,
							},
						],
					}
				: undefined,

		// Twitter - only for public pages
		twitter:
			config.isPublic && !config.noIndex
				? {
						card: 'summary_large_image',
						title,
						description,
						images: [fullOgImage],
					}
				: undefined,

		// Category - only for public pages
		category: config.isPublic && !config.noIndex ? 'Education' : undefined,
	};
};

/**
 * Localized SEO configurations
 */
export const i18nSEOConfigs = {
	// PUBLIC PAGES with full SEO
	home: {
		titleKey: 'home.title',
		descriptionKey: 'home.description',
		keywordsKey: 'home.keywords',
		path: '',
		ogType: 'website' as const,
		isPublic: true,
	},

	modules: {
		titleKey: 'modules.title',
		descriptionKey: 'modules.description',
		keywordsKey: 'modules.keywords',
		path: '/modules',
		ogType: 'website' as const,
		isPublic: true,
	},

	topic: {
		titleKey: 'topic.title',
		descriptionKey: 'topic.description',
		keywordsKey: 'topic.keywords',
		path: '/topic',
		ogType: 'article' as const,
		isPublic: true,
	},

	// PRIVATE PAGES - minimal SEO, no indexing
	dashboard: {
		titleKey: 'dashboard.title',
		descriptionKey: 'dashboard.description',
		path: '/dashboard',
		noIndex: true,
		isPublic: false,
	},

	auth: {
		titleKey: 'auth.title',
		descriptionKey: 'auth.description',
		path: '/auth',
		noIndex: true,
		isPublic: false,
	},

	admin: {
		titleKey: 'admin.title',
		descriptionKey: 'admin.description',
		path: '/admin',
		noIndex: true,
		isPublic: false,
	},
};
