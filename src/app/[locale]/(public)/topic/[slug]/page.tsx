// src/app/[locale]/(public)/[id]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { generateSEOMetadata, seoConfigs } from '@/lib/seo/metadata';
import { generateTopicStructuredData } from '@/lib/seo/structured-data';
import { db } from '@/lib/prisma';
import { nanoid } from 'nanoid';

interface TopicPageProps {
	params: { locale: string; id: string };
}

/**
 * Generate dynamic SEO metadata for topic pages
 * Using [id] route which matches your current structure
 */
export async function generateMetadata({
	params,
}: TopicPageProps): Promise<Metadata> {
	const { locale, id } = params;

	try {
		// Get topic data using the id (which should be the slug)
		const topic = await db.topic.findUnique({
			where: { slug: id }, // Assuming id is the topic slug
			include: {
				module: {
					select: {
						titleEn: true,
						titleRu: true,
						slug: true,
					},
				},
			},
		});

		if (!topic || !topic.isPublished) {
			return {
				title: 'Topic Not Found',
				robots: { index: false, follow: false },
			};
		}

		const topicTitle = locale === 'ru' ? topic.titleRu : topic.titleEn;
		const moduleTitle =
			locale === 'ru' ? topic.module.titleRu : topic.module.titleEn;
		const topicDescription =
			locale === 'ru' ? topic.contentRu : topic.contentEn;

		// Generate topic-specific SEO config
		const seoConfig = {
			...seoConfigs.topic(topicTitle, moduleTitle),
			description: topicDescription
				? topicDescription.replace(/<[^>]*>/g, '').slice(0, 160) + '...'
				: seoConfigs.topic(topicTitle, moduleTitle).description,
			canonical: `/${locale}/${id}`, // Your URL structure
			alternateUrls: {
				en: `/en/${id}`,
				ru: `/ru/${id}`,
			},
			publishedTime: topic.createdAt.toISOString(),
			modifiedTime: topic.updatedAt.toISOString(),
			authors: ['Go Dojo Team'],
			tags: [topicTitle, moduleTitle, 'Go Programming', 'Tutorial'],
			locale: locale === 'ru' ? 'ru_RU' : 'en_US',
		};

		return generateSEOMetadata(seoConfig, locale);
	} catch (error) {
		console.error('Error generating topic metadata:', error);

		return {
			title: 'Error Loading Topic',
			robots: { index: false, follow: false },
		};
	}
}

/**
 * Topic page component adapted for your [id] route structure
 */
