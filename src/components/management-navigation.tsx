'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
	Settings,
	Users,
	BarChart3,
	Shield,
	BookOpen,
	MessageSquare,
	Flag,
	ChevronRight,
	Menu,
	X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { USER_ROLES } from '@/lib/constants/config';
import { cn } from '@/lib/utils';

interface ManagementNavigationProps {
	userRole: string;
	locale: string;
}

interface NavItem {
	label: string;
	href: string;
	icon: React.ComponentType<{ className?: string }>;
	badge?: string;
	adminOnly?: boolean;
	moderatorOnly?: boolean;
}

export const ManagementNavigation = ({
	userRole,
	locale,
}: ManagementNavigationProps) => {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const pathname = usePathname();
	const t = useTranslations('management');

	const isAdmin = userRole === USER_ROLES.ADMIN;
	const isModerator = userRole === USER_ROLES.MODERATOR;

	// Навигационные элементы
	const navItems: NavItem[] = [
		// Общие для Admin и Moderator
		{
			label: t('nav.dashboard'),
			href: `/${locale}/dashboard`,
			icon: BarChart3,
		},
		{
			label: t('nav.content'),
			href: `/${locale}/content`,
			icon: BookOpen,
		},
		{
			label: t('nav.comments'),
			href: `/${locale}/comments`,
			icon: MessageSquare,
			badge: '12', // TODO: реальный счетчик из API
		},
		{
			label: t('nav.reports'),
			href: `/${locale}/reports`,
			icon: Flag,
			badge: '3',
		},

		// Только для Admin
		{
			label: t('nav.users'),
			href: `/${locale}/admin/users`,
			icon: Users,
			adminOnly: true,
		},
		{
			label: t('nav.analytics'),
			href: `/${locale}/admin/analytics`,
			icon: BarChart3,
			adminOnly: true,
		},
		{
			label: t('nav.admin_settings'),
			href: `/${locale}/admin/settings`,
			icon: Settings,
			adminOnly: true,
		},

		// Только для Moderator
		{
			label: t('nav.moderation'),
			href: `/${locale}/moderator/queue`,
			icon: Shield,
			moderatorOnly: true,
			badge: '8',
		},
	];

	// Фильтруем элементы навигации по ролям
	const filteredNavItems = navItems.filter((item) => {
		if (item.adminOnly && !isAdmin) return false;

		return !(item.moderatorOnly && !isModerator);
	});

	const isActive = (href: string) => {
		return pathname.startsWith(href);
	};

	return (
		<>
			{/* Desktop Navigation */}
			<nav className='hidden border-b bg-white shadow-sm lg:block dark:border-gray-700 dark:bg-gray-800'>
				<div className='container mx-auto px-4 lg:px-8'>
					<div className='flex h-16 items-center justify-between'>
						{/* Left: Navigation Items */}
						<div className='flex items-center space-x-1'>
							{/* Management Badge */}
							<div className='mr-6 flex items-center space-x-2'>
								<Shield className='h-5 w-5 text-blue-600' />
								<span className='text-sm font-medium text-gray-900 dark:text-gray-100'>
									{t('nav.management')}
								</span>
								<Badge variant={isAdmin ? 'destructive' : 'secondary'}>
									{isAdmin ? t('roles.admin') : t('roles.moderator')}
								</Badge>
							</div>

							{/* Navigation Links */}
							{filteredNavItems.map((item) => (
								<Link
									key={item.href}
									href={item.href}
									className={cn(
										'flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
										isActive(item.href)
											? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100'
											: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100',
									)}
								>
									<item.icon className='h-4 w-4' />
									<span>{item.label}</span>
									{item.badge && (
										<Badge variant='secondary' className='ml-1 text-xs'>
											{item.badge}
										</Badge>
									)}
								</Link>
							))}
						</div>

						{/* Right: Back to Main Site */}
						<div className='flex items-center space-x-4'>
							<Link
								href={`/${locale}`}
								className='flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'
							>
								<span>{t('nav.back_to_site')}</span>
								<ChevronRight className='h-4 w-4' />
							</Link>
						</div>
					</div>
				</div>
			</nav>

			{/* Mobile Navigation */}
			<nav className='border-b bg-white shadow-sm lg:hidden dark:border-gray-700 dark:bg-gray-800'>
				<div className='flex h-16 items-center justify-between px-4'>
					{/* Left: Management Badge */}
					<div className='flex items-center space-x-2'>
						<Shield className='h-5 w-5 text-blue-600' />
						<span className='text-sm font-medium text-gray-900 dark:text-gray-100'>
							{t('nav.management')}
						</span>
						<Badge
							variant={isAdmin ? 'destructive' : 'secondary'}
							className='text-xs'
						>
							{isAdmin ? t('roles.admin') : t('roles.moderator')}
						</Badge>
					</div>

					{/* Right: Mobile Menu Button */}
					<Button
						variant='ghost'
						size='sm'
						onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
						className='lg:hidden'
					>
						{isMobileMenuOpen ? (
							<X className='h-5 w-5' />
						) : (
							<Menu className='h-5 w-5' />
						)}
					</Button>
				</div>

				{/* Mobile Menu Dropdown */}
				{isMobileMenuOpen && (
					<div className='border-t bg-white dark:border-gray-700 dark:bg-gray-800'>
						<div className='space-y-1 px-4 py-4'>
							{filteredNavItems.map((item) => (
								<Link
									key={item.href}
									href={item.href}
									onClick={() => setIsMobileMenuOpen(false)}
									className={cn(
										'flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors',
										isActive(item.href)
											? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100'
											: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100',
									)}
								>
									<div className='flex items-center space-x-3'>
										<item.icon className='h-4 w-4' />
										<span>{item.label}</span>
									</div>
									{item.badge && (
										<Badge variant='secondary' className='text-xs'>
											{item.badge}
										</Badge>
									)}
								</Link>
							))}

							{/* Back to Main Site */}
							<Link
								href={`/${locale}`}
								onClick={() => setIsMobileMenuOpen(false)}
								className='flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100'
							>
								<span>{t('nav.back_to_site')}</span>
								<ChevronRight className='h-4 w-4' />
							</Link>
						</div>
					</div>
				)}
			</nav>
		</>
	);
};
