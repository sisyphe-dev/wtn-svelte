<script lang="ts">
	import SnsListing from './SnsListing.svelte';
	import CopyIcon from '$lib/icons/CopyIcon.svelte';
	import { fade, scale } from 'svelte/transition';
	import { afterUpdate } from 'svelte';
	import { snsPrincipal, selectedSns, canisters, isBusy, toasts } from '$lib/stores';
	import { Toast } from '$lib/toast';
	import { handleSnsIcpDepositResult, handleSnsRetrieveNicpResult } from '$lib/resultHandler';
	import { Principal } from '@dfinity/principal';

	export let data;
	let accountId: string;
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

	afterUpdate(() => {
		setAccountId($snsPrincipal);
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

<div class="sns-container" transition:fade>
	<SnsListing {data} />
	{#key $selectedSns}
		<div class="boomerang-container" in:fade={{ duration: 500 }}>
			<h1>Stake {$selectedSns} Treasury</h1>
			<div class="fetched-info-container">
				<p>Goverance id:</p>
				<p style:color="var(--main-color)">{$snsPrincipal}</p>
			</div>
			<div class="step-container" in:fade={{ duration: 500 }}>
				<div class="instruction-container">
					<span class="round">1</span>
				</div>
				<div class="receive-container">
					<span>Make an ICP Treasury proposal to the following account identifier.</span>
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
			</div>
			<div class="step-container" in:fade={{ duration: 500 }}>
				<div class="instruction-container">
					<span class="round">2</span>
				</div>
				<div class="balance-container">
				{#if isConfirmBusy}
					<button class="action-btn">
						<div class="spinner"></div>
					</button>
				{:else}
					<button class="action-btn" on:click={notifyIcpDeposit}>Confirm SNS deposit</button>
				{/if}
				</div>
			</div>
			<div class="step-container" in:fade={{ duration: 500 }}>
				<div class="instruction-container">
					<span class="round">3</span>
				</div>
				<div class="balance-container">
				{#if isRetrieveBusy}
					<button class="action-btn">
						<div class="spinner"></div>
					</button>
				{:else}
					<button class="action-btn" on:click={retrieveNicp}>Retrieve Nicp</button>
				{/if}
				</div>
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
	}

	h1 {
		color: white;
		font-size: 26px;
		font-family: var(--main-font);
		align-self: center;
	}

	/* === Layout === */
	.sns-container {
		background-color: #0c2c4c;
		border: 2px solid #66adff;
		border-radius: 10px;
		display: flex;
		width: 60em;
		height: fit-content;
		max-width: 95dvw;
	}

	.boomerang-container {
		display: flex;
		flex-direction: column;
		width: 80%;
		align-items: start;
		justify-content: start;
		gap: 1em;
		padding: 1em;
	}

	.step-container {
		display: flex;
		justify-content: start;
		background: none;
		align-items: center;
		height: fit-content;
		width: 100%;
		border: none;
		margin: 2%;
		gap: 1em;
	}

	.principal-container {
		display: flex;
		align-items: center;
		width: 100%;
		justify-content: center;
	}

	.instruction-container {
		display: flex;
		align-items: center;
		gap: 1em;
	}

	.fetched-info-container{
		display: flex;
		gap: 0.5em;
		width: 100%;
		justify-content: center;
	}

	.receive-container {
		display: flex;
		flex-direction: column;
		align-items: center;
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
		.sns-container {
			flex-direction: column;
			justify-content: start;
			height: fit-content;
		}

		.boomerang-container {
			width: 100%;
			padding: 0 0 1em 0;
			gap: 1em;
			align-items: center;
		}

		.step-container {
			width: 95%;
			justify-content: center;
		}

		span {
			text-align: center;
		}

		p {
			margin: 0;
			text-align: center;
		}

		.fetched-info-container {
			flex-direction: column;
			gap: 0;
			align-items: center;
		}

		.input-container {
			gap: 0;
		}

		.receive-container {
			gap: 1em;
		}

		.round {
			display:none;
		}
	}
</style>
