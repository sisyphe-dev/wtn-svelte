import { writable } from 'svelte/store';
import { type User, Canisters, WaterNeuronInfo, fetchIcpBalance, fetchNicpBalance } from './state';
import { Asset, AssetType, bigintE8sToNumber } from '$lib';
import { Toast } from './toast';
import BigNumber from 'bignumber.js';
import { get } from 'svelte/store';
import { Principal } from '@dfinity/principal';
import { encodeIcrcAccount } from '@dfinity/ledger-icrc';
import { AccountIdentifier } from '@dfinity/ledger-icp';

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

/* === Input Amount ==== */
function createInputAmountStore() {
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

export const inputAmount = createInputAmountStore();

export function handleInputAmount(event: Event): void {
	const target = event.target as HTMLInputElement;
	const number = target.value;
	const regex = /^[0-9]*([\.][0-9]*)?$/;

	if (regex.test(number)) {
		inputAmount.set(number);
	} else {
		const newNumber = number.substring(0, number.length - 1);
		inputAmount.set(newNumber);
		target.value = newNumber;
	}
}

/* === SNS === */
function createBoomerangSnsStore() {
	const { subscribe, set, update } = writable<{
		name: string;
		principal: string;
		encodedStakingAccount: string | undefined;
		encodedUnstakingAccount: string | undefined;
		icpBalance: BigNumber | undefined;
		nicpBalance: BigNumber | undefined;
	}>({
		name: '',
		principal: '',
		encodedStakingAccount: undefined,
		encodedUnstakingAccount: undefined,
		icpBalance: undefined,
		nicpBalance: undefined
	});

	return {
		subscribe,
		setPrincipal: (principal: string) => update((sns) => ({ ...sns, principal })),
		setName: (name: string) => update((sns) => ({ ...sns, name })),
		setEncodedStakingAccount: (encodedStakingAccount: string) =>
			update((sns) => ({ ...sns, encodedStakingAccount })),
		setEncodedUnstakingAccount: (encodedUnstakingAccount: string) =>
			update((sns) => ({ ...sns, encodedUnstakingAccount })),
		setIcpBalance: (icpBalance: BigNumber) => update((sns) => ({ ...sns, icpBalance })),
		setNicpBalance: (nicpBalance: BigNumber) => update((sns) => ({ ...sns, nicpBalance })),
		reset: () =>
			set({
				name: '',
				principal: '',
				encodedStakingAccount: undefined,
				encodedUnstakingAccount: undefined,
				icpBalance: undefined,
				nicpBalance: undefined
			})
	};
}
export const sns = createBoomerangSnsStore();

export const handleSnsChange = async (name?: string, principal?: string) => {
	const fetchedCanisters = get(canisters);
	if (!fetchedCanisters) return;

	sns.reset();
	inputAmount.reset();
	if (name && principal) {
		sns.setName(name);
		const p = Principal.fromText(principal);
		sns.setPrincipal(principal);
		const [stakingAccount, unstakingAccount, icpBalanceE8s, nicpBalanceE8s] = await Promise.all([
			fetchedCanisters.boomerang.get_staking_account(p),
			fetchedCanisters.boomerang.get_unstaking_account(p),
			fetchIcpBalance(p, fetchedCanisters.icpLedger),
			fetchNicpBalance(p, fetchedCanisters.nicpLedger)
		]);
		const encodedStakingAccount = encodeIcrcAccount({
			owner: stakingAccount.owner,
			subaccount: stakingAccount.subaccount[0]
		});
		const encodedUnstakingAccount = encodeIcrcAccount({
			owner: unstakingAccount.owner,
			subaccount: unstakingAccount.subaccount[0]
		});
		sns.setEncodedStakingAccount(encodedStakingAccount);
		sns.setEncodedUnstakingAccount(encodedUnstakingAccount);
		sns.setIcpBalance(bigintE8sToNumber(icpBalanceE8s));
		sns.setNicpBalance(bigintE8sToNumber(nicpBalanceE8s));
	} else {
		sns.setName('Custom');
		sns.setPrincipal('');
	}
};

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
