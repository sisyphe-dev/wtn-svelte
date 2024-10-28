<script lang="ts">
	import {
		AssetType,
		displayUsFormat,
		numberToBigintE8s,
		Asset,
		E8S,
		isContainerHigher,
		getMaybeAccount,
		encodeTransferArgs
	} from '$lib';
	import {
		inSendingMenu,
		selectedAsset,
		user,
		toasts,
		canisters,
		inputAmount,
		handleInputAmount,
	} from '$lib/stores';
	import { onMount } from 'svelte';
	import { Toast as ToastMessage } from '$lib/toast';
	import BigNumber from 'bignumber.js';
	import { AccountIdentifier } from '@dfinity/ledger-icp';
	import {
		handleIcrcTransferResult,
		handleTransferResult,
		type ToastResult
	} from '$lib/resultHandler';
	import type {
		Tokens,
		TransferArgs,
		TransferArg
	} from '$lib/../declarations/icp_ledger/icp_ledger.did';
	import type { _SERVICE as icrcLedgerInterface } from '$lib/../declarations/icrc_ledger/icrc_ledger.did';
	import type { _SERVICE as icpLedgerInterface } from '$lib/../declarations/icp_ledger/icp_ledger.did';
	import { fade } from 'svelte/transition';
	import Toast from '../Toast.svelte';

	let principal: string;
	let isSending = false;
	let isHigher = false;
	let sendingDialog: HTMLDialogElement;

	function isValidAmount(amount: BigNumber): boolean {
		if (amount && $user) {
			return (
				$user.getBalance($selectedAsset.type).isGreaterThanOrEqualTo(amount) &&
				amount.isGreaterThanOrEqualTo(BigNumber(1).dividedBy(E8S))
			);
		} else {
			return true;
		}
	}

	async function handleTransferRequest(amount: BigNumber, accountString: string) {
		if (isSending || amount.isNaN() || !isValidAmount(amount) || !principal || !$canisters) return;
		isSending = true;
		const amount_e8s = numberToBigintE8s(amount);
		const maybeAccount = getMaybeAccount(accountString);
		if (!maybeAccount) {
			isSending = false;
			return;
		}

		try {
			const icrcArgs = {
				to: maybeAccount,
				fee: [],
				memo: [],
				from_subaccount: [],
				created_at_time: [],
				amount: amount_e8s
			} as TransferArg;

			let status: ToastResult;
			switch ($selectedAsset.type) {
				case AssetType.ICP:
					if (maybeAccount instanceof AccountIdentifier) {
						const args = {
							to: maybeAccount.toUint8Array(),
							fee: { e8s: 10000n } as Tokens,
							memo: 0n,
							from_subaccount: [],
							created_at_time: [],
							amount: { e8s: amount_e8s } as Tokens
						} as TransferArgs;
						status = await icpTransfer(args);
					} else {
						if ($canisters.icpLedger.authenticatedActor) {
							status = await icrcTransfer(icrcArgs, $canisters.icpLedger.authenticatedActor, 'ICP');
						} else {
							status = { success: false, message: 'User is not authenticated.' };
						}
					}
					break;
				case AssetType.nICP:
					if (maybeAccount instanceof AccountIdentifier) {
						status = {
							success: false,
							message:
								'Transfer failed: nICP transfers require a principal. Please provide a valid principal.'
						};
					} else {
						if ($canisters.nicpLedger.authenticatedActor) {
							status = await icrcTransfer(
								icrcArgs,
								$canisters.nicpLedger.authenticatedActor,
								'nICP'
							);
						} else {
							status = { success: false, message: 'User is not authenticated.' };
						}
					}
					break;
				case AssetType.WTN:
					if (maybeAccount instanceof AccountIdentifier) {
						status = {
							success: false,
							message:
								'Transfer failed: WTN transfers require a principal. Please provide a valid principal.'
						};
					} else {
						if ($canisters.wtnLedger.authenticatedActor) {
							status = await icrcTransfer(icrcArgs, $canisters.wtnLedger.authenticatedActor, 'WTN');
						} else {
							status = { success: false, message: 'User is not authenticated.' };
						}
					}
					break;
			}
			if (status.success) {
				toasts.add(ToastMessage.success(status.message));
				inSendingMenu.set(false);
			} else {
				toasts.add(ToastMessage.error(status.message));
			}
		} catch (error) {
			console.error(error);
			toasts.add(ToastMessage.error('Transfer failed. Try again.'));
		}
		isSending = false;
		inputAmount.reset();
	}

	async function icpTransfer(args: TransferArgs): Promise<ToastResult> {
		if (!$canisters?.icpLedger.authenticatedActor || !$user)
			return { success: false, message: 'User is not authenticated.' };

		try {
			const result = await $canisters?.icpLedger.authenticatedActor.transfer(args);
			return handleTransferResult(result);
		} catch (error) {
			console.error('[icpTransfer] ', error);
			return { success: false, message: 'Call failed. Please, try again.' };
		}
	}

	async function icrcTransfer(
		args: TransferArg,
		ledger: icrcLedgerInterface | icpLedgerInterface,
		asset: 'ICP' | 'nICP' | 'WTN'
	): Promise<ToastResult> {
		try {
			const transferResult = await ledger.icrc1_transfer(args);
			return handleIcrcTransferResult(transferResult, Asset.fromText(asset));
		} catch (error) {
			console.error('[icpTransfer] ', error);
			return { success: false, message: 'Call failed. Please, try again.' };
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			sendingDialog.close();
			inSendingMenu.set(false);
			inputAmount.reset();
		}
	}

	onMount(() => {
		sendingDialog = document.getElementById('senderDialog') as HTMLDialogElement;
		sendingDialog.showModal();
		isHigher = isContainerHigher('send');
		sendingDialog.addEventListener('keydown', handleKeydown);

		return () => {
			sendingDialog.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<dialog id="senderDialog" style:align-items={isHigher ? 'flex-start' : 'center'}>
	<div class="send-container" transition:fade={{ duration: 100 }}>
		<div class="header-container">
			<h2>Send {$selectedAsset.intoStr()}</h2>
			<img alt="ICP logo" src={$selectedAsset.getIconPath()} width="50px" height="50px" />
		</div>
		{#if $user}
			<div>
				<p>Balance</p>
				<div style:display={'flex'}>
					<div class="balances">
						<span style:margin-left={'1em'}
							>{displayUsFormat($user.getBalance($selectedAsset.type), 8)}
							{$selectedAsset.intoStr()}</span
						>
						<img
							alt="{$selectedAsset.intoStr()} logo"
							src={$selectedAsset.getIconPath()}
							width="20px"
							height="20px"
						/>
					</div>
				</div>
			</div>
		{/if}
		<div>
			<p>Destination</p>
			<input type="text" placeholder="Address" title="send-destination" bind:value={principal} />
			{#if principal && !getMaybeAccount(principal)}
				<span class="error"> Please enter a valid address. </span>
			{/if}
		</div>
		<div>
			<p>Amount</p>
			<div class="amount-input">
				<input
					title="send-amount"
					type="text"
					maxlength="20"
					bind:value={$inputAmount}
					placeholder="Amount"
					on:input={handleInputAmount}
				/>
				<button
					class="max-btn"
					on:click={() => {
						const fee = $selectedAsset.getTransferFee();
						const amount =
							$user && $user.getBalance($selectedAsset.type).isGreaterThanOrEqualTo(fee)
								? $user.getBalance($selectedAsset.type).minus(fee)
								: BigNumber(0);

						inputAmount.change(amount.toNumber() && amount.toNumber() >= 0 ? amount.toNumber() : 0);
					}}
				>
					MAX
				</button>
			</div>
			{#if !BigNumber($inputAmount).isNaN() && BigNumber($inputAmount).isGreaterThanOrEqualTo($user?.getBalance($selectedAsset.type) ?? BigNumber(0))}
				<span class="error"> Not enough treasury. </span>
			{:else if !BigNumber($inputAmount).isNaN() && BigNumber($inputAmount).isLessThan(BigNumber(1).dividedBy(E8S))}
				<span class="error">Minimum amount: 0.00000001</span>
			{/if}
		</div>
		<div>
			<p>Transfer Fee</p>
			<p style:padding-left="1em">
				{$selectedAsset.getTransferFee()}
				{$selectedAsset.intoStr()}
			</p>
		</div>
		<div class="button-container">
			{#if isSending}
				<button class="toggle-btn">
					<div class="spinner"></div>
				</button>
			{:else}
				<button
					class="toggle-btn"
					on:click={() => {
						sendingDialog.close();
						inSendingMenu.set(false);
						inputAmount.reset();
					}}>Cancel</button
				>
				<button
					class="toggle-btn"
					title="continue-btn"
					on:click={() => {
						handleTransferRequest(BigNumber($inputAmount), principal);
					}}
				>
					<span>Continue</span>
				</button>
			{/if}
		</div>
	</div>
	<Toast />
</dialog>

<style>
	/* === Base Styles === */

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

	input {
		border: var(--input-border);
		padding-left: 0.4em;
		height: 3em;
		font-size: 16px;
		color: var(--stake-text-color);
		background: var(--input-color);
		outline: none;
		margin-left: 1em;
		width: 90%;
		border-radius: 0.4em;
	}

	p {
		font-family: var(--secondary-font);
	}

	span {
		font-family: var(--secondary-font);
		display: flex;
		align-items: center;
	}

	button {
		color: var(--main-button-text-color);
	}

	/* === Layout === */
	.send-container {
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
	}

	.header-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 2%;
		font-family: var(--secondary-font);
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
		color: var(--stake-text-color);
		border: none;
		cursor: pointer;
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
		border-radius: 8px;
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
		cursor: pointer;
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
