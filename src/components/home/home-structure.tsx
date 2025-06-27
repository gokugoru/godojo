// src/components/home/home-structure.tsx
import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { HomeHeader } from './home-header';
import { ContentTabs } from './content-tabs';
import { ChapterGrid } from './chapter-grid';
import { HomeHeaderSkeleton } from './skeletons/home-header-skeleton';
import { ContentTabsSkeleton } from './skeletons/content-tabs-skeleton';
import { ChapterGridSkeleton } from './skeletons/chapter-grid-skeleton';

interface HomeStructureProps {
	readonly locale: string;
	readonly searchParams?: {
		readonly tab?: string;
		readonly category?: string;
		readonly difficulty?: string;
		readonly search?: string;
		readonly page?: string;
	};
}

export const HomeStructure = ({
	locale,
	searchParams = {},
}: HomeStructureProps): JSX.Element => {
	const t = useTranslations('home');

	return (
		<div className='min-h-screen bg-white'>
			<div className='mx-auto max-w-6xl space-y-6 px-4 py-8'>
				<Suspense fallback={<HomeHeaderSkeleton />}>
					<HomeHeader title={t('title')} description={t('description')} />
				</Suspense>

				<Suspense fallback={<ContentTabsSkeleton />}>
					<ContentTabs locale={locale} />
				</Suspense>

				<Suspense fallback={<ChapterGridSkeleton />}>
					<ChapterGrid locale={locale} searchParams={searchParams} />
				</Suspense>
			</div>
		</div>
	);
};
