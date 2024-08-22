<script lang="ts">
	import {
		Asset,
		computeRewards,
		displayUsFormat,
		numberToBigintE8s,
		bigintE8sToNumber,
		computeReceiveAmount
	} from '$lib';
	import ChangeIcon from '$lib/icons/ChangeIcon.svelte';
	import SwapInput from './SwapInput.svelte';
	import { Toast } from '$lib/toast';
	import {
		inputAmount,
		waterNeuronInfo,
		canisters,
		user,
		isLogging,
		isConverting,
		toasts
	} from '$lib/stores';
	import BigNumber from 'bignumber.js';
	import {
		nicpTransferApproved,
		handleUnstakeResult,
		handleIcpswapResult,
		handleApproveResult,
		DEFAULT_ERROR_MESSAGE
	} from '$lib/resultHandler';
	import {
		CANISTER_ID_ICP_LEDGER,
		CANISTER_ID_ICPSWAP,
		CANISTER_ID_NICP_LEDGER
	} from '$lib/authentification';
	import type { ApproveArgs } from '../declarations/icrc_ledger/icrc_ledger.did';
	import type { DepositArgs, SwapArgs, WithdrawArgs } from '$declarations/icpswap/icpswap.did';
	import type { ConversionArg } from '$declarations/water_neuron/water_neuron.did';
	import type { Account } from '@dfinity/ledger-icp';
	import { onMount, afterUpdate } from 'svelte';
	import { fade } from 'svelte/transition';

	let invertExchangeRate = false;
	let isFastUnstake = true;
	let exchangeRate: BigNumber;
	let minimumWithdraw: BigNumber;
	let fastUnstakeAmount: BigNumber;

	async function nicpToIcp(amount: BigNumber) {
		if (
			!$user ||
			$isConverting ||
			!$canisters ||
			amount.isNaN() ||
			amount.isLessThan(BigNumber(10).dividedBy($waterNeuronInfo.exchangeRate()))
		)
			return;
		isConverting.set(true);
		if ($user.nicpBalance().isGreaterThanOrEqualTo(amount) && amount.isGreaterThan(0)) {
			try {
				let amountE8s = numberToBigintE8s(amount);
				const approveAmount = amountE8s * 3n;
				const approval = await nicpTransferApproved(
					approveAmount,
					{
						owner: $user.principal,
						subaccount: []
					} as Account,
					$canisters.nicpLedger
				);
				if (!approval.success) {
					toasts.add(Toast.error(approval.message ?? 'Unknown Error.'));
				} else {
					const conversionResult = await $canisters.waterNeuron.nicp_to_icp({
						maybe_subaccount: [],
						amount_e8s: amountE8s
					} as ConversionArg);
					const status = handleUnstakeResult(conversionResult);
					if (status.success) {
						toasts.add(Toast.success(status.message));
					} else {
						toasts.add(Toast.error(status.message));
					}
				}
			} catch (error) {
				console.log('nicpToIcp error:', error);
				toasts.add(Toast.error('Call was rejected.'));
			}
		} else {
			toasts.add(Toast.error('Sorry, there are not enough funds in this account.'));
		}
		isConverting.set(false);
	}

	async function fastUnstake(amount: BigNumber) {
		if (!$canisters || !$user || $isConverting || amount.isNaN()) return;
		const fee = 10_000n;
		try {
			let amountE8s = numberToBigintE8s(amount);

			// 1. Approve
			const spender = {
				owner: Principal.fromText(CANISTER_ID_ICPSWAP),
				subaccount: []
			} as Account;

			const approveResult: ApproveResult = await $canisters.nicpLedger.icrc2_approve({
				spender,
				fee: [],
				memo: [],
				from_subaccount: [],
				created_at_time: [],
				expires_at: [],
				expected_allowance: [],
				amount: amountE8s
			} as ApproveArgs);

			let status = handleApproveResult(approvalResult);
			if (!status.success) {
				toasts.add(Toast.error(status.message));
				return;
			}

			// 2. Deposit
			const depositResult = await $canisters.icpswap.depositFrom({
				fee,
				token: CANISTER_ID_NICP_LEDGER,
				amount: amountE8s
			} as DepositArgs);
			status = handleIcpswapResult(depositResult, 'deposit');
			if (!status.success) {
				toasts.add(Toast.error(status.message));
				return;
			}

			// 3. Swap
			const amountOut = amount.minus(amount.multipliedBy(BigNumber(0.2)));
			const swapResult = await $canisters.icpswap.swap({
				amountIn: amountE8s.toString(),
				zeroForOne: true,
				amountOutMinimum: numberToBigintE8s(amountOut).toString()
			} as SwapArgs);
			status = handleIcpswapResult(swapResult, 'swap');
			if (!status.success) {
				toasts.add(Toast.error(status.message));
				return;
			}

			// 4. Withdraw
			const amountToWithdrawE8s = swapResult['ok'];
			const withdrawResult = await $canisters.icpswap.withdraw({
				fee,
				token: CANISTER_ID_ICP_LEDGER,
				amount: amountToWithdrawE8s
			} as WithdrawArgs);
			status = handleIcpswapResult(withdrawResult, 'withdrawIcp');
			if (!status.success) {
				toasts.add(Toast.error(status.message));
			} else {
				toasts.add(Toast.success(status.message));
			}
		} catch (error) {
			console.log(error);
			toasts.add(Toast.error(DEFAULT_ERROR_MESSAGE));
			return;
		}
	}

	async function withdrawTokens() {
		if (!$canisters || !$user) return;
		const result = await $canisters.icpswap.getUserUnusedBalance($user.principal.toString());
		const key = Object.keys(result)[0] as keyof IcpSwapUnusedBalanceResult;

		switch (key) {
			case 'err':
				console.log(result(key));
				toasts.add(Toast.error('Failed to fetch balances on ICPswap. Please retry.'));
				break;
			case 'ok':
				const nicpBalanceE8s = result[key]['balance0'];
				const withdrawNicpResult = await $canisters.icpswap.withdraw({
					fee,
					token: CANISTER_ID_NICP_LEDGER,
					amount: nicpBalanceE8s - fee
				} as WithdrawArgs);
				status = handleIcpswapResult(withdrawNicpResult, 'withdrawNicp');
				if (!status.success) {
					toasts.add(Toast.error(status.message));
				} else {
					toasts.add(Toast.success(status.message));
				}

				const icpBalanceE8s = result[key]['balance1'];
				const withdrawIcpResult = await $canisters.icpswap.withdraw({
					fee,
					token: CANISTER_ID_ICP_LEDGER,
					amount: icpBalanceE8s - fee
				} as WithdrawArgs);
				status = handleIcpswapResult(withdrawIcpResult, 'withdrawIcp');
				if (!status.success) {
					toasts.add(Toast.error(status.message));
				} else {
					toasts.add(Toast.success(status.message));
				}
		}
	}

	const computeReceiveAmountFastUnstake = async () => {
		if (!$canisters) return;

		try {
			const amount = BigNumber($inputAmount);
			if (amount.isNaN()) return BigNumber(0);

			const amountOut = amount.minus(amount.multipliedBy(BigNumber(0.02)));
			const result = await $canisters.icpswap.quote({
				amountIn: numberToBigintE8s(amount).toString(),
				zeroForOne: true,
				amountOutMinimum: numberToBigintE8s(amountOut).toString()
			} as SwapArgs);

			const status = handleIcpswapResult(result, 'quote');
			if (status.success) {
				fastUnstakeAmount = bigintE8sToNumber(result['ok']);
			} else {
				fastUnstakeAmount = BigNumber(0);
			}
		} catch (error) {
			console.log(error);
			fastUnstakeAmount = undefined;
		}
	};

	const fetchData = async () => {
		if ($waterNeuronInfo)
			try {
				exchangeRate = $waterNeuronInfo.exchangeRate();
				minimumWithdraw = BigNumber(10).multipliedBy(exchangeRate);
			} catch (error) {
				console.error('Error fetching data:', error);
			}
	};

	afterUpdate(() => {
		if ($waterNeuronInfo) {
			fetchData();
		}
	});

	onMount(() => {
		const intervalId = setInterval(fetchData, 5000);
		return () => clearInterval(intervalId);
	});

	$: $inputAmount, computeReceiveAmountFastUnstake();
