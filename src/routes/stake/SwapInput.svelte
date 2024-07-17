<script lang="ts">
	import { Asset } from '$lib';
	import { inputValue, user } from '$lib/stores';

	export let asset: Asset;
</script>

<div class="input-container">
	<input type="number" bind:value={$inputValue} placeholder="Amount" />
	<button
		class="max-btn"
		on:click={() => {
			const maxAmount = $user?.getBalance(asset.type).minus(asset.getTransferFee()).toNumber();
			inputValue.set(maxAmount && maxAmount >= 0 ? maxAmount : 0);
		}}
	>
		<div class="max-btn-items">
			<h2>{asset.intoStr()}</h2>
			<span>Max</span>
		</div>
		<img class="asset-logo" src={asset.getUrl()} alt="ICP Icon" />
	</button>
</div>

<style>
	/* === Base Styles === */
	h2 {
		color: white;
		margin: 0;
	}

	span {
		color: white;
		text-decoration: underline;
		font-size: 12px;
	}

	input {
		border: none;
		padding-left: 0.4em;
		height: 3em;
		font-size: 20px;
		color: white;
		background: rgb(30, 52, 102);
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
		padding: 1em;
		background: rgb(30, 52, 102);
	}

	/* === Components === */

	.max-btn {
		display: flex;
		border: none;
		flex-direction: row-reverse;
		align-items: center;
		padding: 1em;
		color: white;
		background: rgb(30, 52, 102);
		gap: 1em;
		cursor: pointer;
	}

	.max-btn-items {
		display: flex;
		flex-direction: column;
	}

	.asset-logo {
		width: 3em;
		border-radius: 100%;
	}
</style>
