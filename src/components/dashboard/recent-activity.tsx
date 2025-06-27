// src/components/dashboard/recent-activity.tsx
'use client';

import { memo, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';
import {
	CheckCircle2,
	Clock,
	BookOpen,
	Trophy,
	Target,
	Play,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RecentActivityProps {
	userId: string;
}

type ActivityType =
	| 'CHAPTER_COMPLETED'
	| 'TOPIC_COMPLETED'
	| 'ACHIEVEMENT_UNLOCKED'
	| 'STREAK_MILESTONE'
	| 'GOAL_ACHIEVED';

interface Activity {
	id: string;
	type: ActivityType;
	title: string;
	description: string;
	timestamp: string;
	metadata?: Record<string, any>;
}

const fetchRecentActivity = async (userId: string): Promise<Activity[]> => {
	const response = await fetch(`/api/users/${userId}/activity?limit=10`);
	if (!response.ok) throw new Error('Failed to fetch recent activity');

	return response.json();
};

const ActivityIcon = memo(({ type }: { type: ActivityType }) => {
	const iconMap = {
		CHAPTER_COMPLETED: CheckCircle2,
		TOPIC_COMPLETED: Target,
		ACHIEVEMENT_UNLOCKED: Trophy,
		STREAK_MILESTONE: Clock,
		GOAL_ACHIEVED: Play,
	};

	const colorMap = {
		CHAPTER_COMPLETED: 'text-green-600',
		TOPIC_COMPLETED: 'text-blue-600',
		ACHIEVEMENT_UNLOCKED: 'text-yellow-600',
		STREAK_MILESTONE: 'text-purple-600',
		GOAL_ACHIEVED: 'text-emerald-600',
	};

	const Icon = iconMap[type];
	const color = colorMap[type];

	return <Icon className={`h-4 w-4 ${color}`} />;
});

const ActivityItem = memo(({ activity }: { activity: Activity }) => {
	const formattedTime = useMemo(
		() =>
			formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true }),
		[activity.timestamp],
	);

	const getBadgeVariant = useMemo(() => {
		switch (activity.type) {
			case 'ACHIEVEMENT_UNLOCKED':
				return 'default';
			case 'CHAPTER_COMPLETED':
				return 'secondary';
			case 'STREAK_MILESTONE':
				return 'outline';
			default:
				return 'secondary';
		}
	}, [activity.type]);

	return (
		<div className='hover:bg-muted/50 flex items-start space-x-3 rounded-lg p-2 transition-colors'>
			<div className='mt-1 flex-shrink-0'>
				<ActivityIcon type={activity.type} />
			</div>
			<div className='min-w-0 flex-1'>
				<div className='flex items-center justify-between'>
					<p className='truncate text-sm font-medium'>{activity.title}</p>
					<Badge variant={getBadgeVariant} className='ml-2 text-xs'>
						{activity.type.replace('_', ' ').toLowerCase()}
					</Badge>
				</div>
				<p className='text-muted-foreground mt-1 line-clamp-2 text-xs'>
					{activity.description}
				</p>
				<p className='text-muted-foreground mt-1 text-xs'>{formattedTime}</p>
			</div>
		</div>
	);
});

const ActivitySkeleton = memo(() => (
	<div className='space-y-4'>
		{Array.from({ length: 5 }, (_, i) => (
			<div key={i} className='flex items-start space-x-3 p-2'>
				<div className='bg-muted mt-1 h-4 w-4 animate-pulse rounded-full' />
				<div className='flex-1 space-y-2'>
					<div className='flex items-center justify-between'>
						<div className='bg-muted h-4 w-3/4 animate-pulse rounded' />
						<div className='bg-muted h-4 w-16 animate-pulse rounded' />
					</div>
					<div className='bg-muted h-3 w-full animate-pulse rounded' />
					<div className='bg-muted h-3 w-1/2 animate-pulse rounded' />
				</div>
			</div>
		))}
	</div>
));

const EmptyState = memo(() => {
	const t = useTranslations('dashboard');

	return (
		<div className='py-8 text-center'>
			<BookOpen className='text-muted-foreground mx-auto mb-4 h-12 w-12' />
			<p className='text-muted-foreground text-sm'>{t('noRecentActivity')}</p>
			<p className='text-muted-foreground mt-1 text-xs'>
				{t('startLearningToSeeActivity')}
			</p>
		</div>
	);
});

export const RecentActivity = memo(({ userId }: RecentActivityProps) => {
	const t = useTranslations('dashboard');

	const { data: activities, isLoading } = useQuery({
		queryKey: ['recentActivity', userId],
		queryFn: () => fetchRecentActivity(userId),
		staleTime: 2 * 60 * 1000,
		gcTime: 5 * 60 * 1000,
		retry: 2,
	});

	const activityList = useMemo(() => {
		if (!activities) return null;

		if (activities.length === 0) {
			return <EmptyState />;
		}

		return activities.map((activity) => (
			<ActivityItem key={activity.id} activity={activity} />
		));
	}, [activities]);

	return (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center gap-2'>
					<Clock className='h-4 w-4' />
					{t('recentActivity')}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='max-h-96 space-y-2 overflow-y-auto'>
					{isLoading ? <ActivitySkeleton /> : activityList}
				</div>
			</CardContent>
		</Card>
	);
});

RecentActivity.displayName = 'RecentActivity';
ActivityIcon.displayName = 'ActivityIcon';
ActivityItem.displayName = 'ActivityItem';
ActivitySkeleton.displayName = 'ActivitySkeleton';
EmptyState.displayName = 'EmptyState';
