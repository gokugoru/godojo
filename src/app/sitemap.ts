// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { db } from '@/lib/prisma';

interface SitemapEntry {
	url: string;
	lastModified?: string | Date;
	changeFrequency?:
		| 'always'
		| 'hourly'
		| 'daily'
		| 'weekly'
		| 'monthly'
		| 'yearly'
		| 'never';
	priority?: number;
	alternates?: {
		languages?: Record<string, string>;
	};
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://godojo.dev';
	const currentDate = new Date();

	const sitemapEntries: SitemapEntry[] = [];

	// STATIC PUBLIC PAGES with high priority
	const staticPages = [
		{
			url: `${baseUrl}/`,
			lastModified: currentDate,
			changeFrequency: 'daily' as const,
			priority: 1.0,
			alternates: {
				languages: {
					en: `${baseUrl}/en`,
					ru: `${baseUrl}/ru`,
				},
			},
		},
		{
			url: `${baseUrl}/en`,
			lastModified: currentDate,
			changeFrequency: 'daily' as const,
			priority: 1.0,
		},
		{
			url: `${baseUrl}/ru`,
			lastModified: currentDate,
			changeFrequency: 'daily' as const,
			priority: 1.0,
		},
		{
			url: `${baseUrl}/modules`,
			lastModified: currentDate,
			changeFrequency: 'daily' as const,
			priority: 0.9,
			alternates: {
				languages: {
					en: `${baseUrl}/en/modules`,
					ru: `${baseUrl}/ru/modules`,
				},
			},
		},
		{
			url: `${baseUrl}/en/modules`,
			lastModified: currentDate,
			changeFrequency: 'daily' as const,
			priority: 0.9,
		},
		{
			url: `${baseUrl}/ru/modules`,
			lastModified: currentDate,
			changeFrequency: 'daily' as const,
			priority: 0.9,
		},
	];

	sitemapEntries.push(...staticPages);

	try {
		// Get ONLY published modules (public content)
		const modules = await db.module.findMany({
			where: {
				isPublished: true,
				// Only include modules that are meant to be public
			},
			select: {
				id: true,
				slug: true,
				updatedAt: true,
				createdAt: true,
			},
			orderBy: { updatedAt: 'desc' },
			take: 1000, // Limit for performance
		});

		// Add module pages (PUBLIC only)
		modules.forEach((module) => {
			sitemapEntries.push({
				url: `${baseUrl}/modules/${module.slug}`,
				lastModified: module.updatedAt,
				changeFrequency: 'weekly',
				priority: 0.8,
				alternates: {
					languages: {
						en: `${baseUrl}/en/modules/${module.slug}`,
						ru: `${baseUrl}/ru/modules/${module.slug}`,
					},
				},
			});

			// Add localized versions
			sitemapEntries.push(
				{
					url: `${baseUrl}/en/modules/${module.slug}`,
					lastModified: module.updatedAt,
					changeFrequency: 'weekly',
					priority: 0.8,
				},
				{
					url: `${baseUrl}/ru/modules/${module.slug}`,
					lastModified: module.updatedAt,
					changeFrequency: 'weekly',
					priority: 0.8,
				},
			);
		});

		// Get ONLY published topics (public content)
		const topics = await db.topic.findMany({
			where: {
				isPublished: true,
				isFree: true, // Only free/public topics in sitemap
			},
			select: {
				id: true,
				slug: true,
				updatedAt: true,
				module: {
					select: {
						slug: true,
						isPublished: true,
					},
				},
			},
			orderBy: { updatedAt: 'desc' },
			take: 2000, // Limit for performance
		});

		// Add topic pages (PUBLIC only)
		topics.forEach((topic) => {
			if (topic.module.isPublished) {
				sitemapEntries.push({
					url: `${baseUrl}/topic/${topic.slug}`,
					lastModified: topic.updatedAt,
					changeFrequency: 'weekly',
					priority: 0.7,
					alternates: {
						languages: {
							en: `${baseUrl}/en/topic/${topic.slug}`,
							ru: `${baseUrl}/ru/topic/${topic.slug}`,
						},
					},
				});

				// Add localized versions
				sitemapEntries.push(
					{
						url: `${baseUrl}/en/topic/${topic.slug}`,
						lastModified: topic.updatedAt,
						changeFrequency: 'weekly',
						priority: 0.7,
					},
					{
						url: `${baseUrl}/ru/topic/${topic.slug}`,
						lastModified: topic.updatedAt,
						changeFrequency: 'weekly',
						priority: 0.7,
					},
				);
			}
		});

		// Get categories (if they should be public)
		const categories = await db.category.findMany({
			where: {
				isActive: true,
				// Only public categories
			},
			select: {
				id: true,
				slug: true,
				updatedAt: true,
			},
			take: 100, // Reasonable limit
		});

		// Add category pages (PUBLIC only)
		categories.forEach((category) => {
			sitemapEntries.push({
				url: `${baseUrl}/category/${category.slug}`,
				lastModified: category.updatedAt,
				changeFrequency: 'weekly',
				priority: 0.6,
				alternates: {
					languages: {
						en: `${baseUrl}/en/category/${category.slug}`,
						ru: `${baseUrl}/ru/category/${category.slug}`,
					},
				},
			});
		});
	} catch (error) {
		console.error('Error generating sitemap:', error);

		// Fallback static sitemap if database fails
		const fallbackPages = [
			{
				url: `${baseUrl}/modules`,
				lastModified: currentDate,
				changeFrequency: 'daily' as const,
				priority: 0.9,
			},
		];

		sitemapEntries.push(...fallbackPages);
	}

	// Sort by priority (highest first) and then by lastModified (newest first)
	sitemapEntries.sort((a, b) => {
		if (a.priority !== b.priority) {
			return (b.priority || 0) - (a.priority || 0);
		}

		const aDate = new Date(a.lastModified || 0);
		const bDate = new Date(b.lastModified || 0);

		return bDate.getTime() - aDate.getTime();
	});

	// Ensure we don't exceed limits (Google recommends max 50k URLs)
	const maxUrls = 50000;

	if (sitemapEntries.length > maxUrls) {
		console.warn(
			`Sitemap has ${sitemapEntries.length} URLs, truncating to ${maxUrls}`,
		);

		return sitemapEntries.slice(0, maxUrls);
	}

	return sitemapEntries;
}
