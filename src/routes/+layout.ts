export const prerender = true;
export const ssr = false;
export const trailingSlash = 'always';
import { DEV } from '$lib/env';
import { Buffer } from 'buffer/index.js';

if (DEV) {
	// ⚠️ For production build the polyfill needs to be injected with Rollup (see vite.config.ts) because the page might be loaded before the _layout.js which will contains this polyfill.
	// The / in buffer/ is mandatory here.
	// More workaround: https://github.com/vitejs/vite/discussions/2785
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore Polyfill Buffer for development purpose
	globalThis.Buffer = Buffer;
	console.log(Buffer);
}
