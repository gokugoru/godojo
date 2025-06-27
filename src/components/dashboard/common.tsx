import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { nanoid } from 'nanoid';

export const OverviewSkeleton = () => (
	<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
		{Array.from({ length: 4 }).map(() => (
			<Card key={nanoid()}>
				<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
					<div className='bg-muted h-4 w-24 animate-pulse rounded' />
					<div className='bg-muted h-4 w-4 animate-pulse rounded' />
				</CardHeader>
				<CardContent>
					<div className='bg-muted mb-2 h-8 w-16 animate-pulse rounded' />
					<div className='bg-muted mb-2 h-3 w-32 animate-pulse rounded' />
					<div className='bg-muted h-2 w-full animate-pulse rounded' />
				</CardContent>
			</Card>
		))}
	</div>
);

export const ActivitySkeleton = () => (
	<div className='flex items-start space-x-4'>
		<div className='bg-muted h-8 w-8 animate-pulse rounded-full' />
		<div className='flex-1 space-y-2'>
			<div className='bg-muted h-4 w-full animate-pulse rounded' />
			<div className='bg-muted h-3 w-3/4 animate-pulse rounded' />
			<div className='bg-muted h-3 w-1/4 animate-pulse rounded' />
		</div>
	</div>
);
