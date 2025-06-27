import { useTranslations } from 'next-intl';
import { db } from '@/lib/prisma';
import { ChapterCard } from './chapter-card';
import { Difficulty, Prisma } from '@prisma/client';

interface SearchParams {
	tab?: string;
	category?: string;
	difficulty?: Difficulty;
	search?: string;
	page?: string;
}

interface ChaptersHomeProps {
	locale: string;
	searchParams?: SearchParams;
}

type ChapterWithRelations = Prisma.ChapterGetPayload<{
	include: {
		tab: true;
		category: true;
		chapterTags: {
			include: {
				tag: true;
			};
		};
		_count: {
			select: {
				topics: {
					where: { isPublished: true };
				};
			};
		};
	};
}>;

type TabWithCount = Prisma.TabGetPayload<{
	include: {
		_count: {
			select: {
				chapters: {
					where: { isPublished: true };
				};
			};
		};
	};
}>;

export default async function ChaptersHome({
	locale,
	searchParams = {},
}: ChaptersHomeProps) {
	const t = useTranslations('chapters');

	const { tab, category, difficulty, search, page = '1' } = searchParams;

	const currentPage = Math.max(1, parseInt(page, 10) || 1);
	const pageSize = 24;
	const skip = (currentPage - 1) * pageSize;

	const whereCondition: Prisma.ChapterWhereInput = {
		isPublished: true,
	};

	if (tab) {
		whereCondition.tab = { slug: tab };
	}

	if (category) {
		whereCondition.category = { slug: category };
	}

	if (difficulty) {
		whereCondition.difficulty = difficulty;
	}

	if (search && search.trim()) {
		const searchTerm = search.trim();
		whereCondition.OR = [
			{
				titleEn: {
					contains: searchTerm,
					mode: 'insensitive',
				},
			},
			{
				titleRu: {
					contains: searchTerm,
					mode: 'insensitive',
				},
			},
			{
				descriptionEn: {
					contains: searchTerm,
					mode: 'insensitive',
				},
			},
			{
				descriptionRu: {
					contains: searchTerm,
					mode: 'insensitive',
				},
			},
		] as Prisma.ChapterWhereInput['OR'];
	}

	try {
		const [chapters, tabs, totalCount] = await Promise.all([
			db.chapter.findMany({
				where: whereCondition,
				include: {
					tab: true,
					category: true,
					chapterTags: {
						include: {
							tag: true,
						},
					},
					_count: {
						select: {
							topics: {
								where: { isPublished: true },
							},
						},
					},
				},
				orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
				skip,
				take: pageSize,
			}) as Promise<ChapterWithRelations[]>,

			db.tab.findMany({
				where: { isActive: true },
				include: {
					_count: {
						select: {
							chapters: {
								where: { isPublished: true },
							},
						},
					},
				},
				orderBy: { sortOrder: 'asc' },
			}) as Promise<TabWithCount[]>,

			db.chapter.count({
				where: whereCondition,
			}),
		]);

		const totalPages = Math.ceil(totalCount / pageSize);

		return (
			<div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50'>
				<section className='relative px-6 py-16 sm:py-24'>
					<div className='mx-auto max-w-7xl'>
						<div className='text-center'>
							<h1 className='text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl'>
								{t('hero.title')}
							</h1>
							<p className='mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-600'>
								{t('hero.description')}
							</p>

							<div className='mt-10 flex items-center justify-center gap-8'>
								<div className='text-center'>
									<div className='text-3xl font-bold text-blue-600'>
										{totalCount}
									</div>
									<div className='text-sm text-gray-500'>
										{t('stats.chapters')}
									</div>
								</div>
								<div className='text-center'>
									<div className='text-3xl font-bold text-green-600'>
										{chapters.reduce(
											(acc, chapter) => acc + chapter._count.topics,
											0,
										)}
									</div>
									<div className='text-sm text-gray-500'>
										{t('stats.topics')}
									</div>
								</div>
								<div className='text-center'>
									<div className='text-3xl font-bold text-purple-600'>
										{tabs.length}
									</div>
									<div className='text-sm text-gray-500'>
										{t('stats.categories')}
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				<section className='border-y border-gray-200 bg-white/50 px-6 py-8 backdrop-blur-sm'>
					<div className='mx-auto max-w-7xl'>
						<nav className='flex space-x-8 overflow-x-auto pb-2'>
							<a
								href={`/${locale}`}
								className={`rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
									!tab
										? 'bg-blue-100 text-blue-700'
										: 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
								}`}
							>
								{t('navigation.all')} ({totalCount})
							</a>
							{tabs.map((tabItem) => (
								<a
									key={tabItem.id}
									href={`/${locale}?tab=${tabItem.slug}`}
									className={`rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
										tab === tabItem.slug
											? 'bg-blue-100 text-blue-700'
											: 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
									}`}
								>
									{locale === 'ru' ? tabItem.titleRu : tabItem.titleEn} (
									{tabItem._count.chapters})
								</a>
							))}
						</nav>
					</div>
				</section>

				<section className='bg-white px-6 py-6'>
					<div className='mx-auto max-w-7xl'>
						<div className='flex flex-col items-center justify-between gap-4 sm:flex-row'>
							<div className='max-w-md flex-1'>
								<SearchInput
									locale={locale}
									initialValue={search || ''}
									placeholder={t('search.placeholder')}
								/>
							</div>

							<div className='flex gap-2'>
								<DifficultyFilter
									locale={locale}
									currentDifficulty={difficulty}
									currentTab={tab}
									currentCategory={category}
									currentSearch={search}
								/>
							</div>
						</div>
					</div>
				</section>

				<section className='px-6 py-12'>
					<div className='mx-auto max-w-7xl'>
						{chapters.length > 0 ? (
							<>
								<div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
									{chapters.map((chapter) => (
										<ChapterCard
											key={chapter.id}
											chapter={chapter}
											locale={locale}
										/>
									))}
								</div>

								{totalPages > 1 && (
									<div className='mt-12'>
										<Pagination
											currentPage={currentPage}
											totalPages={totalPages}
											locale={locale}
											searchParams={searchParams}
										/>
									</div>
								)}
							</>
						) : (
							<EmptyState
								title={t('empty.title')}
								description={t('empty.description')}
								locale={locale}
							/>
						)}
					</div>
				</section>
			</div>
		);
	} catch (error) {
		console.error('Error fetching chapters:', error);

		return (
			<div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50'>
				<div className='text-center'>
					<h2 className='mb-4 text-2xl font-bold text-gray-900'>
						{t('error.title')}
					</h2>
					<p className='mb-6 text-gray-600'>{t('error.description')}</p>
					<a
						href={`/${locale}`}
						className='inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
					>
						{t('error.retry')}
					</a>
				</div>
			</div>
		);
	}
}

