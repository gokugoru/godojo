// src/components/home/home-header.tsx
'use client';

import { memo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { SearchInput } from '@/components/search-input';

interface HomeHeaderProps {
	readonly title: string;
	readonly description: string;
}

export const HomeHeader = memo(({ title, description }: HomeHeaderProps) => {
	const router = useRouter();
	const t = useTranslations('home.searchInput');

	const handleSearch = useCallback(
		(query: string) => {
			if (query.trim()) {
				const searchParams = new URLSearchParams();
				searchParams.set('search', query.trim());
				router.push(`/chapters?${searchParams.toString()}`);
			}
		},
		[router],
	);

	const handleClear = useCallback(() => {
		// Optional: можно добавить аналитику или другую логику при очистке
	}, []);

	return (
		<div className='border-b pb-8 text-center'>
			<div className='mb-6 space-y-4'>
				<h1 className='text-foreground text-3xl font-bold'>{title}</h1>
				<p className='text-muted-foreground mx-auto max-w-3xl text-lg leading-relaxed'>
					{description}
				</p>
			</div>
			<div className='flex justify-center'>
				<SearchInput
					placeholder={t('placeholder')}
					onSearch={handleSearch}
					onClear={handleClear}
					className='w-full max-w-md'
					debounceMs={500}
				/>
			</div>
		</div>
	);
});

HomeHeader.displayName = 'HomeHeader';
