<script lang="ts">
	import { Asset, AssetType, computeRewards, displayUsFormat } from '$lib';
	import SwapInput from './SwapInput.svelte';
	import { Toast } from '$lib/toast';
	import { inputValue, state, user, isLogging, isConverting, toasts } from '$lib/stores';
	import BigNumber from 'bignumber.js';

	let stake = true;

	function computeReceiveAmount(stake: boolean, inputValue: BigNumber): BigNumber {
		if (inputValue.isNaN()) return BigNumber(0);
		if (stake) {
			return inputValue.multipliedBy($state.exchangeRate());
		} else {
			return inputValue.dividedBy($state.exchangeRate());
		}
	}

	export async function convert(amount: BigNumber, stake: boolean) {
		if (!$user) return;
		if (stake) {
			if ($user.icpBalance().isGreaterThanOrEqualTo(amount) && amount.isGreaterThan(0)) {
				$user.substractBalance(AssetType.ICP, amount);
				$user.addBalance(AssetType.nICP, amount.multipliedBy($state.exchangeRate()));
				user.set($user);
				toasts.set([...$toasts, Toast.success('Converted ICP to nICP.')]);
			} else {
				toasts.set([...$toasts, Toast.error('Conversion failed.')]);
			}
		} else {
			if ($user.nicpBalance().isGreaterThanOrEqualTo(amount) && amount.isGreaterThan(0)) {
				$user.substractBalance(AssetType.nICP, amount);
				$user.addBalance(AssetType.ICP, BigNumber(amount).dividedBy($state.exchangeRate()));
				user.set($user);
				toasts.set([...$toasts, Toast.success('Converted nICP to ICP.')]);
			} else {
				toasts.set([...$toasts, Toast.error('Conversion failed.')]);
			}
		}
	}
</script>

<div class="main-container">
	<div class="header-container">
		<button
			class="header-btn"
			style:text-align="start"
			on:click={() => (stake = !stake)}
			class:selected={stake}
			class:not-selected={!stake}>Stake ICP</button
		>
		<button
			class="header-btn"
			style:text-align="end"
			on:click={() => (stake = !stake)}
			class:selected={!stake}
			class:not-selected={stake}>Unstake ICP</button
		>
	</div>
	<div class="swap-container">
		<SwapInput asset={stake ? new Asset(AssetType.ICP) : new Asset(AssetType.nICP)} />
		<div class="paragraphs">
			{#if stake}
				<p style:color="white">
					You will receive {displayUsFormat(computeReceiveAmount(stake, BigNumber($inputValue)), 8)} nICP
				</p>
				<p>
					1 ICP = {displayUsFormat($state.exchangeRate())} nICP
				</p>
				<p class="reward">
					Future WTN Airdrop: {displayUsFormat(
						computeRewards($state.totalIcpDeposited(), computeReceiveAmount(stake, BigNumber($inputValue))),
						8
					)}
					<img src="/tokens/WTN.png" width="30em" height="30em" alt="WTN logo" />
				</p>
			{:else}
				<p style:color="white">
					You will receive {displayUsFormat(computeReceiveAmount(stake, BigNumber($inputValue)), 8)} ICP
				</p>
				<p>
					1 nICP = {displayUsFormat(BigNumber(1).dividedBy($state.exchangeRate()))} ICP
				</p>
				<p>Waiting Time: 6 months</p>
				<p>Minimum Withdrawal: 10 ICP</p>
			{/if}
		</div>
		{#if !$user}
			<button
				class="swap-btn"
				on:click={() => {
					isLogging.update((_) => true);
				}}
			>
				<span>Connect your wallet</span>
			</button>
		{:else}
			<button class="swap-btn" on:click={() => convert(BigNumber($inputValue), stake)}>
				{#if $isConverting}
					<svg class="spinner" viewBox="0 0 50 50">
						<circle class="circle" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
					</svg>
				{:else}
					<span>Convert</span>
				{/if}
			</button>
		{/if}
	</div>
</div>

<style>
	/* === Base Styles === */
	p {
		color: rgb(176, 163, 217);
		font-family: Arial, Helvetica, sans-serif;
		font-weight: bold;
		text-align: end;
		margin: 0;
	}

	img {
		padding: 0.3em;
	}

	/* === Layout === */
	.main-container {
		display: flex;
		place-content: center;
		flex-direction: column;
		box-shadow: rgba(41, 49, 71, 0.1) 0px 8px 16px;
		width: 30em;
		max-width: 95vw;
	}

	.header-container {
		display: flex;
		justify-content: space-between;
	}

	.swap-container {
		display: flex;
		flex-direction: column;
		padding: 1em;
		border-left: 2px solid rgb(102, 173, 255);
		border-right: 2px solid rgb(102, 173, 255);
		border-bottom: 2px solid rgb(102, 173, 255);
		border-bottom-left-radius: 10px;
		border-bottom-right-radius: 10px;
		background-color: rgb(12, 44, 76);
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
		font-family: Arial, Helvetica, sans-serif;
		font-size: 1.2em;
		color: white;
		border: none;
		color: white;
		padding: 1em;
		width: 100%;
		cursor: pointer;
	}

	.reward {
		display: flex;
		align-items: center;
		justify-content: flex-end;
	}

	.swap-btn {
		color: black;
		background: #66adff;
		min-width: 80px;
		max-width: fit-content;
		position: relative;
		border: 2px solid black;
		font-size: 16px;
		font-weight: bold;
		box-shadow: 3px 3px 0 0 black;
		padding: 0 1em 0 1em;
		max-width: none;
		height: 4em;
	}

	.swap-btn:hover {
		box-shadow: 6px 6px 0 0 black;
	}

	/* === Utilities === */
	.selected {
		border-left: 2px solid rgb(102, 173, 255);
		border-top: 2px solid rgb(102, 173, 255);
		border-right: 2px solid rgb(102, 173, 255);
		background-color: rgb(12, 44, 76);
	}

	.not-selected {
		border-bottom: 2px solid rgb(102, 173, 255);
		background-color: #5d6b77;
		color: #c7c7c7;
	}

	/* === Animation === */

	.spinner {
		animation: rotate 2s linear infinite;
		z-index: 2;
		width: 40px;
		height: 40px;

		& .path {
			stroke: #0a1623;
			stroke-width: 7%;
			stroke-linecap: round;
			animation: dash 2s cubic-bezier(0.35, 0, 0.25, 1) infinite;
		}
	}

	@keyframes rotate {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	@keyframes dash {
		0% {
			stroke-dasharray: 1, 150;
			stroke-dashoffset: 0;
		}
		50% {
			stroke-dasharray: 90, 150;
			stroke-dashoffset: -35;
		}
		100% {
			stroke-dasharray: 90, 150;
			stroke-dashoffset: -124;
		}
	}
</style>
