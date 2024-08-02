<script lang="ts">
	import { boomerang } from '$lib/../declarations/boomerang';
	import { Principal } from '@dfinity/principal';
	import { selectedSns, snsPrincipal, isBusy, toasts } from '$lib/stores';
	import { fade } from 'svelte/transition';
	import { handleSnsRetrieveNicpResult } from '$lib/ledger';
	import { Toast } from '$lib/toast';

	let principal: string;

	function isValid(principal) {
		try {
			const p = Principal.fromText(principal);
			return true;
		} catch (error) {
			return false;
		}
	}

	async function retrieveNicp() {
		if ($isBusy) return;
		try {
			isBusy.set(true);
			const input = $selectedSns === 'Custom' ? principal : $snsPrincipal;
			console.log(input);
			const retrieveResult = await boomerang.retrieve_nicp(Principal.fromText(input));

			const result = await handleSnsRetrieveNicpResult(retrieveResult);
			if (result.success) {
				toasts.add(Toast.success(result.message));
			} else {
				toasts.add(Toast.error(result.message));
			}
			isBusy.set(false);
		} catch (error) {
			console.log(error);
			toasts.add(Toast.error("Call failed."));
			isBusy.set(false);
		}
	}
</script>

<div class="step2-container" in:fade={{ duration: 500 }}>
	<div class="instruction-container">
		<span class="round">3</span>
		<span>Retrieve Nicp.</span>
	</div>
	{#if $selectedSns === 'Custom'}
		<div class="input-container">
			<span style:color="var(--main-color)"
					>Please specify principal:</span
				>
			<input type="text" placeholder="Principal" bind:value={principal} />
		</div>
		{#if principal && isValid(principal)}
			{#if $isBusy}
				<button>
					<div class="spinner"></div>
				</button>
			{:else}
				<button on:click={retrieveNicp}>Retrieve</button>
			{/if}

		{/if}
	{:else}
		<div class="fetched-info-container">
			<p>You are using the following principal:</p>
			<p style:color="var(--main-color)">{$snsPrincipal}</p>
		</div>
		{#if $isBusy}
			<button>
				<div class="spinner"></div>
			</button>
		{:else}
			<button on:click={retrieveNicp}>Retrieve</button>
		{/if}
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
	.step2-container {
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
	}

	.balance-container {
		display: flex;
		gap: 1em;
		justify-content: center;
		align-items: center;
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
		width: 1em;
		height: fit-content;
		padding: 0.2em;
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
</style>
