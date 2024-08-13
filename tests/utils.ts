import { HttpAgent } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { fetchActors } from '$lib/authentification';
import { canisters, user } from '$lib/stores';
import { User, Canisters } from '$lib/state';
import { get } from 'svelte/store';
import type {
	TransferArgs,
	Tokens,
	TransferArg
} from '../src/declarations/icp_ledger/icp_ledger.did';
import { AccountIdentifier } from '@dfinity/ledger-icp';
import { Page } from 'playwright';
import { expect } from '@playwright/test';
import { Principal } from '@dfinity/principal';

const key = [
	'302a300506032b657003210093d488f46b485c07e09b554d9451574bfc669912b99d453722c474e6a7f90fcc',
	'90252a6913658dbb4b36b276410216d47a1891280493cd485328279a12a53e2c'
];

const parsedKey = JSON.stringify(key);

// AccountId = 90526bdfd692793cba1f96bde9079994ce4d40033746f04c12064ea599e2c274
// Principal = syna7-6ipnd-myx4g-ia46u-nxwok-u5nrr-yxgpi-iang7-lvru2-i7n23-tqe

export const mockSetup = async () => {
	try {
		const dummyIdentity = Ed25519KeyIdentity.fromJSON(parsedKey);
		const agent = new HttpAgent({ host: 'http://127.0.1:8080', identity: dummyIdentity });
		agent.fetchRootKey().catch((err) => {
			console.warn('Unable to fetch root key. Check to ensure that your local replica is running');
			console.error(err);
		});
		const actors = await fetchActors(agent);

		canisters.set(new Canisters(actors));
		user.set(new User(dummyIdentity.getPrincipal()));
	} catch (error) {
		console.error('Login failed:', error);
	}
};

export async function supplyICP(accountId: string) {
	await mockSetup();
	const mockMintingAccount = get(user);
	const mockCanisters = get(canisters);

	if (!(mockCanisters && mockMintingAccount))
		throw new Error('Mock user or mock canisters are undefined.');

	const result = await mockCanisters.icpLedger.transfer({
		to: AccountIdentifier.fromHex(accountId).toUint8Array(),
		fee: { e8s: 10000n } as Tokens,
		memo: 0n,
		from_subaccount: [],
		created_at_time: [],
		amount: { e8s: 15n * 100_000_000n } as Tokens
	} as TransferArgs);

	if (Object.keys(result)[0] === 'Err') throw new Error('Failed to transfer balance');
}

export async function supplyNICP(principalString: string) {
	await mockSetup();
	const mockMintingAccount = get(user);
	const mockCanisters = get(canisters);

	if (!(mockCanisters && mockMintingAccount))
		throw new Error('Mock user or mock canisters are undefined.');

	const result = await mockCanisters.nicpLedger.icrc1_transfer({
		to: { owner: Principal.fromText(principalString), subaccount: [] },
		fee: [],
		memo: [],
		from_subaccount: [],
		created_at_time: [],
		amount: 15n * 100_000_000n
	} as TransferArg);

	if (Object.keys(result)[0] === 'Err') throw new Error('Failed to transfer balance');
}

export async function swap(page: Page, amount: number) {
	await page.locator('[title="swap-input"]').fill(amount.toString());
	await page.locator('[title="stake-unstake-btn"]').click();
}

export async function isToastSuccess(page: Page) {
	const message = await page.locator('p[title="toast-message"]').evaluate((msg) => msg.textContent);
	console.log(message);
	await page.locator('.toast-close').click();
	await expect(page.locator('p[title="toast-message"]')).not.toBeVisible();
	return message?.split(' ')[0] === 'Successful';
}

export async function send(page: Page, destination: string, amount: string) {
	await page.locator('[title="send-destination"]').fill(destination);
	await page.locator('[title="send-amount"]').fill(amount);

	await page.locator('[title="continue-btn"]').click();
}