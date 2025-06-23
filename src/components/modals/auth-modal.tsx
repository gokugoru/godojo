'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Github, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { useLogin, useRegister, useOAuthSignIn } from '@/lib/auth/hooks';

// Validation schemas
const loginSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters'),
	email: z.string().email('Invalid email address'),
	password: z
		.string()
		.min(8, 'Password must be at least 8 characters')
		.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
			'Password must contain at least one lowercase letter, one uppercase letter, and one number',
		),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

interface AuthModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
	const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
	const [showPassword, setShowPassword] = useState(false);

	// Translations
	const tAuth = useTranslations('auth');

	// Auth hooks
	const loginMutation = useLogin();
	const registerMutation = useRegister();
	const oauthMutation = useOAuthSignIn();

	const isLoading =
		loginMutation.isPending ||
		registerMutation.isPending ||
		oauthMutation.isPending;

	// Separate forms for each mode
	const loginForm = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	});

	const registerForm = useForm<RegisterFormData>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			name: '',
			email: '',
			password: '',
		},
	});

	const onLoginSubmit = async (values: LoginFormData) => {
		const formData = new FormData();
		formData.append('email', values.email);
		formData.append('password', values.password);

		const result = await loginMutation.mutateAsync(formData);

		if (result.success) {
			onClose();
			loginForm.reset();
		}
	};

	const onRegisterSubmit = async (values: RegisterFormData) => {
		const formData = new FormData();
		formData.append('name', values.name);
		formData.append('email', values.email);
		formData.append('password', values.password);

		const result = await registerMutation.mutateAsync(formData);

		if (result.success) {
			onClose();
			registerForm.reset();
		}
	};

	const handleOAuthLogin = (provider: 'github' | 'google') => {
		oauthMutation.mutate(provider);
	};

	const switchMode = () => {
		setAuthMode(authMode === 'login' ? 'register' : 'login');
		setShowPassword(false);
		loginForm.reset();
		registerForm.reset();
	};

	const getErrorMessage = () => {
		if (loginMutation.error) return loginMutation.error.message;
		if (registerMutation.error) return registerMutation.error.message;
		if (oauthMutation.error) return oauthMutation.error.message;

		return null;
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='sm:max-w-md'>
				<DialogHeader>
					<DialogTitle>
						{authMode === 'login' ? tAuth('signIn') : tAuth('signUp')}
					</DialogTitle>
					<DialogDescription>
						{authMode === 'login'
							? 'Welcome back! Please sign in to your account.'
							: 'Create a new account to start tracking your progress.'}
					</DialogDescription>
				</DialogHeader>

				<div className='space-y-4'>
					{/* Error message */}
					{getErrorMessage() && (
						<div className='rounded-md border border-red-200 bg-red-50 p-3'>
							<p className='text-sm text-red-600'>{getErrorMessage()}</p>
						</div>
					)}

					{/* OAuth Buttons */}
					<div className='space-y-2'>
						<Button
							variant='outline'
							className='w-full'
							onClick={() => handleOAuthLogin('github')}
							disabled={isLoading}
						>
							<Github className='mr-2 h-4 w-4' />
							{tAuth('continueWithGitHub')}
						</Button>
						<Button
							variant='outline'
							className='w-full'
							onClick={() => handleOAuthLogin('google')}
							disabled={isLoading}
						>
							<Mail className='mr-2 h-4 w-4' />
							{tAuth('continueWithGoogle')}
						</Button>
					</div>

					<div className='relative'>
						<div className='absolute inset-0 flex items-center'>
							<Separator className='w-full' />
						</div>
						<div className='relative flex justify-center text-xs uppercase'>
							<span className='bg-background text-muted-foreground px-2'>
								Or
							</span>
						</div>
					</div>

					{/* Login Form */}
					{authMode === 'login' && (
						<Form {...loginForm}>
							<form
								onSubmit={loginForm.handleSubmit(onLoginSubmit)}
								className='space-y-4'
							>
								<FormField
									control={loginForm.control}
									name='email'
									render={({ field }) => (
										<FormItem>
											<FormLabel>{tAuth('email')}</FormLabel>
											<FormControl>
												<Input
													type='email'
													placeholder='john@example.com'
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={loginForm.control}
									name='password'
									render={({ field }) => (
										<FormItem>
											<FormLabel>{tAuth('password')}</FormLabel>
											<FormControl>
												<div className='relative'>
													<Input
														type={showPassword ? 'text' : 'password'}
														placeholder='••••••••'
														{...field}
													/>
													<Button
														type='button'
														variant='ghost'
														size='sm'
														className='absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent'
														onClick={() => setShowPassword(!showPassword)}
													>
														{showPassword ? (
															<EyeOff className='h-4 w-4' />
														) : (
															<Eye className='h-4 w-4' />
														)}
													</Button>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<Button type='submit' className='w-full' disabled={isLoading}>
									{isLoading ? tAuth('pleaseWait') : tAuth('signIn')}
								</Button>
							</form>
						</Form>
					)}

					{/* Register Form */}
					{authMode === 'register' && (
						<Form {...registerForm}>
							<form
								onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
								className='space-y-4'
							>
								<FormField
									control={registerForm.control}
									name='name'
									render={({ field }) => (
										<FormItem>
											<FormLabel>{tAuth('name')}</FormLabel>
											<FormControl>
												<Input placeholder='John Doe' {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={registerForm.control}
									name='email'
									render={({ field }) => (
										<FormItem>
											<FormLabel>{tAuth('email')}</FormLabel>
											<FormControl>
												<Input
													type='email'
													placeholder='john@example.com'
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={registerForm.control}
									name='password'
									render={({ field }) => (
										<FormItem>
											<FormLabel>{tAuth('password')}</FormLabel>
											<FormControl>
												<div className='relative'>
													<Input
														type={showPassword ? 'text' : 'password'}
														placeholder='••••••••'
														{...field}
													/>
													<Button
														type='button'
														variant='ghost'
														size='sm'
														className='absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent'
														onClick={() => setShowPassword(!showPassword)}
													>
														{showPassword ? (
															<EyeOff className='h-4 w-4' />
														) : (
															<Eye className='h-4 w-4' />
														)}
													</Button>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<Button type='submit' className='w-full' disabled={isLoading}>
									{isLoading ? tAuth('pleaseWait') : tAuth('signUp')}
								</Button>
							</form>
						</Form>
					)}

					{/* Switch mode */}
					<div className='text-center'>
						<Button variant='link' onClick={switchMode} className='text-sm'>
							{authMode === 'login' ? tAuth('noAccount') : tAuth('hasAccount')}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default AuthModal;
