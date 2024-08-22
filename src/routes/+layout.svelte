<script lang="ts">
	import Navbar from './Navbar.svelte';
	import Footer from './Footer.svelte';
	import Connect from './Connect.svelte';
	import Send from './wallet/Send.svelte';
	import Menu from './Menu.svelte';
	import SnsMenu from './sns/SnsMenu.svelte';
	import Receive from './wallet/Receive.svelte';
	import {
		isLogging,
		inMobileMenu,
		inSendingMenu,
		inReceivingMenu,
		inSnsMenu,
		user,
		canisters,
		waterNeuronInfo,
		sns,
		handleSnsChange
	} from '$lib/stores';
	import { onMount } from 'svelte';
	import {
		WaterNeuronInfo,
		User,
		fetchIcpBalance,
		fetchNicpBalance,
		fetchWtnBalance,
		fetchWtnAllocation
	} from '$lib/state';
	import { signIn } from '$lib/authentification';
	import Toast from './Toast.svelte';

	async function updateBalances() {
		if ($canisters && $user) {
			$user.icpBalanceE8s = await fetchIcpBalance($user.principal, $canisters.icpLedger);
			$user.nicpBalanceE8s = await fetchNicpBalance($user.principal, $canisters.nicpLedger);
			$user.wtnBalanceE8s = await fetchWtnBalance($user.principal, $canisters.wtnLedger);
			$user.wtnAllocationE8s = await fetchWtnAllocation($user.principal);
		}
	}

	async function updateWaterNeuronInfo() {
		if ($canisters) {
			waterNeuronInfo.set(new WaterNeuronInfo(await $canisters.waterNeuron.get_info()));
		}
	}

	onMount(() => {
		signIn('reload').then(() => {
			updateBalances();
			updateWaterNeuronInfo();
			handleSnsChange('BOOM DAO', 'xomae-vyaaa-aaaaq-aabhq-cai');
		});

		const intervalId = setInterval(async () => {
			await updateBalances();
			await updateWaterNeuronInfo();
		}, 5000);

		return () => clearInterval(intervalId);
	});
</script>

{#if $isLogging}
	<div class="background-filter">
		<Connect />
	</div>
{:else if $inSendingMenu}
	<Send />
{:else if $inReceivingMenu}
	<Receive />
{/if}
{#if $inMobileMenu}
	<Menu />
{:else if $inSnsMenu}
	<SnsMenu />
{:else}
	<div class="page-container">
		<Navbar />
		<div class="content-container" class:filter={$inReceivingMenu || $inSendingMenu || $isLogging}>
			<slot />
		</div>
		<Footer />
		{#if !$inSendingMenu}
			<Toast />
		{/if}
	</div>
{/if}

<style>
	/* === Variables === */
	:root {
		--toast-text-color: var(--main-button-text-color);

		--border-size: 1px;

		--main-font: 'Akrobat-black';
		--secondary-font: Arial;

		--padding: 8px;
		--padding-0_25x: calc(var(--padding) / 4);
		--padding-0_5x: calc(var(--padding) / 2);
		--padding-1_5x: calc(1.5 * var(--padding));
		--padding-2x: calc(2 * var(--padding));
		--padding-3x: calc(3 * var(--padding));
		--padding-4x: calc(4 * var(--padding));
		--padding-6x: calc(6 * var(--padding));
		--padding-8x: calc(8 * var(--padding));
		--card-background-contrast: var(--main-color);
		--card-background: white;
	}

	:root[theme='light'] {
		--main-color: #283e95;
		--important-text-color: black;
		--stake-text-color: black;

		--title-color: black;
		--border-color: #454545;
		--page-background: #fcfffd;
		--background-color: #fcfffd;
		--qr-code-background: #fcfffd;

		--input-color: #fcfffd;

		--main-button-text-color: white;

		--input-border: 2px solid var(--border-color);

		--text-color: rgb(127 127 127);
		--faq-color: black;

		--svg-fill-color: #000000;
		--svg-opposite-color: #b3b3b3;
		--sns-selected-button-color: rgb(107 180 249 / 50%);
	}

	:root[theme='dark'] {
		--svg-fill-color: #ffffff;
		--svg-opposite-color: #7f7f7f;
		--stake-text-color: white;
		--important-text-color: var(--orange-color);

		--main-color: #4c66dc;
		--qr-code-background: #4c66dc;

		--main-button-text-color: #fcfffd;
		--title-color: white;

		--border-color: rgb(158 163 178);
		--input-border: 2px solid var(--border-color);
		--background-color: #0d1432;
		--input-color: #0d1432;
		--text-color: rgb(181 181 181);

		--faq-color: white;

		--page-background: #0d1432;
		--sns-selected-button-color: rgba(107, 249, 201, 0.5);
	}

	@font-face {
		font-family: 'Akrobat-black';
		src: url('/Akrobat-Black.ttf') format('truetype');
		font-weight: normal;
		font-style: normal;
	}

	/* === Layout === */
	.page-container {
		display: flex;
		flex-direction: column;
		height: fit-content;
		min-height: 100%;
		width: 100vw;
		background: var(--page-background);
	}

	.page-container::-webkit-scrollbar {
		width: 12px; /* Width of the scrollbar */
		background: radial-gradient(
			farthest-corner circle at 0% 0%,
			rgb(18, 69, 89),
			#0f0f4d
		); /* Match the background gradient */
	}

	.page-container::-webkit-scrollbar-track {
		background: radial-gradient(
			farthest-corner circle at 0% 0%,
			rgb(18, 69, 89),
			#0f0f4d
		); /* Match the background gradient */
	}

	.page-container::-webkit-scrollbar-thumb {
		background-color: rgba(255, 255, 255, 0.5); /* Thumb color with transparency */
		border-radius: 6px; /* Rounded corners for the thumb */
		background-clip: padding-box;
	}

	.page-container::-webkit-scrollbar-corner {
		background: radial-gradient(
			farthest-corner circle at 0% 0%,
			rgb(18, 69, 89),
			#0f0f4d
		); /* Match the background gradient */
	}

	.content-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: start;
		height: fit-content;
		min-height: 45vh;
		flex-grow: 1;
		width: 100%;
		gap: 3em;
		padding-top: 2em;
		margin-bottom: 4em;
		color: white;
	}

	/* === Components === */
	.background-filter {
		position: fixed;
		width: 100vw;
		height: 100vh;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* === Utilities ===*/
	.filter {
		filter: blur(5px);
	}
</style>
