<script lang="ts">
	import {
		Asset,
		computeRewards,
		displayUsFormat,
		numberToBigintE8s,
		computeReceiveAmount
	} from '$lib';
	import SwapInput from './SwapInput.svelte';
	import { Toast } from '$lib/toast';
	import ChangeIcon from '$lib/icons/ChangeIcon.svelte';
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
		DEFAULT_ERROR_MESSAGE
	} from '$lib/resultHandler';
	import type { ApproveArgs } from '../declarations/icrc_ledger/icrc_ledger.did';
	import type { ConversionArg } from '$declarations/water_neuron/water_neuron.did';
	import type { Account } from '@dfinity/ledger-icp';
	import { onMount, afterUpdate } from 'svelte';
	import { fade } from 'svelte/transition';

	let invertExchangeRate = false;
	let exchangeRate: BigNumber;
	let totalIcpDeposited: BigNumber;

	async function icpToNicp(amount: BigNumber) {
		if (!$user || $isConverting || !$canisters || amount.isNaN() || amount.isLessThan(BigNumber(1)))
			return;
		isConverting.set(true);

		if ($user.icpBalance().isGreaterThanOrEqualTo(amount) && amount.isGreaterThan(0)) {
			try {
				let amountE8s = numberToBigintE8s(amount);
				const approveAmount = amountE8s * 3n;
				const approval = await icpTransferApproved(
					approveAmount,
					{
						owner: $user.principal,
						subaccount: []
					} as Account,
					$canisters.icpLedger
				);
				if (!approval.success) {
					toasts.add(Toast.error(approval.message ?? DEFAULT_ERROR_MESSAGE));
				} else {
					const conversionResult = await $canisters.waterNeuron.icp_to_nicp({
						maybe_subaccount: [],
						amount_e8s: amountE8s
					} as ConversionArg);
					const status = handleStakeResult(conversionResult);
					if (status.success) {
						toasts.add(Toast.success(status.message));
					} else {
						toasts.add(Toast.error(status.message));
					}
				}
			} catch (error) {
				console.log('icpToNicp error:', error);
				toasts.add(Toast.error('Call was rejected.'));
			}
		} else {
			toasts.add(Toast.error('Sorry, there are not enough funds in this account.'));
		}
		isConverting.set(false);
	}

	const fetchData = async () => {
		if ($waterNeuronInfo)
			try {
				exchangeRate = $waterNeuronInfo.exchangeRate();
				totalIcpDeposited = $waterNeuronInfo.totalIcpDeposited();
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
	<SwapInput asset={Asset.fromText('ICP')} />
	<div class="paragraphs" in:fade={{ duration: 500 }}>
		{#if $inputAmount && isNaN(parseFloat($inputAmount))}
			<span class="error">Cannot read amount</span>
		{:else if $inputAmount && parseFloat($inputAmount) < 1}
			<span class="error">Minimum amount: 1 ICP</span>
		{/if}
		<p style:color="var(--important-text-color)">
			{#if exchangeRate}
				You will receive {displayUsFormat(
					computeReceiveAmount(true, BigNumber($inputAmount), exchangeRate),
					8
				)} nICP
			{:else}
				-/-
			{/if}
		</p>
		<p style:display="flex">
			<button class="change-btn" on:click={() => (invertExchangeRate = !invertExchangeRate)}>
				<ChangeIcon />
			</button>
			{#if exchangeRate}
				{#if invertExchangeRate}
					1 nICP = {displayUsFormat(BigNumber(1).dividedBy(exchangeRate), 8)} ICP
				{:else}
					1 ICP = {displayUsFormat(exchangeRate, 8)} nICP
				{/if}
			{:else}
				-/-
			{/if}
		</p>
		<div class="reward">
			<p style:margin-right={'2.5em'}>
				Future WTN Airdrop:
				{#if exchangeRate && totalIcpDeposited}
					{computeRewards(
						totalIcpDeposited,
						computeReceiveAmount(true, BigNumber($inputAmount), exchangeRate)
					).toFixed(2)}
				{:else}
					-/-
				{/if}
			</p>
			<img src="/tokens/WTN.webp" width="30em" height="30em" alt="WTN logo" class="wtn-logo" />
		</div>
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
				icpToNicp(BigNumber($inputAmount));
			}}
			title="stake-unstake-btn"
		>
			{#if $isConverting}
				<div class="spinner"></div>
			{:else}
				<span>Stake</span>
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
		color: var(--main-button-text-color);
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

	.wtn-logo {
		padding: 0.3em;
		position: absolute;
	}

	.reward {
		display: inline-flex;
		align-items: center;
		justify-content: flex-end;
		position: relative;
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
