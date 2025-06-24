import type { DefaultSession } from 'next-auth';
import type { UserRole } from '@prisma/client';

// Module augmentation for NextAuth.js v5
declare module 'next-auth' {
	/**
	 * The shape of the user object returned in the OAuth providers' `dashboard` callback,
	 * or the second parameter of the `session` callback, when using a database.
	 */
	interface User {
		role: UserRole;
		username?: string;
	}

	/**
	 * Returned by `useSession`, `auth`, contains information about the active session.
	 */
	interface Session {
		user: {
			id: string;
			email: string;
			role: UserRole;
		} & DefaultSession['user'];
	}
}

// Module augmentation for JWT
declare module 'next-auth/jwt' {
	/** Returned by the `jwt` callback and `auth`, when using JWT sessions */
	interface JWT {
		/** The user's role. */
		role: UserRole;
		/** The user's username. */
		username: string;
	}
}
