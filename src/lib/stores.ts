import { writable } from 'svelte/store';
import { type User, Canisters, WaterNeuronInfo } from './state';
import { Asset, AssetType } from '$lib';
import { Toast } from './toast';

/* === Flags === */
export const isLogging = writable<boolean>(false);
export const isBusy = writable<boolean>(false);
export const isConverting = writable<boolean>(false);
export const inSendingMenu = writable<boolean>(false);
export const inReceivingMenu = writable<boolean>(false);
export const inMobileMenu = writable<boolean>(false);
export const inSnsMenu = writable<boolean>(false);

/* === Components === */
export const language = writable<'en' | 'es' | 'ja' | 'ru'>('en');
export const selectedAsset = writable<Asset>(new Asset(AssetType.ICP));
export const selectedSns = writable<string>('BOOM DAO');
export const snsPrincipal = writable<string>('xomae-vyaaa-aaaaq-aabhq-cai');
export const user = writable<User | undefined>(undefined);
export const canisters = writable<Canisters | undefined>(undefined);
export const waterNeuronInfo = writable<WaterNeuronInfo | undefined>(undefined);

/* === Toasts === */
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

/* === Input Value ==== */
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

export function handleInput(event: Event): void {
	const target = event.target as HTMLInputElement;
	const value = target.value;
	const regex = /^[0-9]*([\.][0-9]*)?$/;

	if (regex.test(value)) {
		inputValue.set(value);
	} else {
		inputValue.set(value.substring(0, value.length - 1));
		target.value = value.substring(0, value.length - 1);
	}
}

