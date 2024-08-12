import { test, expect } from '@playwright/test';
import { testWithII } from '@dfinity/internet-identity-playwright';
import { user, canisters } from '$lib/stores';
import { get } from 'svelte/store';
import { mockSetup } from './utils/mockInternetIdentity';
import type { TransferArgs, Tokens } from '../src/declarations/icp_ledger/icp_ledger.did';
import { AccountIdentifier } from '@dfinity/ledger-icp';

test('has title', async ({ page }) => {
	await page.goto('/');

	await expect(page).toHaveTitle('WaterNeuron | ICP Liquid Staking');
});

test('test urls', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveURL('/stake/');

	await page.goto('/any');
	await expect(page).toHaveURL('/stake/');

	await page.goto('/sns/');
	await expect(page).toHaveURL('/sns/');

	await page.goto('/wallet/');
	await expect(page).toHaveURL('/stake/');
});

test.only('Mock minting account has balance', async () => {
	await mockSetup();

	const mockMintingAccount = get(user);
	const mockCanisters = get(canisters);

	if (!(mockCanisters && mockMintingAccount))
		throw new Error('Mock user or mock canisters are undefined.');
	const icpBalance = await mockCanisters.icpLedger.icrc1_balance_of({
		owner: mockMintingAccount.principal,
		subaccount: []
	});
	console.log(icpBalance);
	expect(icpBalance > 0n).toBeTruthy();
});

testWithII('should sign-in with a new user', async ({ page, iiPage }) => {
	await page.goto('/');

	let connectBtn = page.locator('[title="connect-btn"]');
	await connectBtn.click();

	await iiPage.signInWithNewIdentity({ selector: '[title="ii-connect-btn"]' });

	const walletInfo = page.locator('#wallet-info');
	await expect(walletInfo).toBeVisible();

	await walletInfo.click();

	const accountId = await page
		.locator('p[title="accountIdentifier-hex"]')
		.evaluate((accountId) => accountId.textContent);

	if (!accountId) throw new Error('No account id found.');

	const paragraphs = walletInfo.locator('p');
	const count = await paragraphs.count();
	expect(count).toBe(3);

	await expect(paragraphs.nth(0)).toHaveText('0 ICP');
	await expect(paragraphs.nth(1)).toHaveText('0 nICP');
	await expect(paragraphs.nth(2)).toHaveText('0 WTN');

	await mockSetup();
	const mockMintingAccount = get(user);
	const mockCanisters = get(canisters);
	if (!(mockCanisters && mockMintingAccount))
		throw new Error('Mock user or mock canisters are undefined.');
	await mockCanisters.icpLedger.transfer({
		to: AccountIdentifier.fromHex(accountId).toUint8Array(),
		fee: { e8s: 10000n } as Tokens,
		memo: 0n,
		from_subaccount: [],
		created_at_time: [],
		amount: { e8s: 100n * 100_000_000n } as Tokens
	} as TransferArgs);

	await expect(paragraphs.nth(0)).toHaveText('100 ICP');
	await expect(paragraphs.nth(1)).toHaveText('0 nICP');
	await expect(paragraphs.nth(2)).toHaveText('0 WTN');
});
