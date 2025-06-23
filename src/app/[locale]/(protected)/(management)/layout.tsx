import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { USER_ROLES } from '@/lib/constants/config';
import { ManagementNavigation } from '@/components/management-navigation';

interface ManagementLayoutProps {
	children: ReactNode;
	params: {
		locale: string;
	};
}

const Layout = async ({
	children,
	params: { locale },
}: ManagementLayoutProps) => {
	const session = await auth();

	if (!session?.user) {
		redirect(`/${locale}/auth/login`);
	}

	const userRole = session.user.role;
	const hasManagementAccess =
		userRole === USER_ROLES.ADMIN || userRole === USER_ROLES.MODERATOR;

	if (!hasManagementAccess) {
		redirect(`/${locale}/dashboard`);
	}

	return (
		<div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
			{/* Management Navigation */}
			<ManagementNavigation userRole={userRole} locale={locale} />

			{/* Main Content Area */}
			<main className='container mx-auto px-4 py-6 lg:px-8'>
				<div className='mx-auto max-w-7xl'>{children}</div>
			</main>
		</div>
	);
};

export default Layout;
