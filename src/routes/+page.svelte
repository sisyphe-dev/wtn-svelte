<script lang="ts">
	import { language } from '$lib/stores';
	import StatsWidget from './stake/StatsWidget.svelte';
	import Swap from './stake/Swap.svelte';
	import { fade, slide } from 'svelte/transition';
</script>

<StatsWidget />
<Swap />

<style>
	/* === Base Styles ===*/
	.faq {
		display: flex;
		align-items: center;
		flex-direction: column;
		width: 90vw;
		max-width: 800px;
		overflow-y: auto;
	}

	h1 {
		color: white;
		font-size: 42px;
		font-family: var(--main-font);
	}

	h2 {
		color: white;
		font-size: 1.5em;
		text-align: start;
	}

	p {
		color: var(--text-color);
		font-weight: 400;
		font-family: CircularXX, sans-serif;
		-webkit-font-smoothing: antialiased;
		line-height: 24px;
	}

	/* === Components === */

	.faq-btn {
		background: none;
		border: none;
		border-bottom: 2px solid;
		border-color: white;
		margin-top: 2em;
		padding-top: 2em;
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin: 0;
	}

	.lang-btn {
		background: none;
		border: none;
		color: white;
		cursor: pointer;
	}
	/* === Layout === */
	.lang-selection {
		display: flex;
	}

	/* Utilities */
	.arrow-up {
		transform: rotate(0);
	}

	.arrow-down {
		transform: rotate(180deg);
	}

	.language-active {
		text-decoration: underline;
	}
</style>
