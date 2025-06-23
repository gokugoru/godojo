import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
	const router = useRouter();
	const pathname = usePathname();
	const locale = useLocale();

	const handleLanguageChange = (newLocale: string) => {
		// Remove current locale from pathname
		const pathnameWithoutLocale = pathname.replace(`/${locale}`, '') || '/';

		// Add new locale to pathname
		const newPath = `/${newLocale}${pathnameWithoutLocale}`;

		router.push(newPath);
	};

	return (
		<div className='relative'>
			<div className='flex items-center gap-2'>
				<Globe className='h-4 w-4 text-gray-500' />
				<select
					value={locale}
					onChange={(e) => handleLanguageChange(e.target.value)}
					className='rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none'
				>
					<option value='en'>English</option>
					<option value='ru'>Русский</option>
				</select>
			</div>
		</div>
	);
};

export default LanguageSwitcher;
