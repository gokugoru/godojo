// src/app/[locale]/(protected)/(user)/dashboard/page.tsx
import { Suspense, lazy } from 'react';
import { requireAuthPage } from '@/lib/middleware/page-guards';
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton';

const StatsCards = lazy(() => import('@/components/dashboard/stats-cards'));
const ProgressChart = lazy(
	() => import('@/components/dashboard/progress-chart'),
);
const RecentActivity = lazy(
	() => import('@/components/dashboard/recent-activity'),
);
const QuickActions = lazy(() => import('@/components/dashboard/quick-actions'));

const DashboardPage = async () => {
	const { user } = await requireAuthPage();

	return (
		<div className='container mx-auto space-y-8 p-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-3xl font-bold'>Dashboard</h1>
					<p className='text-muted-foreground'>Welcome back, {user?.name}</p>
				</div>
			</div>

			<Suspense fallback={<DashboardSkeleton.StatsCards />}>
				<StatsCards userId={user!.id} />
			</Suspense>

			<div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
				<Suspense fallback={<DashboardSkeleton.Chart />}>
					<ProgressChart userId={user!.id} />
				</Suspense>

				<Suspense fallback={<DashboardSkeleton.Activity />}>
					<RecentActivity userId={user!.id} />
				</Suspense>
			</div>

			<Suspense fallback={<DashboardSkeleton.Actions />}>
				<QuickActions />
			</Suspense>
		</div>
	);
};

export default DashboardPage;
