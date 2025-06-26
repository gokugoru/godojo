// src/app/[locale]/(public)/modules/page.tsx
import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import {
	generateSEOMetadata,
	generateStructuredData,
	seoConfigs,
} from '@/lib/seo/metadata';
import { db } from '@/lib/prisma';

interface ModulesPageProps {
	params: { locale: string };
}

/**
 * Generate SEO metadata for modules page
 */
export async function generateMetadata({
	params,
}: ModulesPageProps): Promise<Metadata> {
	const { locale } = params;

	// Get module count for dynamic description
	const moduleCount = await db.module.count({
		where: { isPublished: true },
	});

	const seoConfig = {
		...seoConfigs.modules,
		description: `Explore ${moduleCount}+ comprehensive Go programming modules. Learn backend development, microservices, system design, and advanced Go concepts with practical examples.`,
		canonical: `/${locale}/modules`,
		alternateUrls: {
			en: '/en/modules',
			ru: '/ru/modules',
		},
		locale: locale === 'ru' ? 'ru_RU' : 'en_US',
	};

	return await generateSEOMetadata(seoConfig, locale);
}

/**
 * Modules page component
 */
const ModulesPage = async ({ params }: ModulesPageProps) => {
	const { locale } = params;
	setRequestLocale(locale);

	// Get modules for structured data
	const modules = await db.module.findMany({
		where: { isPublished: true },
		select: {
			id: true,
			slug: true,
			titleEn: true,
			titleRu: true,
			descriptionEn: true,
			descriptionRu: true,
			updatedAt: true,
		},
		take: 20, // Limit for performance
	});

	const structuredData = [
		generateStructuredData({
			type: 'BreadcrumbList',
			breadcrumbs: [
				{ name: 'Home', url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}` },
				{
					name: 'Modules',
					url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/modules`,
				},
			],
		}),
		// ItemList for modules
		{
			'@context': 'https://schema.org',
			'@type': 'ItemList',
			name: 'Go Programming Modules',
			description: 'Comprehensive list of Go programming learning modules',
			numberOfItems: modules.length,
			itemListElement: modules.map((module, index) => ({
				'@type': 'Course',
				position: index + 1,
				name: locale === 'ru' ? module.titleRu : module.titleEn,
				description:
					locale === 'ru' ? module.descriptionRu : module.descriptionEn,
				url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/modules/${module.slug}`,
				dateModified: module.updatedAt.toISOString(),
			})),
		},
	];

	return (
		<>
			{/* Structured Data */}
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(structuredData),
				}}
			/>

			{/* Page content would go here */}
			<div>
				<h1>Go Programming Modules</h1>
				{/* Module list component */}
			</div>
		</>
	);
};

export default ModulesPage;
