// src/components/dashboard/stats-cards.tsx
'use client';

import { memo, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { nanoid } from 'nanoid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface StatsData {
	completedChapters: number;
	totalChapters: number;
	weeklyProgress: number;
	currentStreak: number;
}

interface StatsCardsProps {
	userId: string;
}

const StatCard = memo(
	({
		title,
		value,
		trend,
		isLoading,
	}: {
		title: string;
		value: string | number;
		trend?: string;
		isLoading: boolean;
	}) => (
		<Card>
			<CardHeader className='pb-2'>
				<CardTitle className='text-muted-foreground text-sm font-medium'>
					{title}
				</CardTitle>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<>
						<Skeleton className='mb-2 h-8 w-16' />
						<Skeleton className='h-3 w-20' />
					</>
				) : (
					<>
						<div className='text-2xl font-bold'>{value}</div>
						{trend && <p className='text-muted-foreground text-xs'>{trend}</p>}
					</>
				)}
			</CardContent>
		</Card>
	),
);

const StatsCards = memo(({ userId }: StatsCardsProps) => {
	const { data: stats, isLoading } = useQuery({
		queryKey: ['dashboard-stats', userId],
		queryFn: async (): Promise<StatsData> => {
			const response = await fetch(`/api/dashboard/stats?userId=${userId}`);
			if (!response.ok) throw new Error('Failed to fetch stats');

			return response.json();
		},
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});

	const statsCards = useMemo(
		() => [
			{
				id: nanoid(),
				title: 'Completed Chapters',
				value: stats
					? `${stats.completedChapters}/${stats.totalChapters}`
					: '0/0',
				trend: stats
					? `${Math.round((stats.completedChapters / stats.totalChapters) * 100)}% complete`
					: undefined,
			},
			{
				id: nanoid(),
				title: 'Weekly Progress',
				value: stats?.weeklyProgress ?? 0,
				trend: '+12% from last week',
			},
			{
				id: nanoid(),
				title: 'Current Streak',
				value: stats?.currentStreak ?? 0,
				trend: 'days in a row',
			},
			{
				id: nanoid(),
				title: 'Achievements',
				value: 8,
				trend: '2 new this month',
			},
		],
		[stats],
	);

	return (
		<div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
			{statsCards.map((card) => (
				<StatCard
					key={card.id}
					title={card.title}
					value={card.value}
					trend={card.trend}
					isLoading={isLoading}
				/>
			))}
		</div>
	);
});

export default StatsCards;

StatCard.displayName = 'StatCard';
StatsCards.displayName = 'StatsCards';
