// src/components/chapters/chapters-home-wrapper.tsx
import { Suspense } from 'react';
import ChaptersHome from './chapters-home';
import { Difficulty } from '@prisma/client';
import { ChaptersSkeleton } from '@/components/chapters/chapter-skeleton';

interface SearchParams {
	tab?: string;
	category?: string;
	difficulty?: Difficulty;
	search?: string;
	page?: string;
}

interface ChaptersHomeWrapperProps {
	params: { locale: string };
	searchParams?: SearchParams;
}

const ChaptersHomeWrapper = ({
	params,
	searchParams,
}: ChaptersHomeWrapperProps) => {
	return (
		<Suspense fallback={<ChaptersSkeleton />}>
			<ChaptersHome params={params} searchParams={searchParams} />
		</Suspense>
	);
};

export default ChaptersHomeWrapper;
