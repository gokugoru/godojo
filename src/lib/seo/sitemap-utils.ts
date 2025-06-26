// src/lib/seo/sitemap-utils.ts
import { SitemapEntry } from '@/lib/seo/types';

/**
 * Utility functions for sitemap generation and management
 */

export const sitemapConfig = {
	maxUrls: 50000, // Google limit
	maxFileSize: 50 * 1024 * 1024, // 50MB limit
	defaultChangeFreq: 'weekly' as const,
	defaultPriority: 0.5,
};

/**
 * Generate sitemap index for large sites
 */
export const generateSitemapIndex = (baseUrl: string, sitemaps: string[]) => {
	const currentDate = new Date().toISOString();

	return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps
	.map(
		(sitemap) => `  <sitemap>
    <loc>${baseUrl}/${sitemap}</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>`,
	)
	.join('\n')}
</sitemapindex>`;
};

/**
 * Validate sitemap entry
 */
export const validateSitemapEntry = (entry: SitemapEntry): boolean => {
	if (!entry.url) return false;
	if (entry.priority && (entry.priority < 0 || entry.priority > 1))
		return false;
	if (
		entry.changeFrequency &&
		![
			'always',
			'hourly',
			'daily',
			'weekly',
			'monthly',
			'yearly',
			'never',
		].includes(entry.changeFrequency)
	)
		return false;

	return true;
};

/**
 * Split large sitemaps into chunks
 */
export const chunkSitemap = (
	entries: SitemapEntry[],
	maxUrls: number = sitemapConfig.maxUrls,
) => {
	const chunks: SitemapEntry[][] = [];

	for (let i = 0; i < entries.length; i += maxUrls) {
		chunks.push(entries.slice(i, i + maxUrls));
	}

	return chunks;
};
