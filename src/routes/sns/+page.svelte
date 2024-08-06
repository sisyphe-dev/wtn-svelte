<script lang="ts">
	import StatsWidget from '../stake/StatsWidget.svelte';
	import SnsListing from './SnsListing.svelte';
	import CopyIcon from '$lib/icons/CopyIcon.svelte';
	import { fade, scale } from 'svelte/transition';
	import { afterUpdate, onMount } from 'svelte';
	import { snsPrincipal, selectedSns, canisters, isBusy, toasts } from '$lib/stores';
	import { Toast } from '$lib/toast';
	import { handleSnsIcpDepositResult, handleSnsRetrieveNicpResult } from '$lib/resultHandler';
	import { Principal } from '@dfinity/principal';
	import BigNumber from 'bignumber.js';
	import { displayUsFormat, bigintE8sToNumber } from '$lib';
	import { signIn } from '$lib/authentification';
	import { fetchIcpBalance, fetchNicpBalance } from '$lib/state';

	export let data;

	let accountId: string;
	let icpBalance: BigNumber;
	let nicpBalance: BigNumber;

	let isConfirmBusy: boolean;
	let isRetrieveBusy: boolean;

	const setAccountId = async (principal: string) => {
		if (!$canisters) return;
		try {
			$canisters.boomerang.get_staking_account_id(Principal.fromText(principal)).then((account) => {
				accountId = account;
			});
		} catch (error) {
			console.log(error);
		}
	};

	const notifyIcpDeposit = async () => {
		if ($isBusy || !$canisters) return;
		try {
			isBusy.set(true);
			isConfirmBusy = true;
			const boomerangResult = await $canisters.boomerang.notify_icp_deposit(
				Principal.fromText($snsPrincipal)
			);

			const result = handleSnsIcpDepositResult(boomerangResult);
			if (result.success) {
				toasts.add(Toast.success(result.message));
			} else {
				toasts.add(Toast.error(result.message));
			}
			isBusy.set(false);
			isConfirmBusy = false;
		} catch (error) {
			console.log(error);
			toasts.add(Toast.error('Call failed.'));
			isBusy.set(false);
			isConfirmBusy = false;
		}
	};

	async function retrieveNicp() {
		if ($isBusy || !$canisters) return;
		try {
			isBusy.set(true);
			isRetrieveBusy = true;
			const retrieveResult = await $canisters.boomerang.retrieve_nicp(
				Principal.fromText($snsPrincipal)
			);

			const result = await handleSnsRetrieveNicpResult(retrieveResult);
			if (result.success) {
				toasts.add(Toast.success(result.message));
			} else {
				toasts.add(Toast.error(result.message));
			}
			isBusy.set(false);
			isRetrieveBusy = false;
		} catch (error) {
			console.log(error);
			toasts.add(Toast.error('Call failed.'));
			isBusy.set(false);
			isRetrieveBusy = false;
		}
	}

	async function fetchSnsBalances() {
		if (!$canisters) return;
		try {
			const principal = Principal.fromText($snsPrincipal);
			icpBalance = bigintE8sToNumber(await fetchIcpBalance(principal, $canisters.icpLedger));
			nicpBalance = bigintE8sToNumber(await fetchNicpBalance(principal, $canisters.nicpLedger));
		} catch (error) {
			console.log(error);
		}
	}
	afterUpdate(() => {
		setAccountId($snsPrincipal);
	});

	onMount(() => {
		signIn('reload').then(() => {
			fetchSnsBalances();
		});

		const intervalId = setInterval(async () => {
			await fetchSnsBalances();
		}, 5000);

		return () => clearInterval(intervalId);
	});

	let isAnimating = false;
	let circleVisible = false;

	function handleAnimation() {
		if (!isAnimating) {
			isAnimating = true;
			circleVisible = true;
			setTimeout(() => {
				circleVisible = false;
				setTimeout(() => {
					isAnimating = false;
				}, 500);
			}, 500);
		}
	}
</script>

