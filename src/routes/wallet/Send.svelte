<script lang="ts">
	import { AssetType, numberToBigintE8s } from '$lib';
	import { isSelecting, sendAsset, user, toasts, state, isSending } from '$lib/stores';
	import { Toast } from '$lib/toast';
	import BigNumber from 'bignumber.js';
	import type { Account } from '@dfinity/ledger-icp';
	import { Principal } from '@dfinity/principal';
	import type {
		TransferArg,
		Icrc1TransferResult
	} from '../../declarations/nns-ledger/nns-ledger.did';
	import { handleTransferResult } from '$lib/ledger';

	let principal: string;
	let sendAmount: BigNumber;

	function isValidPrincipal(principal: string): boolean {
		if (!principal) return true;
		try {
			Principal.fromText(principal);
			return true;
		} catch (e) {
			return false;
		}
	}

	function isValidAmount(amount: BigNumber): boolean {
		if (amount && $user) {
			return $user.getBalance($sendAsset.type).isGreaterThanOrEqualTo(amount);
		} else {
			return true;
		}
	}

	async function icrcTransfer(amount: BigNumber, principal: string) {
		isSending.set(true);
		if (amount && principal && isValidAmount(amount) && isValidPrincipal(principal)) {
			let transferResult: Icrc1TransferResult;
			switch ($sendAsset.type) {
				case AssetType.ICP: {
					transferResult = await $state.icpLedger.icrc1_transfer({
						to: {
							owner: Principal.fromText(principal),
							subaccount: []
						} as Account,
						fee: [],
						memo: [],
						from_subaccount: [],
						created_at_time: [],
						amount: numberToBigintE8s(amount)
					} as TransferArg);
				}
				case AssetType.nICP: {
					transferResult = await $state.nicpLedger.icrc1_transfer({
						to: {
							owner: Principal.fromText(principal),
							subaccount: []
						} as Account,
						fee: [],
						memo: [],
						from_subaccount: [],
						created_at_time: [],
						amount: numberToBigintE8s(amount)
					} as TransferArg);
				}
				case AssetType.WTN: {
					transferResult = await $state.wtnLedger.icrc1_transfer({
						to: {
							owner: Principal.fromText(principal),
							subaccount: []
						} as Account,
						fee: [],
						memo: [],
						from_subaccount: [],
						created_at_time: [],
						amount: numberToBigintE8s(amount)
					} as TransferArg);
				}
			}

			let status = handleTransferResult(transferResult);
			if (status.success) {
				toasts.set([...$toasts, Toast.success(`asset sent.`)]);
			} else {
				toasts.set([...$toasts, Toast.error(`Conversion failed. ${status.message}`)]);
			}
			isSelecting.set(false);
		}
		isSending.set(false);
	}
</script>

<div class="send-container">
	<div class="header-container">
		<h2>Send {$sendAsset.intoStr()}</h2>
		<img alt="{$sendAsset.intoStr()} logo" src={$sendAsset.getUrl()} width="50px" height="50px" />
	</div>
	<div>
		<p>Destination</p>
		<input placeholder="Address" bind:value={principal} />
		{#if !isValidPrincipal(principal)}
			<span class="error"> Please enter a valid address. </span>
		{/if}
	</div>
	<div>
		<p>Amount</p>
		<div class="amount-input">
			<input type="number" placeholder="Amount" bind:value={sendAmount} />
			<button
				class="max-btn"
				on:click={() => {
					sendAmount = $user ? $user.getBalance($sendAsset.type) : BigNumber(0);
				}}
			>
				MAX
			</button>
		</div>
		{#if !isValidAmount(sendAmount)}
			<span class="error"> Not enough treasury. </span>
		{/if}
	</div>
	<div>
		<p>Transfer Fee</p>
		<p style:padding-left="1em">
			{$sendAsset.getTransferFee()}
			{$sendAsset.intoStr()}
		</p>
	</div>
	<div class="button-container">
		<button class="toggle-btn" on:click={() => isSelecting.set(false)}>Cancel</button>
		<button
			class="toggle-btn"
			on:click={() => {
				icrcTransfer(sendAmount, principal);
			}}
			>{#if $isSending}
				<svg class="spinner" viewBox="0 0 50 50">
					<circle class="circle" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
				</svg>
			{:else}
				<span>Continue</span>
			{/if}</button
		>
	</div>
</div>

<style>
	/* === Base Styles === */
	input {
		border: none;
		padding-left: 0.4em;
		height: 3em;
		font-size: 16px;
		color: white;
		background: rgb(30, 52, 102);
		outline: none;
		margin-left: 1em;
		width: 90%;
		border-radius: 0.4em;
	}

	p {
		font-family: Arial, Helvetica, sans-serif;
	}

	span {
		font-family: Arial, Helvetica, sans-serif;
	}

	/* === Layout === */
	.send-container {
		position: fixed;
		z-index: 1;
		display: flex;
		flex-direction: column;
		max-width: 35em;
		width: 80vw;
		background: var(--background-color);
		color: white;
		padding: 2em;
		border-radius: 15px;
		margin-left: 0.5em;
		margin-right: 0.5em;
		border: 2px solid var(--border-color);
	}

	.header-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 2%;
		font-family: Arial, Helvetica, sans-serif;
	}

	.button-container {
		display: flex;
		justify-content: end;
		gap: 1em;
	}

	/* === Componennts === */
	.error {
		color: red;
		margin-left: 1em;
	}
	.max-btn {
		position: absolute;
		right: 8%;
		background: none;
		color: white;
		border: none;
	}

	.amount-input {
		position: relative;
		display: flex;
		align-items: center;
	}

	.toggle-btn {
		color: black;
		background: var(--main-color);
		min-width: 80px;
		position: relative;
		border: 2px solid black;
		font-size: 16px;
		box-shadow: 3px 3px 0 0 black;
		padding: 0 1em 0 1em;
		max-width: none;
		height: 60px;
		font-weight: bold;
	}

	.toggle-btn:hover {
		transform: scale(0.95);
		transition: all 0.3s;
		box-shadow: 6px 6px 0 0 black;
	}

	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
</style>
