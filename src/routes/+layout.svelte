<script>
	import Navbar from './Navbar.svelte';
	import Footer from './Footer.svelte';
	import Connect from './Connect.svelte';
	import Send from './wallet/Send.svelte';
	import Menu from './Menu.svelte';
	import { is_logging, menu, is_sending } from '$lib/stores';
	import Toast from './Toast.svelte';
</script>

{#if $is_logging}
	<div class="background-filter">
		<Connect />
	</div>
{:else if $is_sending}
	<div class="background-filter">
		<Send />
	</div>
{/if}
{#if $menu}
	<Menu />
{:else}
	<div class="page-container">
		<Navbar />
		<div class="content-container" class:filter={$is_sending || $is_logging}>
			<slot />
		</div>
		<Footer />
	</div>
	<Toast />
{/if}

<style>
	/* === Layout === */
	.page-container {
		display: flex;
		flex-direction: column;
		height: fit-content;
		min-height: 100vh;
		width: 100%;
		background: radial-gradient(farthest-corner circle at 0% 0%, rgb(18 69 89), #0f0f4d);
	}

	.content-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: fit-content;
		min-height: 45vh;
		width: 100%;
		gap: 2em;
		padding-top: 2em;
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
