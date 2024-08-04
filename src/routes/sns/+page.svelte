<script lang="ts">
	import SnsListing from './SnsListing.svelte';
	import Step1 from './Step1.svelte';
	import Step2 from './Step2.svelte';
	import Step3 from './Step3.svelte';
	import { selectedSns, snsPrincipal, toasts, isBusy, canisters } from '$lib/stores';
	import { fade, scale } from 'svelte/transition';

	export let data;
	let selectedStep: 'Step1' | 'Step2' | 'Step3' = 'Step1';
</script>

<div class="sns-container" transition:fade>
	<SnsListing {data} />
	{#key $selectedSns}
		<div class="boomerang-container" in:fade={{ duration: 500 }}>
			<h1>Stake {$selectedSns} Treasury</h1>
			<div class="fetched-info-container">
				<p style:font-weight="lighter">Governance id:</p>
				<p style:color="var(--main-color)">{$snsPrincipal}</p>
			</div>
			<Step1 />
			<Step2 />
			<Step3 />
		</div>
	{/key}
</div>

<style>
	/* === Base Styles === */
	h1 {
		color: white;
		font-size: 26px;
		font-family: var(--font-type1);
		align-self: center;
		text-align: center;
	}

	nav {
		display: flex;
		width: 100%;
		justify-content: space-around;
		gap: 1em;
	}

	button {
		background-color: transparent;
		border: none;
		cursor: pointer;
		border-radius: 0.3em;
		transition: all 0.3s ease;
		padding: 0.8em 1em;
		font-size: 20px;
		flex-grow: 1;
		color: white;
		font-weight: bold;
	}

	button:hover {
		background-color: #1e3466;
	}

	/* === Layout === */
	.sns-container {
		background-color: #0c2c4c;
		border: 2px solid #66adff;
		border-radius: 10px;
		display: flex;
		justify-content: center;
		width: 45em;
		height: fit-content;
		max-width: 95dvw;
	}

	.boomerang-container {
		display: flex;
		flex-direction: column;
		width: 80%;
		align-items: start;
		justify-content: start;
		gap: 2em;
		padding: 1em;
	}

	.fetched-info-container {
		display: flex;
		gap: 1em;
	}

	/* === Utilities === */
	.selected-step {
		background-color: #1e3466;
	}

	@media (max-width: 767px) {
		.sns-container {
			flex-direction: column;
			justify-content: start;
			height: 30em;
		}

		.boomerang-container {
			width: 100%;
			padding: 0 0 1em 0;
			gap: 1em;
			align-items: center;
		}

		nav {
			max-width: 95%;
			justify-content: center;
		}

		.step2-container {
			width: 95%;
		}

		span {
			text-align: center;
		}

		.fetched-info-container {
			flex-direction: column;
			gap: 0;
			align-items: center;
		}

		.input-container {
			gap: 0;
		}
	}
</style>
