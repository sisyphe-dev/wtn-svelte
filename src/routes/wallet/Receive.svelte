<script lang="ts">
	import { selectedAsset, inReceivingMenu, user } from '$lib/stores';
	import CopyIcon from '$lib/icons/CopyIcon.svelte';
	import { fade, scale } from 'svelte/transition';
	import { AssetType } from '$lib';
	import { onMount } from 'svelte';
	import QrCreator from 'qr-creator';

	onMount(() => {
		QrCreator.render(
			{
				text: `${$selectedAsset.intoStr() === 'ICP' ? $user.accountId : $user.principal}`,
				radius: 0.0, // 0.0 to 0.5
				ecLevel: 'H', // L, M, Q, H
				fill: 'rgb(12, 44, 76)',
				background: null,
				size: 1000 // in pixels
			},
			document.querySelector('#qr-code')
		);
	});

	let isAnimating = false;
	let circleVisible = false;

	function handleAnimation() {
		if (!isAnimating) {
			isAnimating = true;
			circleVisible = true;
			setTimeout(() => {
				circleVisible = false;
				setTimeout(() => {
					isAnimating = false;
				}, 500);
			}, 500);
		}
	}
</script>

<div class="receive-container" transition:fade={{ duration: 100 }}>
	<div class="header-container">
		<h3>Receive {$selectedAsset.intoStr()}</h3>
		<img alt="ICP logo" src={$selectedAsset.getIconPath()} width="50px" height="50px" />
	</div>
	<div class="qr-code-container">
		<canvas id="qr-code" />
		<img id="wtn-logo" src="/WTN.png" width="70px" height="70px" alt="WTN logo." />
	</div>
	<div class="principal-container">
		{#if $selectedAsset.intoStr() === 'ICP'}
			<p>{$user?.accountId}</p>
			<button
				class="copy-btn"
				on:click={() => {
					handleAnimation();
					navigator.clipboard.writeText($user ? $user.accountId : '');
				}}
			>
				<CopyIcon />
				{#if circleVisible}
					<div class="circle" transition:scale={{ duration: 500 }}></div>
				{/if}
			</button>
		{:else}
			<p>{$user?.principal}</p>
			<button
				class="copy-btn"
				on:click={() => {
					handleAnimation();
					navigator.clipboard.writeText($user ? $user.principal : '');
				}}
			>
				<CopyIcon />
				{#if circleVisible}
					<div class="circle" transition:scale={{ duration: 500 }}></div>
				{/if}
			</button>
		{/if}
	</div>
	<button
		class="finish-btn"
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

	p {
		font-family: var(--font-type2);
		overflow-wrap: anywhere;
		font-size: 14px;
	}

	h3 {
		font-family: var(--font-type2);
		font-size: 16px;
	}

	canvas {
		background: oklab(0.88 -0.18 0.03);
		padding: 1em;
		border-radius: 8px;
	}
	/* === Layout === */
	.receive-container {
		position: fixed;
		z-index: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		max-width: 80vw;
		width: 35em;
		background: var(--background-color);
		color: white;
		padding: 2em;
		border-radius: 15px;
		margin-left: 0.5em;
		margin-right: 0.5em;
		border: 2px solid var(--border-color);
		gap: 1em;
	}

	.header-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 2%;
		width: 100%;
		font-family: var(--font-type2);
	}

	.principal-container {
		margin-left: 1em;
		display: flex;
		justify-content: center;
		width: 100%;
		align-items: center;
		gap: 1em;
	}

	.qr-code-container {
		position: relative;
		width: 100%;
		display: flex;
		justify-content: center;
	}
	/* === Components === */

	.finish-btn {
		background: var(--main-color);
		min-width: 80px;
		position: relative;
		border: 2px solid black;
		border-radius: 8px;
		font-size: 16px;
		box-shadow: 3px 3px 0 0 black;
		padding: 0 1em 0 1em;
		width: 10em;
		height: 60px;
		font-weight: bold;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.finish-btn:hover {
		transform: scale(0.95);
		transition: all 0.3s;
		box-shadow: 6px 6px 0 0 black;
	}

	#qr-code {
		height: 268px;
		width: 268px;
	}

	#wtn-logo {
		position: absolute;
		top: 50%;
		transform: translate(0, -50%);
	}

	.copy-btn {
		background-color: transparent;
		border: none;
		cursor: pointer;
		border-radius: 0.3em;
		transition: all 0.3s ease;
		color: white;
		font-weight: bold;
		display: flex;
		position: relative;
	}

	/* === Animation === */

	.circle {
		position: absolute;
		border-radius: 50%;
		background-color: rgb(37, 139, 255, 0.5);
		width: 25px;
		height: 25px;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
</style>