</script>

<div class="swap-container">
	<SwapInput asset={Asset.fromText('nICP')} />
	<div class="paragraphs-container" in:fade={{ duration: 500 }}>
		<span class="error">
			{#if $inputAmount && isNaN(parseFloat($inputAmount))}
				Cannot read amount
			{:else if $inputAmount && minimumWithdraw && parseFloat($inputAmount) < minimumWithdraw}
				Minimum: {displayUsFormat(minimumWithdraw, 4)} nICP
			{/if}
		</span>
		<p>
			<button class="change-btn" on:click={() => (invertExchangeRate = !invertExchangeRate)}>
				<ChangeIcon />
			</button>
			{#if exchangeRate}
				{#if !invertExchangeRate}
					1 nICP = {displayUsFormat(BigNumber(1).dividedBy(exchangeRate), 8)} ICP
				{:else}
					1 ICP = {displayUsFormat(exchangeRate, 8)} nICP
				{/if}
			{:else}
				-/-
			{/if}
		</p>
	</div>
	<div class="unstake-selection-container">
		<button
			class="unstake-container left"
			class:selected={isFastUnstake}
			class:not-selected={!isFastUnstake}
			on:click={() => (isFastUnstake = true)}
		>
			<h2>Immediately</h2>
			<p>via ICPSwap</p>
			<p style:color="var(--orange-color)">
				{#if fastUnstakeAmount}
					You will receive {displayUsFormat(fastUnstakeAmount, 8)} ICP
				{:else}
					-/-
				{/if}
			</p>
		</button>
		<button
			class="unstake-container right"
			class:not-selected={isFastUnstake}
			class:selected={!isFastUnstake}
			on:click={() => (isFastUnstake = false)}
		>
			<h2>Delayed in 6 months</h2>
			<p>via WaterNeuron</p>
			<p style:color="var(--orange-color)">
				{#if exchangeRate}
					You will receive {displayUsFormat(
						computeReceiveAmount(false, BigNumber($inputAmount), exchangeRate),
						8
					)} ICP
				{:else}
					-/-
				{/if}
			</p>
		</button>
	</div>
	<p>Failed retrieve your ICP?</p>
	{#if !$user}
		<button
			class="swap-btn"
			on:click={() => {
				isLogging.update(() => true);
			}}
		>
			<span>Connect your wallet</span>
		</button>
	{:else}
		<button
			class="swap-btn"
			on:click={() => {
				nicpToIcp(BigNumber($inputAmount));
			}}
			title="stake-unstake-btn"
		>
			{#if $isConverting}
				<div class="spinner"></div>
			{:else}
				<span>Unstake</span>
			{/if}
		</button>
	{/if}
</div>

<style>
	/* === Base Styles === */
	p {
		color: var(--text-color);
		font-family: var(--secondary-font);
		text-align: end;
		margin: 0;
		display: flex;
		justify-content: end;
		align-items: center;
		gap: 0.2em;
	}

	span {
		color: var(--main-button-text-color);
	}

	h2 {
		font-family: var(--secondary-font);
		font-size: 16px;
		margin: 0;
		color: var(--title-color);
	}

	/* === Layout === */
	.swap-container {
		display: flex;
		flex-direction: column;
		padding: 1em;
		border-left: 2px solid var(--border-color);
		border-right: 2px solid var(--border-color);
		border-bottom: 2px solid var(--border-color);
		border-bottom-left-radius: 10px;
		border-bottom-right-radius: 10px;
		background-color: var(--background-color);
		gap: 1em;
	}

	.paragraphs-container {
		display: flex;
		justify-content: space-between;
		width: 100%;
	}

	.unstake-selection-container {
		display: flex;
		border: 2px solid var(--border-color);
		border-radius: 8px;
		padding: 1em;
	}

	.unstake-container {
		display: flex;
		flex-grow: 1;
		align-items: center;
		flex-direction: column;
		background: transparent;
		color: white;
		border: none;
		border-radius: 6px;
		padding: 1em;
		align-items: start;
	}

	/* === Components === */
	.change-btn {
		border: none;
		display: flex;
		width: fit-content;
		height: fit-content;
		background: transparent;
		padding: 0;
		margin: 0;
		cursor: pointer;
	}

	.swap-btn {
		background: var(--main-color);
		min-width: 80px;
		max-width: fit-content;
		position: relative;
		border: 2px solid black;
		border-radius: 8px;
		font-size: 16px;
		font-weight: bold;
		box-shadow: 3px 3px 0 0 black;
		padding: 0 1em 0 1em;
		max-width: none;
		height: 4em;
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.swap-btn:hover {
		box-shadow: 6px 6px 0 0 black;
	}

	.error {
		color: red;
		margin-left: 1em;
		font-size: 16px;
		font-family: var(--secondary-font);
		flex-wrap: wrap;
		max-width: 45%;
	}

	/* === Utilities === */
	.selected {
		background-color: #283e9521;
		color: var(--title-color);
	}

	.not-selected {
		background-color: var(--background-color);
		cursor: pointer;
	}

	.left {
		align-items: start;
	}

	.right {
	}

	/* === Animation === */
	.change-btn:hover {
		transform: scale(1.2);
		animation: invert 0.5s ease;
	}

	.spinner {
		width: 2em;
		height: 2em;
		border: 3px solid var(--main-button-text-color);
		border-top-color: transparent;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes invert {
		from {
			transform: scale(1);
		}
		to {
			transform: scale(1.2);
		}
	}
</style>
