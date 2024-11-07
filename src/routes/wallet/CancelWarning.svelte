<script lang="ts">
	import { BigNumber } from 'bignumber.js';
	import { onMount } from 'svelte';
	import { inCancelWarningMenu, waterNeuronInfo, canisters, toasts } from '$lib/stores';
	import { Toast } from '$lib/toast';
	import {
		isContainerHigher,
		displayUsFormat,
		fetchCreationTimestampSecs,
		bigintE8sToNumber
	} from '$lib';
	import type {
		NeuronId,
		WithdrawalDetails,
		WithdrawalStatus
	} from '$lib/../declarations/water_neuron/water_neuron.did';
	import { handleCancelWithdrawalResult } from '$lib/resultHandler';

	export let details: WithdrawalDetails;

	let cancelWarningDialog: HTMLDialogElement;
	let isHigher = false;
	let exchangeRate: BigNumber;
	let warningError: string | undefined;
	let isConfirmBusy = false;

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			cancelWarningDialog.close();
			inCancelWarningMenu.set(false);
		}
	}

	const nicpAfterCancel = (icpDue: BigNumber) => {
		const transactionFee = BigNumber(0.0001);
		const mergedIcp = icpDue.minus(transactionFee.multipliedBy(2));
		const nicpWithoutFee = mergedIcp.multipliedBy(exchangeRate);
		return nicpWithoutFee.minus(nicpWithoutFee.dividedBy(200));
	};

	const setWarningError = async () => {
		// const triggerErrorStatus = { status: {WaitingToSplitNeuron: null} };
		const key = Object.keys(details.status)[0] as keyof WithdrawalStatus;
		switch (key) {
			case 'WaitingDissolvement':
				const value: { neuron_id: NeuronId } = details.status[key];
				const createdAt = await fetchCreationTimestampSecs(value.neuron_id);
				const currentTime = Date.now() / 1000;
				const twoWeeksSeconds = 14 * 24 * 60 * 60;
				if (currentTime - createdAt > twoWeeksSeconds) {
					warningError = 'Withdrawal is too close to disbursing.';
				} else {
					warningError = undefined;
				}
				break;
			case 'WaitingToStartDissolving':
				warningError = undefined;
				break;
			case 'NotFound':
				warningError = 'Withdrawal not found.';
				break;
			case 'Cancelled':
				warningError = 'Withdrawal already cancelled.';
				break;
			case 'WaitingToSplitNeuron':
				warningError = 'Waiting for the withdrawal to split.';
				break;
		}
	};

	const handleCancellation = async () => {
		if (!$canisters?.waterNeuron.authenticatedActor || !details.request.neuron_id[0]) return;

		isConfirmBusy = true;
		try {
			const result = await $canisters.waterNeuron.authenticatedActor.cancel_withdrawal(
				details.request.neuron_id[0]
			);
			const status = handleCancelWithdrawalResult(result);

			if (status.success) {
				toasts.add(Toast.success(status.message));
			} else {
				toasts.add(Toast.error(status.message));
			}
		} catch (error) {
			console.error(error);
			toasts.add(Toast.error('Call was rejected.'));
		}
		isConfirmBusy = false;
		inCancelWarningMenu.set(false);
		cancelWarningDialog.close();
	};

	onMount(() => {
		cancelWarningDialog = document.getElementById('cancelWarningDialog') as HTMLDialogElement;
		cancelWarningDialog.showModal();
		isHigher = isContainerHigher('send');
		cancelWarningDialog.addEventListener('keydown', handleKeydown);
		if ($waterNeuronInfo) {
			exchangeRate = $waterNeuronInfo.exchangeRate();
		}
		setWarningError();

		return () => {
			cancelWarningDialog.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<dialog id="cancelWarningDialog" style:align-items={isHigher ? 'flex-start' : 'center'}>
	{#if warningError}
		<div class="warning-container">
			<h2>Oups...</h2>
			<div class="review-container">
				<p>{warningError}</p>
			</div>
			<div class="toggle-container">
				<button
					id="abort-btn"
					on:click={() => {
						inCancelWarningMenu.set(false);
						cancelWarningDialog.close();
					}}>Back</button
				>
			</div>
		</div>
	{:else}
		<div class="warning-container">
			<h2>Cancel Withdrawal {details.request.withdrawal_id} </h2>
			<div class="review-container">
				<p>
					Convert: {displayUsFormat(bigintE8sToNumber(details.request.icp_due))} ICP
				</p>
				{#if exchangeRate}
					<p>
						To:
						{displayUsFormat(nicpAfterCancel(bigintE8sToNumber(details.request.icp_due)))} nICP
					</p>
					<p>
						Current Exchange Rate: {displayUsFormat(BigNumber(exchangeRate), 8)}
					</p>
				{:else}
					<p>To: -/- nICP</p>
					<p>Current Exchange Rate: -/-</p>
				{/if}
				<p>Fee: 0.5%</p>
			</div>
			<div class="toggle-container">
				<button
					id="abort-btn"
					on:click={() => {
						inCancelWarningMenu.set(false);
						cancelWarningDialog.close();
					}}>Back</button
				>
				{#if isConfirmBusy}
					<button id="confirm-btn">
						<div class="spinner"></div>
					</button>
				{:else}
					<button id="confirm-btn" on:click={handleCancellation}>Confirm</button>
				{/if}
			</div>
		</div>
	{/if}
</dialog>

<style>
	/* === Base styles === */
	::backdrop {
		backdrop-filter: blur(5px);
	}

	dialog {
		display: flex;
		background: transparent;
		justify-content: center;
		height: fit-content;
		min-height: 100%;
		min-width: 100dvw;
		padding: 0;
		margin: 0;
		border: none;
	}

	h2 {
		font-family: var(--main-font);
		align-self: center;
	}

	p {
		font-family: var(--secondary-font);
		margin: 0.4em;
		color: var(--title-color);
	}

	button {
		min-width: 80px;
		border-radius: 8px;
		position: relative;
		border: 2px solid black;
		font-size: 14px;
		box-shadow: 3px 3px 0 0 black;
		padding: 0 1em 0 1em;
		max-width: none;
		height: 3em;
		font-weight: bold;
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: pointer;
		margin-right: 1em;
	}

	button:hover {
		transform: scale(0.95);
		transition: all 0.3s;
		box-shadow: 6px 6px 0 0 black;
	}

	/* === Layout === */
	.warning-container {
		display: flex;
		flex-direction: column;
		height: fit-content;
		max-width: 35em;
		width: 50vw;
		background: var(--background-color);
		color: var(--stake-text-color);
		padding: 2em;
		border-radius: 15px;
		border: var(--input-border);
		gap: 1em;
	}

	.toggle-container {
		display: flex;
		width: 100%;
		justify-content: end;
		gap: 1em;
	}

	.review-container {
		display: flex;
		flex-direction: column;
		border-radius: 8px;
		background-color: var(--unstake-selection-color);
		padding: 1em;
	}

	/* === Components === */
	#abort-btn {
		background: var(--main-button-text-color);
		color: var(--main-color);
	}

	#confirm-btn {
		background: var(--main-color);
		color: var(--main-button-text-color);
	}

	/* === Animation === */

	.spinner {
		width: 1em;
		height: 1em;
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
</style>
