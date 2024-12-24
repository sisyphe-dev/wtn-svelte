<script lang="ts">
	import { inLedgerMenu, inputAmount, ledgerDevice, toasts } from '$lib/stores';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { displayUsFormat, getMaybeAccount, isMobile, numberToBigintE8s } from '$lib';
	import { Toast as ToastMessage } from '$lib/toast';
	import { scale } from 'svelte/transition';
	import CopyIcon from '$lib/icons/CopyIcon.svelte';
	import { connectWithHardwareWallet } from '$lib/authentification';
	import BigNumber from 'bignumber.js';
	import UpIcon from '$lib/icons/UpIcon.svelte';
	import { AccountIdentifier } from '@dfinity/ledger-icp';

	let dialog: HTMLDialogElement;
	let isAnimating = false;
	let circleVisible = false;
	let accountId = false;
	let isSending = false;

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

	async function handleTransferRequest(amount: BigNumber, asset: 'ICP' | 'nICP' | 'WTN') {
		if (isSending || amount.isNaN() || !$ledgerDevice) return;
		isSending = true;
		const amount_e8s = numberToBigintE8s(amount);
		const maybeAccount = getMaybeAccount(
			'b3p43-6kp4b-pryzd-ictzz-ptuy3-rrsnb-4t4rx-pcue6-4bulj-7ztdu-lae'
		);
		if (!maybeAccount) {
			isSending = false;
			return;
		}

		try {
			switch (asset) {
				case 'ICP':
					if (maybeAccount instanceof AccountIdentifier) {
						const blockHeight = await $ledgerDevice.icpLedger.transfer({
							to: maybeAccount,
							amount: amount_e8s
						});

						toasts.add(
							ToastMessage.success(`Transaction completed at block height ${blockHeight}.`)
						);
					} else {
						const blockHeight = await $ledgerDevice.nicpLedger.transfer({
							to: maybeAccount,
							amount: amount_e8s,
							fee: 10_000n,
							created_at_time: BigInt(Date.now()) * BigInt(1e6)
						});

						toasts.add(
							ToastMessage.success(`Transaction completed at block height ${blockHeight}.`)
						);
					}
					break;
				case 'nICP':
					if (maybeAccount instanceof AccountIdentifier) {
						toasts.add(
							ToastMessage.error(
								'Transfer failed: nICP transfers require a principal. Please provide a valid principal.'
							)
						);
					} else {
						const blockHeight = await $ledgerDevice.nicpLedger.transfer({
							to: maybeAccount,
							amount: amount_e8s,
							fee: 10_000n,
							created_at_time: BigInt(Date.now()) * BigInt(1e6)
						});

						toasts.add(
							ToastMessage.success(`Transaction completed at block height ${blockHeight}.`)
						);
					}
					break;
				case 'WTN':
					if (maybeAccount instanceof AccountIdentifier) {
						toasts.add(
							ToastMessage.error(
								'Transfer failed: WTN transfers require a principal. Please provide a valid principal.'
							)
						);
					} else {
						const blockHeight = await $ledgerDevice.wtnLedger.transfer({
							to: maybeAccount,
							amount: amount_e8s,
							fee: 10_000n,
							created_at_time: BigInt(Date.now()) * BigInt(1e6)
						});

						toasts.add(
							ToastMessage.success(`Transaction completed at block height ${blockHeight}.`)
						);
					}
					break;
			}
		} catch (error) {
			console.error(error);
			toasts.add(ToastMessage.error('Transfer failed. Try again.'));
		}
		isSending = false;
		inputAmount.reset();
	}

	onMount(() => {
		connectWithHardwareWallet().then(() => $ledgerDevice?.identity.showAddressAndPubKeyOnDevice());
	});
</script>

<div class="address-container">
	<h2>ICP Account Id</h2>
	<div class="principal-container">
		<p title="accountIdentifier-hex" style:max-width="82%">{$ledgerDevice?.accountId}</p>
		<button
			class="copy-btn"
			on:click={() => {
				accountId = true;
				handleAnimation();
				navigator.clipboard.writeText($ledgerDevice ? $ledgerDevice.accountId : '');
			}}
		>
			<CopyIcon />
			{#if circleVisible && accountId}
				<div class="circle" transition:scale={{ duration: 500 }}></div>
			{/if}
		</button>
	</div>
	<p>
		{displayUsFormat($ledgerDevice ? $ledgerDevice.icpBalance() : BigNumber(0), 8)}
		ICP
	</p>
	<p>
		{displayUsFormat($ledgerDevice ? $ledgerDevice.nicpBalance() : BigNumber(0), 8)}
		nICP
	</p>
	{#if isMobile}
		<button
			class="mobile-action-btn"
			on:click={() => {
				handleTransferRequest(BigNumber(0.001), 'nICP');
			}}
		>
			<UpIcon />
		</button>
	{:else}
		<button
			class="action-btn"
			title="send-btn-ICP"
			on:click={() => {
				handleTransferRequest(BigNumber(0.001), 'nICP');
			}}
		>
			Send
		</button>
	{/if}
</div>
<div class="address-container">
	<h2>Principal Address</h2>
	<div class="principal-container">
		<p title="principal-ledgerDevice" style:max-width="80%">{$ledgerDevice?.principal}</p>
		<button
			class="copy-btn"
			on:click={() => {
				accountId = false;
				handleAnimation();
				navigator.clipboard.writeText($ledgerDevice ? $ledgerDevice.principal.toString() : '');
			}}
		>
			<CopyIcon />
			{#if circleVisible && !accountId}
				<div class="circle" transition:scale={{ duration: 500 }}></div>
			{/if}
		</button>
	</div>
</div>

<style>
	/* === Base Styles === */

	h2 {
		margin: 0;
		margin-top: 1em;
		font-family: var(--secondary-font);
	}

	p {
		font-family: var(--secondary-font);
		overflow-wrap: anywhere;
	}

	/* === Layout === */
	.principal-container {
		margin-left: 1em;
		display: flex;
		align-items: center;
	}

	.address-container {
		gap: 1em;
		display: flex;
		flex-direction: column;
	}

	/* === Components ==== */
	.copy-btn {
		background-color: transparent;
		border: none;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		position: relative;
	}

	/* === Animation === */

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
</style>