<StatsWidget />
<div class="sns-stake-container" in:fade>
	<SnsListing {data} />
	{#key $selectedSns}
		<div class="boomerang-container" in:fade={{ duration: 500 }}>
			<div class="top-container">
				<div class="header-container">
					<h1>Stake <span style:color="var(--main-color)">{$selectedSns}</span> Treasury</h1>
					<a target="blank" href="https://dashboard.internetcomputer.org/canister/{$snsPrincipal}"
						>Goverance id: {$snsPrincipal}</a
					>
				</div>
				<div class="balances-container">
					{#if icpBalance}
						<span class="balance">{displayUsFormat(icpBalance)} ICP</span>
					{:else}
						<span>-/-</span>
					{/if}
					{#if nicpBalance}
						<span class="balance">{displayUsFormat(nicpBalance)} nICP</span>
					{:else}
						<span>-/-</span>
					{/if}
				</div>
			</div>
			<div class="step-container" in:fade={{ duration: 500 }}>
				<div class="instruction-container">
					<div class="number-step-container">
						<span class="round">1</span>
					</div>
					<span
						>Submit a proposal to transfer part of the SNS Treasury to the following account
						identifier.</span
					>
				</div>
				<div class="principal-container">
					<p>{accountId}</p>
					<button
						class="copy-btn"
						on:click={() => {
							handleAnimation();
							navigator.clipboard.writeText(accountId);
						}}
					>
						<CopyIcon />
						{#if circleVisible}
							<div class="circle" transition:scale={{ duration: 500 }}></div>
						{/if}
					</button>
				</div>
			</div>
			<div class="step-container" in:fade={{ duration: 500 }}>
				<div class="instruction-container">
					<div class="number-step-container">
						<span class="round">2</span>
					</div>
					<span>Once the proposal is approved, notify the protocol of the transfer.</span>
				</div>
				{#if isConfirmBusy}
					<button class="action-btn">
						<div class="spinner"></div>
					</button>
				{:else}
					<button class="action-btn" on:click={notifyIcpDeposit}>Confirm SNS deposit</button>
				{/if}
			</div>
			<div class="step-container" in:fade={{ duration: 500 }}>
				<div class="instruction-container">
					<div class="number-step-container">
						<span class="round">3</span>
					</div>
					<span>Collect the minted nICP tokens to the SNS principal.</span>
				</div>
				{#if isRetrieveBusy}
					<button class="action-btn">
						<div class="spinner"></div>
					</button>
				{:else}
					<button class="action-btn" on:click={retrieveNicp}>Retrieve nICP</button>
				{/if}
			</div>
		</div>
	{/key}
</div>

<style>
	/* === Base Styles === */
	span {
		color: var(--text-color);
		overflow-wrap: anywhere;
		font-family: var(--secondary-font);
	}

	p {
		font-family: var(--secondary-font);
		font-weight: bold;
		overflow-wrap: anywhere;
		margin: 0;
	}

	a {
		text-decoration: none;
		color: white;
		padding: 1em;
		font-family: var(--secondary-font);
	}

	h1 {
		color: white;
		font-size: 26px;
		font-family: var(--main-font);
		align-self: center;
		margin: 0;
	}

	/* === Layout === */
	.sns-stake-container {
		background-color: #0c2c4c;
		border: 2px solid #66adff;
		border-radius: 10px;
		display: flex;
	}

	.boomerang-container {
		display: flex;
		flex-direction: column;
		width: 80%;
		align-items: start;
		justify-content: start;
		gap: 2em;
		padding: 1em;
	}

	.step-container {
		display: flex;
		flex-direction: column;
		background: none;
		align-items: center;
		height: fit-content;
		width: 100%;
		border: none;
		gap: 1em;
	}

	.principal-container {
		display: flex;
		align-items: center;
		width: 100%;
		justify-content: center;
	}

	.number-step-container {
		display: flex;
		align-items: center;
		gap: 1em;
	}

	.top-container {
		display: flex;
		justify-content: space-around;
		width: 100%;
		position: relative;
		align-items: center;
	}

	.header-container {
		display: flex;
		flex-direction: column;
		width: 100%;
		justify-content: center;
		align-items: center;
	}

	.instruction-container {
		display: flex;
		align-items: center;
		gap: 1em;
		width: 90%;
	}

	.balances-container {
		display: flex;
		flex-direction: column;
		align-items: end;
		width: fit-content;
		position: absolute;
		right: 0;
	}

	/* === Component === */
	.action-btn {
		background: var(--main-color);
		border: 2px solid black;
		border-radius: 8px;
		font-size: 16px;
		box-shadow: 3px 3px 0 0 black;
		padding: 0.5em 1em;
		font-size: 16px;
		font-weight: bold;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 15em;
		height: 3em;
	}

	.action-btn:hover {
		transform: scale(0.95);
		transition: all 0.3s;
		box-shadow: 6px 6px 0 0 black;
	}

	.copy-btn {
		background-color: transparent;
		border: none;
		cursor: pointer;
		border-radius: 0.3em;
		transition: all 0.3s ease;
		color: white;
		font-weight: bold;
		display: flex;
		position: relative;
	}

	.balance {
		display: flex;
		text-align: end;
		width: fit-content;
		color: white;
		font-family: var(--main-font);
		font-size: 18px;
	}

	/* === Utilities === */
	.round {
		border-radius: 50%;
		color: var(--text-color);
		border: 2px solid;
		width: 1em;
		height: fit-content;
		padding: 0.2em;
		font-weight: bold;
		text-align: center;
		font-family: var(--font-type2);
	}

	.circle {
		position: absolute;
		border-radius: 50%;
		background-color: rgb(37, 139, 255, 0.5);
		width: 25px;
		height: 25px;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	/* === Animation === */

	.spinner {
		width: 1em;
		height: 1em;
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

	@media (max-width: 767px) {
		.sns-stake-container {
			flex-direction: column;
			justify-content: start;
			align-items: center;
			height: fit-content;
		}

		.boomerang-container {
			width: 95%;
			padding: 1em 0 1em 0;
			gap: 2em;
			align-items: center;
		}

		.step-container {
			width: 98%;
			justify-content: center;
		}

		.header-container {
			flex-direction: column;
			gap: 1em;
			align-items: center;
		}

		.instruction-container {
			gap: 1em;
		}

		.balances-container {
			display: none;
		}

		a {
			font-size: 15px;
		}
	}
</style>
