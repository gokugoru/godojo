// src/components/dashboard/achievement-banner.tsx
'use client';

import { memo, useMemo, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Trophy, X, Star, Target, Clock, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AchievementsBannerProps {
	userId: string;
}

type AchievementType =
	| 'CHAPTER_COMPLETED'
	| 'TOPIC_COMPLETED'
	| 'WEEK_STREAK'
	| 'MONTH_STREAK'
	| 'FIRST_LESSON'
	| 'FAANG_READY'
	| 'SPEED_LEARNER';

interface Achievement {
	id: string;
	type: AchievementType;
	title: string;
	description: string;
	unlockedAt: string;
	metadata?: Record<string, any>;
	isNew?: boolean;
}

const fetchRecentAchievements = async (
	userId: string,
): Promise<Achievement[]> => {
	const response = await fetch(`/api/users/${userId}/achievements/recent`);
	if (!response.ok) throw new Error('Failed to fetch achievements');

	return response.json();
};

const AchievementIcon = memo(({ type }: { type: AchievementType }) => {
	const iconMap = {
		CHAPTER_COMPLETED: BookOpen,
		TOPIC_COMPLETED: Target,
		WEEK_STREAK: Clock,
		MONTH_STREAK: Star,
		FIRST_LESSON: Star,
		FAANG_READY: Trophy,
		SPEED_LEARNER: Target,
	};

	const colorMap = {
		CHAPTER_COMPLETED: 'text-blue-500',
		TOPIC_COMPLETED: 'text-green-500',
		WEEK_STREAK: 'text-orange-500',
		MONTH_STREAK: 'text-purple-500',
		FIRST_LESSON: 'text-yellow-500',
		FAANG_READY: 'text-gold-500',
		SPEED_LEARNER: 'text-red-500',
	};

	const Icon = iconMap[type] || Trophy;
	const color = colorMap[type] || 'text-yellow-500';

	return <Icon className={`h-5 w-5 ${color}`} />;
});

const AchievementCard = memo(
	({
		achievement,
		onDismiss,
	}: {
		achievement: Achievement;
		onDismiss: (id: string) => void;
	}) => {
		const handleDismiss = useCallback(() => {
			onDismiss(achievement.id);
		}, [achievement.id, onDismiss]);

		const formatTime = useMemo(() => {
			const date = new Date(achievement.unlockedAt);

			return date.toLocaleDateString();
		}, [achievement.unlockedAt]);

		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -20 }}
				className='flex items-center gap-3 rounded-lg border border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 p-3 dark:border-yellow-800 dark:from-yellow-950/20 dark:to-orange-950/20'
			>
				<div className='flex-shrink-0 rounded-full bg-yellow-100 p-2 dark:bg-yellow-900/30'>
					<AchievementIcon type={achievement.type} />
				</div>

				<div className='min-w-0 flex-1'>
					<div className='flex items-center gap-2'>
						<h4 className='text-sm font-semibold'>{achievement.title}</h4>
						{achievement.isNew && (
							<Badge variant='secondary' className='text-xs'>
								New!
							</Badge>
						)}
					</div>
					<p className='text-muted-foreground mt-1 text-sm'>
						{achievement.description}
					</p>
					<p className='text-muted-foreground mt-1 text-xs'>
						Unlocked on {formatTime}
					</p>
				</div>

				<Button
					variant='ghost'
					size='sm'
					onClick={handleDismiss}
					className='h-8 w-8 p-0 hover:bg-yellow-200 dark:hover:bg-yellow-900/30'
				>
					<X className='h-4 w-4' />
				</Button>
			</motion.div>
		);
	},
);

const AchievementSkeleton = memo(() => (
	<div className='bg-muted/50 flex animate-pulse items-center gap-3 rounded-lg p-3'>
		<div className='bg-muted h-9 w-9 rounded-full' />
		<div className='flex-1 space-y-2'>
			<div className='bg-muted h-4 w-3/4 rounded' />
			<div className='bg-muted h-3 w-full rounded' />
			<div className='bg-muted h-3 w-1/2 rounded' />
		</div>
		<div className='bg-muted h-8 w-8 rounded' />
	</div>
));

export const AchievementsBanner = memo(
	({ userId }: AchievementsBannerProps) => {
		const t = useTranslations('achievements');
		const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

		const { data: achievements, isLoading } = useQuery({
			queryKey: ['recentAchievements', userId],
			queryFn: () => fetchRecentAchievements(userId),
			staleTime: 2 * 60 * 1000,
			gcTime: 5 * 60 * 1000,
			retry: 1,
		});

		const handleDismiss = useCallback((achievementId: string) => {
			setDismissedIds((prev) => new Set([...prev, achievementId]));
		}, []);

		const visibleAchievements = useMemo(() => {
			if (!achievements) return [];

			return achievements.filter(
				(achievement) => !dismissedIds.has(achievement.id),
			);
		}, [achievements, dismissedIds]);

		const achievementCards = useMemo(
			() =>
				visibleAchievements.map((achievement) => (
					<AchievementCard
						key={achievement.id}
						achievement={achievement}
						onDismiss={handleDismiss}
					/>
				)),
			[visibleAchievements, handleDismiss],
		);

		if (isLoading) {
			return <AchievementSkeleton />;
		}

		if (
			!achievements ||
			achievements.length === 0 ||
			visibleAchievements.length === 0
		) {
			return null;
		}

		return (
			<Card className='border-yellow-200 dark:border-yellow-800'>
				<CardContent className='p-4'>
					<div className='mb-3 flex items-center gap-2'>
						<Trophy className='h-5 w-5 text-yellow-600' />
						<h3 className='text-lg font-semibold'>{t('recentAchievements')}</h3>
						<Badge variant='secondary' className='text-xs'>
							{visibleAchievements.length}
						</Badge>
					</div>

					<div className='space-y-3'>
						<AnimatePresence mode='popLayout'>
							{achievementCards}
						</AnimatePresence>
					</div>

					{visibleAchievements.length > 0 && (
						<div className='mt-3 border-t border-yellow-200 pt-3 dark:border-yellow-800'>
							<p className='text-muted-foreground text-center text-xs'>
								{t('congratulationsOnProgress')}
							</p>
						</div>
					)}
				</CardContent>
			</Card>
		);
	},
);

AchievementsBanner.displayName = 'AchievementsBanner';
AchievementIcon.displayName = 'AchievementIcon';
AchievementCard.displayName = 'AchievementCard';
AchievementSkeleton.displayName = 'AchievementSkeleton';
