// @/components/dashboard/QuickActions.tsx
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { nanoid } from 'nanoid';
import { BarChart3, BookOpen, Target } from 'lucide-react';

export const QuickActions = ({ userId }: { userId: string }) => {
	const t = useTranslations('common');
	console.log(t, userId);

	const actions = [
		{
			title: 'Continue Learning',
			description: 'Resume your current module',
			href: '/modules',
			icon: BookOpen,
			color: 'bg-blue-500 hover:bg-blue-600',
		},
		{
			title: 'View Progress',
			description: 'See detailed progress report',
			href: '/progress',
			icon: BarChart3,
			color: 'bg-green-500 hover:bg-green-600',
		},
		{
			title: 'Browse Modules',
			description: 'Explore all available modules',
			href: '/modules',
			icon: Target,
			color: 'bg-purple-500 hover:bg-purple-600',
		},
	];

	return (
		<Card>
			<CardHeader>
				<CardTitle>Quick Actions</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='grid gap-4 md:grid-cols-3'>
					{actions.map((action) => (
						<a
							key={nanoid()}
							href={action.href}
							className={`${action.color} group rounded-lg p-4 text-white transition-colors`}
						>
							<div className='flex items-center gap-3'>
								<action.icon className='h-6 w-6' />
								<div>
									<h3 className='font-medium'>{action.title}</h3>
									<p className='text-sm opacity-90'>{action.description}</p>
								</div>
							</div>
						</a>
					))}
				</div>
			</CardContent>
		</Card>
	);
};
