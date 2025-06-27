// src/components/dashboard/dashboard-skeleton.tsx
import { memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { nanoid } from 'nanoid';

const StatsCardsSkeleton = memo(() => (
	<div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
		{Array.from({ length: 4 }).map(() => (
			<Card key={nanoid()}>
				<CardHeader className='pb-2'>
					<Skeleton className='h-4 w-24' />
				</CardHeader>
				<CardContent>
					<Skeleton className='mb-2 h-8 w-16' />
					<Skeleton className='h-3 w-20' />
				</CardContent>
			</Card>
		))}
	</div>
));

const ChartSkeleton = memo(() => (
	<Card>
		<CardHeader>
			<Skeleton className='h-6 w-32' />
			<Skeleton className='h-4 w-48' />
		</CardHeader>
		<CardContent>
			<Skeleton className='h-64 w-full' />
		</CardContent>
	</Card>
));

const ActivitySkeleton = memo(() => (
	<Card>
		<CardHeader>
			<Skeleton className='h-6 w-32' />
		</CardHeader>
		<CardContent className='space-y-4'>
			{Array.from({ length: 5 }).map(() => (
				<div key={nanoid()} className='flex items-center space-x-4'>
					<Skeleton className='h-10 w-10 rounded-full' />
					<div className='space-y-2'>
						<Skeleton className='h-4 w-48' />
						<Skeleton className='h-3 w-24' />
					</div>
				</div>
			))}
		</CardContent>
	</Card>
));

const ActionsSkeleton = memo(() => (
	<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
		{Array.from({ length: 6 }).map(() => (
			<Card key={nanoid()} className='p-6'>
				<div className='flex items-center space-x-3'>
					<Skeleton className='h-8 w-8 rounded' />
					<div className='space-y-2'>
						<Skeleton className='h-4 w-24' />
						<Skeleton className='h-3 w-32' />
					</div>
				</div>
			</Card>
		))}
	</div>
));

export const DashboardSkeleton = {
	StatsCards: StatsCardsSkeleton,
	Chart: ChartSkeleton,
	Activity: ActivitySkeleton,
	Actions: ActionsSkeleton,
};

StatsCardsSkeleton.displayName = 'StatsCardsSkeleton';
ChartSkeleton.displayName = 'ChartSkeleton';
ActivitySkeleton.displayName = 'ActivitySkeleton';
ActionsSkeleton.displayName = 'ActionsSkeleton';
