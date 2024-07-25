<script lang="ts">
	import { AssetType, displayUsFormat, isMobile } from '$lib';
	import { user, selectedAsset, inSendingMenu, state, isReceiving } from '$lib/stores';
	import BigNumber from 'bignumber.js';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import QRCodeScannerIcon from '$lib/icons/QRCodeScannerIcon.svelte';
	import UpIcon from '$lib/icons/UpIcon.svelte';

	export let asset;
	let wtnAllocation: BigNumber;

	const fetchAllocation = async () => {
		if ($state) wtnAllocation = await $state.wtnAllocation();
	};
	onMount(() => {
		fetchAllocation();
		const intervalId = setInterval(fetchAllocation, 5000);

		return () => clearInterval(intervalId);
	});
</script>

<div class="token-balance-container" in:fade={{ duration: 500 }}>
	<div class="balance">
		<p>
			{displayUsFormat($user ? $user.getBalance(asset.type) : BigNumber(0), 8)}
			{asset.intoStr()}
		</p>
		<img alt="{asset.intoStr()} logo" src={asset.getIconPath()} width="30px" height="30px" />
	</div>
	<div class="btns-container">
	
	
	<button
		class="action-btn"
		on:click={() => {
			inSendingMenu.set(true);
			selectedAsset.set(asset);
		}}>
		<QRCodeScannerIcon />
		</button
	>
	<button
		class="action-btn"
		on:click={() => {
			inSendingMenu.set(true);
			selectedAsset.set(asset);
		}}>
		<UpIcon />
		</button>
	</div>
	{#if asset.type === AssetType.WTN}
		<p class="airdrop-allocation">
			{#if isMobile}
				Airdrop:
			{:else}
				Airdrop Allocation:
			{/if}
			{#if wtnAllocation}
				{displayUsFormat(wtnAllocation)}
			{:else}
				-/-
			{/if} WTN
		</p>
	{/if}
</div>

<style>
	/* === Base Styles === */
	p {
		font-family: var(--font-type2);
	}

	/* === Layout === */
	.token-balance-container {
		display: flex;
		justify-content: space-between;
		position: relative;
		margin-left: 1em;
		align-items: center;
	}

	.btns-container {
		display: flex; 
		gap: 0.5em;
		align-items: center;
	}

	/* === Components ==== */
	.balance {
		display: flex;
		align-items: center;
		gap: 5px;
	}

	.airdrop-allocation {
		position: absolute;
		color: lightgrey;
		top: 50%;
		width: 60%;
		margin-top: 1em;
		font-family: var(--font-type2);
	}

	.action-btn {
		border: none;
		background: transparent;
		display: flex;
		cursor: pointer;
		color: var(--main-color);
	}

	.action-btn:hover {

	}
</style>
