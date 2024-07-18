import { writable } from 'svelte/store';
import { type User, provideState, State } from './state';
import { Asset, AssetType } from '$lib';
import { Toast } from './toast';

export const isLogging = writable<boolean>(false);
export const isBusy = writable<boolean>(false);
export const isConverting = writable<boolean>(false);
export const isSelecting = writable<boolean>(false);
export const isSending = writable<boolean>(false);
export const menu = writable<boolean>(false);

export const language = writable<string>('en');
export const sendAsset = writable<Asset>(new Asset(AssetType.ICP));
export const inputValue = writable<number>();

export const user = writable<User | undefined>(undefined);
export const state = writable<State>();
export const session = writable<'plug' | 'internetIdentity'>();

async function initializeState() {
	const providedState = await provideState();
	state.set(providedState);
}

initializeState();

function creatToasts() {
	const { subscribe, set, update } = writable<Toast[]>([]);

	return {
		subscribe,
		add: (toast: Toast) => update((toasts: Toast[]) => [...toasts, toast]),
		remove: (id: string) => update((toasts: Toast[]) => toasts.filter((toast) => toast.id !== id)),
		reset: () => set([])
	};
}

export const toasts = creatToasts();
