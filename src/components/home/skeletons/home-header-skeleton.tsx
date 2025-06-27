// src/components/home/skeletons/home-header-skeleton.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { nanoid } from 'nanoid';

export const HomeHeaderSkeleton = (): JSX.Element => {
	return (
		<div className='space-y-6 text-center'>
			<div className='space-y-4'>
				<Skeleton className='mx-auto h-12 w-3/4' />
				<Skeleton className='mx-auto h-6 w-2/3' />
			</div>

			<Card className='mx-auto max-w-4xl'>
				<CardContent className='p-6'>
					<div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
						{Array.from({ length: 3 }, () => (
							<div
								key={nanoid()}
								className='flex flex-col items-center space-y-2'
							>
								<Skeleton className='h-10 w-16' />
								<Skeleton className='h-4 w-24' />
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
