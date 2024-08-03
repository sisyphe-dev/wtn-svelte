<script lang="ts">
	import CopyIcon from '$lib/icons/CopyIcon.svelte';
	import { selectedSns, snsPrincipal, canisters } from '$lib/stores';
	import { onMount, afterUpdate } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import { Principal } from '@dfinity/principal';

	let accountId: string;
	let principal: string;

	const setAccountId = async (principal: string) => {
		if (!$canisters) return;
		try {
			$canisters.boomerang.get_staking_account_id(Principal.fromText(principal)).then((account) => {
				accountId = account;
			});
		} catch (error) {
			console.log(error);
		}
	};

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

	onMount(() => {
		if ($selectedSns !== 'Custom') {
			setAccountId($snsPrincipal);
		}
	});

	$: {
		if (principal) {
			setAccountId(principal);
		}
	}
</script>

<div class="step1-container" in:fade={{ duration: 500 }}>
	<div class="instruction-container">
		<span class="round">1</span>
		<span class="instruction"
			>Make an ICP Treasury proposal to the following account identifier.</span
		>
	</div>
	{#if $selectedSns !== 'Custom'}
		<div class="fetched-info-container">
			<p style:font-weight="lighter">You are using the following principal:</p>
			<p style:color="var(--main-color)">{$snsPrincipal}</p>
		</div>
		<div class="receive-container">
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
			<span style:color="var(--main-color)">Please specify principal:</span>
			<input type="text" placeholder="Principal" bind:value={principal} />
		</div>
		{#if accountId !== undefined}
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

	p {
		font-family: var(--font-type2);
		overflow-wrap: anywhere;
		font-weight: bold;
		margin: 0.2em;
	}

	/* === Layout === */
	.step1-container {
		display: flex;
		flex-direction: column;
		justify-content: start;
		background: none;
		align-items: center;
		height: fit-content;
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

	.principal-container {
		display: flex;
		align-items: center;
		width: 100%;
		height: 4em;
		justify-content: center;
	}

	.receive-container {
		display: flex;
		flex-direction: column;
		gap: 2em;
		align-items: center;
		justify-content: center;
	}

	.input-container {
		display: flex;
		gap: 1em;
		width: 100%;
		justify-content: center;
		align-items: center;
	}

	.fetched-info-container {
		display: flex;
		gap: 1em;
	}

	/* === Component === */
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

	.instruction {
		width: 80%;
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

	@media (max-width: 767px) {
		.step1-container {
			width: 95%;
		}

		span {
			text-align: center;
		}

		.instruction-container {
			justify-content: center;
		}

		p {
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
