<script lang="ts">
	import Withdrawals from './Withdrawals.svelte';
	import { AssetType, Asset, displayUsFormat } from '$lib';
	import { user, sendAsset, isSelecting } from '$lib/stores';
	import BigNumber from 'bignumber.js';
	import SendButton from './SendButton.svelte';

	let assets = [new Asset(AssetType.ICP), new Asset(AssetType.nICP), new Asset(AssetType.WTN)];
</script>

{#if $user}
	<div class="wallet-menu-container">
		<h1>Wallet</h1>
		<div class="address-container">
			<h2>ICP Account Id</h2>
			<div class="principal-container">
				<b>{$user?.accountId}</b>
				<button
					class="copy-btn"
					on:click={() => {
						navigator.clipboard.writeText($user ? $user.accountId : '');
					}}
				>
					<svg
						height="20px"
						width="20px"
						viewBox="0 0 20 20"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fill-rule="evenodd"
							clip-rule="evenodd"
							d="M6.75 3C5.23207 3 4 4.22862 4 5.74826V14.75H5.5V5.74826C5.5 5.05875 6.05879 4.5 6.75 4.5H12.75V3H6.75ZM8.75 7.25H13.75C14.0261 7.25 14.25 7.47386 14.25 7.75V15.75C14.25 16.0261 14.0261 16.25 13.75 16.25H8.75C8.47386 16.25 8.25 16.0261 8.25 15.75V7.75C8.25 7.47386 8.47386 7.25 8.75 7.25ZM6.75 7.75C6.75 6.64543 7.64543 5.75 8.75 5.75H13.75C14.8546 5.75 15.75 6.64543 15.75 7.75V15.75C15.75 16.8546 14.8546 17.75 13.75 17.75H8.75C7.64543 17.75 6.75 16.8546 6.75 15.75V7.75Z"
							fill="currentColor"
						></path>
					</svg>
				</button>
			</div>
			<SendButton asset={new Asset(AssetType.ICP)} />
		</div>
		<div class="address-container">
			<h2>Principal Address</h2>
			<div class="principal-container">
				<b>{$user?.principal}</b>
				<button
					class="copy-btn"
					on:click={() => {
						navigator.clipboard.writeText($user ? $user.principal.toString() : '');
					}}
				>
					<svg
						height="20px"
						width="20px"
						viewBox="0 0 20 20"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fill-rule="evenodd"
							clip-rule="evenodd"
							d="M6.75 3C5.23207 3 4 4.22862 4 5.74826V14.75H5.5V5.74826C5.5 5.05875 6.05879 4.5 6.75 4.5H12.75V3H6.75ZM8.75 7.25H13.75C14.0261 7.25 14.25 7.47386 14.25 7.75V15.75C14.25 16.0261 14.0261 16.25 13.75 16.25H8.75C8.47386 16.25 8.25 16.0261 8.25 15.75V7.75C8.25 7.47386 8.47386 7.25 8.75 7.25ZM6.75 7.75C6.75 6.64543 7.64543 5.75 8.75 5.75H13.75C14.8546 5.75 15.75 6.64543 15.75 7.75V15.75C15.75 16.8546 14.8546 17.75 13.75 17.75H8.75C7.64543 17.75 6.75 16.8546 6.75 15.75V7.75Z"
							fill="currentColor"
						></path>
					</svg>
				</button>
			</div>
			<SendButton asset={new Asset(AssetType.nICP)} />
			<SendButton asset={new Asset(AssetType.WTN)} />
		</div>
	</div>
	<Withdrawals />
{:else}
	<span>User not found.</span>
{/if}

<style>
	/* === Base Styles === */
	h1 {
		text-align: center;
		margin: 0;
		font-family: Arial, Helvetica, sans-serif;
	}

	h2 {
		margin: 0;
		margin-top: 1em;
		font-family: Arial, Helvetica, sans-serif;
	}

	span {
		font-family: Arial, Helvetica, sans-serif;
		font-weight: bold;
		font-size: 20px;
	}

	b {
		font-family: Arial, Helvetica, sans-serif;
	}

	/* === Layout === */
	.wallet-menu-container {
		background-color: #0c2c4c;
		border: 2px solid #66adff;
		border-radius: 10px;
		color: white;
		padding: 2em;
		display: flex;
		flex-direction: column;
		width: 40em;
		max-width: 80vw;
	}

	.principal-container {
		margin-left: 1em;
		display: flex;
		gap: 1em;
		margin-top: 1em;
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
		border-radius: 0.3em;
		transition: all 0.3s ease;
		margin: 0 1em;
		color: white;
		font-weight: bold;
	}

	.copy-btn:hover {
		background-color: #1e3466;
	}
</style>
