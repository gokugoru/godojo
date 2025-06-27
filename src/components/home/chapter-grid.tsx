// src/components/home/chapter-grid.tsx
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Clock, BookOpen, Play } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ChapterGridProps {
	readonly locale: string;
	readonly searchParams?: {
		readonly tab?: string;
		readonly category?: string;
		readonly difficulty?: string;
		readonly search?: string;
		readonly page?: string;
	};
}

type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

interface Chapter {
	readonly id: string;
	readonly titleKey: string;
	readonly descriptionKey: string;
	readonly difficulty: DifficultyLevel;
	readonly topicsCount: number;
	readonly completedTopics: number;
	readonly estimatedTimeKey: string;
	readonly tags: readonly string[];
}

const mockChapters: readonly Chapter[] = [
	{
		id: '1',
		titleKey: 'setup.title',
		descriptionKey: 'setup.description',
		difficulty: 'BEGINNER',
		topicsCount: 10,
		completedTopics: 8,
		estimatedTimeKey: 'setup.time',
		tags: ['setup', 'tools', 'environment'],
	},
	{
		id: '2',
		titleKey: 'core.title',
		descriptionKey: 'core.description',
		difficulty: 'BEGINNER',
		topicsCount: 15,
		completedTopics: 0,
		estimatedTimeKey: 'core.time',
		tags: ['syntax', 'basics', 'types'],
	},
	{
		id: '3',
		titleKey: 'concurrency.title',
		descriptionKey: 'concurrency.description',
		difficulty: 'INTERMEDIATE',
		topicsCount: 12,
		completedTopics: 0,
		estimatedTimeKey: 'concurrency.time',
		tags: ['goroutines', 'channels', 'concurrency'],
	},
	{
		id: '4',
		titleKey: 'http.title',
		descriptionKey: 'http.description',
		difficulty: 'INTERMEDIATE',
		topicsCount: 18,
		completedTopics: 0,
		estimatedTimeKey: 'http.time',
		tags: ['http', 'web', 'api', 'microservices'],
	},
	{
		id: '5',
		titleKey: 'database.title',
		descriptionKey: 'database.description',
		difficulty: 'ADVANCED',
		topicsCount: 14,
		completedTopics: 0,
		estimatedTimeKey: 'database.time',
		tags: ['database', 'sql', 'orm', 'optimization'],
	},
	{
		id: '6',
		titleKey: 'systemDesign.title',
		descriptionKey: 'systemDesign.description',
		difficulty: 'EXPERT',
		topicsCount: 20,
		completedTopics: 0,
		estimatedTimeKey: 'systemDesign.time',
		tags: ['architecture', 'scalability', 'patterns'],
	},
] as const;

const getDifficultyVariant = (
	difficulty: DifficultyLevel,
): 'default' | 'secondary' | 'destructive' | 'outline' => {
	const variantMap: Record<
		DifficultyLevel,
		'default' | 'secondary' | 'destructive' | 'outline'
	> = {
		BEGINNER: 'default',
		INTERMEDIATE: 'secondary',
		ADVANCED: 'outline',
		EXPERT: 'destructive',
	} as const;

	return variantMap[difficulty];
};

const calculateProgress = (completed: number, total: number): number =>
	total > 0 ? Math.round((completed / total) * 100) : 0;

export const ChapterGrid = ({
	locale,
	searchParams,
}: ChapterGridProps): JSX.Element => {
	const t = useTranslations('home.chapters');
	const tDifficulty = useTranslations('common.difficulty');
	console.log(locale, searchParams);

	return (
		<div className='space-y-6'>
			<div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
				{mockChapters.map((chapter) => {
					const progressPercentage = calculateProgress(
						chapter.completedTopics,
						chapter.topicsCount,
					);
					const isStarted = chapter.completedTopics > 0;

					return (
						<Card
							key={chapter.id}
							className='flex h-full flex-col transition-all duration-200 hover:shadow-lg'
						>
							<CardHeader className='pb-3'>
								<div className='flex items-start justify-between gap-2'>
									<CardTitle className='text-lg leading-tight'>
										{t(chapter.titleKey)}
									</CardTitle>
									<Badge variant={getDifficultyVariant(chapter.difficulty)}>
										{tDifficulty(chapter.difficulty.toLowerCase())}
									</Badge>
								</div>
							</CardHeader>

							<CardContent className='flex-1 space-y-4'>
								<CardDescription className='line-clamp-3 text-sm'>
									{t(chapter.descriptionKey)}
								</CardDescription>

								<div className='space-y-3'>
									<div className='flex items-center justify-between text-sm'>
										<div className='flex items-center gap-2'>
											<BookOpen className='text-muted-foreground h-4 w-4' />
											<span className='text-muted-foreground'>
												{t('progress')}
											</span>
										</div>
										<span className='font-medium'>
											{chapter.completedTopics}/{chapter.topicsCount}{' '}
											{t('lessons')}
										</span>
									</div>

									<Progress value={progressPercentage} className='w-full' />

									<div className='text-muted-foreground flex items-center justify-between text-sm'>
										<div className='flex items-center gap-2'>
											<Clock className='h-4 w-4' />
											<span>{t(chapter.estimatedTimeKey)}</span>
										</div>
										<span className='font-medium'>{progressPercentage}%</span>
									</div>
								</div>

								<div className='flex flex-wrap gap-2'>
									{chapter.tags.slice(0, 3).map((tag) => (
										<Badge key={tag} variant='outline' className='text-xs'>
											{tag}
										</Badge>
									))}
									{chapter.tags.length > 3 && (
										<Badge variant='outline' className='text-xs'>
											+{chapter.tags.length - 3}
										</Badge>
									)}
								</div>
							</CardContent>

							<CardFooter className='pt-3'>
								<Button
									className='w-full'
									variant={isStarted ? 'default' : 'outline'}
								>
									<Play className='mr-2 h-4 w-4' />
									{isStarted ? t('continue') : t('start')}
								</Button>
							</CardFooter>
						</Card>
					);
				})}
			</div>
		</div>
	);
};
