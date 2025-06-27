// src/components/home/home-header.tsx

import React from 'react';
import SearchInput from '@/components/search-input';

interface HomeHeaderProps {
	readonly title: string;
	readonly description: string;
}

export const HomeHeader = async ({ title, description }: HomeHeaderProps) => {
	return (
		<div className='border-b pb-8 text-center'>
			<div className='mb-6 space-y-4'>
				<h1 className='text-3xl font-bold text-gray-900'>{title}</h1>
				<p className='mx-auto max-w-3xl text-lg leading-relaxed text-gray-600'>
					{description}
				</p>
			</div>
			<div className='flex justify-center'>
				<SearchInput />
			</div>
		</div>
	);
};