const TopicPage = async ({ params }: TopicPageProps) => {
	const { locale, id } = params;
	setRequestLocale(locale);

	try {
		const topic = await db.topic.findUnique({
			where: { slug: id }, // Using id as topic slug
			include: {
				module: {
					select: {
						titleEn: true,
						titleRu: true,
						slug: true,
					},
				},
				section: {
					select: {
						titleEn: true,
						titleRu: true,
						slug: true,
					},
				},
			},
		});

		if (!topic || !topic.isPublished) {
			notFound();
		}

		const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://godojo.dev';
		const topicTitle = locale === 'ru' ? topic.titleRu : topic.titleEn;
		const moduleTitle =
			locale === 'ru' ? topic.module.titleRu : topic.module.titleEn;
		const topicContent = locale === 'ru' ? topic.contentRu : topic.contentEn;

		// Build breadcrumbs adapted for your structure
		const breadcrumbs = [
			{ name: 'Home', url: `${baseUrl}/${locale}` },
			{
				name: moduleTitle,
				url: `${baseUrl}/${locale}#${topic.module.slug}`, // Link to module section on homepage
			},
			{
				name: topicTitle,
				url: `${baseUrl}/${locale}/${id}`,
			},
		];

		// Generate comprehensive structured data for topic
		const structuredData = generateTopicStructuredData(
			topicTitle,
			moduleTitle,
			topicContent?.slice(0, 200) ||
				`Learn ${topicTitle} in Go programming with practical examples.`,
			`${baseUrl}/${locale}/${id}`,
			locale,
			breadcrumbs,
		);

		return (
			<>
				{/* Comprehensive JSON-LD Structured Data */}
				<script
					type='application/ld+json'
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(structuredData),
					}}
				/>

				{/* Breadcrumb Navigation for SEO */}
				<nav aria-label='Breadcrumb' className='mb-6 bg-gray-50 py-3'>
					<div className='container mx-auto px-4'>
						<ol className='flex space-x-2 text-sm text-gray-600'>
							{breadcrumbs.map((crumb, index) => (
								<li key={nanoid()} className='flex items-center'>
									{index > 0 && <span className='mx-2 text-gray-400'>/</span>}
									{index === breadcrumbs.length - 1 ? (
										<span className='font-medium text-gray-900'>
											{crumb.name}
										</span>
									) : (
										<a
											href={crumb.url}
											className='transition-colors hover:text-blue-600'
										>
											{crumb.name}
										</a>
									)}
								</li>
							))}
						</ol>
					</div>
				</nav>

				{/* Main content with semantic markup */}
				<article className='container mx-auto px-4 py-8'>
					<header className='mb-8'>
						<h1 className='mb-4 text-4xl font-bold'>{topicTitle}</h1>

						<div className='mb-6 flex items-center space-x-4 text-sm text-gray-600'>
							<time dateTime={topic.updatedAt.toISOString()}>
								Last updated: {topic.updatedAt.toLocaleDateString(locale)}
							</time>
							{topic.duration > 0 && <span>{topic.duration} min read</span>}
							<span className='rounded bg-blue-100 px-2 py-1 text-xs text-blue-800'>
								{moduleTitle}
							</span>
						</div>

						{/* Topic description/summary */}
						<div className='mb-8 text-lg leading-relaxed text-gray-700'>
							<p>
								Learn {topicTitle} in Go programming. This comprehensive
								tutorial covers practical implementation with code examples,
								best practices, and hands-on exercises to master this important
								concept.
							</p>
						</div>
					</header>

					{/* Main content */}
					<div className='prose prose-lg max-w-none'>
						{/* Topic content would be rendered here */}
						{topicContent && (
							<div
								dangerouslySetInnerHTML={{ __html: topicContent }}
								className='markdown-content'
							/>
						)}

						{/* Code example section if available */}
						{topic.codeExample && (
							<section className='mt-8'>
								<h2 className='mb-4 text-2xl font-semibold'>Code Example</h2>
								<pre className='overflow-x-auto rounded-lg bg-gray-900 p-6 text-gray-100'>
									<code>{topic.codeExample}</code>
								</pre>
							</section>
						)}

						{/* Related links */}
						{topic.githubUrl && (
							<section className='mt-8'>
								<h2 className='mb-4 text-2xl font-semibold'>Resources</h2>
								<ul className='list-disc pl-6'>
									<li>
										<a
											href={topic.githubUrl}
											target='_blank'
											rel='noopener noreferrer'
											className='text-blue-600 hover:text-blue-800'
										>
											View code examples on GitHub
										</a>
									</li>
								</ul>
							</section>
						)}
					</div>

					{/* Navigation adapted for your structure */}
					<nav className='mt-12 border-t border-gray-200 pt-8'>
						<div className='flex justify-between'>
							<a
								href={`/${locale}#${topic.module.slug}`}
								className='inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'
							>
								← Back to {moduleTitle}
							</a>
							<a
								href={`/${locale}`}
								className='inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50'
							>
								All Modules →
							</a>
						</div>
					</nav>
				</article>

				{/* Additional SEO content (hidden) */}
				<div className='sr-only'>
					<h2>About {topicTitle} in Go</h2>
					<p>
						{topicTitle} is an essential concept in Go programming that every
						backend developer should master. This tutorial provides
						comprehensive coverage with practical examples and best practices
						used in production environments.
					</p>
					<h3>What you&#39;ll learn:</h3>
					<ul>
						<li>Core concepts of {topicTitle}</li>
						<li>Practical implementation in Go</li>
						<li>Best practices and common pitfalls</li>
						<li>Real-world usage examples</li>
					</ul>
				</div>
			</>
		);
	} catch (error) {
		console.error('Error loading topic page:', error);
		notFound();
	}
};

export default TopicPage;
