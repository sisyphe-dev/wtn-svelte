import { writable } from 'svelte/store';
import { type User, provideState, State } from './state';
import { Asset, AssetType } from '$lib';
import { Toast } from './toast';
import { Principal } from '@dfinity/principal';

export const isLogging = writable<boolean>(false);
export const isBusy = writable<boolean>(false);
export const isConverting = writable<boolean>(false);
export const inSendingMenu = writable<boolean>(false);
export const inReceivingMenu = writable<boolean>(false);
export const menu = writable<boolean>(false);

export const language = writable<'en' | 'es' | 'ja' | 'ru'>('en');
export const selectedAsset = writable<Asset>(new Asset(AssetType.ICP));
export const selectedSns = writable<string>('Custom');
export const snsPrincipal = writable<string>('');

function createInputValue() {
	const { subscribe, set } = writable<string>();

	return {
		subscribe,
		change: (value: number) => {
			const input = value.toString().replace(',', '.');
			set(input);
		},
		set: (value: string) => set(value),
		reset: () => set('')
	};
}

export const inputValue = createInputValue();

export const user = writable<User | undefined>(undefined);

export const state = writable<State | undefined>(undefined);

export async function initializeState() {
	const providedState = await provideState();
	state.set(providedState);
}

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
