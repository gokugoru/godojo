import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db as prisma } from '@/lib/prisma';
import type { UserRole } from '@prisma/client';

// Схема для валидации credentials
const credentialsSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(1, 'Password is required'),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
	adapter: PrismaAdapter(prisma),

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
					username: profile.email?.split('@')[0] || '',
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
					const { email, password } = credentialsSchema.parse(credentials);

					// Найти пользователя с credentials аккаунтом
					const user = await prisma.user.findUnique({
						where: { email },
						include: {
							accounts: {
								where: { provider: 'credentials' },
							},
						},
					});

					if (!user || user.accounts.length === 0) {
						return null;
					}

					// Проверить пароль (хранится в refresh_token)
					const account = user.accounts[0];
					const isValidPassword = await bcrypt.compare(
						password,
						account.refresh_token || '',
					);

					if (!isValidPassword) {
						return null;
					}

					// Обновить последний вход
					await prisma.user.update({
						where: { id: user.id },
						data: { lastLogin: new Date() },
					});

					return {
						id: user.id,
						email: user.email,
						name: user.name,
						image: user.image,
						username: user.username || email.split('@')[0],
						role: user.role,
					};
				} catch (error) {
					console.error('Auth error:', error);

					return null;
				}
			},
		}),
	],

	session: {
		strategy: 'jwt',
		maxAge: 30 * 24 * 60 * 60, // 30 дней
	},

	callbacks: {
		async jwt({ token, user, account }) {
			// При первом входе добавляем данные пользователя в токен
			if (user) {
				token.role = user.role;
				token.username = user.username || '';
			}

			// Для OAuth провайдеров генерируем username если его нет
			if (account && account.provider !== 'credentials' && !token.username) {
				const email = token.email as string;
				const baseUsername = email.split('@')[0];

				// Проверяем уникальность username
				let username = baseUsername;
				let counter = 1;

				while (await prisma.user.findUnique({ where: { username } })) {
					username = `${baseUsername}${counter}`;
					counter++;
				}

				// Обновляем пользователя с новым username
				await prisma.user.update({
					where: { id: token.sub },
					data: { username },
				});

				token.username = username;
			}

			return token;
		},

		async session({ session, token }) {
			// Добавляем дополнительные поля в сессию из JWT токена
			if (token.sub && session?.user && session?.user?.role) {
				session.user.id = token.sub;
				session.user.role = token.role as UserRole;
				session.user.username = token.username as string;
			}

			return session;
		},

		async signIn() {
			// Разрешаем вход
			return true;
		},
	},

	pages: {
		signIn: '/auth/login',
		error: '/auth/error',
	},

	events: {
		async signIn({ user, account }) {
			console.log(`✅ User ${user.email} signed in with ${account?.provider}`);
		},
	},

	debug: process.env.NODE_ENV === 'development',
});
