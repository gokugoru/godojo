// src/app/[locale]/(public)/page.tsx
import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import ModulesHome from '@/components/modules/modules-home';
import {
	generateI18nSEOMetadata,
	i18nSEOConfigs,
} from '@/lib/seo/i18n-metadata';
import { generateStructuredData } from '@/lib/seo/structured-data';

interface HomePageProps {
	params: { locale: string };
}

/**
 * Generate advanced SEO metadata for homepage
 * This is the main landing page that should rank well in search
 */
export async function generateMetadata({
	params,
}: HomePageProps): Promise<Metadata> {
	const { locale } = params;

	// Generate comprehensive SEO metadata with translations
	return await generateI18nSEOMetadata(i18nSEOConfigs.home, locale);
}

/**
 * Homepage component with full SEO optimization
 * Focus: Attract users searching for Go programming education
 */
const HomePage = async ({ params }: HomePageProps) => {
	const { locale } = params;
	setRequestLocale(locale);

	const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://godojo.dev';

	// Enhanced structured data for homepage
	const structuredData = [
		// Course structured data for educational content
		generateStructuredData({
			type: 'Course',
			title: 'Go Programming Course - Master Backend Development',
			description:
				'Comprehensive Go programming course with hands-on projects, system design, and real-world examples for backend development.',
			url: `${baseUrl}/${locale}`,
			image: `${baseUrl}/images/og-course.png`,
		}),

		// Breadcrumb for navigation
		generateStructuredData({
			type: 'BreadcrumbList',
			breadcrumbs: [{ name: 'Home', url: `${baseUrl}/${locale}` }],
		}),
	];

	return (
		<>
			{/* Enhanced JSON-LD Structured Data for homepage */}
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(structuredData),
				}}
			/>

			{/* Main homepage content */}
			<ModulesHome params={params} />

			{/* Hidden semantic content for SEO (if needed) */}
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
