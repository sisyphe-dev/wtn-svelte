<script lang="ts">
	import { goto } from '$app/navigation';
	import { inLedgerMenu, user } from '$lib/stores';

	if (!$user) goto('/');

	import Withdrawals from './Withdrawals.svelte';
	import LedgerWallet from './LedgerWallet.svelte';
	import MainWallet from './MainWallet.svelte';
	import ArrowIcon from '$lib/icons/ArrowIcon.svelte';
	import { fade } from 'svelte/transition';

	let inMainWallet = true;
</script>

<div class="wallet-menu-container" in:fade={{ duration: 500 }}>
	<div class="header-container">
		<h1>{inMainWallet ? 'Main Wallet' : 'Ledger Wallet'}</h1>
		<button class="switch-btn" on:click={() => (inMainWallet = !inMainWallet)}>
			<ArrowIcon direction="left" color="--main-color" />
			<ArrowIcon direction="right" color="--main-color" />
		</button>
	</div>
	{#if inMainWallet}
		<MainWallet />
	{:else}
		<LedgerWallet />
	{/if}
</div>
<Withdrawals />

<style>
	/* === Base Styles === */
	h1 {
		margin: 0;
		font-family: var(--secondary-font);
	}

	/* === Layout === */
	.wallet-menu-container {
		background-color: var(--background-color);
		border: var(--input-border);
		border-radius: 10px;
		color: var(--stake-text-color);
		padding: 2em;
		display: flex;
		flex-direction: column;
		width: 44em;
		max-width: 80vw;
	}

	.header-container {
		display: flex;
		position: relative;
		align-items: center;
		justify-content: center;
	}

	/* === Components ==== */
	.switch-btn {
		background: none;
		border: none;
		cursor: pointer;
		position: absolute;
		right: 0;
	}
</style>
