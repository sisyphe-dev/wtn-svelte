<script lang="ts">
	import {
		Asset,
		AssetType,
		computeRewards,
		displayUsFormat,
		numberToBigintE8s,
		computeReceiveAmount
	} from '$lib';
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
		icpTransferApproved,
		nicpTransferApproved,
		handleStakeResult,
		handleUnstakeResult,
		handleIcpswapApproveResult,
		handleIcpswapResult,
		handleApproveResult,
		DEFAULT_ERROR_MESSAGE
	} from '$lib/resultHandler';
	import type { ApproveArgs } from '../declarations/icrc_ledger/icrc_ledger.did';
	import type { DepositArgs, SwapArgs, WithdrawArgs } from '$declarations/icpswap/icpswap.did';
	import type { ConversionArg } from '$declarations/water_neuron/water_neuron.did';
	import type { Account } from '@dfinity/ledger-icp';
	import { onMount, afterUpdate } from 'svelte';
	import { fade } from 'svelte/transition';

	let invertExchangeRate = false;
	let exchangeRate: BigNumber;
	let totalIcpDeposited: BigNumber;
	let minimumWithdraw: BigNumber;

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
				amount: numberToBigintE8s(amount)
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
				amount: amountE8s - fee
			} as DepositArgs);
			status = handleIcpswapResult(depositResult);
			if (!status.success) {
				toasts.add(Toast.error(status.message));
				return;
			}

			// 3. Swap
			const swapResult = await $canisters.icpswap.swap({
				amountIn: amountE8s.toString(),
				zeroForOne: true,
				amountOutMinimum: fee.toString()
			} as SwapArgs);
			status = handleIcpswapResult(swapResult);
			if (!status.success) {
				toasts.add(Toast.error(status.message));
				return;
			}

			// 4. Withdraw
			const withdrawResult = await $canisters.icpswap.withdraw({
				fee,
				token: 'ICP',
				amount: amountE8s - 2n * fee
			} as WithdrawArgs);
			status = handleIcpswapResult(withdrawResult);
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

	const fetchData = async () => {
		if ($waterNeuronInfo)
			try {
				exchangeRate = $waterNeuronInfo.exchangeRate();
				totalIcpDeposited = $waterNeuronInfo.totalIcpDeposited();
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
</script>

<div class="swap-container">
	<SwapInput asset={Asset.fromText('nICP')} />
	<div class="paragraphs" in:fade={{ duration: 500 }}>
		{#if $inputAmount && isNaN(parseFloat($inputAmount))}
			<span class="error">Cannot read amount</span>
		{:else if $inputAmount && minimumWithdraw && parseFloat($inputAmount) < minimumWithdraw}
			<span class="error">Minimum: {displayUsFormat(minimumWithdraw, 4)} nICP</span>
		{/if}
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
		<p>
			<button class="change-btn" on:click={() => (invertExchangeRate = !invertExchangeRate)}
				><img alt="Change icon" src="/icon/change.svg" height="25px" width="25px" />
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
		<p>Waiting Time: 6 months</p>
	</div>
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
		font-weight: bold;
		text-align: end;
		margin: 0;
		display: flex;
		justify-content: end;
		align-items: center;
		gap: 0.2em;
	}

	span {
		color: black;
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

	.paragraphs {
		display: flex;
		justify-content: space-around;
		flex-direction: column;
		height: 8em;
		position: relative;
	}

	.error {
		color: red;
		margin-left: 1em;
		font-size: 16px;
		font-family: var(--secondary-font);
		position: absolute;
		top: 0;
		flex-wrap: wrap;
		max-width: 45%;
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

	/* === Animation === */
	.change-btn:hover {
		transform: scale(1.2);
		animation: invert 0.5s ease;
	}

	.spinner {
		width: 2em;
		height: 2em;
		border: 3px solid black;
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
