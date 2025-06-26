export interface SitemapEntry {
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

export interface SEOConfig {
	title: string;
	description: string;
	keywords?: string[];
	canonical?: string;
	ogType?: 'website' | 'article';
	ogImage?: string;
	twitterCard?: 'summary' | 'summary_large_image';
	publishedTime?: string;
	modifiedTime?: string;
	authors?: string[];
	section?: string;
	tags?: string[];
	locale?: string;
	alternateUrls?: Record<string, string>;
	noIndex?: boolean;
	noFollow?: boolean;
}

export interface LocalizedSEOConfig {
	titleKey: string;
	descriptionKey: string;
	keywordsKey?: string;
	path: string;
	ogImage?: string;
	ogType?: 'website' | 'article';
	noIndex?: boolean;
	isPublic?: boolean; // Only public pages get full SEO
}
