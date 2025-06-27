// src/components/language-switcher.tsx
'use client';

import { memo, useCallback, useMemo, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const LOCALES = [
	{ code: 'en', name: 'English', flag: '🇺🇸' },
	{ code: 'ru', name: 'Русский', flag: '🇷🇺' },
] as const;

type Locale = (typeof LOCALES)[number]['code'];

const LocaleItem = memo(
	({
		locale,
		isActive,
		onClick,
	}: {
		locale: (typeof LOCALES)[number];
		isActive: boolean;
		onClick: () => void;
	}) => (
		<DropdownMenuItem
			onClick={onClick}
			className={`flex items-center gap-2 ${isActive ? 'bg-accent' : ''}`}
		>
			<span className='text-base'>{locale.flag}</span>
			<span className={isActive ? 'font-medium' : ''}>{locale.name}</span>
			{isActive && (
				<span className='text-muted-foreground ml-auto text-xs'>✓</span>
			)}
		</DropdownMenuItem>
	),
);

export const LanguageSwitcher = memo(() => {
	const locale = useLocale() as Locale;
	const router = useRouter();
	const pathname = usePathname();
	const [isPending, startTransition] = useTransition();
	const t = useTranslations('common');

	const currentLocale = useMemo(
		() => LOCALES.find((l) => l.code === locale) || LOCALES[0],
		[locale],
	);

	const handleLocaleChange = useCallback(
		(newLocale: Locale) => {
			if (newLocale === locale) return;

			startTransition(() => {
				const segments = pathname.split('/');
				segments[1] = newLocale;
				const newPath = segments.join('/');
				router.push(newPath);
			});
		},
		[locale, pathname, router],
	);

	const localeItems = useMemo(
		() =>
			LOCALES.map((localeOption) => (
				<LocaleItem
					key={localeOption.code}
					locale={localeOption}
					isActive={localeOption.code === locale}
					onClick={() => handleLocaleChange(localeOption.code)}
				/>
			)),
		[locale, handleLocaleChange],
	);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant='ghost'
					size='sm'
					className='flex items-center gap-2'
					disabled={isPending}
					aria-label={t('changeLanguage')}
				>
					<Globe className='h-4 w-4' />
					<span className='text-base'>{currentLocale.flag}</span>
					<span className='hidden sm:inline'>
						{currentLocale.code.toUpperCase()}
					</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end' className='w-36'>
				{localeItems}
			</DropdownMenuContent>
		</DropdownMenu>
	);
});

LanguageSwitcher.displayName = 'LanguageSwitcher';
LocaleItem.displayName = 'LocaleItem';
