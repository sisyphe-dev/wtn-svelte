<script lang="ts">
	import { assetToIconPath } from '$lib';
	import { inputAmount, user, handleInputAmount } from '$lib/stores';
	import { fade } from 'svelte/transition';

	export let asset: 'ICP' | 'nICP';
</script>

<div class="input-container" in:fade={{ duration: 500 }}>
	<input
		type="text"
		maxlength="20"
		bind:value={$inputAmount}
		placeholder="0.00"
		on:input={handleInputAmount}
		title="swap-input"
	/>
	<button
		class="max-btn"
		on:click={() => {
			const maxAmount = ($user?.getBalance(asset) ?? 0) - 0.0002;
			inputAmount.change(maxAmount && maxAmount >= 0 ? maxAmount : 0);
		}}
	>
		<div class="max-btn-items">
			<h2>{asset}</h2>
			<span>Max</span>
		</div>
		<div class="logo-container">
			<img class="asset-logo" src={assetToIconPath(asset)} alt="ICP Icon" />
		</div>
	</button>
</div>

<style>
	/* === Base Styles === */
	h2 {
		color: var(--stake-text-color);
		margin: 0;
	}

	span {
		color: var(--stake-text-color);
		text-decoration: underline;
		font-size: 12px;
	}

	input {
		margin: 0 4px;
		border: none;
		padding-left: 0.4em;
		height: 3em;
		font-size: 20px;
		color: var(--stake-text-color);
		background: var(--input-color);
		outline: none;
		width: 80%;
	}

	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
	/* === Layout === */
	.input-container {
		position: relative;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-radius: 1em;
		padding: 0 0.5em;
		background: var(--input-color);
		border: var(--main-container-border);
	}

	/* === Components === */

	.max-btn {
		display: flex;
		border: none;
		flex-direction: row-reverse;
		align-items: center;
		padding: 1em;
		background: none;
		gap: 1em;
		cursor: pointer;
	}

	.max-btn-items {
		display: flex;
		flex-direction: column;
	}

	.asset-logo {
		width: 2em;
		border-radius: 100%;
	}

	.logo-container {
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--theme-background-asset-logo);
		border-radius: 50%;
		padding: 2px;
		border: var(--theme-border-asset-logo);
	}
</style>
