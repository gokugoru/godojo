// src/lib/seo/metadata.ts
import { Metadata } from 'next';
import { SEOConfig } from '@/lib/seo/types';
import { getBaseUrl } from '@/lib/utils';

const defaultSEOConfig = {
	siteName: 'Go Dojo',
	siteUrl: getBaseUrl(),
	defaultImage: '/images/og-default.png',
	twitterHandle: '@godojo_dev',
	githubHandle: 'godojo',
};

/**
 * Generate comprehensive SEO metadata for pages
 * Only for PUBLIC pages that should be indexed
 */
export const generateSEOMetadata = (
	config: SEOConfig,
	locale: string = 'en',
): Metadata => {
	const {
		title,
		description,
		keywords = [],
		canonical,
		ogType = 'website',
		ogImage,
		twitterCard = 'summary_large_image',
		publishedTime,
		modifiedTime,
		authors = [],
		section,
		tags = [],
		alternateUrls = {},
		noIndex = false,
		noFollow = false,
	} = config;

	// Build full URLs
	const fullCanonical = canonical
		? `${defaultSEOConfig.siteUrl}${canonical}`
		: defaultSEOConfig.siteUrl;

	const fullOgImage = ogImage?.startsWith('http')
		? ogImage
		: `${defaultSEOConfig.siteUrl}${ogImage || defaultSEOConfig.defaultImage}`;

	// Enhanced keywords with Go programming focus
	const enhancedKeywords = [
		...keywords,
		'Go programming',
		'Golang tutorial',
		'Backend development',
		'Programming course',
		'Software engineering',
	].filter((keyword, index, arr) => arr.indexOf(keyword) === index);

	// Build alternate language URLs (only for public pages)
	const alternateLanguages: Record<string, string> = {};

	if (Object.keys(alternateUrls).length > 0 && !noIndex) {
		for (const [lang, url] of Object.entries(alternateUrls)) {
			alternateLanguages[lang] = `${defaultSEOConfig.siteUrl}${url}`;
		}
	}

	const metadata: Metadata = {
		title: {
			default: title,
			template: `%s | ${defaultSEOConfig.siteName}`,
		},
		description,
		keywords: enhancedKeywords,

		// Canonical URL & Languages (only for indexable pages)
		alternates: !noIndex
			? {
					canonical: fullCanonical,
					languages: alternateLanguages,
				}
			: undefined,

		// Robots
		robots: {
			index: !noIndex,
			follow: !noFollow,
			googleBot: {
				index: !noIndex,
				follow: !noFollow,
				'max-video-preview': noIndex ? 0 : -1,
				'max-image-preview': noIndex ? 'none' : 'large',
				'max-snippet': noIndex ? 0 : -1,
			},
		},

		// Open Graph (only for public pages)
		openGraph: !noIndex
			? {
					type: ogType,
					title,
					description,
					url: fullCanonical,
					siteName: defaultSEOConfig.siteName,
					locale: locale === 'ru' ? 'ru_RU' : 'en_US',
					images: [
						{
							url: fullOgImage,
							width: 1200,
							height: 630,
							alt: title,
							type: 'image/png',
						},
					],
					...(publishedTime && { publishedTime }),
					...(modifiedTime && { modifiedTime }),
					...(authors.length > 0 && { authors }),
					...(section && { section }),
					...(tags.length > 0 && { tags }),
				}
			: undefined,

		// Twitter Cards (only for public pages)
		twitter: !noIndex
			? {
					card: twitterCard,
					title,
					description,
					images: [fullOgImage],
					creator: defaultSEOConfig.twitterHandle,
					site: defaultSEOConfig.twitterHandle,
				}
			: undefined,

		// Category for educational content
		category: !noIndex ? 'Education' : undefined,
	};

	return metadata;
};

/**
 * SEO configurations for PUBLIC pages only
 */
export const seoConfigs = {
	// PUBLIC PAGES - Full SEO
	home: {
		title: 'Go Dojo - Master Go Programming for FAANG Companies',
		description:
			'Learn Go programming with hands-on projects, system design, and real-world examples. Master backend development skills needed for top-tier tech companies.',
		keywords: [
			'learn go programming',
			'golang course',
			'backend development tutorial',
			'FAANG preparation',
			'go programming examples',
			'microservices golang',
			'system design go',
		],
		ogType: 'website' as const,
		section: 'Education',
	},

	modules: {
		title: 'Go Programming Modules - Structured Learning Path',
		description:
			'Comprehensive Go programming modules covering fundamentals, advanced concepts, microservices, and system design with practical projects.',
		keywords: [
			'go modules',
			'golang learning path',
			'programming curriculum',
			'backend development course',
			'go fundamentals',
		],
		ogType: 'website' as const,
	},

	topic: (topicTitle: string, moduleTitle: string) => ({
		title: `${topicTitle} - ${moduleTitle} | Go Programming Tutorial`,
		description: `Learn ${topicTitle} in Go programming. Comprehensive tutorial with examples, best practices, and hands-on exercises.`,
		keywords: [
			topicTitle.toLowerCase(),
			'go programming',
			'golang tutorial',
			'backend development',
			moduleTitle.toLowerCase(),
		],
		ogType: 'article' as const,
	}),

	// PRIVATE PAGES - No indexing
	dashboard: {
		title: 'Dashboard - Go Dojo',
		description: 'Your personal learning dashboard.',
		noIndex: true,
		noFollow: true,
	},

	auth: {
		title: 'Authentication - Go Dojo',
		description: 'Sign in to access your Go learning journey.',
		noIndex: true,
		noFollow: true,
	},

	admin: {
		title: 'Admin Panel - Go Dojo',
		description: 'Administrative interface.',
		noIndex: true,
		noFollow: true,
	},
};
