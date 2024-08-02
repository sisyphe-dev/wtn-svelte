<script lang="ts">
	import CopyIcon from '$lib/icons/CopyIcon.svelte';
	import { selectedSns } from '$lib/stores';
	import { afterUpdate, onMount } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import { boomerang } from '$lib/../declarations/boomerang';
	import { Principal } from '@dfinity/principal';

	let accountId: string;
	let principal: string;
	let isValid = true;

	const setAccountId = (principal: string) => {
		try {
			boomerang.get_staking_account_id(Principal.fromText(principal)).then((account) => {
				accountId = account;
				isValid = true;
			});
		} catch (error) {
			isValid = false;
		}
	};

	$: principal, setAccountId(principal);

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

	afterUpdate(() => {
		if ($selectedSns.name !== 'Custom') {
			QrCreator.render(
				{
					text: `${accountId}`,
					radius: 0.0, // 0.0 to 0.5
					ecLevel: 'H', // L, M, Q, H
					fill: 'rgb(12, 44, 76)',
					background: null,
					size: 1000 // in pixels
				},
				document.querySelector('#qr-code-sns')
			);
		} else if (principal && isValid) {
			QrCreator.render(
				{
					text: `${accountId}`,
					radius: 0.0, // 0.0 to 0.5
					ecLevel: 'H', // L, M, Q, H
					fill: 'rgb(12, 44, 76)',
					background: null,
					size: 1000 // in pixels
				},
				document.querySelector('#qr-code-sns')
			);
		}
	});

	onMount(() => {
		setAccountId($selectedSns.governance_id);
	});
</script>

<div class="step1-container">
	<div class="instruction-container">
		<span class="round">1</span>
		<span>Make an ICP Treasury proposal to the following account identifier.</span>
	</div>
	{#if $selectedSns.name !== 'Custom'}
		<div class="receive-container">
			<div class="qr-code-container">
				<canvas id="qr-code-sns" />
				<img id="wtn-logo" src="/tokens/WTN.webp" width="70px" height="70px" alt="WTN logo." />
			</div>
			<div class="principal-container">
				<p>{accountId}</p>
				<button
					on:click={() => {
						handleAnimation();
						navigator.clipboard.writeText(accountId);
					}}
				>
					<CopyIcon />
					{#if circleVisible}
						<div class="circle" transition:scale={{ duration: 500 }}></div>
					{/if}
				</button>
			</div>
		</div>
	{:else}
		<div class="input-container">
			<input type="text" placeholder="Principal" bind:value={principal} />
		</div>
		{#if isValid && principal}
			<div class="qr-code-container" transition:fade={{ duration: 500 }}>
				<canvas id="qr-code-sns" />
				<img id="wtn-logo" src="/tokens/WTN.webp" width="70px" height="70px" alt="WTN logo." />
			</div>
			<div class="principal-container" transition:fade={{ duration: 500 }}>
				<p>{accountId}</p>
				<button
					on:click={() => {
						handleAnimation();
						navigator.clipboard.writeText(accountId);
					}}
				>
					<CopyIcon />
					{#if circleVisible}
						<div class="circle" transition:scale={{ duration: 500 }}></div>
					{/if}
				</button>
			</div>
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

	img {
		position: absolute;
		top: 50%;
		transform: translate(0, -50%);
	}

	button {
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

	canvas {
		background: oklab(0.88 -0.18 0.03);
		padding: 0.5em;
		border-radius: 8px;
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

	p {
		font-family: var(--font-type2);
		overflow-wrap: anywhere;
		font-weight: bold;
	}

	/* === Layout === */
	.step1-container {
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

	.principal-container {
		display: flex;
		align-items: center;
		width: 80%;
	}

	.qr-code-container {
		position: relative;
		width: 100%;
		display: flex;
		justify-content: center;
	}

	.receive-container {
		display: flex;
		flex-direction: column;
		gap: 2em;
		align-items: center;
		justify-content: center;
		flex-grow: 1;
	}

	.input-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	/* === Component === */
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

	#qr-code-sns {
		height: 268px;
		width: 268px;
	}

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

	/* === Utilities === */
</style>
