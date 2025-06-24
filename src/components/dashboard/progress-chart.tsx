import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BarChart3, TrendingUp } from 'lucide-react';

export const ProgressChart = ({ userId }: { userId: string }) => {
	const t = useTranslations('progress');
	console.log(t, userId);

	return (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center gap-2'>
					<TrendingUp className='h-5 w-5' />
					{t('progressChart')}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='border-muted-foreground/25 flex h-64 items-center justify-center rounded-lg border-2 border-dashed'>
					<div className='text-center'>
						<BarChart3 className='text-muted-foreground mx-auto mb-2 h-12 w-12' />
						<p className='text-muted-foreground text-sm'>
							Progress chart will be implemented with chart library
						</p>
						<p className='text-muted-foreground mt-1 text-xs'>
							Consider using Recharts or Chart.js
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
