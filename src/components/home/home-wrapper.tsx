// src/components/home/home-wrapper.tsx
import { Suspense, lazy } from 'react';
import { HomeHeaderSkeleton } from './skeletons/home-header-skeleton';
import { ContentTabsSkeleton } from './skeletons/content-tabs-skeleton';
import { ChapterGridSkeleton } from './skeletons/chapter-grid-skeleton';

const HomeStructure = lazy(() =>
	import('./home-structure').then((module) => ({
		default: module.HomeStructure,
	})),
);

interface HomeWrapperProps {
	readonly locale: string;
	readonly searchParams?: {
		readonly tab?: string;
		readonly category?: string;
		readonly difficulty?: string;
		readonly search?: string;
		readonly page?: string;
	};
}

const LoadingFallback = () => (
	<div className='bg-background min-h-screen'>
		<div className='container mx-auto space-y-8 px-4 py-8'>
			<HomeHeaderSkeleton />
			<ContentTabsSkeleton />
			<ChapterGridSkeleton />
		</div>
	</div>
);

const HomeWrapper = ({ locale, searchParams = {} }: HomeWrapperProps) => {
	return (
		<Suspense fallback={<LoadingFallback />}>
			<HomeStructure locale={locale} searchParams={searchParams} />
		</Suspense>
	);
};

export default HomeWrapper;
