import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db as prisma } from '@/lib/prisma';
import type { UserRole } from '@prisma/client';

const CREDENTIALS_SCHEMA = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(1, 'Password is required'),
});

const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

const extractUsernameFromEmail = (email: string): string => {
	return email.split('@')[0] || 'user';
};

const validateCredentialsUser = async (email: string, password: string) => {
	const user = await prisma.user.findUnique({
		where: { email },
		include: {
			accounts: {
				where: { provider: 'credentials' },
				select: { refresh_token: true },
			},
		},
	});

	if (!user || user.accounts.length === 0) {
		return null;
	}

	const account = user.accounts.at(0);

	if (!account?.refresh_token) {
		return null;
	}

	const isValidPassword = await bcrypt.compare(password, account.refresh_token);

	if (!isValidPassword) {
		return null;
	}

	return user;
};

const generateUniqueUsername = async (
	baseUsername: string,
): Promise<string> => {
	let username = baseUsername;
	let counter = 1;

	while (await prisma.user.findUnique({ where: { username } })) {
		username = `${baseUsername}${counter}`;
		counter++;
	}

	return username;
};

export const { handlers, signIn, signOut, auth } = NextAuth({
	adapter: PrismaAdapter(prisma),
	secret: process.env.NEXTAUTH_SECRET,

	providers: [
		GitHub({
			clientId: process.env.AUTH_GITHUB_ID!,
			clientSecret: process.env.AUTH_GITHUB_SECRET!,
			profile(profile) {
				return {
					id: profile.id.toString(),
					name: profile.name || profile.login,
					email: profile.email,
					image: profile.avatar_url,
					username: profile.login,
					role: 'USER' as UserRole,
				};
			},
		}),

		Google({
			clientId: process.env.AUTH_GOOGLE_ID!,
			clientSecret: process.env.AUTH_GOOGLE_SECRET!,
			profile(profile) {
				return {
					id: profile.sub,
					name: profile.name,
					email: profile.email,
					image: profile.picture,
					username: extractUsernameFromEmail(profile.email || ''),
					role: 'USER' as UserRole,
				};
			},
		}),

		Credentials({
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				try {
					const { email, password } = CREDENTIALS_SCHEMA.parse(credentials);
					const user = await validateCredentialsUser(email, password);

					if (!user) {
						return null;
					}

					await prisma.user.update({
						where: { id: user.id },
						data: { lastLogin: new Date() },
					});

					return {
						id: user.id,
						email: user.email,
						name: user.name,
						image: user.image,
						username: user.username || extractUsernameFromEmail(user.email),
						role: user.role,
					};
				} catch (error) {
					console.error('Authorization error:', error);

					return null;
				}
			},
		}),
	],

	session: {
		strategy: 'jwt',
		maxAge: SESSION_MAX_AGE_SECONDS,
	},

	callbacks: {
		async jwt({ token, user }) {
			if (user?.id) {
				token.role = user.role;
				token.username = user.username || '';
			}

			if (!token.username && token.email) {
				const email = token.email as string;
				const baseUsername = extractUsernameFromEmail(email);
				const uniqueUsername = await generateUniqueUsername(baseUsername);

				await prisma.user.update({
					where: { id: token.sub },
					data: { username: uniqueUsername },
				});

				token.username = uniqueUsername;
			}

			return token;
		},

		async session({ session, token }) {
			if (token.sub && session?.user) {
				session.user.id = token.sub;
				session.user.role = token.role as UserRole;
				session.user.username = token.username as string;
			}

			return session;
		},

		async signIn() {
			return true;
		},
	},

	pages: {
		signIn: '/auth/login',
		error: '/auth/error',
	},

	events: {
		async signIn({ user, account }) {
			console.log(`User ${user.email} signed in with ${account?.provider}`);
		},
	},

	debug: process.env.NODE_ENV === 'development',
});
