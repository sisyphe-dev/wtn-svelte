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
	import InfoIcon from '$lib/icons/InfoIcon.svelte';
	import ErrorIcon from '$lib/icons/ErrorIcon.svelte';
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
	import type { ApproveArgs, ApproveResult } from '../declarations/icrc_ledger/icrc_ledger.did';
	import type { DepositArgs, SwapArgs, WithdrawArgs } from '$declarations/icpswap/icpswap.did';
	import type { ConversionArg } from '$declarations/water_neuron/water_neuron.did';
	import type { Account } from '@dfinity/ledger-icp';
	import { onMount, afterUpdate } from 'svelte';
	import { fade } from 'svelte/transition';
	import { Principal } from '@dfinity/principal';

	let invertExchangeRate = false;
	let isFastUnstake = true;
	let exchangeRate: BigNumber;
	let minimumWithdraw: BigNumber;
	let fastUnstakeAmount: BigNumber;
	let showFailedHelp = false;
	let showImmediateHelp = false;
	let showDelayedHelp = false;

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
		if (!$canisters || !$user || $isConverting || amount.isNaN() || !fastUnstakeAmount) return;
		const fee = 10_000n;
		isConverting.set(true);
		try {
			let amountE8s = numberToBigintE8s(amount);
			// 1. Approve
			const spender = {
				owner: Principal.fromText(CANISTER_ID_ICPSWAP),
				subaccount: []
			} as Account;

			const allowanceResult: Allowance = await $canisters.nicpLedger.icrc2_allowance({
				account: { owner: $user.principal, subaccount: [] } as Account,
				spender
			} as AllowanceArgs);
			const allowance = allowanceResult['allowance'];
			if (numberToBigintE8s(amount) > allowance) {
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

				const status = handleApproveResult(approveResult);
				if (!status.success) {
					toasts.add(Toast.error(status.message));
					isConverting.set(false);
					return;
				}
			}

			// 2. Deposit
			const depositResult = await $canisters.icpswap.depositFrom({
				fee,
				token: CANISTER_ID_NICP_LEDGER,
				amount: amountE8s - fee
			} as DepositArgs);
			let status = handleIcpswapResult(depositResult, 'deposit');
			if (!status.success) {
				toasts.add(Toast.error(status.message));
				isConverting.set(false);
				return;
			} else {
				toasts.add(Toast.success(status.message));
			}

			// 3. Swap
			const amountIn = depositResult['ok'];
			const amountOut = numberToBigintE8s(fastUnstakeAmount.multipliedBy(BigNumber(0.98)));
			const swapResult = await $canisters.icpswap.swap({
				amountIn: amountIn.toString(),
				zeroForOne: true,
				amountOutMinimum: amountOut.toString()
			} as SwapArgs);
			status = handleIcpswapResult(swapResult, 'swap');
			if (!status.success) {
				toasts.add(Toast.error(status.message));
				isConverting.set(false);
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
			isConverting.set(false);
		} catch (error) {
			console.log('[fastUnstake] error:', error);
			toasts.add(Toast.error(DEFAULT_ERROR_MESSAGE));
			isConverting.set(false);
			return;
		}
	}

	async function withdrawIcpswapTokens() {
		if (!$canisters || !$user) return;
		const fee = 10_000n;
		isConverting.set(true);
		try {
			const result = await $canisters.icpswap.getUserUnusedBalance($user.principal);
			const key = Object.keys(result)[0] as keyof IcpSwapUnusedBalanceResult;

			switch (key) {
				case 'err':
					console.log(result(key));
					toasts.add(Toast.error('Failed to fetch balances on ICPswap. Please retry.'));
					break;
				case 'ok':
					const nicpBalanceE8s = result[key]['balance0'];
					if (nicpBalanceE8s > fee) {
						const withdrawNicpResult = await $canisters.icpswap.withdraw({
							fee,
							token: CANISTER_ID_NICP_LEDGER,
							amount: nicpBalanceE8s - fee
						} as WithdrawArgs);
						console.log(withdrawNicpResult);
						const status = handleIcpswapResult(withdrawNicpResult, 'withdrawNicp');
						console.log(status);
						if (!status.success) {
							toasts.add(Toast.error(status.message));
						} else {
							toasts.add(Toast.success(status.message));
						}
					}

					const icpBalanceE8s = result[key]['balance1'];
					if (icpBalanceE8s > fee) {
						const withdrawIcpResult = await $canisters.icpswap.withdraw({
							fee,
							token: CANISTER_ID_ICP_LEDGER,
							amount: icpBalanceE8s - fee
						} as WithdrawArgs);
						const status = handleIcpswapResult(withdrawIcpResult, 'withdrawIcp');
						if (!status.success) {
							toasts.add(Toast.error(status.message));
						} else {
							toasts.add(Toast.success(status.message));
						}
					}
			}
		} catch (error) {
			console.log('[withdrawIcpswapTokens] error:', error);
			toasts.add(Toast.success(DEFAULT_ERROR_MESSAGE));
		}
		isConverting.set(false);
	}

	const computeReceiveAmountFastUnstake = async () => {
		if (!$canisters) return;

		try {
			const amount = BigNumber($inputAmount);
			if (amount.isNaN()) return BigNumber(0);

			const amountIn = numberToBigintE8s(amount);
			const amountOut = amountIn - numberToBigintE8s(amount.multipliedBy(BigNumber(0.02)));
			const result = await $canisters.icpswap.quote({
				amountIn: amountIn.toString(),
				zeroForOne: true,
				amountOutMinimum: amountOut.toString()
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
				<ErrorIcon /> Cannot read amount
			{:else if !isFastUnstake && $inputAmount && minimumWithdraw && parseFloat($inputAmount) < minimumWithdraw}
				<ErrorIcon /> Minimum: {displayUsFormat(minimumWithdraw, 4)} nICP
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
			class="unstake-container"
			class:selected={isFastUnstake}
			class:not-selected={!isFastUnstake}
			on:click={() => (isFastUnstake = true)}
		>
			<div class="delay-header">
				<h2>Immediately</h2>
				<button
					class="help-btn"
					on:mouseover={() => (showImmediateHelp = true)}
					on:focus={() => (showImmediateHelp = true)}
					on:mouseleave={() => (showImmediateHelp = false)}
					on:click={withdrawIcpswapTokens}
				>
					<InfoIcon />
					<p style:display={showImmediateHelp ? 'flex' : 'none'} class="help-content">
						Immediate unstake via ICPSwap, traded at the current price with 2% slippage.
					</p>
				</button>
			</div>
			<p>
				{#if fastUnstakeAmount}
					Receive {displayUsFormat(fastUnstakeAmount.minus(BigNumber(0.0002)), 8)} ICP
				{:else}
					-/-
				{/if}
			</p>
			<button
				class="help-btn"
				on:mouseover={() => (showFailedHelp = true)}
				on:focus={() => (showFailedHelp = true)}
				on:mouseleave={() => (showFailedHelp = false)}
				on:click={withdrawIcpswapTokens}
			>
				Failed swap?
				<p style:display={showFailedHelp ? 'flex' : 'none'} class="help-content">
					If a swap is unsuccessful, click here to retrieve the deposited nICP to your wallet.
				</p>
			</button>
		</button>
		<button
			title="delayed-btn"
			class="unstake-container"
			class:not-selected={isFastUnstake}
			class:selected={!isFastUnstake}
			on:click={() => (isFastUnstake = false)}
		>
			<div class="delay-header">
				<h2>Delayed</h2>
				<button
					class="help-btn"
					on:mouseover={() => (showDelayedHelp = true)}
					on:focus={() => (showDelayedHelp = true)}
					on:mouseleave={() => (showDelayedHelp = false)}
					on:click={withdrawIcpswapTokens}
				>
					<InfoIcon />
					<p style:display={showDelayedHelp ? 'flex' : 'none'} class="help-content">
						The protocol will split and dissolve a 6 months neuron. The nICP will be sent to your
						wallet as soon as the dissolve delay ends.
					</p>
				</button>
			</div>
			<p>
				{#if exchangeRate}
					Receive {displayUsFormat(
						computeReceiveAmount(false, BigNumber($inputAmount), exchangeRate),
						8
					)} ICP
				{:else}
					-/-
				{/if}
			</p>
		</button>
	</div>
	{#if !$user}
		<button
			class="main-btn swap-btn"
			on:click={() => {
				isLogging.update(() => true);
			}}
		>
			Connect your wallet
		</button>
	{:else}
		<button
			class="main-btn swap-btn"
			on:click={() => {
				if (isFastUnstake) {
					fastUnstake(BigNumber($inputAmount));
				} else {
					nicpToIcp(BigNumber($inputAmount));
				}
			}}
			title="stake-unstake-btn"
		>
			{#if $isConverting}
				<div class="spinner"></div>
			{:else}
				Unstake
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

	h2 {
		font-family: var(--secondary-font);
		font-size: 16px;
		margin: 0;
		color: var(--title-color);
		display: flex;
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
		width: 50%;
		flex-direction: column;
		background: transparent;
		color: white;
		border: none;
		border-radius: 6px;
		padding: 1em;
		gap: 1em;
	}

	.unstake-container > p {
		align-self: start;
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

	.main-btn {
		background: var(--main-color);
		position: relative;
		border: 2px solid black;
		border-radius: 8px;
		box-shadow: 3px 3px 0 0 black;
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;
		color: var(--main-button-text-color);
	}

	.main-btn:hover {
		box-shadow: 6px 6px 0 0 black;
	}

	.swap-btn {
		min-width: 80px;
		width: 100%;
		padding: 0 1em 0 1em;
		font-weight: bold;
		font-size: 16px;
		height: 4em;
	}

	.error {
		display: flex;
		align-items: center;
		color: var(--title-color);
		gap: 10px;
		margin-left: 1em;
		font-size: 16px;
		font-family: var(--secondary-font);
		flex-wrap: wrap;
		max-width: 45%;
		font-size: 14px;
	}

	.help-btn {
		display: flex;
		position: relative;
		background: none;
		border: none;
		text-decoration: underline;
		font-style: italic;
		font-size: 12px;
		padding: 0;
		color: var(--text-color);
		cursor: pointer;
	}

	.help-content {
		background: var(--background-color);
		color: var(--text-color);
		text-align: left;
		padding: 1em;
		font-style: italic;
		border-radius: 8px;
		width: 200px;
		position: absolute;
		bottom: 2em;
		left: 50%;
		transform: translate(-50%, 0);
		z-index: 1;
		border: 1px solid black;
		box-shadow: 3px 3px 0 0 #8e8b8b;
	}

	.delay-header {
		display: flex;
		width: 100%;
		justify-content: space-between;
		align-items: center;
	}

	/* === Utilities === */
	.selected {
		background-color: var(--unstake-selection-color);
		color: var(--title-color);
	}

	.not-selected {
		background-color: var(--background-color);
		cursor: pointer;
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
