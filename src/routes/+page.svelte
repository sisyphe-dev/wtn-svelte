<script lang="ts">
	import StatsWidget from './stake/StatsWidget.svelte';
	import Stake from './stake/Stake.svelte';
	import Unstake from './stake/Unstake.svelte';
	import Faq from './Faq.svelte';
	import { inputAmount } from '$lib/stores';
	import type { Account } from '@dfinity/ledger-icp';
	import { fade } from 'svelte/transition';

	let stake = true;
</script>

<StatsWidget />
<div class="main-container" in:fade={{ duration: 500 }}>
	<div class="header-container">
		<button
			class="header-btn"
			style:text-align="start"
			style:border-top-left-radius="8px"
			title="stake-header"
			on:click={() => {
				inputAmount.reset();
				stake = true;
			}}
			class:selected={stake}
			class:not-selected={!stake}><h2 style:left="1em">Stake ICP</h2></button
		>
		<button
			class="header-btn"
			style:text-align="end"
			style:border-top-right-radius="8px"
			title="unstake-header"
			on:click={() => {
				inputAmount.reset();
				stake = false;
			}}
			class:selected={!stake}
			class:not-selected={stake}><h2 style:right="1em">Unstake nICP</h2></button
		>
	</div>
	{#if stake}
		<Stake />
	{:else}
		<Unstake />
	{/if}
</div>
<Faq />

<style>
	/* === Basic Styles === /*
	h2 {
		font-family: var(--secondary-font);
		font-size: 17px;
		font-weight: bold;
		color: white;
	}

	/* === Layout === */
	.main-container {
		display: flex;
		justify-content: start;
		flex-direction: column;
		box-shadow: rgba(41, 49, 71, 0.1) 0px 8px 16px;
		width: 30em;
		max-width: 97vw;
	}

	.header-container {
		display: flex;
		justify-content: space-between;
	}
	/* === Components === */
	.header-btn {
		border: none;
		color: white;
		width: 100%;
		height: 4.5em;
		border: 2px solid transparent;
		padding: 0 2em;
	}

	/* === Utilities === */
	.selected {
		border-left: 2px solid var(--border-color);
		border-top: 2px solid var(--border-color);
		border-right: 2px solid var(--border-color);
		background-color: var(--background-color);
	}

	.not-selected {
		border-bottom: 2px solid var(--border-color);
		background-color: #5d6b77;
		color: #c7c7c7;
		cursor: pointer;
	}
</style>
