'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { BookOpen, Clock, Trophy, Target, Calendar } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { OverviewSkeleton } from '@/components/dashboard/common';
import { nanoid } from 'nanoid';

interface DashboardOverviewProps {
	userId: string;
}

interface UserStats {
	totalModules: number;
	completedModules: number;
	totalTopics: number;
	completedTopics: number;
	totalHours: number;
	currentStreak: number;
	completionRate: number;
	weeklyGoal: number;
	weeklyProgress: number;
}

const mockStats: UserStats = {
	totalModules: 12,
	completedModules: 8,
	totalTopics: 156,
	completedTopics: 98,
	totalHours: 47,
	currentStreak: 7,
	completionRate: 85,
	weeklyGoal: 10,
	weeklyProgress: 6,
};

export const DashboardOverview = ({ userId }: DashboardOverviewProps) => {
	const t = useTranslations('progress');

	const { data: stats, isLoading } = useQuery({
		queryKey: ['userStats', userId],
		queryFn: async () => {
			await new Promise((resolve) => setTimeout(resolve, 1000));

			return mockStats;
		},
		staleTime: 5 * 60 * 1000,
	});

	if (isLoading) {
		return <OverviewSkeleton />;
	}

	const statsData = stats || mockStats;
	const moduleCompletionRate =
		(statsData.completedModules / statsData.totalModules) * 100;
	const topicCompletionRate =
		(statsData.completedTopics / statsData.totalTopics) * 100;
	const weeklyCompletionRate =
		(statsData.weeklyProgress / statsData.weeklyGoal) * 100;

	const cards = [
		{
			title: t('totalModules'),
			value: `${statsData.completedModules}/${statsData.totalModules}`,
			description: `${moduleCompletionRate.toFixed(0)}% completed`,
			icon: BookOpen,
			color: 'text-blue-600',
			progress: moduleCompletionRate,
		},
		{
			title: t('totalTopics'),
			value: `${statsData.completedTopics}/${statsData.totalTopics}`,
			description: `${topicCompletionRate.toFixed(0)}% completed`,
			icon: Target,
			color: 'text-green-600',
			progress: topicCompletionRate,
		},
		{
			title: t('weeklyGoal'),
			value: `${statsData.weeklyProgress}/${statsData.weeklyGoal}`,
			description: `${weeklyCompletionRate.toFixed(0)}% of weekly goal`,
			icon: Calendar,
			color: 'text-emerald-600',
			progress: weeklyCompletionRate,
			badge: weeklyCompletionRate >= 100 ? 'Goal Achieved!' : undefined,
		},
		{
			title: t('totalHours'),
			value: statsData.totalHours.toString(),
			description: 'Hours of learning',
			icon: Clock,
			color: 'text-orange-600',
		},
		{
			title: t('streak'),
			value: statsData.currentStreak.toString(),
			description: t('days'),
			icon: Trophy,
			color: 'text-purple-600',
			badge: statsData.currentStreak >= 7 ? 'Hot Streak!' : undefined,
		},
	];

	return (
		<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-5'>
			{cards.map((card) => (
				<Card key={nanoid()} className='transition-shadow hover:shadow-md'>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>{card.title}</CardTitle>
						<card.icon className={`h-4 w-4 ${card.color}`} />
					</CardHeader>
					<CardContent>
						<div className='mb-2 flex items-center justify-between'>
							<div className='text-2xl font-bold'>{card.value}</div>
							{card.badge && (
								<Badge variant='secondary' className='text-xs'>
									{card.badge}
								</Badge>
							)}
						</div>
						<p className='text-muted-foreground mb-2 text-xs'>
							{card.description}
						</p>
						{card.progress !== undefined && (
							<Progress value={card.progress} className='h-2' />
						)}
					</CardContent>
				</Card>
			))}
		</div>
	);
};
