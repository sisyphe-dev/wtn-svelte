import { writable } from 'svelte/store';
import { type User, provideState, signIn, State } from './state';
import { Asset, AssetType } from '$lib';
import { Toast } from './toast';
import { subscribe } from 'diagnostics_channel';

export const isLogging = writable<boolean>(false);
export const isBusy = writable<boolean>(false);
export const isConverting = writable<boolean>(false);
export const isSelecting = writable<boolean>(false);
export const isSending = writable<boolean>(false);
export const menu = writable<boolean>(false);

export const language = writable<'en' | 'es' | 'ja' | 'ru'>('en');
export const sendAsset = writable<Asset>(new Asset(AssetType.ICP));

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

async function initializeUser() {
	const {subscribe, set, update } = writable<User | undefined>();

	return {
		initialize: () => set(undefined),
	}
}



export const state = writable<State | undefined>(undefined);

async function initializeState() {
	const {subscribe, set, update } = writable<State>();

	const providedState = await provideState();

	return {
		initialize: () => set(providedState),
		signIn: async (via: 'internetIdentity' | 'plug') => {
			try {
				const authResult = await signIn(via);
				if (authResult) {
					update((state) => {
						state.wtnLedger = authResult.actors.wtnLedger;
						state.icpLedger = authResult.actors.icpLedger;
						state.nicpLedger = authResult.actors.nicpLedger;
						state.waterNeuron = authResult.actors.waterNeuron;
	
						return state;
					})
				}
			} catch (error) {
				console.log(error);
			}
			
				
			 
		},
		fetchUserBalance: async () => {

		}, 
	}
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
