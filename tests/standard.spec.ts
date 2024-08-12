import { test, expect } from '@playwright/test';
import { testWithII } from '@dfinity/internet-identity-playwright';
import { user, canisters } from '$lib/stores';
import { get } from 'svelte/store';
import { mockSetup, supplyICP, swap, isToastSuccess } from './utils/mockInternetIdentity';

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

test('Mock minting account has balance', async () => {
	await mockSetup();

	const mockMintingAccount = get(user);
	const mockCanisters = get(canisters);

	if (!(mockCanisters && mockMintingAccount))
		throw new Error('Mock user or mock canisters are undefined.');
	const icpBalance = await mockCanisters.icpLedger.icrc1_balance_of({
		owner: mockMintingAccount.principal,
		subaccount: []
	});
	console.log('Balance of mock minting account:', icpBalance);
	expect(icpBalance > 0n).toBeTruthy();
});

testWithII.only('e2e test', async ({ page, iiPage }) => {
	await page.goto('/');

	await page.locator('[title="connect-btn"]').click();

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

	await supplyICP(accountId);

	await expect(paragraphs.nth(0)).toHaveText('100 ICP');
	await expect(paragraphs.nth(1)).toHaveText('0 nICP');
	await expect(paragraphs.nth(2)).toHaveText('0 WTN');

  	await swap(page, 15);

	await expect(paragraphs.nth(0)).toHaveText('85 ICP');
	await expect(paragraphs.nth(1)).toHaveText('15 nICP');
	await expect(paragraphs.nth(2)).toHaveText('0 WTN');

	expect(await isToastSuccess(page)).toBeTruthy();

	await expect(page.locator('p[title="toast-message"]')).not.toBeVisible();

	await swap(page, 0.001);
	expect(await isToastSuccess(page)).toBeFalsy();

	await page.locator('[title="unstake-header"]').click();

	await swap(page, 9.9999);
	expect(await isToastSuccess(page)).toBeFalsy();

	await swap(page, 14.9999);
	expect(await isToastSuccess(page)).toBeTruthy();
});
