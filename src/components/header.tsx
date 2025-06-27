// src/components/header.tsx
'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import { User, LogOut, Settings, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { useAuth, useSignOut } from '@/lib/auth/hooks';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LanguageSwitcher } from './language-switcher';
import { AuthModal } from '@/components/modals/auth-modal';

const HeaderSkeleton = memo(() => (
	<div className='bg-muted h-8 w-8 animate-pulse rounded-full' />
));

const GitHubStars = memo(() => {
	const t = useTranslations('common');

	return (
		<div className='flex items-center gap-2 text-sm'>
			<Star className='h-4 w-4 text-orange-500' />
			<span className='text-primary font-medium'>3933</span>
			<span className='text-muted-foreground'>{t('github')}</span>
		</div>
	);
});

const UserAvatar = memo(
	({
		user,
		onLogout,
		isLoggingOut,
	}: {
		user: { name?: string; username?: string; email?: string; image?: string };
		onLogout: () => void;
		isLoggingOut: boolean;
	}) => {
		const tAuth = useTranslations('auth');

		const avatarFallback = useMemo(
			() =>
				user.name?.charAt(0).toUpperCase() ||
				user.username?.charAt(0).toUpperCase() ||
				'U',
			[user.name, user.username],
		);

		const displayName = useMemo(
			() => user.name || user.username,
			[user.name, user.username],
		);

		return (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant='ghost' className='relative h-10 w-10 rounded-full'>
						<Avatar className='h-8 w-8'>
							<AvatarImage src={user.image || ''} alt={displayName || ''} />
							<AvatarFallback>{avatarFallback}</AvatarFallback>
						</Avatar>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className='w-56' align='end' forceMount>
					<DropdownMenuLabel className='font-normal'>
						<div className='flex flex-col space-y-1'>
							<p className='text-sm leading-none font-medium'>{displayName}</p>
							<p className='text-muted-foreground text-xs leading-none'>
								{user.email}
							</p>
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem asChild>
						<Link href='/profile' className='flex items-center'>
							<User className='mr-2 h-4 w-4' />
							{tAuth('profile')}
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<Link href='/settings' className='flex items-center'>
							<Settings className='mr-2 h-4 w-4' />
							{tAuth('settings')}
						</Link>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={onLogout}
						disabled={isLoggingOut}
						className='flex items-center'
					>
						<LogOut className='mr-2 h-4 w-4' />
						{isLoggingOut ? tAuth('signingOut') : tAuth('signOut')}
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		);
	},
);

const Logo = memo(() => (
	<Link href='/' className='flex items-center space-x-2'>
		<div className='bg-primary flex h-8 w-8 items-center justify-center rounded-lg'>
			<span className='text-primary-foreground text-sm font-bold'>Go</span>
		</div>
		<span className='text-foreground text-lg font-semibold'>Dojo</span>
	</Link>
));

export const Header = memo(() => {
	const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
	const tAuth = useTranslations('auth');
	const { user, isAuthenticated, isLoading } = useAuth();
	const signOutMutation = useSignOut();

	const handleLogout = useCallback(() => {
		signOutMutation.mutate();
	}, [signOutMutation]);

	const handleAuthModalOpen = useCallback(() => {
		setIsAuthModalOpen(true);
	}, []);

	const handleAuthModalClose = useCallback(() => {
		setIsAuthModalOpen(false);
	}, []);

	const renderUserSection = useMemo(() => {
		if (isLoading) return <HeaderSkeleton />;

		if (isAuthenticated && user) {
			return (
				<UserAvatar
					user={user}
					onLogout={handleLogout}
					isLoggingOut={signOutMutation.isPending}
				/>
			);
		}

		return <Button onClick={handleAuthModalOpen}>{tAuth('signIn')}</Button>;
	}, [
		isLoading,
		isAuthenticated,
		user,
		handleLogout,
		signOutMutation.isPending,
		handleAuthModalOpen,
		tAuth,
	]);

	return (
		<>
			<header className='bg-background border-border sticky top-0 z-40 border-b shadow-sm'>
				<div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
					<div className='flex h-16 items-center justify-between'>
						<Logo />

						<div className='flex items-center space-x-4'>
							<GitHubStars />
							<LanguageSwitcher />
							{renderUserSection}
						</div>
					</div>
				</div>
			</header>

			<AuthModal isOpen={isAuthModalOpen} onClose={handleAuthModalClose} />
		</>
	);
});

Header.displayName = 'Header';
HeaderSkeleton.displayName = 'HeaderSkeleton';
GitHubStars.displayName = 'GitHubStars';
UserAvatar.displayName = 'UserAvatar';
Logo.displayName = 'Logo';
