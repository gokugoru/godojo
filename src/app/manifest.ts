// src/app/manifest.ts
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: 'Go Dojo - Learn Go Programming',
		short_name: 'Go Dojo',
		description:
			'Master Go programming with comprehensive tutorials, hands-on projects, and real-world examples for backend development.',
		start_url: '/',
		display: 'standalone',
		background_color: '#ffffff',
		theme_color: '#0066cc',
		orientation: 'portrait-primary',
		categories: ['education', 'productivity', 'developer'],
		lang: 'en',
		dir: 'ltr',
		scope: '/',
		icons: [
			{
				src: '/icons/icon-72x72.png',
				sizes: '72x72',
				type: 'image/png',
				purpose: 'any',
			},
			{
				src: '/icons/icon-96x96.png',
				sizes: '96x96',
				type: 'image/png',
				purpose: 'any',
			},
			{
				src: '/icons/icon-128x128.png',
				sizes: '128x128',
				type: 'image/png',
				purpose: 'any',
			},
			{
				src: '/icons/icon-144x144.png',
				sizes: '144x144',
				type: 'image/png',
				purpose: 'any',
			},
			{
				src: '/icons/icon-152x152.png',
				sizes: '152x152',
				type: 'image/png',
				purpose: 'any',
			},
			{
				src: '/icons/icon-192x192.png',
				sizes: '192x192',
				type: 'image/png',
				purpose: 'maskable',
			},
			{
				src: '/icons/icon-384x384.png',
				sizes: '384x384',
				type: 'image/png',
				purpose: 'any',
			},
			{
				src: '/icons/icon-512x512.png',
				sizes: '512x512',
				type: 'image/png',
				purpose: 'maskable',
			},
		],
		screenshots: [
			{
				src: '/images/screenshot-wide.png',
				sizes: '1280x720',
				type: 'image/png',
				form_factor: 'wide',
			},
			{
				src: '/images/screenshot-narrow.png',
				sizes: '720x1280',
				type: 'image/png',
				form_factor: 'narrow',
			},
		],
		shortcuts: [
			{
				name: 'Learn Go Modules',
				short_name: 'Modules',
				description: 'Browse all Go programming modules',
				url: '/modules',
				icons: [
					{
						src: '/icons/shortcut-modules.png',
						sizes: '96x96',
						type: 'image/png',
					},
				],
			},
			{
				name: 'Go Tutorials',
				short_name: 'Tutorials',
				description: 'Access Go programming tutorials',
				url: '/topic',
				icons: [
					{
						src: '/icons/shortcut-tutorials.png',
						sizes: '96x96',
						type: 'image/png',
					},
				],
			},
		],
		related_applications: [
			{
				platform: 'webapp',
				url: 'https://godojo.dev',
			},
		],
		prefer_related_applications: false,
	};
}