const SearchInput = ({
	locale,
	initialValue,
	placeholder,
}: {
	locale: string;
	initialValue: string;
	placeholder: string;
}) => {
	return (
		<form method='GET' action={`/${locale}`} className='w-full'>
			<div className='relative'>
				<input
					type='text'
					name='search'
					defaultValue={initialValue}
					placeholder={placeholder}
					className='block w-full rounded-md border-gray-300 py-2 pr-4 pl-10 text-sm placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500'
				/>
				<div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
					<svg
						className='h-5 w-5 text-gray-400'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
						/>
					</svg>
				</div>
			</div>
		</form>
	);
};

const DifficultyFilter = ({
	locale,
	currentDifficulty,
	currentTab,
	currentCategory,
	currentSearch,
}: {
	locale: string;
	currentDifficulty?: Difficulty;
	currentTab?: string;
	currentCategory?: string;
	currentSearch?: string;
}) => {
	const buildUrl = (difficulty?: Difficulty) => {
		const params = new URLSearchParams();
		if (currentTab) params.set('tab', currentTab);
		if (currentCategory) params.set('category', currentCategory);
		if (currentSearch) params.set('search', currentSearch);
		if (difficulty) params.set('difficulty', difficulty);

		const queryString = params.toString();

		return `/${locale}${queryString ? `?${queryString}` : ''}`;
	};

	const difficulties: { value: Difficulty; label: string }[] = [
		{ value: 'BEGINNER', label: 'Начинающий' },
		{ value: 'INTERMEDIATE', label: 'Средний' },
		{ value: 'ADVANCED', label: 'Продвинутый' },
		{ value: 'EXPERT', label: 'Эксперт' },
	];

	return (
		<div className='flex gap-2'>
			<a
				href={buildUrl()}
				className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
					!currentDifficulty
						? 'bg-blue-100 text-blue-700'
						: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
				}`}
			>
				Все
			</a>
			{difficulties.map((diff) => (
				<a
					key={diff.value}
					href={buildUrl(diff.value)}
					className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
						currentDifficulty === diff.value
							? 'bg-blue-100 text-blue-700'
							: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
					}`}
				>
					{diff.label}
				</a>
			))}
		</div>
	);
};

