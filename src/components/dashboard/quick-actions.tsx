// src/components/dashboard/quick-actions.tsx
'use client';

import { memo, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
	Play,
	BookOpen,
	Target,
	Calendar,
	Settings,
	Download,
	Bookmark,
	TrendingUp,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QuickActionsProps {
	userId: string;
}

interface QuickAction {
	id: string;
	icon: React.ComponentType<{ className?: string }>;
	title: string;
	description: string;
	href?: string;
	onClick?: () => void;
	variant?: 'default' | 'secondary' | 'outline';
	disabled?: boolean;
}

const ActionButton = memo(
	({
		action,
		onNavigate,
	}: {
		action: QuickAction;
		onNavigate: (href: string) => void;
	}) => {
		const handleClick = useCallback(() => {
			if (action.onClick) {
				action.onClick();
			} else if (action.href) {
				onNavigate(action.href);
			}
		}, [action, onNavigate]);

		return (
			<Button
				variant={action.variant || 'outline'}
				className='h-auto min-h-[100px] flex-col gap-2 p-4'
				onClick={handleClick}
				disabled={action.disabled}
			>
				<action.icon className='h-6 w-6' />
				<div className='text-center'>
					<div className='text-sm font-medium'>{action.title}</div>
					<div className='text-muted-foreground mt-1 text-xs'>
						{action.description}
					</div>
				</div>
			</Button>
		);
	},
);

export const QuickActions = memo(({ userId }: QuickActionsProps) => {
	const t = useTranslations('dashboard');
	const router = useRouter();

	const handleNavigate = useCallback(
		(href: string) => {
			router.push(href);
		},
		[router],
	);

	const handleDownloadProgress = useCallback(() => {
		window.open(`/api/users/${userId}/export/progress`, '_blank');
	}, [userId]);

	const handleViewAnalytics = useCallback(() => {
		router.push('/analytics');
	}, [router]);

	const quickActions = useMemo(
		(): QuickAction[] => [
			{
				id: 'continue-learning',
				icon: Play,
				title: t('continueLearning'),
				description: t('resumeLastChapter'),
				href: '/continue',
				variant: 'default',
			},
			{
				id: 'browse-chapters',
				icon: BookOpen,
				title: t('browseChapters'),
				description: t('exploreAllContent'),
				href: '/chapters',
			},
			{
				id: 'practice-challenges',
				icon: Target,
				title: t('practiceChallenges'),
				description: t('testYourSkills'),
				href: '/challenges',
			},
			{
				id: 'view-bookmarks',
				icon: Bookmark,
				title: t('viewBookmarks'),
				description: t('savedContent'),
				href: '/bookmarks',
			},
			{
				id: 'schedule-learning',
				icon: Calendar,
				title: t('scheduleLearning'),
				description: t('setLearningGoals'),
				href: '/schedule',
			},
			{
				id: 'view-analytics',
				icon: TrendingUp,
				title: t('viewAnalytics'),
				description: t('detailedProgress'),
				onClick: handleViewAnalytics,
			},
			{
				id: 'download-progress',
				icon: Download,
				title: t('downloadProgress'),
				description: t('exportYourData'),
				onClick: handleDownloadProgress,
			},
			{
				id: 'settings',
				icon: Settings,
				title: t('settings'),
				description: t('customizeExperience'),
				href: '/settings',
			},
		],
		[t, handleViewAnalytics, handleDownloadProgress],
	);

	const actionButtons = useMemo(
		() =>
			quickActions.map((action) => (
				<ActionButton
					key={action.id}
					action={action}
					onNavigate={handleNavigate}
				/>
			)),
		[quickActions, handleNavigate],
	);

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t('quickActions')}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='grid grid-cols-2 gap-3 md:grid-cols-4'>
					{actionButtons}
				</div>
			</CardContent>
		</Card>
	);
});

QuickActions.displayName = 'QuickActions';
ActionButton.displayName = 'ActionButton';
