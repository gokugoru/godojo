// Расширяем типы NextAuth
import type { UserRole } from '@prisma/client';

declare module 'next-auth' {
	interface User {
		role: UserRole;
		username?: string;
	}

	interface Session {
		user: {
			id: string;
			email: string;
			name?: string;
			image?: string;
			role: UserRole;
			username: string;
		};
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		role: UserRole;
		username: string;
	}
}
