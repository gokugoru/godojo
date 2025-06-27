// src/app/[locale]/(protected)/(user)/dashboard/page.tsx
import { memo, Suspense } from 'react';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { requireAuth, getCurrentUser } from '@/actions/auth';
import { DashboardOverview } from '@/components/dashboard/dashboard-overview';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { ProgressChart } from '@/components/dashboard/progress-chart';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { AchievementsBanner } from '@/components/dashboard/achievement-banner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface DashboardPageProps {
	params: Promise<{ locale: string }>;
}

const DashboardSkeleton = memo(() => (
	<div className='space-y-6'>
		<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
			{Array.from({ length: 4 }, (_, i) => (
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
		<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
			<div className='col-span-4'>
				<Card>
					<CardHeader>
						<div className='bg-muted h-6 w-32 animate-pulse rounded' />
					</CardHeader>
					<CardContent>
						<div className='bg-muted h-64 animate-pulse rounded' />
					</CardContent>
				</Card>
			</div>
			<div className='col-span-3'>
				<Card>
					<CardHeader>
						<div className='bg-muted h-6 w-32 animate-pulse rounded' />
					</CardHeader>
					<CardContent>
						<div className='space-y-4'>
							{Array.from({ length: 5 }, (_, i) => (
								<div key={i} className='flex items-center space-x-4'>
									<div className='bg-muted h-8 w-8 animate-pulse rounded-full' />
									<div className='flex-1 space-y-2'>
										<div className='bg-muted h-4 w-full animate-pulse rounded' />
										<div className='bg-muted h-3 w-3/4 animate-pulse rounded' />
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	</div>
));

const AchievementSkeleton = memo(() => (
	<div className='bg-muted h-20 animate-pulse rounded-lg' />
));

const DashboardContent = memo(({ userId }: { userId: string }) => (
	<>
		<DashboardOverview userId={userId} />

		<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
			<div className='col-span-4'>
				<ProgressChart userId={userId} />
			</div>

			<div className='col-span-3'>
				<RecentActivity userId={userId} />
			</div>
		</div>

		<QuickActions userId={userId} />
	</>
));

const DashboardPage = async ({ params }: DashboardPageProps) => {
	const { locale } = await params;
	setRequestLocale(locale);

	await requireAuth();
	const user = await getCurrentUser();

	if (!user) {
		notFound();
	}

	return (
		<div className='flex-1 space-y-6 p-8 pt-6'>
			<div className='flex items-center justify-between space-y-2'>
				<div>
					<h2 className='text-3xl font-bold tracking-tight'>
						Welcome back, {user.name || user.username}!
					</h2>
					<p className='text-muted-foreground'>
						Here&#39;s what&#39;s happening with your Go learning journey today.
					</p>
				</div>
			</div>

			<Suspense fallback={<AchievementSkeleton />}>
				<AchievementsBanner userId={user.id} />
			</Suspense>

			<Suspense fallback={<DashboardSkeleton />}>
				<DashboardContent userId={user.id} />
			</Suspense>
		</div>
	);
};

export const generateMetadata = async () => ({
	title: 'Dashboard - Go Dojo',
	description: 'Your personal learning dashboard for Go programming',
	robots: 'noindex, nofollow',
});

DashboardSkeleton.displayName = 'DashboardSkeleton';
AchievementSkeleton.displayName = 'AchievementSkeleton';
DashboardContent.displayName = 'DashboardContent';

export default DashboardPage;
