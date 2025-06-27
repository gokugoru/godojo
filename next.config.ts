// next.config.ts
import createNextIntlPlugin from 'next-intl/plugin';
import { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./src/i18n/requests.ts');

const nextConfig: NextConfig = {
	// Добавляем оптимизации производительности
	experimental: {
		optimizePackageImports: [
			'lucide-react',
			'@radix-ui/react-avatar',
			'@radix-ui/react-dialog',
			'@radix-ui/react-dropdown-menu',
			'@radix-ui/react-label',
			'@radix-ui/react-progress',
			'@radix-ui/react-separator',
			'@radix-ui/react-slot',
			'@radix-ui/react-tabs',
		],
	},

	// Оптимизация изображений
	images: {
		formats: ['image/webp', 'image/avif'],
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
	},

	// Настройки компилятора
	compiler: {
		removeConsole: process.env.NODE_ENV === 'production',
	},

	// Webpack оптимизации
	webpack: (config, { dev, isServer }) => {
		// Анализатор bundle (только в dev режиме)
		if (process.env.ANALYZE && !isServer) {
			// Динамический импорт для избежания require()
			const { BundleAnalyzerPlugin } = eval('require')(
				'webpack-bundle-analyzer',
			);
			config.plugins.push(
				new BundleAnalyzerPlugin({
					analyzerMode: 'server',
					openAnalyzer: true,
				}),
			);
		}

		// Tree shaking оптимизации
		if (!dev) {
			config.optimization = {
				...config.optimization,
				usedExports: true,
				sideEffects: false,
			};
		}

		return config;
	},
};

// Bundle analyzer конфигурация
const bundleAnalyzer =
	process.env.ANALYZE === 'true'
		? eval('require')('@next/bundle-analyzer')({ enabled: true })
		: (config: NextConfig) => config;

// Применяем плагины в правильном порядке
export default bundleAnalyzer(withNextIntl(nextConfig));
