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
	locale: string;
	searchParams?: SearchParams;
}

const ChaptersHomeWrapper = ({
	locale,
	searchParams,
}: ChaptersHomeWrapperProps) => {
	return (
		<Suspense fallback={<ChaptersSkeleton />}>
			<ChaptersHome locale={locale} searchParams={searchParams} />
		</Suspense>
	);
};

export default ChaptersHomeWrapper;
