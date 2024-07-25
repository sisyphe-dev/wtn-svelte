<script lang="ts">
	import { selectedAsset, inReceivingMenu } from '$lib/stores';
	import { fade } from 'svelte/transition';
</script>

<div class="receive-container" transition:fade={{ duration: 100 }}>
	<div class="header-container">
		<h2>Receive {$selectedAsset.intoStr()}</h2>
		<img alt="ICP logo" src={$selectedAsset.getIconPath()} width="50px" height="50px" />
	</div>

	<button
		class="toggle-btn"
		on:click={() => {
			inReceivingMenu.set(false);
		}}
	>
		<span>Finish</span>
	</button>
</div>

<style>
	/* === Base Styles === */

	span {
		font-family: var(--font-type2);
		display: flex;
		align-items: center;
	}

	button {
		color: black;
	}

	/* === Layout === */
	.receive-container {
		position: fixed;
		z-index: 1;
		display: flex;
		flex-direction: column;
		max-width: 35em;
		width: 10em;
		background: var(--background-color);
		color: white;
		padding: 2em;
		border-radius: 15px;
		margin-left: 0.5em;
		margin-right: 0.5em;
		border: 2px solid var(--border-color);
	}

	.header-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 2%;
		font-family: var(--font-type2);
	}
	/* === Componennts === */
	.toggle-btn {
		background: var(--main-color);
		min-width: 80px;
		position: relative;
		border: 2px solid black;
		font-size: 16px;
		box-shadow: 3px 3px 0 0 black;
		padding: 0 1em 0 1em;
		max-width: none;
		height: 60px;
		font-weight: bold;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.toggle-btn:hover {
		transform: scale(0.95);
		transition: all 0.3s;
		box-shadow: 6px 6px 0 0 black;
	}
</style>
