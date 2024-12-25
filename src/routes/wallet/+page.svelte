<script lang="ts">
	import { goto } from '$app/navigation';
	import { selectedWallet, user, identityProvider } from '$lib/stores';
	import { isMobile } from '$lib';

	if (!$user) goto('/');

	import Withdrawals from './Withdrawals.svelte';
	import LedgerWallet from './LedgerWallet.svelte';
	import MainWallet from './MainWallet.svelte';
	import ArrowIcon from '$lib/icons/ArrowIcon.svelte';
	import { fade } from 'svelte/transition';
	import { LedgerIdentity } from '$lib/leger-wallet/identity';
	import { onMount } from 'svelte';

	let inMainWallet = true;
	let isSwitchVisible = false;

	const isDeviceDetected = async () => {
		try {
			await LedgerIdentity.create();
			isSwitchVisible = true;
		} catch (_) {
			isSwitchVisible = false;
			inMainWallet = true;
			selectedWallet.set('main');
		}
	};

	function identityProviderToImg(provider: 'ii' | 'plug' | 'nfid'): string {
		console.log(provider);
		if (provider == 'ii') {
			return '/icon/astronaut.webp';
		} else if (provider == 'plug') {
			return '/icon/plug.png';
		} else if (provider == 'nfid') {
			return '/icon/nfid.webp';
		}
		return '';
	}

	onMount(() => {
		isDeviceDetected();

		const intervalId = setInterval(async () => {
			await isDeviceDetected();
		}, 5000);

		return () => clearInterval(intervalId);
	});
</script>

<div class="wallet-menu-container" in:fade={{ duration: 500 }}>
	<div class="header-container">
		<h1>Wallet</h1>
		{#if isSwitchVisible}
			<button
				class="switch-btn"
				on:click={() => {
					inMainWallet = !inMainWallet;
					selectedWallet.set(inMainWallet ? 'main' : 'ledger');
				}}
			>
				<ArrowIcon direction="left" color="--main-color" />
				<ArrowIcon direction="right" color="--main-color" />
			</button>
		{/if}
		{#if identityProvider !== undefined}
			<div class="ledger-container">
				{#if !isMobile}
					<button>
						<p>use Ledger</p>
						<img src="/icon/ledger.svg" alt="" />
					</button>

					<img src={identityProviderToImg($identityProvider)} alt="" />
				{/if}
			</div>
		{/if}
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
		/* justify-content: center; */
		justify-content: space-between;
	}

	.header-container img {
		width: 50px;
		height: 50px;
	}

	.header-container button {
		background-color: none;
		display: flex;
		flex-direction: row;
	}

	.ledger-container {
		display: flex;
		flex-direction: row;
		gap: 0.5em;
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
