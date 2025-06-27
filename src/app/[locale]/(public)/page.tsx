// src/app/[locale]/(public)/page.tsx
import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import ChaptersHomeWrapper from '@/components/chapters/chapters-home-wrapper';
import {
	generateI18nSEOMetadata,
	i18nSEOConfigs,
} from '@/lib/seo/i18n-metadata';
import { generateStructuredData } from '@/lib/seo/structured-data';
import { Difficulty } from '@prisma/client';

interface HomePageProps {
	params: { locale: string };
	searchParams?: {
		tab?: string;
		category?: string;
		difficulty?: Difficulty;
		search?: string;
		page?: string;
	};
}

export async function generateMetadata({
	params,
}: Pick<HomePageProps, 'params'>): Promise<Metadata> {
	const { locale } = params;

	return await generateI18nSEOMetadata(i18nSEOConfigs.home, locale);
}

const HomePage = async ({ params, searchParams }: HomePageProps) => {
	const { locale } = params;
	setRequestLocale(locale);

	const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://godojo.dev';

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
	];

	return (
		<>
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(structuredData),
				}}
			/>

			<ChaptersHomeWrapper params={params} searchParams={searchParams} />

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
