// src/components/providers/toast-provider.tsx
'use client';

import { Toaster } from '@/components/ui/sonner';
import { useTheme } from 'next-themes';
import { memo } from 'react';
import { ToasterProps } from 'sonner';

export const ToastProvider = memo(() => {
	const { theme } = useTheme();

	return (
		<Toaster
			theme={theme as ToasterProps['theme']}
			position='top-center'
			visibleToasts={5}
			closeButton
		/>
	);
});

ToastProvider.displayName = 'ToastProvider';
