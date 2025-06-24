'use client';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, CheckCircle, Target, Trophy } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ActivitySkeleton } from '@/components/dashboard/common';
import { nanoid } from 'nanoid';

interface Activity {
	id: string;
	type:
		| 'module_completed'
		| 'topic_completed'
		| 'achievement_unlocked'
		| 'streak_milestone';
	title: string;
	description: string;
	timestamp: string;
	icon: React.ComponentType<{ className?: string }>;
}

const mockActivities: Activity[] = [
	{
		id: '1',
		type: 'module_completed',
		title: 'Go Fundamentals Completed',
		description: 'Completed all 12 topics in the module',
		timestamp: '2 hours ago',
		icon: CheckCircle,
	},
	{
		id: '2',
		type: 'achievement_unlocked',
		title: 'Week Warrior Achievement',
		description: '7-day learning streak achieved!',
		timestamp: '1 day ago',
		icon: Trophy,
	},
	{
		id: '3',
		type: 'topic_completed',
		title: 'Goroutines and Channels',
		description: 'Mastered concurrent programming concepts',
		timestamp: '2 days ago',
		icon: Target,
	},
];

export const RecentActivity = ({ userId }: { userId: string }) => {
	const t = useTranslations('progress');

	const { data: activities, isLoading } = useQuery({
		queryKey: ['recentActivity', userId],
		queryFn: async () => {
			await new Promise((resolve) => setTimeout(resolve, 800));

			return mockActivities;
		},
		staleTime: 2 * 60 * 1000, // 2 minutes
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center gap-2'>
					<BarChart3 className='h-5 w-5' />
					{t('recentActivity')}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='space-y-4'>
					{isLoading ? (
						Array.from({ length: 3 }).map(() => (
							<ActivitySkeleton key={nanoid()} />
						))
					) : activities?.length ? (
						activities.map((activity) => (
							<div key={activity.id} className='flex items-start space-x-4'>
								<div className='flex-shrink-0'>
									<div className='bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full'>
										<activity.icon className='text-primary h-4 w-4' />
									</div>
								</div>
								<div className='min-w-0 flex-1'>
									<p className='text-sm font-medium text-gray-900 dark:text-gray-100'>
										{activity.title}
									</p>
									<p className='text-muted-foreground text-sm'>
										{activity.description}
									</p>
									<p className='text-muted-foreground mt-1 text-xs'>
										{activity.timestamp}
									</p>
								</div>
							</div>
						))
					) : (
						<p className='text-muted-foreground py-8 text-center text-sm'>
							{t('noActivity')}
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
};
