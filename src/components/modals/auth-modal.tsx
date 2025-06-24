// @/components/modals/AuthModal.tsx - PRODUCTION READY
'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Github, Mail, AlertCircle } from 'lucide-react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';

import { useLogin, useRegister, useOAuthSignIn } from '@/lib/auth/hooks';

// FIXED: Synchronized validation schemas
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
type AuthMode = 'login' | 'register';

interface AuthModalProps {
	isOpen: boolean;
	onClose: () => void;
}

/**
 * Enhanced error categorization for better UX
 */
type ErrorCategory =
	| 'network'
	| 'validation'
	| 'server'
	| 'rate_limit'
	| 'unknown';

interface AuthError {
	category: ErrorCategory;
	message: string;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
	const [authMode, setAuthMode] = useState<AuthMode>('login');
	const [showPassword, setShowPassword] = useState(false);

	// Translations
	const tAuth = useTranslations('auth');
	const tCommon = useTranslations('common');

	// Auth hooks
	const loginMutation = useLogin();
	const registerMutation = useRegister();
	const oauthMutation = useOAuthSignIn();

	const isLoading = useMemo(
		() =>
			loginMutation.isPending ||
			registerMutation.isPending ||
			oauthMutation.isPending,
		[
			loginMutation.isPending,
			registerMutation.isPending,
			oauthMutation.isPending,
		],
	);

	// FIXED: Memoized auth mode configuration
	const authModeConfig = useMemo(
		() => ({
			login: {
				title: tAuth('signIn'),
				description: tAuth('welcomeBack'),
				submitText: tAuth('signIn'),
				switchText: tAuth('noAccount'),
			},
			register: {
				title: tAuth('signUp'),
				description: tAuth('createAccount'),
				submitText: tAuth('signUp'),
				switchText: tAuth('hasAccount'),
			},
		}),
		[tAuth],
	);

	const currentConfig = authModeConfig[authMode];

	// Form instances
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

	// FIXED: Enhanced error handling with categorization
	const getErrorDetails = useCallback((): AuthError | null => {
		const errors = [
			loginMutation.error,
			registerMutation.error,
			oauthMutation.error,
		];

		const firstError = errors.find(Boolean);
		if (!firstError?.message) return null;

		const { message } = firstError;

		// Network error detection
		if (
			message.includes('fetch') ||
			message.includes('network') ||
			message.includes('Failed to fetch')
		) {
			return {
				category: 'network',
				message: tAuth('networkError'),
			};
		}

		// Rate limiting detection
		if (
			message.includes('Too many attempts') ||
			message.includes('rate limit')
		) {
			return {
				category: 'rate_limit',
				message: message, // Keep original rate limit message with timing
			};
		}

		// Server error detection
		if (
			message.includes('500') ||
			message.includes('server') ||
			message.includes('Internal')
		) {
			return {
				category: 'server',
				message: tAuth('serverError'),
			};
		}

		// Validation errors (handled by forms)
		if (message.includes('Invalid') || message.includes('required')) {
			return {
				category: 'validation',
				message,
			};
		}

		return {
			category: 'unknown',
			message,
		};
	}, [loginMutation.error, registerMutation.error, oauthMutation.error, tAuth]);

	// Form submission handlers
	const onLoginSubmit = useCallback(
		async (values: LoginFormData) => {
			const formData = new FormData();
			formData.append('email', values.email);
			formData.append('password', values.password);

			const result = await loginMutation.mutateAsync(formData);

			if (result.success) {
				onClose();
				loginForm.reset();
			}
		},
		[loginMutation, onClose, loginForm],
	);

	const onRegisterSubmit = useCallback(
		async (values: RegisterFormData) => {
			const formData = new FormData();
			formData.append('name', values.name);
			formData.append('email', values.email);
			formData.append('password', values.password);

			const result = await registerMutation.mutateAsync(formData);

			if (result.success) {
				onClose();
				registerForm.reset();
			}
		},
		[registerMutation, onClose, registerForm],
	);

