<script lang="ts">
	import { BigNumber } from 'bignumber.js';
	import { onMount } from 'svelte';
	import { inCancelWarningMenu, waterNeuronInfo } from '$lib/stores';
	import {
		isContainerHigher,
		displayUsFormat,
		fetchCreationTimestampSecs,
		bigintE8sToNumber
	} from '$lib';
	import type {
		WithdrawalDetails,
		WithdrawalStatus
	} from '$lib/../declarations/water_neuron/water_neuron.did';

	export let details: WithdrawalDetails;

	let cancelWarningDialog: HTMLDialogElement;
	let isHigher = false;
	let exchangeRate: BigNumber;
	let warningError: string | undefined;

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			cancelWarningDialog.close();
			inCancelWarningMenu.set(false);
		}
	}

	const nicpAfterCancel = (icpDue: BigNumber) => {
		const transactionFee = BigNumber(0.0001);
		const mergedIcp = icpDue.minus(2 * transactionFee);
		const nicpWithoutFee = mergedIcp.multipliedBy(exchangeRate);
		return nicpWithoutFee.minus(nicpWithoutFee.dividedBy(200));
	};

	const setWarningError = async () => {
		// const triggerErrorStatus = { status: {WaitingToSplitNeuron: null} };
		const key = Object.keys(details.status)[0] as keyof WithdrawalStatus;
		switch (key) {
			case 'WaitingDissolvement':
				const createdAt = await fetchCreationTimestampSecs(details.status[key].neuron_id);
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

	onMount(() => {
		cancelWarningDialog = document.getElementById('cancelWarningDialog') as HTMLDialogElement;
		cancelWarningDialog.showModal();
		isHigher = isContainerHigher('send');
		cancelWarningDialog.addEventListener('keydown', handleKeydown);
		exchangeRate = $waterNeuronInfo.exchangeRate();
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
			<p>Withdrawal {details.request.withdrawal_id} is not cancellable.</p>
			<div class="review-container">
				<p>{warningError}</p>
			</div>
			<div class="toggle-container">
				<button
					id="abort-btn"
					on:click={() => {
						inCancelWarningMenu.set(false);
						cancelWarningDialog.close();
					}}>Abort</button
				>
			</div>
		</div>
	{:else}
		<div class="warning-container">
			<h2>Confirm Action</h2>
			<p>
				Please, confirm that you want to cancel <i>withdrawal {details.request.withdrawal_id}.</i>
			</p>
			<div class="review-container">
				<p>
					Convert: <i>{displayUsFormat(bigintE8sToNumber(details.request.icp_due))} ICP</i>
				</p>
				{#if exchangeRate}
					<p>
						To: <i
							>{displayUsFormat(nicpAfterCancel(bigintE8sToNumber(details.request.icp_due)))} nICP</i
						>
					</p>
					<p>
						Current Exchange Rate: <i>{displayUsFormat(BigNumber(exchangeRate), 8)}</i>
					</p>
				{:else}
					<p>
						To: <i>-/- nICP</i>
					</p>
					<p>
						Current Exchange Rate: <i>-/-</i>
					</p>
				{/if}
				<p>
					Fee: <i>0.5%</i>
				</p>
			</div>
			<div class="toggle-container">
				<button
					id="abort-btn"
					on:click={() => {
						inCancelWarningMenu.set(false);
						cancelWarningDialog.close();
					}}>Abort</button
				>
				<button id="confirm-btn">Confirm</button>
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
		width: 80vw;
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
</style>
