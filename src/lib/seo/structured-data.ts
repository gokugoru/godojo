// src/lib/seo/structured-data.ts

import { getBaseUrl } from '@/lib/utils';

const baseUrl = getBaseUrl();

interface BreadcrumbItem {
	readonly name: string;
	readonly url: string;
}

interface FAQItem {
	readonly question: string;
	readonly answer: string;
}

interface StructuredDataConfig {
	readonly type:
		| 'WebSite'
		| 'Organization'
		| 'Course'
		| 'Article'
		| 'BreadcrumbList'
		| 'FAQPage'
		| 'WebPage';
	readonly title?: string;
	readonly description?: string;
	readonly url?: string;
	readonly image?: string;
	readonly publishedTime?: string;
	readonly modifiedTime?: string;
	readonly authors?: readonly string[];
	readonly breadcrumbs?: readonly BreadcrumbItem[];
	readonly faqs?: readonly FAQItem[];
}

export const generateStructuredData = (config: StructuredDataConfig) => {
	const commonData = {
		'@context': 'https://schema.org',
		'@type': config.type,
	} as const;

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
				datePublished: config.publishedTime,
				dateModified: config.modifiedTime,
				author: {
					'@type': 'Organization',
					name: config.authors?.[0] || 'Go Dojo',
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

		case 'WebPage':
			return {
				...commonData,
				name: config.title,
				description: config.description,
				url: config.url,
				isPartOf: {
					'@type': 'WebSite',
					name: 'Go Dojo',
					url: baseUrl,
				},
			};

		default:
			return commonData;
	}
};

export const generateGoTopicFAQs = (topicTitle: string): readonly FAQItem[] =>
	[
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
	] as const;

export const generateTopicStructuredData = (
	topicTitle: string,
	chapterTitle: string,
	description: string,
	url: string,
	locale: string,
	breadcrumbs: readonly BreadcrumbItem[],
) => {
	return [
		generateStructuredData({
			type: 'Article',
			title: `${topicTitle} - ${chapterTitle}`,
			description,
			url,
			image: `${baseUrl}/images/topics/${topicTitle.toLowerCase().replace(/\s+/g, '-')}.png`,
			publishedTime: new Date().toISOString(),
			modifiedTime: new Date().toISOString(),
			authors: ['Go Dojo Team'],
		}),
		generateStructuredData({
			type: 'BreadcrumbList',
			breadcrumbs,
		}),
		generateStructuredData({
			type: 'FAQPage',
			faqs: generateGoTopicFAQs(topicTitle),
		}),
	] as const;
};
