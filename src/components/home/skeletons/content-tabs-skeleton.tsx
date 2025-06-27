// src/components/home/skeletons/content-tabs-skeleton.tsx
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { nanoid } from 'nanoid';

export const ContentTabsSkeleton = (): JSX.Element => {
	return (
		<div className='w-full space-y-6'>
			<div className='bg-muted flex space-x-1 rounded-lg p-1'>
				{Array.from({ length: 3 }, (_, index) => (
					<div key={index} className='flex-1 rounded-md p-3'>
						<Skeleton className='mx-auto mb-1 h-4 w-20' />
						<Skeleton className='mx-auto h-3 w-16' />
					</div>
				))}
			</div>

			<Card>
				<CardHeader>
					<Skeleton className='h-8 w-48' />
					<Skeleton className='h-5 w-full' />
				</CardHeader>

				<CardContent className='space-y-8'>
					{Array.from({ length: 2 }, (_, chapterIndex) => (
						<Card key={nanoid()} className='border-l-muted border-l-4'>
							<CardHeader>
								<div className='flex items-center justify-between'>
									<div className='flex items-center gap-3'>
										<Skeleton className='h-6 w-48' />
										{chapterIndex === 0 && <Skeleton className='h-5 w-20' />}
									</div>
								</div>

								<div className='flex items-center gap-6'>
									<Skeleton className='h-4 w-20' />
									<Skeleton className='h-4 w-24' />
								</div>

								{chapterIndex === 0 && <Skeleton className='h-2 w-full' />}
							</CardHeader>

							<CardContent>
								<div className='grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3'>
									{Array.from(
										{ length: chapterIndex === 0 ? 10 : 3 },
										(_, itemIndex) => (
											<div
												key={itemIndex}
												className='flex items-start gap-3 p-3'
											>
												<Skeleton className='h-5 w-12 flex-shrink-0' />
												<Skeleton className='h-4 w-full' />
											</div>
										),
									)}
								</div>
							</CardContent>
						</Card>
					))}
				</CardContent>
			</Card>
		</div>
	);
};
