// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { db } from '@/lib/prisma';
import { getBaseUrl } from '@/lib/utils';

interface SitemapEntry {
	readonly url: string;
	readonly lastModified?: string | Date;
	readonly changeFrequency?:
		| 'always'
		| 'hourly'
		| 'daily'
		| 'weekly'
		| 'monthly'
		| 'yearly'
		| 'never';
	readonly priority?: number;
	readonly alternates?: {
		readonly languages?: Record<string, string>;
	};
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = getBaseUrl();
	const currentDate = new Date();

	const sitemapEntries: SitemapEntry[] = [];

	// STATIC PUBLIC PAGES with high priority
	const staticPages: readonly SitemapEntry[] = [
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
			url: `${baseUrl}/chapters`,
			lastModified: currentDate,
			changeFrequency: 'daily' as const,
			priority: 0.9,
			alternates: {
				languages: {
					en: `${baseUrl}/en/chapters`,
					ru: `${baseUrl}/ru/chapters`,
				},
			},
		},
		{
			url: `${baseUrl}/en/chapters`,
			lastModified: currentDate,
			changeFrequency: 'daily' as const,
			priority: 0.9,
		},
		{
			url: `${baseUrl}/ru/chapters`,
			lastModified: currentDate,
			changeFrequency: 'daily' as const,
			priority: 0.9,
		},
	] as const;

	sitemapEntries.push(...staticPages);

	try {
		// Get ONLY published chapters
		const chapters = await db.chapter.findMany({
			where: {
				isPublished: true,
			},
			select: {
				id: true,
				slug: true,
				updatedAt: true,
				createdAt: true,
			},
			orderBy: { updatedAt: 'desc' },
			take: 1000,
		});

		// Add chapter pages (PUBLIC only)
		chapters.forEach((chapter) => {
			sitemapEntries.push({
				url: `${baseUrl}/chapters/${chapter.slug}`,
				lastModified: chapter.updatedAt,
				changeFrequency: 'weekly',
				priority: 0.8,
				alternates: {
					languages: {
						en: `${baseUrl}/en/chapters/${chapter.slug}`,
						ru: `${baseUrl}/ru/chapters/${chapter.slug}`,
					},
				},
			});

			// Add localized versions
			sitemapEntries.push(
				{
					url: `${baseUrl}/en/chapters/${chapter.slug}`,
					lastModified: chapter.updatedAt,
					changeFrequency: 'weekly',
					priority: 0.8,
				},
				{
					url: `${baseUrl}/ru/chapters/${chapter.slug}`,
					lastModified: chapter.updatedAt,
					changeFrequency: 'weekly',
					priority: 0.8,
				},
			);
		});

		// Get ONLY published topics (public content)
		const topics = await db.topic.findMany({
			where: {
				isPublished: true,
			},
			select: {
				id: true,
				slug: true,
				updatedAt: true,
				chapter: {
					select: {
						slug: true,
						isPublished: true,
					},
				},
			},
			orderBy: { updatedAt: 'desc' },
			take: 2000,
		});

		// Add topic pages (PUBLIC only)
		topics.forEach((topic) => {
			if (topic.chapter?.isPublished) {
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
			},
			select: {
				id: true,
				slug: true,
				updatedAt: true,
			},
			take: 100,
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
		const fallbackPages: readonly SitemapEntry[] = [
			{
				url: `${baseUrl}/chapters`,
				lastModified: currentDate,
				changeFrequency: 'daily' as const,
				priority: 0.9,
			},
		] as const;

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
