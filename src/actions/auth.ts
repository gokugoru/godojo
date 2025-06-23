'use server';

import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { signIn, signOut, auth } from '@/lib/auth/auth';
import { db as prisma } from '@/lib/prisma';
import { AuthError } from 'next-auth';
import { AuthResult, OAuthProvider } from '@/lib/auth/types';

// Validation schemas
const registerSchema = z.object({
	email: z.string().email('Invalid email address'),
	username: z
		.string()
		.min(3, 'Username must be at least 3 characters')
		.max(20, 'Username must be at most 20 characters')
		.regex(
			/^[a-zA-Z0-9_-]+$/,
			'Username can only contain letters, numbers, _ and -',
		),
	name: z.string().min(2, 'Name must be at least 2 characters').optional(),
	password: z
		.string()
		.min(8, 'Password must be at least 8 characters')
		.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
			'Password must contain at least one lowercase letter, one uppercase letter, and one number',
		),
});

/**
 * Register a new user with credentials
 */
export async function registerUser(formData: FormData): Promise<AuthResult> {
	try {
		// Validate input
		const validatedData = registerSchema.parse({
			email: formData.get('email'),
			username: formData.get('username'),
			name: formData.get('name'),
			password: formData.get('password'),
		});

		// Check if user already exists
		const existingUser = await prisma.user.findFirst({
			where: {
				OR: [
					{ email: validatedData.email },
					{ username: validatedData.username },
				],
			},
		});

		if (existingUser) {
			if (existingUser.email === validatedData.email) {
				return { success: false, error: 'User with this email already exists' };
			}

			return { success: false, error: 'Username is already taken' };
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(validatedData.password, 12);

		// Create user and credentials account in transaction
		const user = await prisma.$transaction(async (tx) => {
			const newUser = await tx.user.create({
				data: {
					email: validatedData.email,
					username: validatedData.username,
					name: validatedData.name,
					emailVerified: new Date(), // Auto-verify for demo
				},
			});

			// Create credentials account
			await tx.account.create({
				data: {
					userId: newUser.id,
					type: 'credentials',
					provider: 'credentials',
					providerAccountId: newUser.id,
					refresh_token: hashedPassword, // Store hashed password in refresh_token
				},
			});

			return newUser;
		});

		// Auto sign in after successful registration
		await signIn('credentials', {
			email: validatedData.email,
			password: validatedData.password,
			redirect: false,
		});

		return {
			success: true,
			user: {
				id: user.id,
				email: user.email,
				username: user.username || '',
				name: user.name || undefined,
				role: user.role,
			},
		};
	} catch (error) {
		console.error('Registration error:', error);

		if (error instanceof z.ZodError) {
			return { success: false, error: error.errors[0].message };
		}

		return { success: false, error: 'An error occurred during registration' };
	}
}

/**
 * Sign in with credentials
 */
export async function loginUser(formData: FormData): Promise<AuthResult> {
	try {
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		if (!email || !password) {
			return { success: false, error: 'Email and password are required' };
		}

		const result = await signIn('credentials', {
			email,
			password,
			redirect: false,
		});

		if (result?.error) {
			return { success: false, error: 'Invalid email or password' };
		}

		return { success: true };
	} catch (error) {
		console.error('Login error:', error);

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
}

/**
 * Sign in with OAuth provider
 */
export async function signInWithProvider(provider: OAuthProvider) {
	try {
		await signIn(provider, { redirectTo: '/dashboard' });
	} catch (error) {
		console.error(`${provider} sign in error:`, error);
		throw error;
	}
}

/**
 * Sign out user
 */
export async function signOutUser() {
	try {
		await signOut({ redirectTo: '/' });
	} catch (error) {
		console.error('Sign out error:', error);
		throw error;
	}
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
	try {
		const session = await auth();

		return session?.user || null;
	} catch (error) {
		console.error('Get current user error:', error);

		return null;
	}
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
	try {
		const session = await auth();

		return !!session?.user;
	} catch (error) {
		console.error('Authentication check error:', error);

		return false;
	}
}

/**
 * Require authentication (redirect to login if not authenticated)
 */
export async function requireAuth(redirectTo: string = '/auth/login') {
	const authenticated = await isAuthenticated();

	if (!authenticated) {
		redirect(redirectTo);
	}

	return true;
}
