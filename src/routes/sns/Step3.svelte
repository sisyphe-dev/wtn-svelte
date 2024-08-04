<script lang="ts">
	import { Principal } from '@dfinity/principal';
	import { selectedSns, snsPrincipal, isBusy, toasts, canisters } from '$lib/stores';
	import { fade } from 'svelte/transition';
	import { handleSnsRetrieveNicpResult } from '$lib/result';
	import { Toast } from '$lib/toast';

	async function retrieveNicp() {
		if ($isBusy || !$canisters) return;
		try {
			isBusy.set(true);
			const retrieveResult = await $canisters.boomerang.retrieve_nicp(
				Principal.fromText($snsPrincipal)
			);

			const result = await handleSnsRetrieveNicpResult(retrieveResult);
			if (result.success) {
				toasts.add(Toast.success(result.message));
			} else {
				toasts.add(Toast.error(result.message));
			}
			isBusy.set(false);
		} catch (error) {
			console.log(error);
			toasts.add(Toast.error('Call failed.'));
			isBusy.set(false);
		}
	}
</script>

<div class="step3-container" in:fade={{ duration: 500 }}>
	<div class="instruction-container">
		<span class="round">3</span>
		<span>Retrieve Nicp.</span>
	</div>
	{#if $isBusy}
		<button>
			<div class="spinner"></div>
		</button>
	{:else}
		<button on:click={retrieveNicp}>Retrieve</button>
	{/if}
</div>

<style>
	/* === Base Styles === */
	span {
		color: var(--text-color);
		overflow-wrap: anywhere;
		font-family: var(--font-type2);
	}

	p {
		font-family: var(--font-type2);
		font-weight: bold;
		margin: 0.2em;
	}

	button {
		background: var(--main-color);
		min-width: 80px;
		border: 2px solid black;
		border-radius: 8px;
		font-size: 16px;
		box-shadow: 3px 3px 0 0 black;
		width: 10em;
		height: 4em;
		font-size: 16px;
		font-weight: bold;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	button:hover {
		transform: scale(0.95);
		transition: all 0.3s;
		box-shadow: 6px 6px 0 0 black;
	}

	input {
		border: none;
		padding-left: 0.4em;
		height: 3em;
		font-size: 16px;
		color: white;
		background: rgb(30, 52, 102);
		outline: none;
		width: 15em;
		border-radius: 0.4em;
	}

	/* === Layout === */
	.step3-container {
		display: flex;
		flex-direction: column;
		justify-content: start;
		background: none;
		align-items: center;
		height: fit-content;
		height: 100%;
		width: 100%;
		border: none;
		gap: 2em;
	}

	.instruction-container {
		display: flex;
		align-items: center;
		gap: 1em;
		height: 2em;
	}

	.fetched-info-container {
		display: flex;
		gap: 1em;
	}

	.input-container {
		display: flex;
		gap: 1em;
		width: 100%;
		justify-content: center;
		align-items: center;
	}

	/* === Utilities === */
	.round {
		border-radius: 50%;
		color: var(--text-color);
		border: 2px solid;
		width: 1.5em;
		height: 1.5em;
		display: flex;
		justify-content: center;
		align-items: center;
		font-weight: bold;
		text-align: center;
		font-family: var(--font-type2);
	}

	/* === Animation === */

	.spinner {
		width: 2em;
		height: 2em;
		border: 3px solid black;
		border-top-color: transparent;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	@media (max-width: 678px) {
		.step3-container {
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
