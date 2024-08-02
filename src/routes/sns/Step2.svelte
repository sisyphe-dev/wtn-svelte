<script lang="ts">
	import { boomerang } from '$lib/../declarations/boomerang';
	import { Principal } from '@dfinity/principal';
	import { selectedSns, snsPrincipal } from '$lib/stores';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';

	let principal: string;
	let amount: number;

	function isValid(principal) {
		try {
			const p = Principal.fromText(principal);
			return true;
		} catch (error) {
			return false;
		}
	}

	const notifyIcpDeposit = () => {
		try {
			const input = $selectedSns === 'Custom' ? principal : $snsPrincipal;
			boomerang.notify_icp_deposit(Principal.fromText(input)).then((result) => {});
		} catch (error) {
			console.log(error);
		}
	};
</script>

<div class="step2-container" in:fade={{ duration: 500 }}>
	<div class="instruction-container">
		<span class="round">2</span>
		<span>Confirm your deposit.</span>
	</div>
	{#if $selectedSns === 'Custom'}
		<div class="input-container">
			<input type="text" placeholder="Principal" bind:value={principal} />
		</div>
		{#if principal && isValid(principal)}
			<div class="balance-container" in:fade={{ duration: 500 }}>
				<button on:click={notifyIcpDeposit}>Confirm</button>
			</div>
		{:else}
			<span in:fade={{ duration: 500 }} style:color="var(--main-color)"
				>Please specify principal.</span
			>
		{/if}
	{:else}
		<div class="fetched-info-container">
			<p>You are using the following principal:</p>
			<p style:color="var(--main-color)">{$snsPrincipal}</p>
		</div>
		<div class="balance-container">
			<button on:click={notifyIcpDeposit}>Confirm</button>
		</div>
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
		padding: 0.5em 1em;
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
		width: 13em;
		border-radius: 0.4em;
	}

	/* === Layout === */
	.step2-container {
		display: flex;
		flex-direction: column;
		justify-content: start;
		background: none;
		align-items: center;
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

	/* === Component === */
	.balance {
		display: flex;
		align-items: center;
		gap: 5px;
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
</style>
