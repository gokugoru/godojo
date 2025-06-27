// src/components/dashboard/progress-chart.tsx
'use client';

import { memo, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from 'recharts';
import { nanoid } from 'nanoid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ProgressData {
	date: string;
	completed: number;
	timeSpent: number;
}

interface ProgressChartProps {
	userId: string;
}

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

const ProgressChart = memo(({ userId }: ProgressChartProps) => {
	const { data: progressData, isLoading } = useQuery({
		queryKey: ['progress-chart', userId],
		queryFn: async (): Promise<ProgressData[]> => {
			const response = await fetch(`/api/dashboard/progress?userId=${userId}`);
			if (!response.ok) throw new Error('Failed to fetch progress');

			return response.json();
		},
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});

	const chartData = useMemo(() => {
		if (!progressData) return [];

		return progressData.map((item) => ({
			...item,
			id: nanoid(),
			date: new Date(item.date).toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
			}),
		}));
	}, [progressData]);

	if (isLoading) return <ChartSkeleton />;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Learning Progress</CardTitle>
				<p className='text-muted-foreground text-sm'>
					Your progress over the last 7 days
				</p>
			</CardHeader>
			<CardContent>
				<ResponsiveContainer width='100%' height={300}>
					<LineChart data={chartData}>
						<CartesianGrid strokeDasharray='3 3' />
						<XAxis
							dataKey='date'
							fontSize={12}
							tickLine={false}
							axisLine={false}
						/>
						<YAxis fontSize={12} tickLine={false} axisLine={false} />
						<Tooltip
							contentStyle={{
								backgroundColor: 'hsl(var(--background))',
								border: '1px solid hsl(var(--border))',
								borderRadius: '8px',
							}}
						/>
						<Line
							type='monotone'
							dataKey='completed'
							stroke='hsl(var(--primary))'
							strokeWidth={2}
							dot={{ fill: 'hsl(var(--primary))' }}
						/>
					</LineChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);
});

export default ProgressChart;

ChartSkeleton.displayName = 'ChartSkeleton';
ProgressChart.displayName = 'ProgressChart';
