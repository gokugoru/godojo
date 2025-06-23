'use client';

import React, { useState } from 'react';
import { Search, User, LogOut, Settings, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuth, useSignOut } from '@/lib/auth/hooks';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import LanguageSwitcher from './LanguageSwitcher';
import AuthModal from '@/components/modals/auth-modal';
import Link from 'next/link';

const Header = () => {
	const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');

	const t = useTranslations('common');
	const tAuth = useTranslations('auth');
	const { user, isAuthenticated, isLoading } = useAuth();
	const signOutMutation = useSignOut();

	const handleLogout = () => {
		signOutMutation.mutate();
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		// Implement search functionality
		console.log('Search:', searchQuery);
	};

	return (
		<>
			{/* Header */}
			<header className='bg-background border-border sticky top-0 z-40 border-b shadow-sm'>
				<div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
					<div className='flex h-16 items-center justify-between'>
						{/* Logo */}
						<div className='flex items-center'>
							<Link href='/' className='flex items-center space-x-2'>
								<div className='bg-primary flex h-8 w-8 items-center justify-center rounded-lg'>
									<span className='text-primary-foreground text-sm font-bold'>
										Go
									</span>
								</div>
								<span className='text-foreground text-lg font-semibold'>
									Dojo
								</span>
							</Link>
						</div>

						{/* Search */}
						<div className='mx-8 max-w-lg flex-1'>
							<div className='relative'>
								<Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform' />
								<Input
									type='text'
									placeholder={t('search')}
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
									className='pl-10'
								/>
							</div>
						</div>

						{/* Right side */}
						<div className='flex items-center space-x-4'>
							{/* GitHub stars */}
							<div className='flex items-center gap-2 text-sm'>
								<Star className='h-4 w-4 text-orange-500' />
								<span className='text-primary font-medium'>3933</span>
								<span className='text-muted-foreground'>{t('github')}</span>
							</div>

							{/* Language Switcher */}
							<LanguageSwitcher />

							{/* User menu */}
							{isLoading ? (
								<div className='bg-muted h-8 w-8 animate-pulse rounded-full' />
							) : isAuthenticated && user ? (
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant='ghost'
											className='relative h-10 w-10 rounded-full'
										>
											<Avatar className='h-8 w-8'>
												<AvatarImage
													src={user.image || ''}
													alt={user.name || ''}
												/>
												<AvatarFallback>
													{user.name?.charAt(0).toUpperCase() ||
														user.username?.charAt(0).toUpperCase() ||
														'U'}
												</AvatarFallback>
											</Avatar>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent className='w-56' align='end' forceMount>
										<DropdownMenuLabel className='font-normal'>
											<div className='flex flex-col space-y-1'>
												<p className='text-sm leading-none font-medium'>
													{user.name || user.username}
												</p>
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
											onClick={handleLogout}
											disabled={signOutMutation.isPending}
											className='flex items-center'
										>
											<LogOut className='mr-2 h-4 w-4' />
											{signOutMutation.isPending
												? tAuth('signingOut')
												: tAuth('signOut')}
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							) : (
								<Button onClick={() => setIsAuthModalOpen(true)}>
									{tAuth('signIn')}
								</Button>
							)}
						</div>
					</div>
				</div>
			</header>

			{/* Auth Modal */}
			<AuthModal
				isOpen={isAuthModalOpen}
				onClose={() => setIsAuthModalOpen(false)}
			/>
		</>
	);
};

export default Header;
