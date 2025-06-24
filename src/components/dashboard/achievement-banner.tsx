// @/components/dashboard/AchievementsBanner.tsx
import { Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const AchievementsBanner = ({ userId }: { userId: string }) => {
	// Mock recent achievement
	const hasRecentAchievement = true;
	const recentAchievement = {
		title: 'Week Warrior',
		description: 'Completed learning activities for 7 consecutive days!',
		icon: Trophy,
		userId,
	};

	if (!hasRecentAchievement) return null;

	return (
		<Card className='border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 dark:border-yellow-800 dark:from-yellow-900/20 dark:to-orange-900/20'>
			<CardContent className='p-4'>
				<div className='flex items-center gap-4'>
					<div className='flex-shrink-0'>
						<div className='flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30'>
							<Trophy className='h-6 w-6 text-yellow-600 dark:text-yellow-400' />
						</div>
					</div>
					<div className='flex-1'>
						<h3 className='font-medium text-yellow-900 dark:text-yellow-100'>
							🎉 Achievement Unlocked: {recentAchievement.title}
						</h3>
						<p className='text-sm text-yellow-700 dark:text-yellow-200'>
							{recentAchievement.description}
						</p>
					</div>
					<Badge
						variant='secondary'
						className='bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
					>
						New!
					</Badge>
				</div>
			</CardContent>
		</Card>
	);
};
