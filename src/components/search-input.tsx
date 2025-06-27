// src/components/search-input.tsx
'use client';

import {
	memo,
	useCallback,
	useMemo,
	useRef,
	useState,
	useTransition,
} from 'react';
import { Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchInputProps {
	placeholder?: string;
	onSearch: (query: string) => void;
	onClear?: () => void;
	defaultValue?: string;
	debounceMs?: number;
	className?: string;
}

export const SearchInput = memo(
	({
		placeholder,
		onSearch,
		onClear,
		defaultValue = '',
		debounceMs = 300,
		className = '',
	}: SearchInputProps) => {
		const t = useTranslations('common');
		const [value, setValue] = useState(defaultValue);
		const [isPending, startTransition] = useTransition();
		const timeoutRef = useRef<NodeJS.Timeout>();

		const effectivePlaceholder = useMemo(
			() => placeholder || t('search'),
			[placeholder, t],
		);

		const handleInputChange = useCallback(
			(e: React.ChangeEvent<HTMLInputElement>) => {
				const newValue = e.target.value;
				setValue(newValue);

				if (timeoutRef.current) {
					clearTimeout(timeoutRef.current);
				}

				timeoutRef.current = setTimeout(() => {
					startTransition(() => {
						onSearch(newValue);
					});
				}, debounceMs);
			},
			[onSearch, debounceMs],
		);

		const handleClear = useCallback(() => {
			setValue('');

			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}

			startTransition(() => {
				onSearch('');
				onClear?.();
			});
		}, [onSearch, onClear]);

		const handleKeyDown = useCallback(
			(e: React.KeyboardEvent<HTMLInputElement>) => {
				if (e.key === 'Escape') {
					handleClear();
				}
			},
			[handleClear],
		);

		const showClearButton = useMemo(() => value.length > 0, [value.length]);

		return (
			<div className={`relative ${className}`}>
				<div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
					<Search
						className={`text-muted-foreground h-4 w-4 ${isPending ? 'animate-pulse' : ''}`}
					/>
				</div>

				<Input
					type='text'
					value={value}
					onChange={handleInputChange}
					onKeyDown={handleKeyDown}
					placeholder={effectivePlaceholder}
					className='pr-10 pl-10'
					autoComplete='off'
					spellCheck={false}
				/>

				{showClearButton && (
					<div className='absolute inset-y-0 right-0 flex items-center pr-3'>
						<Button
							type='button'
							variant='ghost'
							size='sm'
							onClick={handleClear}
							className='hover:bg-muted h-6 w-6 p-0'
							aria-label={t('clear')}
						>
							<X className='h-3 w-3' />
						</Button>
					</div>
				)}
			</div>
		);
	},
);

SearchInput.displayName = 'SearchInput';
