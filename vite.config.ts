import { fileURLToPath, URL } from 'url';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import environment from 'vite-plugin-environment';
import dotenv from 'dotenv';
import path from 'path';
import GlobalPolyFill from "@esbuild-plugins/node-globals-polyfill";

dotenv.config({ path: '../../.env' });

export default defineConfig({
	build: {
		emptyOutDir: true
	},
	optimizeDeps: {
		esbuildOptions: {
			define: {
				global: 'globalThis'
			}
		},
		include: ['buffer'] // Ensure buffer is included in optimized dependencies
	},
	server: {
		proxy: {
			'/api': {
				target: 'http://127.0.0.1:49191',
				changeOrigin: true
			}
		}
	},
	plugins: [
		sveltekit(),
		environment('all', { prefix: 'CANISTER_' }),
		environment('all', { prefix: 'DFX_' }),
		GlobalPolyFill({
			process: true,
			buffer: true,
		}),
	],
	resolve: {
		alias: [
			{
				find: 'declarations',
				replacement: fileURLToPath(new URL('../declarations', import.meta.url)),
			},
			{
				find: 'buffer',
				replacement: path.resolve(__dirname, 'node_modules/buffer/index.js'), // Resolve buffer
			},
			{
				find: 'process',
				replacement: path.resolve(__dirname, 'node_modules/process/browser.js'), // Resolve process
			}
		]
	}
});
