// src/components/dashboard/quick-actions.tsx
'use client';

import { memo, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QuickAction {
	id: string;
	title: string;
	description: string;
	icon: string;
	href: string;
	variant: 'default' | 'secondary' | 'outline';
}

const ActionCard = memo(
	({
		action,
		onClick,
	}: {
		action: QuickAction;
		onClick: (href: string) => void;
	}) => {
		const handleClick = useCallback(() => {
			onClick(action.href);
		}, [action.href, onClick]);

		return (
			<Card className='cursor-pointer transition-all hover:scale-105 hover:shadow-md'>
				<CardContent className='p-6'>
					<Button
						variant={action.variant}
						className='h-auto w-full flex-col space-y-2 p-4'
						onClick={handleClick}
					>
						<span className='text-2xl'>{action.icon}</span>
						<div className='text-center'>
							<p className='font-semibold'>{action.title}</p>
							<p className='text-muted-foreground text-sm font-normal'>
								{action.description}
							</p>
						</div>
					</Button>
				</CardContent>
			</Card>
		);
	},
);

const QuickActions = memo(() => {
	const router = useRouter();

	const actions = useMemo(
		(): QuickAction[] => [
			{
				id: nanoid(),
				title: 'Continue Learning',
				description: 'Resume your current chapter',
				icon: '📚',
				href: '/dashboard/continue',
				variant: 'default',
			},
			{
				id: nanoid(),
				title: 'Browse Chapters',
				description: 'Explore all available content',
				icon: '🔍',
				href: '/chapters',
				variant: 'secondary',
			},
			{
				id: nanoid(),
				title: 'Practice Mode',
				description: 'Test your knowledge',
				icon: '🎯',
				href: '/practice',
				variant: 'outline',
			},
			{
				id: nanoid(),
				title: 'Bookmarks',
				description: 'Review saved content',
				icon: '🔖',
				href: '/bookmarks',
				variant: 'outline',
			},
			{
				id: nanoid(),
				title: 'Progress Report',
				description: 'View detailed analytics',
				icon: '📊',
				href: '/progress',
				variant: 'outline',
			},
			{
				id: nanoid(),
				title: 'Settings',
				description: 'Customize your experience',
				icon: '⚙️',
				href: '/settings',
				variant: 'outline',
			},
		],
		[],
	);

	const handleActionClick = useCallback(
		(href: string) => {
			router.push(href);
		},
		[router],
	);

	return (
		<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
			{actions.map((action) => (
				<ActionCard
					key={action.id}
					action={action}
					onClick={handleActionClick}
				/>
			))}
		</div>
	);
});

export default QuickActions;

ActionCard.displayName = 'ActionCard';
QuickActions.displayName = 'QuickActions';
