// src/components/dashboard/recent-activity.tsx
'use client';

import { memo, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { nanoid } from 'nanoid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ActivityItem {
	id: string;
	type: 'chapter_completed' | 'topic_started' | 'achievement_unlocked';
	title: string;
	description: string;
	timestamp: string;
	icon: string;
}

interface RecentActivityProps {
	userId: string;
}

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

const ActivityItem = memo(({ activity }: { activity: ActivityItem }) => {
	const iconMap = useMemo(
		() => ({
			chapter_completed: '✅',
			topic_started: '📖',
			achievement_unlocked: '🏆',
		}),
		[],
	);

	return (
		<div className='flex items-center space-x-4'>
			<Avatar className='h-10 w-10'>
				<AvatarFallback>{iconMap[activity.type]}</AvatarFallback>
			</Avatar>
			<div className='flex-1 space-y-1'>
				<p className='text-sm leading-none font-medium'>{activity.title}</p>
				<p className='text-muted-foreground text-sm'>{activity.description}</p>
				<p className='text-muted-foreground text-xs'>
					{new Date(activity.timestamp).toLocaleString()}
				</p>
			</div>
		</div>
	);
});

const RecentActivity = memo(({ userId }: RecentActivityProps) => {
	const { data: activities, isLoading } = useQuery({
		queryKey: ['recent-activity', userId],
		queryFn: async (): Promise<ActivityItem[]> => {
			const response = await fetch(`/api/dashboard/activity?userId=${userId}`);
			if (!response.ok) throw new Error('Failed to fetch activity');

			return response.json();
		},
		staleTime: 2 * 60 * 1000,
		gcTime: 5 * 60 * 1000,
	});

	const recentActivities = useMemo(() => {
		if (!activities) return [];

		return activities.slice(0, 5);
	}, [activities]);

	if (isLoading) return <ActivitySkeleton />;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Recent Activity</CardTitle>
			</CardHeader>
			<CardContent className='space-y-6'>
				{recentActivities.length > 0 ? (
					recentActivities.map((activity) => (
						<ActivityItem key={activity.id} activity={activity} />
					))
				) : (
					<p className='text-muted-foreground py-4 text-center text-sm'>
						No recent activity
					</p>
				)}
			</CardContent>
		</Card>
	);
});

export default RecentActivity;

ActivitySkeleton.displayName = 'ActivitySkeleton';
ActivityItem.displayName = 'ActivityItem';
RecentActivity.displayName = 'RecentActivity';
