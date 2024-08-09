<script lang="ts">
	import StatsWidget from '../stake/StatsWidget.svelte';
	import SnsListing from './SnsListing.svelte';
	import CopyIcon from '$lib/icons/CopyIcon.svelte';
	import { fade, scale } from 'svelte/transition';
	import { sns, canisters, isBusy, toasts, handleSnsChange } from '$lib/stores';
	import { Toast } from '$lib/toast';
	import { handleSnsIcpDepositResult, handleSnsRetrieveNicpResult } from '$lib/resultHandler';
	import { Principal } from '@dfinity/principal';
	import { type Account, AccountIdentifier } from '@dfinity/ledger-icp';
	import BigNumber from 'bignumber.js';
	import { displayUsFormat, bigintE8sToNumber, isPrincipalValid } from '$lib';
	import { signIn, CANISTER_ID_BOOMERANG } from '$lib/authentification';
	import { fetchIcpBalance, fetchNicpBalance } from '$lib/state';
	import { encodeIcrcAccount } from '@dfinity/ledger-icrc';

	let isConfirmBusy: boolean;
	let isRetrieveBusy: boolean;
	let principalInput: string;

	const handleInputChange = async () => {
		if (!$canisters || $sns.name !== 'Custom') return;
		if (isPrincipalValid(principalInput)) {
			await handleSnsChange('Custom', principalInput);
		}
	};

	const notifyIcpDeposit = async () => {
		if ($isBusy || !$canisters || !isPrincipalValid($sns.principal)) return;
		try {
			isBusy.set(true);
			isConfirmBusy = true;
			const boomerangResult = await $canisters.boomerang.notify_icp_deposit(
				Principal.fromText($sns.principal)
			);
			const result = handleSnsIcpDepositResult(boomerangResult);
			if (result.success) {
				toasts.add(Toast.success(result.message));
			} else {
				toasts.add(Toast.error(result.message));
			}
		} catch (error) {
			console.log(error);
			toasts.add(Toast.error('Notify ICP deposit call failed, please retry.'));
		}
		isBusy.set(false);
		isConfirmBusy = false;
	};

	async function retrieveNicp() {
		if ($isBusy || !$canisters || !isPrincipalValid($sns.principal)) return;
		try {
			isBusy.set(true);
			isRetrieveBusy = true;
			const retrieveResult = await $canisters.boomerang.retrieve_nicp(
				Principal.fromText($sns.principal)
			);
			const result = await handleSnsRetrieveNicpResult(retrieveResult);
			if (result.success) {
				toasts.add(Toast.success(result.message));
			} else {
				toasts.add(Toast.error(result.message));
			}
		} catch (error) {
			console.log(error);
			toasts.add(Toast.error('Retrieve nICP call failed, please retry.'));
		}
		isBusy.set(false);
		isRetrieveBusy = false;
	}

	let isAnimating = false;
	let isCircleOwnerVisible = false;
	let isCircleSubaccountVisible = false;

	const handleAnimation = (target: 'owner' | 'subaccount') => {
		if (!isAnimating) {
			isAnimating = true;
			isCircleOwnerVisible = target === 'owner';
			isCircleSubaccountVisible = target === 'subaccount';
			setTimeout(() => {
				isCircleOwnerVisible = false;
				isCircleSubaccountVisible = false;
				setTimeout(() => {
					isAnimating = false;
				}, 500);
			}, 500);
		}
	};
</script>

<StatsWidget />
<div class="sns-stake-container" in:fade>
	<SnsListing />
	{#key $sns.name}
		<div class="boomerang-container" in:fade={{ duration: 500 }}>
			<div class="top-container">
				<div class="header-container">
					<h1>Stake <span style:color="var(--main-color)">{$sns.name}</span> Treasury</h1>
					<span style:color="white">
						{#if $sns.name === 'Custom'}
							Principal: <input
								type="text"
								placeholder="Address"
								bind:value={principalInput}
								on:input={handleInputChange}
							/>
						{:else}
							Goverance id: <a
								target="blank"
								href="https://dashboard.internetcomputer.org/canister/{$sns.principal}"
								class="dashboard">{$sns.principal}</a
							>
						{/if}
					</span>
				</div>
				<div class="balances-container">
					{#if $sns.icpBalance}
						<a
							target="blank"
							href="https://dashboard.internetcomputer.org/account/{$sns.hex}"
							class="balance dashboard">{displayUsFormat($sns.icpBalance)} ICP</a
						>
					{:else}
						<span class="balance">-/- ICP</span>
					{/if}
					{#if $sns.nicpBalance}
						<span class="balance">{displayUsFormat($sns.nicpBalance)} nICP</span>
					{:else}
						<span class="balance">-/- nICP</span>
					{/if}
				</div>
			</div>
			<div class="step-container" in:fade={{ duration: 500 }}>
				<div class="instruction-container">
					<div class="number-step-container">
						<span class="round">1</span>
					</div>
					<span>
						Submit a proposal to transfer ICP from the SNS Treasury to the following destination.
					</span>
				</div>
				<div class="account-container">
					<div class="principal-container">
						{#if $sns.encodedAccount}
							<p>{$sns.encodedAccount}</p>
						{:else}
							<p>-/-</p>
						{/if}
						<button
							class="copy-btn"
							on:click={() => {
								handleAnimation('subaccount');
								navigator.clipboard.writeText($sns.encodedAccount);
							}}
						>
							<CopyIcon />
							{#if isCircleSubaccountVisible}
								<div class="circle" transition:scale={{ duration: 500 }}></div>
							{/if}
						</button>
					</div>
				</div>
				<a
					class="action-btn"
					href="https://proposals.network/submit?g={$sns.principal}"
					target="blank"
				>
					Make a proposal
				</a>
			</div>
			<div class="step-container" in:fade={{ duration: 500 }}>
				<div class="instruction-container">
					<div class="number-step-container">
						<span class="round">2</span>
					</div>
					<span>Once the proposal is executed, notify the protocol of the transfer.</span>
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
					<span>Collect the minted nICP tokens to the governance canister of the SNS.</span>
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

	.dashboard {
		color: white;
		padding: 0.5em;
		font-family: var(--secondary-font);
	}

	h1 {
		color: white;
		font-size: 26px;
		font-family: var(--main-font);
		align-self: center;
		margin: 0;
	}

	input {
		border: none;
		padding-left: 0.4em;
		height: 2em;
		font-size: 15px;
		color: white;
		background: rgb(30, 52, 102);
		outline: none;
		margin-left: 1em;
		border-radius: 0.4em;
	}

	/* === Layout === */
	.sns-stake-container {
		background-color: #0c2c4c;
		border: 2px solid #66adff;
		border-radius: 10px;
		display: flex;
		height: 39em;
		width: 60em;
		max-width: 95dvw;
	}

	.boomerang-container {
		display: flex;
		flex-direction: column;
		width: 80%;
		align-items: start;
		justify-content: start;
		gap: 2em;
		padding: 3em;
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
		justify-content: center;
	}

	.account-container {
		display: flex;
		flex-direction: column;
		gap: 1em;
		width: 100%;
		height: 4em;
		justify-content: center;
		align-items: center;
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
		gap: 0.5em;
		height: 4em;
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
		box-shadow: 3px 3px 0 0 black;
		font-size: 16px;
		font-weight: bold;
		font-family: var(--secondary-font);
		display: flex;
		justify-content: center;
		align-items: center;
		width: 15em;
		height: 3em;
		text-decoration: none;
		color: black;
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
		padding: 0;
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

		.dashboard {
			font-size: 15px;
		}
	}
</style>
