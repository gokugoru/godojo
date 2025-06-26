// src/lib/seo/structured-data.ts

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://godojo.dev';

/**
 * Generate structured data (JSON-LD) for enhanced SEO
 * Only for PUBLIC pages that should appear in search results
 */
export const generateStructuredData = (config: {
	type:
		| 'WebSite'
		| 'Organization'
		| 'Course'
		| 'Article'
		| 'BreadcrumbList'
		| 'FAQPage';
	title?: string;
	description?: string;
	url?: string;
	image?: string;
	datePublished?: string;
	dateModified?: string;
	author?: string;
	breadcrumbs?: Array<{ name: string; url: string }>;
	faqs?: Array<{ question: string; answer: string }>;
}) => {
	const commonData = {
		'@context': 'https://schema.org',
		'@type': config.type,
	};

	switch (config.type) {
		case 'WebSite':
			return {
				...commonData,
				name: 'Go Dojo',
				url: baseUrl,
				description:
					'Learn Go programming with comprehensive tutorials and hands-on projects for backend development',
				potentialAction: {
					'@type': 'SearchAction',
					target: `${baseUrl}/search?q={search_term_string}`,
					'query-input': 'required name=search_term_string',
				},
				sameAs: ['https://github.com/godojo', 'https://twitter.com/godojo_dev'],
			};

		case 'Organization':
			return {
				...commonData,
				name: 'Go Dojo',
				url: baseUrl,
				logo: `${baseUrl}/images/logo.png`,
				description:
					'Educational platform for learning Go programming and backend development',
				foundingDate: '2024',
				sameAs: ['https://github.com/godojo', 'https://twitter.com/godojo_dev'],
				contactPoint: {
					'@type': 'ContactPoint',
					contactType: 'Education Support',
					url: `${baseUrl}/contact`,
				},
			};

		case 'Course':
			return {
				...commonData,
				name: config.title,
				description: config.description,
				url: config.url,
				image: config.image,
				provider: {
					'@type': 'Organization',
					name: 'Go Dojo',
					url: baseUrl,
				},
				educationalLevel: 'Beginner to Advanced',
				about: 'Go Programming Language',
				teaches:
					'Backend Development, Microservices, System Design, Go Programming',
				courseMode: 'Online',
				hasCourseInstance: {
					'@type': 'CourseInstance',
					courseMode: 'Online',
					instructor: {
						'@type': 'Organization',
						name: 'Go Dojo',
					},
				},
			};

		case 'Article':
			return {
				...commonData,
				headline: config.title,
				description: config.description,
				url: config.url,
				image: {
					'@type': 'ImageObject',
					url: config.image,
					width: 1200,
					height: 630,
				},
				datePublished: config.datePublished,
				dateModified: config.dateModified,
				author: {
					'@type': 'Organization',
					name: config.author || 'Go Dojo',
					url: baseUrl,
				},
				publisher: {
					'@type': 'Organization',
					name: 'Go Dojo',
					url: baseUrl,
					logo: {
						'@type': 'ImageObject',
						url: `${baseUrl}/images/logo.png`,
					},
				},
				mainEntityOfPage: {
					'@type': 'WebPage',
					'@id': config.url,
				},
				articleSection: 'Programming Tutorial',
				keywords: 'Go programming, Golang, Backend development',
			};

		case 'BreadcrumbList':
			return {
				...commonData,
				itemListElement: config.breadcrumbs?.map((crumb, index) => ({
					'@type': 'ListItem',
					position: index + 1,
					name: crumb.name,
					item: {
						'@type': 'WebPage',
						'@id': crumb.url,
					},
				})),
			};

		case 'FAQPage':
			return {
				...commonData,
				mainEntity: config.faqs?.map((faq) => ({
					'@type': 'Question',
					name: faq.question,
					acceptedAnswer: {
						'@type': 'Answer',
						text: faq.answer,
					},
				})),
			};

		default:
			return commonData;
	}
};

/**
 * Common FAQ data for Go programming topics
 */
export const generateGoTopicFAQs = (topicTitle: string) => [
	{
		question: `What is ${topicTitle} in Go programming?`,
		answer: `${topicTitle} is an important concept in Go programming that helps developers build efficient backend applications. This tutorial covers practical implementation with code examples.`,
	},
	{
		question: `How do I learn ${topicTitle} effectively?`,
		answer:
			'Start with the fundamentals, practice with code examples, and build real projects. Our comprehensive tutorial provides step-by-step guidance with hands-on exercises.',
	},
	{
		question: `Why is ${topicTitle} important for backend development?`,
		answer: `${topicTitle} is crucial for building scalable backend systems. Understanding this concept helps you write better Go code and prepare for technical interviews at top companies.`,
	},
];

/**
 * Generate complete structured data for a topic page
 */
export const generateTopicStructuredData = (
	topicTitle: string,
	moduleTitle: string,
	description: string,
	url: string,
	locale: string,
	breadcrumbs: Array<{ name: string; url: string }>,
) => {
	return [
		generateStructuredData({
			type: 'Article',
			title: `${topicTitle} - ${moduleTitle}`,
			description,
			url,
			image: `${baseUrl}/images/topics/${topicTitle.toLowerCase().replace(/\s+/g, '-')}.png`,
			datePublished: new Date().toISOString(),
			dateModified: new Date().toISOString(),
			author: 'Go Dojo',
		}),
		generateStructuredData({
			type: 'BreadcrumbList',
			breadcrumbs,
		}),
		generateStructuredData({
			type: 'FAQPage',
			faqs: generateGoTopicFAQs(topicTitle),
		}),
	];
};
