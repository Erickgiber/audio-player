import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
	plugins: [
		sveltekit(),
		SvelteKitPWA({
			srcDir: './src',
			mode: 'production',
			strategies: 'generateSW',
			scope: '/',
			base: '/',
			selfDestroying: false,
			manifest: {
				short_name: 'Audio Player',
				name: 'Offline Audio Player',
				start_url: '/',
				scope: '/',
				display: 'standalone',
				theme_color: '#1a1a1a',
				background_color: '#1a1a1a',
				icons: [
					{
						src: '/icon-192.png',
						type: 'image/png',
						sizes: '192x192'
					},
					{
						src: '/icon-512.png',
						type: 'image/png',
						sizes: '512x512'
					},
					{
						src: '/icon-512.png',
						type: 'image/png',
						sizes: '512x512',
						purpose: 'any maskable'
					}
				]
			},
			injectManifest: {
				globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}']
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
				// Don't cache user audio files
				navigateFallback: null,
				runtimeCaching: []
			},
			devOptions: {
				enabled: true,
				suppressWarnings: process.env.SUPPRESS_WARNING === 'true',
				type: 'module',
				navigateFallback: '/'
			}
		})
	]
});
