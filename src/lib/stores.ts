import { writable } from 'svelte/store';
import { type User, type State, provideState } from './state';
import { Asset, AssetType } from '$lib';
import { Toast } from './toast';

export const is_logging = writable<boolean>(false);
export const isBusy = writable<boolean>(false);
export const is_converting = writable<boolean>(false);
export const is_sending = writable<boolean>(false);
export const menu = writable<boolean>(false);

export const language = writable<string>('en');
export const send_asset = writable<Asset>(new Asset(AssetType.ICP));
export const input_value = writable<number>();
export const reward = writable<number>(0);

export const toasts = writable<Toast[]>([]);

export const user = writable<User | undefined>(undefined);
export const state = writable<State>(provideState());
