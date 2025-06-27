// src/components/dashboard/dashboard-overview.tsx
'use client';

import { memo, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { BookOpen, Clock, Trophy, Target, Calendar } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { nanoid } from 'nanoid';

interface DashboardOverviewProps {
	userId: string;
}

interface UserStats {
	totalChapters: number;
	completedChapters: number;
	totalTopics: number;
	completedTopics: number;
	totalHours: number;
	currentStreak: number;
	completionRate: number;
	weeklyGoal: number;
	weeklyProgress: number;
}

const fetchUserStats = async (userId: string): Promise<UserStats> => {
	const response = await fetch(`/api/users/${userId}/stats`);
	if (!response.ok) throw new Error('Failed to fetch user stats');

	return response.json();
};

const StatCard = memo(
	({
		title,
		value,
		description,
		icon: Icon,
		color,
		progress,
		badge,
	}: {
		title: string;
		value: string;
		description: string;
		icon: React.ComponentType<{ className?: string }>;
		color: string;
		progress?: number;
		badge?: string;
	}) => (
		<Card className='transition-shadow hover:shadow-md'>
			<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
				<CardTitle className='text-sm font-medium'>{title}</CardTitle>
				<Icon className={`h-4 w-4 ${color}`} />
			</CardHeader>
			<CardContent>
				<div className='mb-2 flex items-center justify-between'>
					<div className='text-2xl font-bold'>{value}</div>
					{badge && (
						<Badge variant='secondary' className='text-xs'>
							{badge}
						</Badge>
					)}
				</div>
				<p className='text-muted-foreground mb-2 text-xs'>{description}</p>
				<Progress value={progress} className='h-2' />
			</CardContent>
		</Card>
	),
);

const OverviewSkeleton = memo(() => (
	<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-5'>
		{Array.from({ length: 5 }, (_, i) => (
			<Card key={i}>
				<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
					<div className='bg-muted h-4 w-24 animate-pulse rounded' />
					<div className='bg-muted h-4 w-4 animate-pulse rounded' />
				</CardHeader>
				<CardContent>
					<div className='bg-muted mb-2 h-8 w-16 animate-pulse rounded' />
					<div className='bg-muted h-3 w-32 animate-pulse rounded' />
				</CardContent>
			</Card>
		))}
	</div>
));

export const DashboardOverview = memo(({ userId }: DashboardOverviewProps) => {
	const t = useTranslations('progress');

	const { data: stats, isLoading } = useQuery({
		queryKey: ['userStats', userId],
		queryFn: () => fetchUserStats(userId),
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		retry: 2,
	});

	const statsCards = useMemo(() => {
		if (!stats) return [];

		const chapterCompletionRate =
			(stats.completedChapters / stats.totalChapters) * 100;
		const topicCompletionRate =
			(stats.completedTopics / stats.totalTopics) * 100;
		const weeklyCompletionRate =
			(stats.weeklyProgress / stats.weeklyGoal) * 100;

		return [
			{
				title: t('totalChapters'),
				value: `${stats.completedChapters}/${stats.totalChapters}`,
				description: `${Math.round(chapterCompletionRate)}% completed`,
				icon: BookOpen,
				color: 'text-blue-600',
				progress: chapterCompletionRate,
			},
			{
				title: t('totalTopics'),
				value: `${stats.completedTopics}/${stats.totalTopics}`,
				description: `${Math.round(topicCompletionRate)}% completed`,
				icon: Target,
				color: 'text-green-600',
				progress: topicCompletionRate,
			},
			{
				title: t('weeklyGoal'),
				value: `${stats.weeklyProgress}/${stats.weeklyGoal}`,
				description: `${Math.round(weeklyCompletionRate)}% of weekly goal`,
				icon: Calendar,
				color: 'text-emerald-600',
				progress: weeklyCompletionRate,
				badge: weeklyCompletionRate >= 100 ? t('goalAchieved') : undefined,
			},
			{
				title: t('totalHours'),
				value: stats.totalHours.toString(),
				description: t('hoursOfLearning'),
				icon: Clock,
				color: 'text-orange-600',
			},
			{
				title: t('streak'),
				value: stats.currentStreak.toString(),
				description: t('days'),
				icon: Trophy,
				color: 'text-purple-600',
				badge: stats.currentStreak >= 7 ? t('hotStreak') : undefined,
			},
		];
	}, [stats, t]);

	const renderCards = useMemo(
		() => statsCards.map((card) => <StatCard key={nanoid()} {...card} />),
		[statsCards],
	);

	if (isLoading) {
		return <OverviewSkeleton />;
	}

	return (
		<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-5'>
			{renderCards}
		</div>
	);
});

DashboardOverview.displayName = 'DashboardOverview';
StatCard.displayName = 'StatCard';
OverviewSkeleton.displayName = 'OverviewSkeleton';
