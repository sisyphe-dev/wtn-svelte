import { writable } from 'svelte/store';
import { type User, Canisters, WaterNeuronInfo } from './state';
import { Asset, AssetType } from '$lib';
import { Toast } from './toast';
import BigNumber from 'bignumber.js';
import { get } from 'svelte/store';
import { Principal } from '@dfinity/principal';
import { encodeIcrcAccount } from '@dfinity/ledger-icrc';

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
export const user = writable<User | undefined>(undefined);
export const canisters = writable<Canisters | undefined>(undefined);
export const waterNeuronInfo = writable<WaterNeuronInfo | undefined>(undefined);

/* === SNS === */
function createSns() {
	const { subscribe, set, update } = writable<{
		name: string;
		principal: string;
		encodedAccount: string;
		icpBalance: BigNumber | undefined;
		nicpBalance: BigNumber | undefined;
	}>({
		name: '',
		principal: '',
		encodedAccount: '-/-',
		icpBalance: undefined,
		nicpBalance: undefined
	});

	return {
		subscribe,
		setPrincipal: (principal: string) => update((sns) => ({ ...sns, principal })),
		setName: (name: string) => update((sns) => ({ ...sns, name })),
		setEncodedAccount: (encodedAccount: string) => update((sns) => ({ ...sns, encodedAccount })),
		setIcpBalance: (icpBalance: BigNumber) => update((sns) => ({ ...sns, icpBalance })),
		setNicpBalance: (nicpBalance: BigNumber) => update((sns) => ({ ...sns, nicpBalance })),
		reset: () =>
			set({
				name: '',
				principal: '',
				encodedAccount: '-/-',
				icpBalance: undefined,
				nicpBalance: undefined
			})
	};
}
export const sns = createSns();

export async function handleSnsChange(name?: string, principal?: string) {
	const boomerang = get(canisters)?.boomerang;
	if (!boomerang) return;

	sns.reset();

	if (name && principal) {
		sns.setName(name);
		sns.setPrincipal(principal);
		const account = await boomerang.get_staking_account(Principal.fromText(principal));
		const hex = encodeIcrcAccount({
			owner: account.owner,
			subaccount: account.subaccount[0]
		});
		sns.setEncodedAccount(hex);
	} else {
		sns.setName('Custom');
		sns.setPrincipal('');
	}
}

/* === Toasts === */
function createToasts() {
	const { subscribe, set, update } = writable<Toast[]>([]);

	return {
		subscribe,
		add: (toast: Toast) => update((toasts: Toast[]) => [...toasts, toast]),
		remove: (id: string) => update((toasts: Toast[]) => toasts.filter((toast) => toast.id !== id)),
		reset: () => set([])
	};
}

export const toasts = createToasts();

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