const Pagination = ({
	currentPage,
	totalPages,
	locale,
	searchParams,
}: {
	currentPage: number;
	totalPages: number;
	locale: string;
	searchParams: SearchParams;
}) => {
	const buildPageUrl = (page: number) => {
		const params = new URLSearchParams();
		const { tab, category, difficulty, search } = searchParams;
		if (tab) params.set('tab', tab);
		if (category) params.set('category', category);
		if (difficulty) params.set('difficulty', difficulty);
		if (search) params.set('search', search);
		if (page > 1) params.set('page', page.toString());

		const queryString = params.toString();

		return `/${locale}${queryString ? `?${queryString}` : ''}`;
	};

	const getPageNumbers = () => {
		const delta = 2;
		const range = [];
		const rangeWithDots = [];

		for (
			let i = Math.max(2, currentPage - delta);
			i <= Math.min(totalPages - 1, currentPage + delta);
			i++
		) {
			range.push(i);
		}

		if (currentPage - delta > 2) {
			rangeWithDots.push(1, '...');
		} else {
			rangeWithDots.push(1);
		}

		rangeWithDots.push(...range);

		if (currentPage + delta < totalPages - 1) {
			rangeWithDots.push('...', totalPages);
		} else if (totalPages > 1) {
			rangeWithDots.push(totalPages);
		}

		return rangeWithDots;
	};

	return (
		<nav className='flex items-center justify-center space-x-2'>
			{currentPage > 1 && (
				<a
					href={buildPageUrl(currentPage - 1)}
					className='rounded-md px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700'
				>
					← Предыдущая
				</a>
			)}

			{getPageNumbers().map((page, index) => {
				if (page === '...') {
					return (
						<span
							key={`dots-${index}`}
							className='px-3 py-2 text-sm text-gray-400'
						>
							...
						</span>
					);
				}

				return (
					<a
						key={page}
						href={buildPageUrl(page as number)}
						className={`rounded-md px-3 py-2 text-sm ${
							page === currentPage
								? 'bg-blue-600 text-white'
								: 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
						}`}
					>
						{page}
					</a>
				);
			})}

			{currentPage < totalPages && (
				<a
					href={buildPageUrl(currentPage + 1)}
					className='rounded-md px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700'
				>
					Следующая →
				</a>
			)}
		</nav>
	);
};

const EmptyState = ({
	title,
	description,
	locale,
}: {
	title: string;
	description: string;
	locale: string;
}) => {
	return (
		<div className='py-12 text-center'>
			<div className='mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100'>
				<svg
					className='h-12 w-12 text-gray-400'
					fill='none'
					stroke='currentColor'
					viewBox='0 0 24 24'
				>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={1.5}
						d='M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25'
					/>
				</svg>
			</div>
			<h3 className='mb-2 text-lg font-medium text-gray-900'>{title}</h3>
			<p className='mb-6 text-gray-500'>{description}</p>
			<a
				href={`/${locale}`}
				className='inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700'
			>
				Посмотреть все главы
			</a>
		</div>
	);
};
