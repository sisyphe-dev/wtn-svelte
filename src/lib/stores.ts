import { writable } from 'svelte/store';
import { type User, State } from './state';
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

export const toasts = writable<Toast[]>([]);

export const user = writable<User | undefined>(undefined);
export const state = writable<State>(new State());
