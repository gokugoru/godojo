'use server';

import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { signIn, signOut, auth } from '@/lib/auth/auth';
import { db as prisma } from '@/lib/prisma';
import { AuthError } from 'next-auth';
import { rateLimiters } from '@/lib/redis';
import { REDIRECTS } from '@/lib/constants/config';
import type { AuthResult, OAuthProvider } from '@/lib/auth/types';

const registerSchema = z.object({
	email: z.string().email('Invalid email address'),
	name: z.string().min(2, 'Name must be at least 2 characters'),
	password: z
		.string()
		.min(8, 'Password must be at least 8 characters')
		.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
			'Password must contain at least one lowercase letter, one uppercase letter, and one number',
		),
});

const generateUniqueUsername = async (email: string): Promise<string> => {
	const baseUsername = email
		.split('@')[0]
		.toLowerCase()
		.replace(/[^a-zA-Z0-9]/g, '');

	let username = baseUsername;
	let counter = 1;

	while (counter <= 1000) {
		const existingUser = await prisma.user.findUnique({
			where: { username },
			select: { id: true },
		});

		if (!existingUser) return username;

		username = `${baseUsername}${counter}`;
		counter++;
	}

	const fallbackSuffix = nanoid(8);

	return `${baseUsername}_${fallbackSuffix}`;
};

const checkAuthRateLimit = async (identifier: string) => {
	const result = await rateLimiters.auth.limit(identifier);

	if (!result.success) {
		const resetTime = Math.ceil((result.reset - Date.now()) / 1000);
		throw new Error(`Too many attempts. Try again in ${resetTime}s`);
	}

	return result;
};

export const registerUser = async (formData: FormData): Promise<AuthResult> => {
	try {
		const email = formData.get('email') as string;
		await checkAuthRateLimit(`register:${email}`);

		const validatedData = registerSchema.parse({
			email: formData.get('email'),
			name: formData.get('name'),
			password: formData.get('password'),
		});

		const existingUser = await prisma.user.findUnique({
			where: { email: validatedData.email },
			select: { id: true },
		});

		if (existingUser) {
			return { success: false, error: 'User with this email already exists' };
		}

		const hashedPassword = await bcrypt.hash(validatedData.password, 12);
		const username = await generateUniqueUsername(validatedData.email);

		const user = await prisma.$transaction(async (tx) => {
			const newUser = await tx.user.create({
				data: {
					email: validatedData.email,
					username,
					name: validatedData.name,
					emailVerified: new Date(),
				},
			});

			await tx.account.create({
				data: {
					userId: newUser.id,
					type: 'credentials',
					provider: 'credentials',
					providerAccountId: newUser.id,
					refresh_token: hashedPassword,
				},
			});

			return newUser;
		});

		const signInResult = await signIn('credentials', {
			email: validatedData.email,
			password: validatedData.password,
			redirect: false,
		});

		if (signInResult?.error) {
			return {
				success: false,
				error: 'Registration successful but login failed',
			};
		}

		return {
			success: true,
			redirectTo: REDIRECTS.afterRegister,
			user: {
				id: user.id,
				email: user.email,
				username: user?.username || '',
				name: user.name || undefined,
				role: user.role,
			},
		};
	} catch (error) {
		console.error('Registration error:', error);

		if (error instanceof z.ZodError) {
			return { success: false, error: error.errors[0].message };
		}

		if (error instanceof Error && error.message.includes('Too many attempts')) {
			return { success: false, error: error.message };
		}

		return { success: false, error: 'An error occurred during registration' };
	}
};

export const loginUser = async (formData: FormData): Promise<AuthResult> => {
	try {
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		if (!email || !password) {
			return { success: false, error: 'Email and password are required' };
		}

		await checkAuthRateLimit(`login:${email}`);

		const result = await signIn('credentials', {
			email,
			password,
			redirect: false,
		});

		if (result?.error) {
			return { success: false, error: 'Invalid email or password' };
		}

		return {
			success: true,
			redirectTo: REDIRECTS.afterLogin,
		};
	} catch (error) {
		console.error('Login error:', error);

		if (error instanceof Error && error.message.includes('Too many attempts')) {
			return { success: false, error: error.message };
		}

		if (error instanceof AuthError) {
			switch (error.type) {
				case 'CredentialsSignin':
					return { success: false, error: 'Invalid email or password' };
				default:
					return { success: false, error: 'An error occurred during sign in' };
			}
		}

		return { success: false, error: 'An error occurred during sign in' };
	}
};

export const signInWithProvider = async (
	provider: OAuthProvider,
): Promise<AuthResult> => {
	try {
		const result = await signIn(provider, {
			redirect: false,
			callbackUrl: REDIRECTS.afterLogin,
		});

		if (result?.error) {
			return { success: false, error: `${provider} sign in failed` };
		}

		return {
			success: true,
			redirectTo: REDIRECTS.afterLogin,
		};
	} catch (error) {
		console.error(`${provider} sign in error:`, error);

		return {
			success: false,
			error: `An error occurred during ${provider} sign in`,
		};
	}
};

export const signOutUser = async (): Promise<AuthResult> => {
	try {
		await signOut({ redirect: false });

		return {
			success: true,
			redirectTo: REDIRECTS.afterLogout,
		};
	} catch (error) {
		console.error('Sign out error:', error);

		return {
			success: false,
			error: 'An error occurred during sign out',
		};
	}
};

export const getCurrentUser = async () => {
	try {
		const session = await auth();

		return session?.user || null;
	} catch (error) {
		console.error('Get current user error:', error);

		return null;
	}
};

export const isAuthenticated = async (): Promise<boolean> => {
	try {
		const session = await auth();

		return !!session?.user;
	} catch (error) {
		console.error('Authentication check error:', error);

		return false;
	}
};

export const requireAuth = async (): Promise<{
	authenticated: boolean;
	redirectTo?: string;
}> => {
	try {
		const authenticated = await isAuthenticated();

		if (!authenticated) {
			return {
				authenticated: false,
				redirectTo: '/auth/login',
			};
		}

		return { authenticated: true };
	} catch (error) {
		console.error('Authentication check error:', error);

		return {
			authenticated: false,
			redirectTo: '/auth/login',
		};
	}
};
