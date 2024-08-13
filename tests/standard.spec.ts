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

testWithII('e2e test stake', async ({ page, iiPage }) => {
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
	await expect(paragraphs.nth(0)).toHaveText('15 ICP');

	await page.locator('[title="home-btn"]').click();

	await swap(page, 0.001);
	expect(await isToastSuccess(page)).toBeFalsy();

  	await swap(page, 14.9998);
	expect(await isToastSuccess(page)).toBeFalsy();

	await page.locator('.max-btn').click();
	const maxAmountStake = parseFloat(await page.locator('[title="swap-input"]').evaluate(input => (input as HTMLInputElement).value) ?? "0");
	expect(maxAmountStake).toEqual(14.9996);
	await swap(page, maxAmountStake);
	expect(await isToastSuccess(page)).toBeTruthy();
});


testWithII.only('e2e test unstake', async ({ page, iiPage }) => {
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


	await supplyICP(accountId);
	const paragraphs = walletInfo.locator('p');
	await expect(paragraphs.nth(0)).toHaveText('15 ICP');

	await page.locator('[title="home-btn"]').click();

	await page.locator('.max-btn').click();
	const maxAmountStake = parseFloat(await page.locator('[title="swap-input"]').evaluate(input => (input as HTMLInputElement).value) ?? "0");
	await swap(page, maxAmountStake);
	expect(await isToastSuccess(page)).toBeTruthy();
	await expect(paragraphs.nth(1)).toHaveText('15 nICP');

	await page.locator('[title="unstake-header"]').click();

	await swap(page, 9.9999);
	expect(await isToastSuccess(page)).toBeFalsy();

	await swap(page, 14.9998);
	expect(await isToastSuccess(page)).toBeFalsy();

	await page.locator('.max-btn').click();
	const maxAmountUnstake = parseFloat(await page.locator('[title="swap-input"]').evaluate((input) => (input as HTMLInputElement).value) ?? "0");
	expect(maxAmountUnstake).toEqual(14.9996);
	await swap(page, maxAmountUnstake);
	expect(await isToastSuccess(page)).toBeTruthy();
});