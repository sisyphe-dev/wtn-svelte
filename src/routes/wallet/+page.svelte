<script lang="ts">
	import { goto } from '$app/navigation';
	import { user, ledgerDevice, toasts } from '$lib/stores';
	import { isMobile } from '$lib';

	if (!$user) goto('/');

	import Withdrawals from './Withdrawals.svelte';
	import LedgerWallet from './LedgerWallet.svelte';
	import MainWallet from './MainWallet.svelte';
	import { fade } from 'svelte/transition';
	import { connectWithHardwareWallet } from '$lib/authentification';
	import { Toast } from '$lib/toast';

	let inMainWallet = true;

	function displayInstruction(): string {
		if (!$user) return '';

		return ($user.account === 'ledger') ? `Back to ${$user.identityProvider}` : 'Use Ledger Nano';
	}

	function displayWalletName(): string {
		if (!$user) return '';

		if ($user.account === 'main') {
			switch ($user.identityProvider) {
				case 'Plug': return 'Plug';
				case 'II': return 'Internet Identity';
				case 'Nfid': return 'Nfid'
			}
		} 
		return 'Ledger Nano'
	}

	async function handleLedgerConnection() {
		if (!$user) return;

		try {
			if (!$ledgerDevice) {
				await connectWithHardwareWallet();
			}
			inMainWallet = !inMainWallet;
			$user.account = inMainWallet ? 'main' : 'ledger';
		} catch(e) {
			console.error(e);
			toasts.add(Toast.error('Failed to connect Ledger device.'))
		}
	}
</script>

<div class="wallet-menu-container" in:fade={{ duration: 500 }}>
	{#key inMainWallet}
	<div class="header-container">
		<div class="wallet-info-container">
			<h1>{displayWalletName()}</h1>
		</div>
		{#if !isMobile}
			<button
				on:click={handleLedgerConnection}
			>
				<p>{displayInstruction()}</p>
			</button>
		{/if}
	</div>
	{#if inMainWallet}
		<MainWallet />
	{:else}
		<LedgerWallet />
	{/if}
	{/key}
</div>
<Withdrawals />

<style>
	/* === Base Styles === */
	h1 {
		margin: 0;
		font-family: var(--secondary-font);
		display: flex;
		align-items: center;
		gap: 0.5em;
	}

	 p {
		display: flex;
		align-items: center;
		gap: 0.5em;
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
		align-items: center;
		justify-content: space-between;
	}

	.wallet-info-container {
		display: flex;
		align-items: center;
		gap: 0.5em;
	}

	/* === Components ==== */
	.header-container button {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1em;
		background: var(--main-color);
		color: var(--main-button-text-color);
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
		cursor: pointer;
	}

	.header-container button:hover {
		transform: scale(0.95);
		transition: all 0.3s;
		box-shadow: 6px 6px 0 0 black;
	}
</style>
