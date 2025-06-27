// src/components/chapters/chapters-skeleton.tsx
export const ChaptersSkeleton = () => {
	return (
		<div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50'>
			<section className='relative px-6 py-16 sm:py-24'>
				<div className='mx-auto max-w-7xl'>
					<div className='text-center'>
						<div className='mx-auto mb-6 h-12 max-w-2xl animate-pulse rounded-lg bg-gray-300 sm:h-16' />

						<div className='mx-auto mb-10 max-w-3xl space-y-3'>
							<div className='mx-auto h-4 w-3/4 animate-pulse rounded bg-gray-200' />
							<div className='mx-auto h-4 w-1/2 animate-pulse rounded bg-gray-200' />
						</div>

						<div className='flex items-center justify-center gap-8'>
							{[1, 2, 3].map((i) => (
								<div key={i} className='text-center'>
									<div className='mb-2 h-8 w-16 animate-pulse rounded bg-gray-300' />
									<div className='h-3 w-12 animate-pulse rounded bg-gray-200' />
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			<section className='border-y border-gray-200 bg-white/50 px-6 py-8 backdrop-blur-sm'>
				<div className='mx-auto max-w-7xl'>
					<div className='flex space-x-8 overflow-x-auto pb-2'>
						{[1, 2, 3, 4, 5].map((i) => (
							<div
								key={i}
								className='h-8 w-24 flex-shrink-0 animate-pulse rounded-lg bg-gray-200'
							/>
						))}
					</div>
				</div>
			</section>

			<section className='bg-white px-6 py-6'>
				<div className='mx-auto max-w-7xl'>
					<div className='flex flex-col items-center justify-between gap-4 sm:flex-row'>
						<div className='max-w-md flex-1'>
							<div className='h-10 animate-pulse rounded-md bg-gray-200' />
						</div>

						<div className='flex gap-2'>
							{[1, 2, 3, 4, 5].map((i) => (
								<div
									key={i}
									className='h-6 w-16 animate-pulse rounded-full bg-gray-200'
								/>
							))}
						</div>
					</div>
				</div>
			</section>

			<section className='px-6 py-12'>
				<div className='mx-auto max-w-7xl'>
					<div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
						{Array.from({ length: 12 }, (_, i) => (
							<ChapterCardSkeleton key={i} />
						))}
					</div>
				</div>
			</section>
		</div>
	);
};

const ChapterCardSkeleton = () => {
	return (
		<div className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm'>
			<div className='flex items-start justify-between p-4 pb-0'>
				<div className='h-5 w-20 animate-pulse rounded bg-gray-200' />
				<div className='h-5 w-16 animate-pulse rounded bg-gray-200' />
			</div>

			<div className='p-6 pt-2'>
				<div className='mb-2 h-4 w-24 animate-pulse rounded bg-gray-200' />

				<div className='mb-3 space-y-2'>
					<div className='h-5 w-full animate-pulse rounded bg-gray-300' />
					<div className='h-5 w-3/4 animate-pulse rounded bg-gray-300' />
				</div>

				<div className='mb-4 space-y-2'>
					<div className='h-4 w-full animate-pulse rounded bg-gray-200' />
					<div className='h-4 w-full animate-pulse rounded bg-gray-200' />
					<div className='h-4 w-2/3 animate-pulse rounded bg-gray-200' />
				</div>

				<div className='mb-4 flex flex-wrap gap-1'>
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className='h-6 w-16 animate-pulse rounded-md bg-gray-200'
						/>
					))}
				</div>

				<div className='flex items-center justify-between border-t border-gray-100 pt-4'>
					<div className='flex items-center gap-4'>
						<div className='h-4 w-16 animate-pulse rounded bg-gray-200' />
						<div className='h-4 w-12 animate-pulse rounded bg-gray-200' />
					</div>

					<div className='h-5 w-20 animate-pulse rounded bg-gray-200' />
				</div>
			</div>
		</div>
	);
};
