// src/components/modals/auth-modal.tsx
'use client';

import { memo, useCallback, useMemo, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff, Github, Mail } from 'lucide-react';

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface AuthModalProps {
	isOpen: boolean;
	onClose: () => void;
}

type AuthMode = 'signin' | 'signup';

const SocialButton = memo(
	({
		provider,
		onClick,
		disabled,
	}: {
		provider: 'github' | 'google';
		onClick: () => void;
		disabled?: boolean;
	}) => {
		const t = useTranslations('auth');

		const iconMap = {
			github: Github,
			google: Mail,
		};

		const Icon = iconMap[provider];

		return (
			<Button
				variant='outline'
				onClick={onClick}
				disabled={disabled}
				className='w-full'
			>
				<Icon className='mr-2 h-4 w-4' />
				{t(
					`continueWith${provider.charAt(0).toUpperCase() + provider.slice(1)}`,
				)}
			</Button>
		);
	},
);

const PasswordField = memo(
	({
		value,
		onChange,
		placeholder,
		required = false,
	}: {
		value: string;
		onChange: (value: string) => void;
		placeholder: string;
		required?: boolean;
	}) => {
		const [showPassword, setShowPassword] = useState(false);

		const togglePasswordVisibility = useCallback(() => {
			setShowPassword((prev) => !prev);
		}, []);

		const handleChange = useCallback(
			(e: React.ChangeEvent<HTMLInputElement>) => {
				onChange(e.target.value);
			},
			[onChange],
		);

		return (
			<div className='relative'>
				<Input
					type={showPassword ? 'text' : 'password'}
					value={value}
					onChange={handleChange}
					placeholder={placeholder}
					required={required}
					className='pr-10'
				/>
				<Button
					type='button'
					variant='ghost'
					size='sm'
					onClick={togglePasswordVisibility}
					className='absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent'
				>
					{showPassword ? (
						<EyeOff className='h-4 w-4' />
					) : (
						<Eye className='h-4 w-4' />
					)}
				</Button>
			</div>
		);
	},
);

export const AuthModal = memo(({ isOpen, onClose }: AuthModalProps) => {
	const t = useTranslations('auth');
	const [mode, setMode] = useState<AuthMode>('signin');
	const [isPending, startTransition] = useTransition();
	const [formData, setFormData] = useState({
		email: '',
		password: '',
		confirmPassword: '',
		name: '',
	});

	const isSignUp = useMemo(() => mode === 'signup', [mode]);

	const toggleMode = useCallback(() => {
		setMode((prev) => (prev === 'signin' ? 'signup' : 'signin'));
		setFormData({
			email: '',
			password: '',
			confirmPassword: '',
			name: '',
		});
	}, []);

	const updateFormData = useCallback(
		(field: keyof typeof formData, value: string) => {
			setFormData((prev) => ({ ...prev, [field]: value }));
		},
		[],
	);

	const handleSocialAuth = useCallback((provider: 'github' | 'google') => {
		startTransition(() => {
			console.log(`Authenticating with ${provider}`);
		});
	}, []);

	const handleSubmit = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();
			startTransition(() => {
				console.log(`${mode}:`, formData);
			});
		},
		[mode, formData],
	);

	const socialButtons = useMemo(
		() => (
			<div className='space-y-3'>
				<SocialButton
					provider='github'
					onClick={() => handleSocialAuth('github')}
					disabled={isPending}
				/>
				<SocialButton
					provider='google'
					onClick={() => handleSocialAuth('google')}
					disabled={isPending}
				/>
			</div>
		),
		[handleSocialAuth, isPending],
	);

	const formFields = useMemo(
		() => (
			<div className='space-y-4'>
				{isSignUp && (
					<div className='space-y-2'>
						<Label htmlFor='name'>{t('name')}</Label>
						<Input
							id='name'
							type='text'
							value={formData.name}
							onChange={(e) => updateFormData('name', e.target.value)}
							placeholder={t('enterName')}
							required
						/>
					</div>
				)}

				<div className='space-y-2'>
					<Label htmlFor='email'>{t('email')}</Label>
					<Input
						id='email'
						type='email'
						value={formData.email}
						onChange={(e) => updateFormData('email', e.target.value)}
						placeholder={t('enterEmail')}
						required
					/>
				</div>

				<div className='space-y-2'>
					<Label htmlFor='password'>{t('password')}</Label>
					<PasswordField
						value={formData.password}
						onChange={(value) => updateFormData('password', value)}
						placeholder={t('enterPassword')}
						required
					/>
				</div>

				{isSignUp && (
					<div className='space-y-2'>
						<Label htmlFor='confirmPassword'>{t('confirmPassword')}</Label>
						<PasswordField
							value={formData.confirmPassword}
							onChange={(value) => updateFormData('confirmPassword', value)}
							placeholder={t('confirmPassword')}
							required
						/>
					</div>
				)}
			</div>
		),
		[isSignUp, formData, updateFormData, t],
	);

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='sm:max-w-md'>
				<DialogHeader>
					<DialogTitle>
						{isSignUp ? t('createAccount') : t('signIn')}
					</DialogTitle>
					<DialogDescription>
						{isSignUp ? t('createAccountDescription') : t('signInDescription')}
					</DialogDescription>
				</DialogHeader>

				<div className='space-y-4'>
					{socialButtons}

					<div className='relative'>
						<Separator />
						<div className='absolute inset-0 flex items-center justify-center'>
							<span className='bg-background text-muted-foreground px-2 text-xs'>
								{t('orContinueWith')}
							</span>
						</div>
					</div>

					<form onSubmit={handleSubmit} className='space-y-4'>
						{formFields}

						<Button type='submit' className='w-full' disabled={isPending}>
							{isPending
								? t('loading')
								: isSignUp
									? t('createAccount')
									: t('signIn')}
						</Button>
					</form>

					<div className='text-center text-sm'>
						<span className='text-muted-foreground'>
							{isSignUp ? t('alreadyHaveAccount') : t('dontHaveAccount')}
						</span>{' '}
						<Button
							variant='link'
							onClick={toggleMode}
							className='h-auto p-0 text-sm font-normal'
						>
							{isSignUp ? t('signIn') : t('signUp')}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
});

AuthModal.displayName = 'AuthModal';
SocialButton.displayName = 'SocialButton';
PasswordField.displayName = 'PasswordField';
