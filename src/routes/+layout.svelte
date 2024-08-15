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
		<Toast />
	</div>
{/if}

<style>
	/* === Variables === */
	:root {
		--main-color: #283e95;
		--background-color: #091121;
		--main-color-transparent: #283e9575;
		--main-nuanced-color: #7d98ff;

		--not-selected-color: #5d6b77;

		--anchor-color: white;

		--main-font: 'Akrobat-black';
		--secondary-font: Arial;
	}

	:root[theme='light'] {
		--svg-fill-color: #000000; /* Black for light theme */
		--svg-opposite-color: #b3b3b3; /* Optional: Stroke color */
		--text-color: #000000;
		--stake-text-color: #000000;
		--page-background: #f1fff6;
		--faq-color: #000000;
		--title-color: #000000;
		--input-color: #f1fff6;
		--border-color: #454545;
	}

	:root[theme='dark'] {
		--svg-fill-color: #ffffff; /* White for dark theme */
		--svg-opposite-color: #e1e1e1; /* Optional: Stroke color */
		--text-color: #cbcbcb;
		--page-background: #091121;
		--stake-text-color: #ffffff;
		--faq-color: #ffffff;
		--title-color: #ffffff;
		--border-color: #d4d4d4;
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
