// src/app/[locale]/(public)/page.tsx
import { type Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { HomeStructure } from '@/components/home/home-structure';
import {
	generateI18nSEOMetadata,
	i18nSEOConfigs,
} from '@/lib/seo/i18n-metadata';
import { generateStructuredData } from '@/lib/seo/structured-data';
import { type Difficulty } from '@prisma/client';
import { getBaseUrl } from '@/lib/utils';

interface HomePageParams {
	readonly locale: string;
}

interface HomePageSearchParams {
	readonly tab?: string;
	readonly category?: string;
	readonly difficulty?: Difficulty;
	readonly search?: string;
	readonly page?: string;
}

interface HomePageProps {
	readonly params: Promise<HomePageParams>;
	readonly searchParams?: Promise<HomePageSearchParams>;
}

export const generateMetadata = async ({
	params,
}: Pick<HomePageProps, 'params'>): Promise<Metadata> => {
	const { locale } = await params;

	return await generateI18nSEOMetadata(i18nSEOConfigs.home, locale);
};

const HomePage = async ({
	params,
	searchParams,
}: HomePageProps): Promise<JSX.Element> => {
	const { locale } = await params;
	const resolvedSearchParams = searchParams ? await searchParams : {};
	setRequestLocale(locale);

	const baseUrl = getBaseUrl();

	const structuredData = [
		generateStructuredData({
			type: 'Course',
			title: 'Go Programming Course - Master Backend Development',
			description:
				'Comprehensive Go programming course with hands-on projects, system design, and real-world examples for backend development.',
			url: `${baseUrl}/${locale}`,
			image: `${baseUrl}/images/og-course.png`,
		}),

		generateStructuredData({
			type: 'WebSite',
		}),

		generateStructuredData({
			type: 'Organization',
		}),

		generateStructuredData({
			type: 'BreadcrumbList',
			breadcrumbs: [{ name: 'Home', url: `${baseUrl}/${locale}` }],
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

			<HomeStructure locale={locale} searchParams={resolvedSearchParams} />

			<div className='sr-only'>
				<h1>Learn Go Programming - Complete Backend Development Course</h1>
				<p>
					Master Go programming language with comprehensive tutorials, hands-on
					projects, and real-world examples. Perfect for backend developers
					wanting to work at FAANG companies like Google, Amazon, and Meta.
				</p>
				<ul>
					<li>Go fundamentals and advanced concepts</li>
					<li>Microservices architecture with Go</li>
					<li>System design and scalability</li>
					<li>FAANG interview preparation</li>
					<li>Hands-on projects and code examples</li>
				</ul>
			</div>
		</>
	);
};

export default HomePage;
