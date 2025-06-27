// src/components/dashboard/progress-chart.tsx
'use client';

import { memo, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import {
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Area,
	AreaChart,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { nanoid } from 'nanoid';

interface ProgressChartProps {
	userId: string;
}

interface ProgressDataPoint {
	date: string;
	chaptersCompleted: number;
	topicsCompleted: number;
	hoursSpent: number;
	cumulativeChapters: number;
	cumulativeTopics: number;
}

const fetchProgressData = async (
	userId: string,
	days = 30,
): Promise<ProgressDataPoint[]> => {
	const response = await fetch(`/api/users/${userId}/progress?days=${days}`);
	if (!response.ok) throw new Error('Failed to fetch progress data');

	return response.json();
};

const CustomTooltip = memo(({ active, payload, label }: any) => {
	if (!active || !payload || !payload.length) return null;

	return (
		<div className='bg-background border-border rounded-lg border p-3 shadow-lg'>
			<p className='mb-2 text-sm font-medium'>{label}</p>
			{payload.map((entry: any) => (
				<div key={nanoid()} className='flex items-center gap-2 text-xs'>
					<div
						className='h-3 w-3 rounded-full'
						style={{ backgroundColor: entry.color }}
					/>
					<span className='text-muted-foreground'>{entry.name}:</span>
					<span className='font-medium'>{entry.value}</span>
				</div>
			))}
		</div>
	);
});

const ProgressSkeleton = memo(() => (
	<Card>
		<CardHeader>
			<div className='bg-muted h-6 w-32 animate-pulse rounded' />
		</CardHeader>
		<CardContent>
			<div className='bg-muted h-64 animate-pulse rounded' />
		</CardContent>
	</Card>
));

export const ProgressChart = memo(({ userId }: ProgressChartProps) => {
	const t = useTranslations('dashboard');

	const { data: progressData, isLoading } = useQuery({
		queryKey: ['progressChart', userId],
		queryFn: () => fetchProgressData(userId),
		staleTime: 10 * 60 * 1000,
		gcTime: 30 * 60 * 1000,
		retry: 2,
	});

	const chartData = useMemo(() => {
		if (!progressData) return [];

		return progressData.map((point) => ({
			...point,
			date: new Date(point.date).toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
			}),
		}));
	}, [progressData]);

	const totalProgress = useMemo(() => {
		if (!progressData || progressData.length === 0)
			return { chapters: 0, topics: 0 };

		const latest = progressData[progressData.length - 1];

		return {
			chapters: latest.cumulativeChapters,
			topics: latest.cumulativeTopics,
		};
	}, [progressData]);

	const progressTrend = useMemo(() => {
		if (!progressData || progressData.length < 2) return 0;

		const recent = progressData.slice(-7);
		const weeklyChapters = recent.reduce(
			(sum, point) => sum + point.chaptersCompleted,
			0,
		);
		const previousWeek = progressData.slice(-14, -7);
		const previousWeeklyChapters = previousWeek.reduce(
			(sum, point) => sum + point.chaptersCompleted,
			0,
		);

		if (previousWeeklyChapters === 0) return weeklyChapters > 0 ? 100 : 0;

		return (
			((weeklyChapters - previousWeeklyChapters) / previousWeeklyChapters) * 100
		);
	}, [progressData]);

	if (isLoading) {
		return <ProgressSkeleton />;
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<TrendingUp className='h-4 w-4' />
						{t('progressOverview')}
					</div>
					<div className='text-muted-foreground text-sm'>
						{progressTrend > 0 ? '+' : ''}
						{Math.round(progressTrend)}% {t('thisWeek')}
					</div>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='mb-4 grid grid-cols-2 gap-4 text-sm'>
					<div>
						<p className='text-muted-foreground'>{t('totalChapters')}</p>
						<p className='text-primary text-2xl font-bold'>
							{totalProgress.chapters}
						</p>
					</div>
					<div>
						<p className='text-muted-foreground'>{t('totalTopics')}</p>
						<p className='text-2xl font-bold text-emerald-600'>
							{totalProgress.topics}
						</p>
					</div>
				</div>

				<div className='h-64'>
					<ResponsiveContainer width='100%' height='100%'>
						<AreaChart data={chartData}>
							<defs>
								<linearGradient
									id='chaptersGradient'
									x1='0'
									y1='0'
									x2='0'
									y2='1'
								>
									<stop
										offset='5%'
										stopColor='hsl(var(--primary))'
										stopOpacity={0.3}
									/>
									<stop
										offset='95%'
										stopColor='hsl(var(--primary))'
										stopOpacity={0}
									/>
								</linearGradient>
								<linearGradient id='topicsGradient' x1='0' y1='0' x2='0' y2='1'>
									<stop offset='5%' stopColor='#10b981' stopOpacity={0.3} />
									<stop offset='95%' stopColor='#10b981' stopOpacity={0} />
								</linearGradient>
							</defs>
							<CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
							<XAxis
								dataKey='date'
								className='fill-muted-foreground text-xs'
								tick={{ fontSize: 12 }}
							/>
							<YAxis
								className='fill-muted-foreground text-xs'
								tick={{ fontSize: 12 }}
							/>
							<Tooltip content={<CustomTooltip />} />
							<Area
								type='monotone'
								dataKey='cumulativeChapters'
								stroke='hsl(var(--primary))'
								strokeWidth={2}
								fill='url(#chaptersGradient)'
								name={t('chapters')}
							/>
							<Area
								type='monotone'
								dataKey='cumulativeTopics'
								stroke='#10b981'
								strokeWidth={2}
								fill='url(#topicsGradient)'
								name={t('topics')}
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>
			</CardContent>
		</Card>
	);
});

ProgressChart.displayName = 'ProgressChart';
CustomTooltip.displayName = 'CustomTooltip';
ProgressSkeleton.displayName = 'ProgressSkeleton';
