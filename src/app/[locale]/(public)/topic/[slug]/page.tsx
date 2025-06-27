// src/app/[locale]/(public)/topic/[slug]/page.tsx
import { type Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { generateStructuredData } from '@/lib/seo/structured-data';
import { db } from '@/lib/prisma';
import { nanoid } from 'nanoid';
import { getBaseUrl } from '@/lib/utils';

interface TopicPageParams {
	readonly locale: string;
	readonly slug: string;
}

interface TopicPageProps {
	readonly params: Promise<TopicPageParams>;
}

export const generateMetadata = async ({
	params,
}: TopicPageProps): Promise<Metadata> => {
	const { locale, slug } = await params;

	try {
		const topic = await db.topic.findUnique({
			where: {
				slug: slug,
				isPublished: true,
			},
			include: {
				chapter: {
					select: {
						titleEn: true,
						titleRu: true,
						slug: true,
						tab: {
							select: {
								titleEn: true,
								titleRu: true,
								slug: true,
							},
						},
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

		if (!topic) {
			return {
				title: 'Topic Not Found',
				robots: { index: false, follow: false },
			};
		}

		const topicTitle = locale === 'ru' ? topic.titleRu : topic.titleEn;
		const chapterTitle =
			locale === 'ru' ? topic.chapter.titleRu : topic.chapter.titleEn;
		const tabTitle =
			locale === 'ru' ? topic.chapter.tab.titleRu : topic.chapter.tab.titleEn;
		const topicDescription =
			locale === 'ru' ? topic.contentRu : topic.contentEn;

		return {
			title: `${topicTitle} - ${chapterTitle} | Go Dojo`,
			description: topicDescription
				? topicDescription.replace(/<[^>]*>/g, '').slice(0, 160) + '...'
				: `Learn ${topicTitle} in Go programming with practical examples and hands-on tutorials.`,
			keywords: [
				topicTitle,
				chapterTitle,
				tabTitle,
				'Go Programming',
				'Tutorial',
			],
			openGraph: {
				title: `${topicTitle} - ${chapterTitle}`,
				description:
					topicDescription?.slice(0, 200) ||
					`Learn ${topicTitle} in Go programming`,
				type: 'article',
				url: `/${locale}/topic/${slug}`,
				publishedTime: topic.createdAt.toISOString(),
				modifiedTime: topic.updatedAt.toISOString(),
				authors: ['Go Dojo Team'],
				tags: [topicTitle, chapterTitle, tabTitle],
			},
			alternates: {
				canonical: `/${locale}/topic/${slug}`,
				languages: {
					en: `/en/topic/${slug}`,
					ru: `/ru/topic/${slug}`,
				},
			},
		};
	} catch (error) {
		console.error('Error generating topic metadata:', error);

		return {
			title: 'Error Loading Topic',
			robots: { index: false, follow: false },
		};
	}
};

const TopicPage = async ({ params }: TopicPageProps): Promise<JSX.Element> => {
	const { locale, slug } = await params;
	setRequestLocale(locale);

	const t = await getTranslations('topic');

	try {
		const topic = await db.topic.findUnique({
			where: {
				slug: slug,
				isPublished: true,
			},
			include: {
				chapter: {
					include: {
						tab: {
							select: {
								titleEn: true,
								titleRu: true,
								slug: true,
							},
						},
						category: {
							select: {
								titleEn: true,
								titleRu: true,
								slug: true,
							},
						},
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

		if (!topic) {
			notFound();
		}

		const baseUrl = getBaseUrl();
		const topicTitle = locale === 'ru' ? topic.titleRu : topic.titleEn;
		const chapterTitle =
			locale === 'ru' ? topic.chapter.titleRu : topic.chapter.titleEn;
		const tabTitle =
			locale === 'ru' ? topic.chapter.tab.titleRu : topic.chapter.tab.titleEn;
		const sectionTitle = topic.section
			? locale === 'ru'
				? topic.section.titleRu
				: topic.section.titleEn
			: null;
		const topicContent = locale === 'ru' ? topic.contentRu : topic.contentEn;

		const breadcrumbs = [
			{
				name: locale === 'ru' ? 'Главная' : 'Home',
				url: `${baseUrl}/${locale}`,
			},
			{
				name: tabTitle,
				url: `${baseUrl}/${locale}?tab=${topic.chapter.tab.slug}`,
			},
			{
				name: chapterTitle,
				url: `${baseUrl}/${locale}?tab=${topic.chapter.tab.slug}#${topic.chapter.slug}`,
			},
			...(sectionTitle
				? [
						{
							name: sectionTitle,
							url: `${baseUrl}/${locale}/topic/${slug}#section-${topic.section?.slug}`,
						},
					]
				: []),
			{
				name: topicTitle,
				url: `${baseUrl}/${locale}/topic/${slug}`,
			},
		] as const;

		const structuredData = [
			generateStructuredData({
				type: 'Article',
				title: topicTitle,
				description:
					topicContent?.slice(0, 200) ||
					`Learn ${topicTitle} in Go programming`,
				url: `${baseUrl}/${locale}/topic/${slug}`,
				image: `${baseUrl}/images/og-topic.png`,
				publishedTime: topic.createdAt.toISOString(),
				modifiedTime: topic.updatedAt.toISOString(),
				authors: ['Go Dojo Team'],
			}),
			generateStructuredData({
				type: 'BreadcrumbList',
				breadcrumbs: breadcrumbs,
			}),
			generateStructuredData({
				type: 'WebPage',
			}),
		] as const;

		return (
			<>
				<script
					type='application/ld+json'
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(structuredData),
					}}
				/>

				<nav aria-label='Breadcrumb' className='mb-6 bg-gray-50 py-3'>
					<div className='container mx-auto px-4'>
						<ol className='flex flex-wrap items-center space-x-2 text-sm text-gray-600'>
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

				<article className='container mx-auto px-4 py-8'>
					<header className='mb-8'>
						<h1 className='mb-4 text-4xl font-bold text-gray-900'>
							{topicTitle}
						</h1>

						<div className='mb-6 flex flex-wrap items-center gap-4 text-sm text-gray-600'>
							<time dateTime={topic.updatedAt.toISOString()}>
								{t('lastUpdated')}: {topic.updatedAt.toLocaleDateString(locale)}
							</time>

							{topic.duration > 0 && (
								<span className='flex items-center'>
									<svg
										className='mr-1 h-4 w-4'
										fill='currentColor'
										viewBox='0 0 20 20'
									>
										<path
											fillRule='evenodd'
											d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
											clipRule='evenodd'
										/>
									</svg>
									{topic.duration} {t('minutes')}
								</span>
							)}

							<span className='rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800'>
								{chapterTitle}
							</span>

							<span className='rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800'>
								{tabTitle}
							</span>
						</div>

						<div className='mb-8 rounded-lg bg-blue-50 p-6'>
							<h2 className='mb-3 text-lg font-semibold text-blue-900'>
								{t('aboutTopic')}
							</h2>
							<p className='text-blue-800'>{t('practicalImplementation')}</p>
						</div>
					</header>

					<div className='prose prose-lg max-w-none'>
						{topicContent ? (
							<div
								dangerouslySetInnerHTML={{ __html: topicContent }}
								className='markdown-content'
							/>
						) : (
							<div className='rounded-lg bg-yellow-50 p-6 text-center'>
								<p className='text-yellow-800'>{t('contentPreparing')}</p>
							</div>
						)}

						{topic.codeExample && (
							<section className='mt-8'>
								<h2 className='mb-4 text-2xl font-semibold'>
									{t('codeExample')}
								</h2>
								<pre className='overflow-x-auto rounded-lg bg-gray-900 p-6 text-gray-100'>
									<code>{topic.codeExample}</code>
								</pre>
							</section>
						)}

						{(topic.githubUrl || topic.videoUrl) && (
							<section className='mt-8'>
								<h2 className='mb-4 text-2xl font-semibold'>
									{t('resources')}
								</h2>
								<ul className='space-y-2'>
									{topic.githubUrl && (
										<li>
											<a
												href={topic.githubUrl}
												target='_blank'
												rel='noopener noreferrer'
												className='inline-flex items-center text-blue-600 hover:text-blue-800'
											>
												<svg
													className='mr-2 h-5 w-5'
													fill='currentColor'
													viewBox='0 0 20 20'
												>
													<path
														fillRule='evenodd'
														d='M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z'
														clipRule='evenodd'
													/>
												</svg>
												{t('viewOnGithub')}
											</a>
										</li>
									)}
									{topic.videoUrl && (
										<li>
											<a
												href={topic.videoUrl}
												target='_blank'
												rel='noopener noreferrer'
												className='inline-flex items-center text-blue-600 hover:text-blue-800'
											>
												<svg
													className='mr-2 h-5 w-5'
													fill='currentColor'
													viewBox='0 0 20 20'
												>
													<path
														fillRule='evenodd'
														d='M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z'
														clipRule='evenodd'
													/>
												</svg>
												{t('watchVideo')}
											</a>
										</li>
									)}
								</ul>
							</section>
						)}
					</div>

					<nav className='mt-12 border-t border-gray-200 pt-8'>
						<div className='flex flex-col justify-between gap-4 sm:flex-row'>
							<a
								href={`/${locale}?tab=${topic.chapter.tab.slug}#${topic.chapter.slug}`}
								className='inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700'
							>
								<svg
									className='mr-2 h-5 w-5'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M10 19l-7-7m0 0l7-7m-7 7h18'
									/>
								</svg>
								{t('backToChapter')} {chapterTitle}
							</a>

							<a
								href={`/${locale}?tab=${topic.chapter.tab.slug}`}
								className='inline-flex items-center justify-center rounded-lg border border-gray-300 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50'
							>
								{t('allTopicsIn')} {tabTitle}
								<svg
									className='ml-2 h-5 w-5'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M14 5l7 7m0 0l-7 7m7-7H3'
									/>
								</svg>
							</a>
						</div>
					</nav>
				</article>

				<div className='sr-only'>
					<h2>
						{t('coreConceptsOf')} {topicTitle}
					</h2>
					<p>{t('practicalImplementation')}</p>
					<h3>{t('whatYouLearn')}</h3>
					<ul>
						<li>
							{t('coreConceptsOf')} {topicTitle}
						</li>
						<li>{t('practicalImplementation')}</li>
						<li>{t('bestPractices')}</li>
						<li>{t('realWorldExamples')}</li>
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
