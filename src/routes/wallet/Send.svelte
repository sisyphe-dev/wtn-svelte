<script lang="ts">
	import { AssetType } from '$lib';
	import { is_sending, send_asset, user, toasts } from '$lib/stores';
	import { Toast } from '$lib/toast';

	let principal: string;
	let send_amount: number;

	function isValidPrincipal(principal: string): boolean {
		if (principal) {
			return principal.length === 4;
		} else {
			return true;
		}
	}

	function isValidAmount(amount: number): boolean {
		if (amount && $user) {
			return $user.getBalance($send_asset.type()) >= amount;
		} else {
			return true;
		}
	}

	function get_transfer_fee() {
		switch ($send_asset.type()) {
			case AssetType.ICP:
				return 0.0001;
			case AssetType.nICP:
				return 0.0001;
			case AssetType.WTN:
				return 0.01;
		}
	}

	function sendTokens(amount: number, principal: string) {
		if (amount && principal && isValidAmount(amount) && isValidPrincipal(principal) && $user) {
			switch ($send_asset.type()) {
				case AssetType.ICP:
					$user.substractBalance(AssetType.ICP, amount);
					break;
				case AssetType.nICP:
					$user.substractBalance(AssetType.nICP, amount);
					break;
				case AssetType.WTN:
					$user.substractBalance(AssetType.WTN, amount);
					break;
			}
			user.set($user);
			toasts.set([...$toasts, Toast.success('Successful transfer.')]);
		} else {
			toasts.set([...$toasts, Toast.error('Error while sending tokens.')]);
		}
	}
</script>

<div class="send-container">
	<div class="header-container">
		<h2>Send {$send_asset.intoStr()}</h2>
		<img alt="{$send_asset.intoStr()} logo" src={$send_asset.getUrl()} width="50px" height="50px" />
	</div>
	<div>
		<p>Destination</p>
		<input placeholder="Address" bind:value={principal} />
		{#if !isValidPrincipal(principal)}
			<span> Please enter a valid address. </span>
		{/if}
	</div>
	<div>
		<p>Amount</p>
		<div class="amount-input">
			<input type="number" placeholder="Amount" bind:value={send_amount} />
			<button
				class="max-btn"
				on:click={() => {
					send_amount = $user ? $user.getBalance($send_asset.type()) : 0;
				}}
			>
				MAX
			</button>
		</div>
		{#if !isValidAmount(send_amount)}
			<span> Not enough treasury. </span>
		{/if}
	</div>
	<div>
		<p>Transfer Fee</p>
		<p style:padding-left="1em">
			{get_transfer_fee()}
			{$send_asset.intoStr()}
		</p>
	</div>
	<div class="button-container">
		<button class="toggle-btn" on:click={() => is_sending.set(false)}>Cancel</button>
		<button
			class="toggle-btn"
			on:click={() => {
				sendTokens(send_amount, principal);
				is_sending.set(false);
			}}>Continue</button
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
		color: red;
		margin-left: 1em;
	}

	/* === Layout === */
	.send-container {
		position: fixed;
		z-index: 1;
		display: flex;
		flex-direction: column;
		max-width: 35em;
		width: 80vw;
		background: rgb(12, 44, 76);
		color: white;
		padding: 2em;
		border-radius: 15px;
		margin-left: 0.5em;
		margin-right: 0.5em;
		border: 2px solid rgb(102, 173, 255);
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
		background: #66adff;
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

	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
</style>
