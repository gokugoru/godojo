// @/app/[locale]/(protected)/dashboard/page.tsx - COMPLETE DASHBOARD
import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';

import { requireAuth, getCurrentUser } from '@/actions/auth';
import { DashboardOverview } from '@/components/dashboard/dashboard-overview';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { ProgressChart } from '@/components/dashboard/progress-chart';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { AchievementsBanner } from '@/components/dashboard/achievement-banner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { setRequestLocale } from 'next-intl/server';
import { nanoid } from 'nanoid';

interface DashboardPageProps {
	params: {
		locale: string;
	};
}

// Loading components for better UX
const DashboardSkeleton = () => (
	<div className='space-y-6'>
		<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
			{Array.from({ length: 4 }).map(() => (
				<Card key={nanoid()}>
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
							{Array.from({ length: 5 }).map(() => (
								<div key={nanoid()} className='flex items-center space-x-4'>
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
);

/**
 * Dashboard Page - Main entry point after authentication
 * Shows user progress, recent activity, and quick actions
 */
const DashboardPage = async ({ params }: DashboardPageProps) => {
	const { locale } = await params;
	setRequestLocale(locale);

	// Require authentication - redirects to login if not authenticated
	await requireAuth();

	// Get current user data
	const user = await getCurrentUser();

	if (!user) {
		notFound();
	}

	return (
		<div className='flex-1 space-y-6 p-8 pt-6'>
			{/* Welcome Header */}
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

			{/* Achievements Banner */}
			<Suspense
				fallback={<div className='bg-muted h-20 animate-pulse rounded-lg' />}
			>
				<AchievementsBanner userId={user.id} />
			</Suspense>

			{/* Dashboard Overview Stats */}
			<Suspense fallback={<DashboardSkeleton />}>
				<DashboardContent userId={user.id} />
			</Suspense>
		</div>
	);
};

/**
 * Dashboard Content Component
 * Separated for better loading states and code organization
 */
const DashboardContent = ({ userId }: { userId: string }) => {
	return (
		<>
			{/* Overview Cards */}
			<DashboardOverview userId={userId} />

			{/* Main Content Grid */}
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
				{/* Progress Chart */}
				<div className='col-span-4'>
					<ProgressChart userId={userId} />
				</div>

				{/* Recent Activity */}
				<div className='col-span-3'>
					<RecentActivity userId={userId} />
				</div>
			</div>

			{/* Quick Actions */}
			<QuickActions userId={userId} />
		</>
	);
};

// Generate metadata for SEO
export async function generateMetadata() {
	return {
		title: 'Dashboard - Go Dojo',
		description: 'Your personal learning dashboard for Go programming',
		robots: 'noindex, nofollow', // Private page
	};
}

export default DashboardPage;
