// src/app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
	const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://godojo.dev';

	return {
		rules: [
			{
				userAgent: '*',
				allow: [
					'/', // Homepage
					'/en/', // English homepage
					'/ru/', // Russian homepage
					'/modules/', // Modules listing
					'/topic/', // Individual topics
					'/about/', // About page
					'/contact/', // Contact page
				],
				disallow: [
					// PRIVATE SECTIONS - No indexing
					'/dashboard/', // User dashboard
					'/admin/', // Admin panel
					'/api/', // API endpoints
					'/auth/', // Authentication pages
					'/login/', // Login page
					'/register/', // Registration page
					'/settings/', // User settings
					'/profile/', // User profile
					'/user/', // User pages
					'/_next/', // Next.js internals
					'/private/', // Private content

					// SEARCH & DYNAMIC PAGES
					'/search?*', // Search results
					'*.json', // JSON files
					'*.xml', // XML files (except sitemap)
					'/tmp/', // Temporary files
				],
				crawlDelay: 1,
			},

			// Specific rules for major search engines
			{
				userAgent: 'Googlebot',
				allow: ['/', '/en/', '/ru/', '/modules/', '/topic/'],
				disallow: [
					'/dashboard/',
					'/admin/',
					'/api/',
					'/auth/',
					'/private/',
					'/user/',
				],
				crawlDelay: 1,
			},

			{
				userAgent: 'Bingbot',
				allow: ['/', '/en/', '/ru/', '/modules/', '/topic/'],
				disallow: [
					'/dashboard/',
					'/admin/',
					'/api/',
					'/auth/',
					'/private/',
					'/user/',
				],
				crawlDelay: 2,
			},

			// Block AI training crawlers
			{
				userAgent: 'GPTBot',
				disallow: '/',
			},
			{
				userAgent: 'ChatGPT-User',
				disallow: '/',
			},
			{
				userAgent: 'CCBot',
				disallow: '/',
			},
			{
				userAgent: 'anthropic-ai',
				disallow: '/',
			},
			{
				userAgent: 'Claude-Web',
				disallow: '/',
			},
			{
				userAgent: 'PerplexityBot',
				disallow: '/',
			},
			{
				userAgent: 'YouBot',
				disallow: '/',
			},

			// Block aggressive crawlers
			{
				userAgent: 'AhrefsBot',
				disallow: '/',
			},
			{
				userAgent: 'SemrushBot',
				disallow: '/',
			},
			{
				userAgent: 'MJ12bot',
				disallow: '/',
			},
		],
		sitemap: `${baseUrl}/sitemap.xml`,
		host: baseUrl,
	};
}