	// FIXED: Prevent form submission on OAuth buttons
	const handleOAuthLogin = useCallback(
		(provider: 'github' | 'google') => (e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			oauthMutation.mutate(provider);
		},
		[oauthMutation],
	);

	const switchMode = useCallback(() => {
		setAuthMode((prev) => (prev === 'login' ? 'register' : 'login'));
		setShowPassword(false);
		loginForm.reset();
		registerForm.reset();
	}, [loginForm, registerForm]);

	const togglePasswordVisibility = useCallback(() => {
		setShowPassword((prev) => !prev);
	}, []);

	const errorDetails = getErrorDetails();

	// FIXED: Memoized OAuth buttons to prevent re-renders
	const OAuthButtons = useMemo(
		() => (
			<div className='space-y-2'>
				<Button
					type='button'
					variant='outline'
					className='w-full'
					onClick={handleOAuthLogin('github')}
					disabled={isLoading}
					onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
				>
					<Github className='mr-2 h-4 w-4' aria-hidden='true' />
					{tAuth('continueWithGitHub')}
				</Button>
				<Button
					type='button'
					variant='outline'
					className='w-full'
					onClick={handleOAuthLogin('google')}
					disabled={isLoading}
					onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
				>
					<Mail className='mr-2 h-4 w-4' aria-hidden='true' />
					{tAuth('continueWithGoogle')}
				</Button>
			</div>
		),
		[handleOAuthLogin, isLoading, tAuth],
	);

	// FIXED: Enhanced password input with accessibility
	const PasswordInput = ({ field, placeholder = '••••••••' }: any) => (
		<div className='relative'>
			<Input
				type={showPassword ? 'text' : 'password'}
				placeholder={placeholder}
				{...field}
			/>
			<Button
				type='button'
				variant='ghost'
				size='sm'
				className='absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent'
				onClick={togglePasswordVisibility}
				aria-label={
					showPassword ? tAuth('hidePassword') : tAuth('showPassword')
				}
				tabIndex={-1}
			>
				{showPassword ? (
					<EyeOff className='h-4 w-4' aria-hidden='true' />
				) : (
					<Eye className='h-4 w-4' aria-hidden='true' />
				)}
			</Button>
		</div>
	);

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='sm:max-w-md'>
				<DialogHeader>
					<DialogTitle>{currentConfig.title}</DialogTitle>
					<DialogDescription>{currentConfig.description}</DialogDescription>
				</DialogHeader>

				<div className='space-y-4'>
					{/* FIXED: Enhanced error display with icons */}
					{errorDetails && (
						<Alert
							variant={
								errorDetails.category === 'network' ? 'destructive' : 'default'
							}
						>
							<AlertCircle className='h-4 w-4' />
							<AlertDescription>{errorDetails.message}</AlertDescription>
						</Alert>
					)}

					{/* OAuth Buttons */}
					{OAuthButtons}

					<div className='relative'>
						<div className='absolute inset-0 flex items-center'>
							<Separator className='w-full' />
						</div>
						<div className='relative flex justify-center text-xs uppercase'>
							<span className='bg-background text-muted-foreground px-2'>
								{tCommon('or')}
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
													autoComplete='email'
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
												<PasswordInput field={field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<Button type='submit' className='w-full' disabled={isLoading}>
									{isLoading ? tAuth('pleaseWait') : currentConfig.submitText}
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
												<Input
													placeholder='John Doe'
													autoComplete='name'
													{...field}
												/>
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
													autoComplete='email'
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
												<PasswordInput field={field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<Button type='submit' className='w-full' disabled={isLoading}>
									{isLoading ? tAuth('pleaseWait') : currentConfig.submitText}
								</Button>
							</form>
						</Form>
					)}

					{/* Switch mode */}
					<div className='text-center'>
						<Button variant='link' onClick={switchMode} className='text-sm'>
							{currentConfig.switchText}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default AuthModal;
