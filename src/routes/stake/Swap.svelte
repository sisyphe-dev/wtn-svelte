<script lang="ts">
	import { Asset, AssetType, computeRewards, displayUsFormat, numberToBigintE8s } from '$lib';
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
		handleRetrieveResult,
		DEFAULT_ERROR_MESSAGE
	} from '$lib/resultHandler';
	import type { ConversionArg } from '$declarations/water_neuron/water_neuron.did';
	import type { Account } from '@dfinity/ledger-icp';
	import { onMount, afterUpdate } from 'svelte';
	import { fade } from 'svelte/transition';

	let stake = true;
	let invertExchangeRate = false;
	let exchangeRate: BigNumber;
	let totalIcpDeposited: BigNumber;
	let minimumWithdraw: BigNumber;

	function computeReceiveAmount(
		stake: boolean,
		value: BigNumber,
		exchangeRate: BigNumber
	): BigNumber {
		if (value.isNaN()) return BigNumber(0);

		if (exchangeRate) {
			if (stake) {
				return value.multipliedBy(exchangeRate);
			} else {
				return value.dividedBy(exchangeRate);
			}
		} else {
			return BigNumber(0);
		}
	}

	export async function icpToNicp(amount: BigNumber) {
		if (!$user || $isConverting || !$canisters) return;
		isConverting.set(true);

		if ($user.icpBalance().isGreaterThanOrEqualTo(amount) && amount.isGreaterThan(0)) {
			try {
				let amountE8s = numberToBigintE8s(amount);
				const approveAmount = numberToBigintE8s(amount.multipliedBy(3));
				const approval = await icpTransferApproved(
					approveAmount,
					{
						owner: $user.principal,
						subaccount: []
					} as Account,
					$canisters.icpLedger
				);
				if (!approval.success) {
					toasts.add(Toast.error(approval.message ?? DEFAULT_ERROR_MESAGE));
				} else {
					const conversionResult = await $canisters.waterNeuron.icp_to_nicp({
						maybe_subaccount: [],
						amount_e8s: amountE8s
					} as ConversionArg);
					let status = handleStakeResult(conversionResult);
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

	export async function nicpToIcp(amount: BigNumber) {
		if (!$user || $isConverting || !$canisters) return;
		isConverting.set(true);

		if ($user.nicpBalance().isGreaterThanOrEqualTo(amount) && amount.isGreaterThan(0)) {
			try {
				let amountE8s = numberToBigintE8s(amount);
				const approveAmount = numberToBigintE8s(amount.multipliedBy(3));
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
					let status = handleRetrieveResult(conversionResult);
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

<div class="main-container" in:fade={{ duration: 500 }}>
	{#key stake}
		<div class="header-container">
			<button
				class="header-btn"
				style:text-align="start"
				style:border-top-left-radius="8px"
				on:click={() => {
					stake = true;
					invertExchangeRate = false;
					inputAmount.set('');
				}}
				class:selected={stake}
				class:not-selected={!stake}><h2 class="header-txt" style:left="5%">Stake ICP</h2></button
			>
			<button
				class="header-btn"
				style:text-align="end"
				style:border-top-right-radius="8px"
				on:click={() => {
					stake = false;
					invertExchangeRate = false;
					inputAmount.set('');
				}}
				class:selected={!stake}
				class:not-selected={stake}><h2 class="header-txt" style:right="5%">Unstake nICP</h2></button
			>
		</div>
		<div class="swap-container">
			<SwapInput asset={stake ? Asset.fromText('ICP') : Asset.fromText('nICP')} />
			<div class="paragraphs" in:fade={{ duration: 500 }}>
				{#if stake}
					<p style:color="var(--orange-color)">
						{#if exchangeRate}
							You will receive {displayUsFormat(
								computeReceiveAmount(stake, BigNumber($inputAmount), exchangeRate),
								8
							)} nICP
						{:else}
							-/-
						{/if}
					</p>
					<p style:display="flex">
						<button class="change-btn" on:click={() => (invertExchangeRate = !invertExchangeRate)}
							><img alt="Change icon" src="/icon/change.svg" height="25px" width="25px" />
						</button>
						{#if exchangeRate}
							{#if invertExchangeRate}
								1 nICP = {displayUsFormat(BigNumber(1).dividedBy(exchangeRate))} ICP
							{:else}
								1 ICP = {displayUsFormat(exchangeRate)} nICP
							{/if}
						{:else}
							-/-
						{/if}
					</p>
					<div class="reward">
						<p style:margin-right={'2.5em'}>
							Future WTN Airdrop:
							{#if exchangeRate && totalIcpDeposited}
								{displayUsFormat(
									computeRewards(
										totalIcpDeposited,
										computeReceiveAmount(stake, BigNumber($inputAmount), exchangeRate)
									),
									8
								)}
							{:else}
								-/-
							{/if}
						</p>
						<img
							src="/tokens/WTN.webp"
							width="30em"
							height="30em"
							alt="WTN logo"
							class="wtn-logo"
						/>
					</div>
				{:else}
					<p style:color="var(--orange-color)">
						{#if exchangeRate}
							You will receive {displayUsFormat(
								computeReceiveAmount(stake, BigNumber($inputAmount), exchangeRate),
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
								1 nICP = {displayUsFormat(BigNumber(1).dividedBy(exchangeRate))} ICP
							{:else}
								1 ICP = {displayUsFormat(exchangeRate)} nICP
							{/if}
						{:else}
							-/-
						{/if}
					</p>
					<p>Waiting Time: 6 months</p>
					<p>
						{#if minimumWithdraw}
							Minimum Amount: {minimumWithdraw} nICP
						{:else}
							-/-
						{/if}
					</p>
				{/if}
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
						stake ? icpToNicp(BigNumber($inputAmount)) : nicpToIcp(BigNumber($inputAmount));
					}}
				>
					{#if $isConverting}
						<div class="spinner"></div>
					{:else if stake}
						<span>Stake</span>
					{:else}
						<span>Unstake</span>
					{/if}
				</button>
			{/if}
		</div>
	{/key}
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

	h2 {
		font-family: var(--secondary-font);
		font-size: 17px;
		font-weight: bold;
		color: white;
		position: absolute;
		top: 2.25em;
		margin: 0;
		transform: translate(0px, -100%);
	}

	/* === Layout === */
	.main-container {
		display: flex;
		justify-content: start;
		flex-direction: column;
		box-shadow: rgba(41, 49, 71, 0.1) 0px 8px 16px;
		width: 30em;
		max-width: 97vw;
	}

	.header-container {
		display: flex;
		justify-content: space-between;
		position: relative;
	}

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
	}

	/* === Components === */
	.header-btn {
		border: none;
		color: white;
		width: 100%;
		height: 4.5em;
	}

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

	/* === Utilities === */
	.selected {
		border-left: 2px solid var(--border-color);
		border-top: 2px solid var(--border-color);
		border-right: 2px solid var(--border-color);
		background-color: var(--background-color);
	}

	.not-selected {
		border-bottom: 2px solid var(--border-color);
		background-color: #5d6b77;
		color: #c7c7c7;
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
