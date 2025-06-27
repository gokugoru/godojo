// src/components/home/skeletons/chapter-grid-skeleton.tsx
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { nanoid } from 'nanoid';

const SKELETON_COUNT = 6;

export const ChapterGridSkeleton = (): JSX.Element => {
	return (
		<div className='space-y-6'>
			<div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
				{Array.from({ length: SKELETON_COUNT }, () => (
					<Card key={nanoid()} className='flex h-full flex-col'>
						<CardHeader className='pb-3'>
							<div className='flex items-start justify-between gap-2'>
								<Skeleton className='h-6 w-3/4' />
								<Skeleton className='h-5 w-16' />
							</div>
						</CardHeader>

						<CardContent className='flex-1 space-y-4'>
							<div className='space-y-2'>
								<Skeleton className='h-4 w-full' />
								<Skeleton className='h-4 w-4/5' />
								<Skeleton className='h-4 w-3/5' />
							</div>

							<div className='space-y-3'>
								<div className='flex items-center justify-between'>
									<Skeleton className='h-4 w-20' />
									<Skeleton className='h-4 w-24' />
								</div>

								<Skeleton className='h-2 w-full' />

								<div className='flex items-center justify-between'>
									<Skeleton className='h-4 w-16' />
									<Skeleton className='h-4 w-8' />
								</div>
							</div>

							<div className='flex flex-wrap gap-2'>
								<Skeleton className='h-5 w-12' />
								<Skeleton className='h-5 w-16' />
								<Skeleton className='h-5 w-14' />
							</div>
						</CardContent>

						<CardFooter className='pt-3'>
							<Skeleton className='h-10 w-full' />
						</CardFooter>
					</Card>
				))}
			</div>
		</div>
	);
};
