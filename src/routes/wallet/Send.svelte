<script lang="ts">
	import { AssetType, displayUsFormat, numberToBigintE8s } from '$lib';
	import { isSelecting, sendAsset, user, toasts, state, isSending } from '$lib/stores';
	import { Toast } from '$lib/toast';
	import BigNumber from 'bignumber.js';
	import { type Account, AccountIdentifier } from '@dfinity/ledger-icp';
	import { Principal } from '@dfinity/principal';
	import {
		handleIcrcTransferResult,
		handleTransferResult,
		type ConversionResult
	} from '$lib/ledger';
	import type {
		Tokens,
		TransferArgs,
		TransferArg
	} from '../../declarations/nns-ledger/nns-ledger.did';

	let principal: string;
	let sendAmount: BigNumber;

	function getReceiver(input: string): Principal | AccountIdentifier | undefined {
		try {
			const principal = Principal.fromText(input);
			return principal;
		} catch (e) {
			if ($sendAsset.type === AssetType.ICP) {
				try {
					if (input.length !== 64) return undefined;
					const accountId = AccountIdentifier.fromHex(input);
					return accountId;
				} catch (error) {
					console.log(error);
					return undefined;
				}
			}
			console.log(e);
			return undefined;
		}
	}

	function isValidAmount(amount: BigNumber): boolean {
		if (amount && $user) {
			return $user.getBalance($sendAsset.type).isGreaterThanOrEqualTo(amount);
		} else {
			return true;
		}
	}

	async function icrcTransfer(amount: BigNumber, input: string) {
		if ($isSending) return;

		isSending.set(true);
		if (amount && principal && isValidAmount(amount)) {
			const amount_e8s = numberToBigintE8s(amount);
			const receiver = getReceiver(input);
			if (!receiver) {
				isSending.set(false);
				return;
			}

			let status: ConversionResult;
			switch ($sendAsset.type) {
				case AssetType.ICP:
					{
						if (receiver instanceof Principal) {
							const transferResult = await $state.icpLedger.icrc1_transfer({
								to: {
									owner: receiver,
									subaccount: []
								} as Account,
								fee: [],
								memo: [],
								from_subaccount: [],
								created_at_time: [],
								amount: amount_e8s
							} as TransferArg);
							status = handleIcrcTransferResult(transferResult);
						} else {
							const transferResult = await $state.icpLedger.transfer({
								to: receiver.toUint8Array(),
								fee: { e8s: 10000n } as Tokens,
								memo: 0n,
								from_subaccount: [],
								created_at_time: [],
								amount: { e8s: amount_e8s } as Tokens
							} as TransferArgs);
							status = handleTransferResult(transferResult);
						}
					}
					break;
				case AssetType.nICP:
					{
						const transferResult = await $state.nicpLedger.icrc1_transfer({
							to: {
								owner: receiver,
								subaccount: []
							} as Account,
							fee: [],
							memo: [],
							from_subaccount: [],
							created_at_time: [],
							amount: amount_e8s
						} as TransferArg);
						status = handleIcrcTransferResult(transferResult);
					}
					break;
				case AssetType.WTN:
					{
						const transferResult = await $state.wtnLedger.icrc1_transfer({
							to: {
								owner: receiver,
								subaccount: []
							} as Account,
							fee: [],
							memo: [],
							from_subaccount: [],
							created_at_time: [],
							amount: amount_e8s
						} as TransferArg);
						status = handleIcrcTransferResult(transferResult);
					}
					break;
			}

			if (status.success) {
				toasts.add(Toast.success(status.message));
			} else {
				toasts.add(Toast.error(status.message));
			}
			isSelecting.set(false);
			isSending.set(false);
		}
		isSending.set(false);
		isSelecting.set(false);
	}
</script>

<div class="send-container">
	<div class="header-container">
		<h2>Send {$sendAsset.intoStr()}</h2>
		<img alt="ICP logo" src={$sendAsset.getUrl()} width="50px" height="50px" />
	</div>
	{#if $user}
		<div>
			<p>Balance</p>
			<div style:display={'flex'}>
				<div class="balances">
					<span>{displayUsFormat($user.getBalance($sendAsset.type), 8)} {$sendAsset.intoStr()}</span
					>
					<img
						alt="{$sendAsset.intoStr()} logo"
						src={$sendAsset.getUrl()}
						width="20px"
						height="20px"
					/>
				</div>
			</div>
		</div>
	{/if}
	<div>
		<p>Destination</p>
		<input placeholder="Address" bind:value={principal} />
		{#if principal && !getReceiver(principal)}
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
					sendAmount =
						$user &&
						$user.getBalance($sendAsset.type).isGreaterThanOrEqualTo($sendAsset.getTransferFee())
							? $user.getBalance($sendAsset.type).minus($sendAsset.getTransferFee())
							: BigNumber(0);

					sendAmount = BigNumber(parseFloat(sendAmount.toNumber().toString().replace(",", ".")));
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
		{#if $isSending}
			<button
				class="toggle-btn"
				on:click={() => {
					icrcTransfer(sendAmount, principal);
				}}
			>
				<div class="spinner"></div>
			</button>
		{:else}
			<button class="toggle-btn" on:click={() => isSelecting.set(false)}>Cancel</button>
			<button
				class="toggle-btn"
				on:click={() => {
					icrcTransfer(sendAmount, principal);
				}}
			>
				<span>Continue</span>
			</button>
		{/if}
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
		font-family: var(--font-type2);
	}

	span {
		font-family: var(--font-type2);
		margin-left: 1em;
		display: flex;
		align-items: center;
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
		font-family: var(--font-type2);
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

	.balances {
		display: flex;
		align-items: center;
		gap: 0.5em;
	}

	.toggle-btn {
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
		display: flex;
		justify-content: center;
		align-items: center;
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

	/* === Animation === */

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
</style>
