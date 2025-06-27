// src/components/chapters/chapter-card.tsx
import Link from 'next/link';
import { Clock, BookOpen, Tag, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Prisma } from '@prisma/client';

type ChapterWithRelations = Prisma.ModuleGetPayload<{
	include: {
		tab: true;
		category: true;
		moduleTags: {
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

interface ChapterCardProps {
	chapter: ChapterWithRelations;
	locale: string;
}

const difficultyConfig = {
	BEGINNER: {
		label: 'Начинающий',
		color: 'bg-green-100 text-green-800',
		labelEn: 'Beginner',
	},
	INTERMEDIATE: {
		label: 'Средний',
		color: 'bg-yellow-100 text-yellow-800',
		labelEn: 'Intermediate',
	},
	ADVANCED: {
		label: 'Продвинутый',
		color: 'bg-orange-100 text-orange-800',
		labelEn: 'Advanced',
	},
	EXPERT: {
		label: 'Эксперт',
		color: 'bg-red-100 text-red-800',
		labelEn: 'Expert',
	},
} as const;

export const ChapterCard = ({ chapter, locale }: ChapterCardProps) => {
	const title = locale === 'ru' ? chapter.titleRu : chapter.titleEn;
	const description =
		locale === 'ru' ? chapter.descriptionRu : chapter.descriptionEn;
	const tabTitle = locale === 'ru' ? chapter.tab.titleRu : chapter.tab.titleEn;
	const categoryTitle = chapter.category
		? locale === 'ru'
			? chapter.category.titleRu
			: chapter.category.titleEn
		: null;

	const difficultyInfo = difficultyConfig[chapter.difficulty];
	const difficultyLabel =
		locale === 'ru' ? difficultyInfo.label : difficultyInfo.labelEn;

	return (
		<div className='group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:border-gray-300 hover:shadow-lg'>
			<div className='absolute top-4 left-4 z-10'>
				<Badge variant='secondary' className='text-xs font-medium'>
					{tabTitle}
				</Badge>
			</div>

			{chapter.isFaang && (
				<div className='absolute top-4 right-4 z-10'>
					<Badge className='bg-gradient-to-r from-purple-500 to-blue-600 text-xs font-medium text-white'>
						<Star className='mr-1 h-3 w-3' />
						FAANG
					</Badge>
				</div>
			)}

			<Link href={`/${locale}/topic/${chapter.slug}`}>
				<div className='p-6 pt-16'>
					{categoryTitle && (
						<p className='mb-2 text-sm font-medium text-gray-500'>
							{categoryTitle}
						</p>
					)}

					<h3 className='mb-3 line-clamp-2 text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600'>
						{title}
					</h3>

					{description && (
						<p className='mb-4 line-clamp-3 text-sm text-gray-600'>
							{description}
						</p>
					)}

					{chapter.moduleTags.length > 0 && (
						<div className='mb-4 flex flex-wrap gap-1'>
							{chapter.moduleTags.slice(0, 3).map(({ tag }) => (
								<span
									key={tag.id}
									className='inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700'
								>
									<Tag className='mr-1 h-3 w-3' />
									{locale === 'ru' ? tag.nameRu : tag.nameEn}
								</span>
							))}
							{chapter.moduleTags.length > 3 && (
								<span className='inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500'>
									+{chapter.moduleTags.length - 3}
								</span>
							)}
						</div>
					)}

					<div className='flex items-center justify-between border-t border-gray-100 pt-4'>
						<div className='flex items-center gap-4 text-sm text-gray-500'>
							<div className='flex items-center gap-1'>
								<BookOpen className='h-4 w-4' />
								<span>{chapter._count.topics} тем</span>
							</div>
							{chapter.estimatedHours > 0 && (
								<div className='flex items-center gap-1'>
									<Clock className='h-4 w-4' />
									<span>{chapter.estimatedHours}ч</span>
								</div>
							)}
						</div>

						<Badge className={`text-xs font-medium ${difficultyInfo.color}`}>
							{difficultyLabel}
						</Badge>
					</div>
				</div>

				<div className='pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 transition-all duration-300 group-hover:from-blue-500/5 group-hover:to-purple-500/5' />
			</Link>
		</div>
	);
};
