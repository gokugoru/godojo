// src/components/home/content-tabs.tsx
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTranslations } from 'next-intl';

interface ContentTabsProps {
	readonly locale: string;
}

interface Topic {
	readonly id: string;
	readonly title: string;
	readonly href: string;
}

interface Chapter {
	readonly title: string;
	readonly badge?: string;
	readonly time: string;
	readonly progress: number;
	readonly topics: readonly Topic[];
}

export const ContentTabs = ({ locale }: ContentTabsProps): JSX.Element => {
	const t = useTranslations('home.tabs');
	console.log(t, locale);

	const tabs = [
		{ key: 'all', title: 'ВСЕ МОДУЛИ', subtitle: 'Go Language', active: true },
		{ key: 'db', title: 'БАЗЫ ДАННЫХ', subtitle: 'SQL & NoSQL', active: false },
		{ key: 'net', title: 'СЕТЬ', subtitle: 'HTTP & Protocols', active: false },
	] as const;

	const chapters: readonly Chapter[] = [
		{
			title: 'Go Fundamentals',
			badge: 'FAANG Focus',
			time: '5 недель',
			progress: 75,
			topics: [
				{
					id: '1.1.1',
					title: 'Go installation: binary, source, version management',
					href: '#',
				},
				{ id: '1.1.2', title: 'GOPATH vs Go modules history', href: '#' },
				{
					id: '1.1.3',
					title: 'go command: build, run, install, clean, env',
					href: '#',
				},
				{ id: '1.1.4', title: 'go fmt: code formatting standards', href: '#' },
				{
					id: '1.1.5',
					title: 'go vet: static analysis, common mistakes',
					href: '#',
				},
				{
					id: '1.1.6',
					title: 'go mod: init, tidy, download, vendor',
					href: '#',
				},
				{ id: '1.1.7', title: 'go doc: documentation generation', href: '#' },
				{ id: '1.1.8', title: 'go test: testing commands, flags', href: '#' },
				{ id: '1.1.9', title: 'Cross compilation: GOOS, GOARCH', href: '#' },
				{
					id: '1.1.10',
					title: 'Build tags and conditional compilation',
					href: '#',
				},
			],
		},
		{
			title: 'Language Core',
			time: '2 недели',
			progress: 0,
			topics: [
				{
					id: '1.2.1',
					title: 'Go philosophy: simplicity, readability, performance',
					href: '#',
				},
				{
					id: '1.2.7',
					title: 'Arrays and slices: internals, performance',
					href: '#',
				},
				{
					id: '1.2.13',
					title: 'Type inference: explicit vs implicit',
					href: '#',
				},
			],
		},
	] as const;

	return (
		<div className='space-y-6'>
			{/* Tabs */}
			<div className='grid grid-cols-3 gap-4'>
				{tabs.map((tab) => (
					<div
						key={tab.key}
						className={`cursor-pointer rounded-lg border-2 p-4 text-center transition-all ${
							tab.active
								? 'border-blue-200 bg-blue-50'
								: 'border-gray-200 hover:border-gray-300'
						}`}
					>
						<div
							className={`text-sm font-semibold ${tab.active ? 'text-blue-700' : 'text-gray-600'}`}
						>
							{tab.title}
						</div>
						<div className='mt-1 text-xs text-gray-500'>{tab.subtitle}</div>
					</div>
				))}
			</div>

			{/* Contents */}
			<div className='space-y-6'>
				<div>
					<h2 className='mb-2 text-2xl font-bold text-gray-900'>Contents</h2>
					<p className='leading-relaxed text-gray-600'>
						Модули организованы от базовых Go концепций к продвинутым системным
						паттернам. Затем есть дополнительные циклы статей на различные темы.
					</p>
				</div>

				{/* Chapters */}
				<div className='space-y-8'>
					{chapters.map((chapter) => (
						<div key={chapter.title} className='space-y-4'>
							<div className='flex flex-wrap items-center gap-3'>
								<h3 className='text-xl font-semibold text-gray-900'>
									{chapter.title}
								</h3>
								{chapter.badge && (
									<Badge className='bg-orange-100 text-orange-700 hover:bg-orange-100'>
										{chapter.badge}
									</Badge>
								)}
							</div>

							<div className='flex items-center gap-6 text-sm text-gray-600'>
								<div className='flex items-center gap-1'>
									<span>📅</span>
									<span>{chapter.time}</span>
								</div>
								<div className='flex items-center gap-1'>
									<span>📊</span>
									<span>{chapter.progress}% завершено</span>
								</div>
							</div>

							{chapter.progress > 0 && (
								<div className='space-y-2'>
									<div className='text-sm text-gray-600'>Прогресс модуля</div>
									<Progress value={chapter.progress} className='h-2' />
								</div>
							)}

							{/* Topics Grid */}
							<div className='grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3'>
								{chapter.topics.map((topic) => (
									<a
										key={topic.id}
										href={topic.href}
										className='group flex items-start gap-3 rounded-md p-3 text-left transition-colors hover:bg-gray-50'
									>
										<span className='mt-0.5 min-w-[2.5rem] flex-shrink-0 font-mono text-xs text-gray-500'>
											{topic.id}
										</span>
										<span className='text-sm leading-tight text-gray-700 transition-colors group-hover:text-blue-600'>
											{topic.title}
										</span>
									</a>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};
