import { test, expect } from '@playwright/test';
import { testWithII } from '@dfinity/internet-identity-playwright';
import { user, canisters } from '$lib/stores';
import { get } from 'svelte/store';
import { mockSetup, supplyICP, swap, isToastSuccess, supplyNICP, send } from './utils';

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

	const nicpBalance = await mockCanisters.nicpLedger.icrc1_balance_of({
		owner: mockMintingAccount.principal,
		subaccount: []
	});

	console.log('ICP balance of mock minting account', mockMintingAccount.accountId, ':', icpBalance);
	console.log(
		'nICP balance of mock minting account',
		mockMintingAccount.principal.toString(),
		':',
		nicpBalance
	);
	expect(icpBalance > 0n && nicpBalance > 0n).toBeTruthy();
});

test('has title', async ({ page }) => {
	await page.goto('/');

	await expect(page).toHaveTitle('WaterNeuron | ICP Liquid Staking');
});

testWithII('test page navigation', async ({ page, iiPage }) => {
	await page.goto('/');
	await expect(page).toHaveURL('/stake/');

	await page.goto('/any');
	await expect(page).toHaveURL('/stake/');

	await page.goto('/sns/');
	await expect(page).toHaveURL('/sns/');

	await page.goto('/wallet/');
	await expect(page).toHaveURL('/stake/');

	await page.locator('[title="connect-btn"]').click();

	await iiPage.signInWithNewIdentity({ selector: '[title="ii-connect-btn"]' });

	await page.locator('#disconnect-btn').click();
});

testWithII('e2e test stake', async ({ page, iiPage }) => {
	test.setTimeout(60000);
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

	await supplyICP(accountId);
	await expect(paragraphs.nth(0)).toHaveText('15 ICP');

	await page.locator('[title="home-btn"]').click();

	await swap(page, 0.001);
	expect(await isToastSuccess(page)).toBeFalsy();

	await page.waitForTimeout(5000);

	await swap(page, 15);
	expect(await isToastSuccess(page)).toBeFalsy();


	await page.locator('.max-btn').click();
	const maxAmountStake = parseFloat(
		(await page
			.locator('[title="swap-input"]')
			.evaluate((input) => (input as HTMLInputElement).value)) ?? '0'
	);
	expect(maxAmountStake).toEqual(14.9997);
	await swap(page, maxAmountStake);
	expect(await isToastSuccess(page)).toBeTruthy();
});

testWithII('e2e test unstake', async ({ page, iiPage }) => {
	await page.goto('/');

	await page.locator('[title="connect-btn"]').click();

	await iiPage.signInWithNewIdentity({ selector: '[title="ii-connect-btn"]' });

	const walletInfo = page.locator('#wallet-info');
	await expect(walletInfo).toBeVisible();

	await walletInfo.click();
	await expect(page.locator('.withdrawals-container')).not.toBeVisible();

	const principal = await page
		.locator('p[title="principal-user"]')
		.evaluate((accountId) => accountId.textContent);

	if (!principal) throw new Error('No account id found.');

	await supplyNICP(principal);
	const paragraphs = walletInfo.locator('p');
	await expect(paragraphs.nth(1)).toHaveText('15 nICP');

	await page.locator('[title="home-btn"]').click();
	await page.locator('[title="unstake-header"]').click();

	await swap(page, 9.9999);
	expect(await isToastSuccess(page)).toBeFalsy();

	await page.waitForTimeout(5000);

	await swap(page, 15);
	expect(await isToastSuccess(page)).toBeFalsy();

	await page.locator('.max-btn').click();
	const maxAmountUnstake = parseFloat(
		(await page
			.locator('[title="swap-input"]')
			.evaluate((input) => (input as HTMLInputElement).value)) ?? '0'
	);
	expect(maxAmountUnstake).toEqual(14.9998);
	await swap(page, maxAmountUnstake);
	expect(await isToastSuccess(page)).toBeTruthy();

	await walletInfo.click();
	await expect(page.locator('.withdrawals-container')).toBeVisible();
});

testWithII('e2e test send', async ({ page, iiPage }) => {
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

	const principal = await page
		.locator('p[title="principal-user"]')
		.evaluate((principal) => principal.textContent);

	if (!principal) throw new Error('No principal found.');

	const paragraphs = walletInfo.locator('p');
	const count = await paragraphs.count();
	expect(count).toBe(3);

	await expect(paragraphs.nth(0)).toHaveText('0 ICP');
	await expect(paragraphs.nth(1)).toHaveText('0 nICP');
	await expect(paragraphs.nth(2)).toHaveText('0 WTN');

	await supplyICP(accountId);
	await supplyNICP(principal);

	await expect(paragraphs.nth(0)).toHaveText('15 ICP');
	await expect(paragraphs.nth(1)).toHaveText('15 nICP');

	await page.locator('[title="send-btn-ICP"]').click();

	await send(page, 'aaa-aa', '10');
	await expect(page.locator('span.error')).toBeVisible();
	await send(page, accountId, '0.000000009');
	await expect(page.locator('span.error')).toBeVisible();
	await send(page, accountId, '16');
	await expect(page.locator('span.error')).toBeVisible();

	await page.locator('.max-btn').click();
	const maxAmountSendIcp = parseFloat(
		(await page
			.locator('[title="send-amount"]')
			.evaluate((input) => (input as HTMLInputElement).value)) ?? '0'
	);
	expect(maxAmountSendIcp).toEqual(14.9999);
	await send(page, accountId, maxAmountSendIcp.toString());

	expect(await isToastSuccess(page)).toBeTruthy();

	await page.locator('[title="send-btn-nICP"]').click();
	await send(page, accountId, '10');
	expect(await isToastSuccess(page)).toBeFalsy();

	await page.locator('[title="send-btn-nICP"]').click();
	await page.locator('.max-btn').click();
	const maxAmountSendNicp = parseFloat(
		(await page
			.locator('[title="send-amount"]')
			.evaluate((input) => (input as HTMLInputElement).value)) ?? '0'
	);
	expect(maxAmountSendNicp).toEqual(14.9999);
	await send(page, principal, maxAmountSendNicp.toString());

	expect(await isToastSuccess(page)).toBeTruthy();
});
