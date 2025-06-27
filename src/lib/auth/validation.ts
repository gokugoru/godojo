// src/lib/auth/validation.ts
import { useCallback } from 'react';
import { useTranslations } from 'next-intl';

interface AuthFormData {
	email: string;
	password: string;
	confirmPassword: string;
	name: string;
	username: string;
}

export const useAuthValidation = () => {
	const t = useTranslations('auth');

	const validateEmail = useCallback(
		(email: string): string | null => {
			if (!email.trim()) return t('emailRequired');

			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email)) return t('emailInvalid');

			return null;
		},
		[t],
	);

	const validatePassword = useCallback(
		(password: string): string | null => {
			if (!password.trim()) return t('passwordRequired');
			if (password.length < 6) return t('passwordTooShort');

			return null;
		},
		[t],
	);

	const validateName = useCallback(
		(name: string): string | null => {
			if (!name.trim()) return t('nameRequired');
			if (name.length < 2) return t('nameTooShort');

			return null;
		},
		[t],
	);

	const validateUsername = useCallback(
		(username: string): string | null => {
			if (!username.trim()) return null;

			if (username.length < 3) return t('usernameTooShort');
			if (username.length > 20) return t('usernameTooLong');

			const usernameRegex = /^[a-zA-Z0-9_-]+$/;
			if (!usernameRegex.test(username)) return t('usernameInvalid');

			return null;
		},
		[t],
	);

	const validateConfirmPassword = useCallback(
		(password: string, confirmPassword: string): string | null => {
			if (!confirmPassword.trim()) return t('confirmPasswordRequired');
			if (password !== confirmPassword) return t('passwordMismatch');

			return null;
		},
		[t],
	);

	const validateLoginForm = useCallback(
		(formData: Pick<AuthFormData, 'email' | 'password'>): string | null => {
			const emailError = validateEmail(formData.email);
			if (emailError) return emailError;

			const passwordError = validatePassword(formData.password);
			if (passwordError) return passwordError;

			return null;
		},
		[validateEmail, validatePassword],
	);

	const validateRegisterForm = useCallback(
		(formData: AuthFormData): string | null => {
			const nameError = validateName(formData.name);
			if (nameError) return nameError;

			if (formData.username?.trim()) {
				const usernameError = validateUsername(formData.username);
				if (usernameError) return usernameError;
			}

			const emailError = validateEmail(formData.email);
			if (emailError) return emailError;

			const passwordError = validatePassword(formData.password);
			if (passwordError) return passwordError;

			const confirmPasswordError = validateConfirmPassword(
				formData.password,
				formData.confirmPassword,
			);
			if (confirmPasswordError) return confirmPasswordError;

			return null;
		},
		[
			validateName,
			validateUsername,
			validateEmail,
			validatePassword,
			validateConfirmPassword,
		],
	);

	return {
		validateEmail,
		validatePassword,
		validateName,
		validateUsername,
		validateConfirmPassword,
		validateLoginForm,
		validateRegisterForm,
	};
};
