'use client';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

const SearchInput = () => {
	const t = useTranslations('home.searchInput');
	const [searchQuery, setSearchQuery] = useState('');
	console.log(process.env.NEXT_PUBLIC_APP_URL, 'NEXT_PUBLIC_APP_URL');

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		// Implement search functionality
		console.log('Search:', searchQuery);
	};

	return (
		<div className='mx-8 max-w-lg flex-1'>
			<div className='relative'>
				<Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform' />
				<Input
					type='text'
					placeholder={t('placeholder')}
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
					className='h-9 min-h-9 pl-10'
				/>
			</div>
		</div>
	);
};

export default SearchInput;
