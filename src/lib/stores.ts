import { writable } from 'svelte/store';
import { type User, type State, provideState } from './state';
import { Asset, AssetType } from '$lib';
import { Toast } from './toast';
import BigNumber from 'bignumber.js';

export const isLogging = writable<boolean>(false);
export const isBusy = writable<boolean>(false);
export const isConverting = writable<boolean>(false);
export const isSelecting = writable<boolean>(false);
export const menu = writable<boolean>(false);

export const language = writable<string>('en');
export const sendAsset = writable<Asset>(new Asset(AssetType.ICP));
export const inputValue = writable<number>();

export const toasts = writable<Toast[]>([]);

export const user = writable<User | undefined>(undefined);
export const state = writable<State>(provideState());
