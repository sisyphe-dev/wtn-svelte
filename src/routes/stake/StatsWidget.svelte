<script lang="ts">
	import { waterNeuronInfo } from '$lib/stores';
	import { displayUsFormat } from '$lib';
	import BigNumber from 'bignumber.js';
	import { onMount, afterUpdate } from 'svelte';
	import { fade } from 'svelte/transition';

	let totalIcpDeposited: BigNumber;
	let apy: BigNumber;
	let stakersCount: Number;

	const fetchData = async () => {
		if ($waterNeuronInfo)
			try {
				totalIcpDeposited = $waterNeuronInfo.totalIcpDeposited();
				apy = $waterNeuronInfo.apy();
				stakersCount = $waterNeuronInfo.stakersCount();
			} catch (error) {
				console.error('Error fetching data:', error);
			}
	};

	afterUpdate(() => {
		if ($waterNeuronInfo) {
			fetchData();
		}
	});

	onMount(() => {
		const intervalId = setInterval(fetchData, 5000);
		return () => clearInterval(intervalId);
	});
</script>

<div class="stat-widget-container" in:fade={{ duration: 500 }}>
	<div class="stat-item">
		<b>Total Staked</b>
		<b>
			{#if $waterNeuronInfo}
				{displayUsFormat(
					$waterNeuronInfo.neuron8yStake().plus($waterNeuronInfo.neuron6mStake()),
					2
				)} ICP
			{:else}
				-/-
			{/if}
		</b>
	</div>
	<div class="stat-item">
		<b>APY</b>
		<b
			>{#if apy}
				{displayUsFormat(BigNumber(100).multipliedBy(apy), 1)} %
			{:else}
				-/-
			{/if}</b
		>
	</div>
	<div class="stat-item">
		<b>Stakers</b>
		<b>
			{#if stakersCount || stakersCount === 0}
				{stakersCount}
			{:else}
				-/-
			{/if}
		</b>
	</div>
</div>

<style>
	/* === Layout === */
	.stat-widget-container {
		background: var(--background-color);
		border: var(--border-size) solid var(--border-color);
		color: var(--stake-text-color);
		padding: 1em;
		padding-left: 2em;
		padding-right: 2em;
		border-radius: 15px;
		display: flex;
		flex-direction: row;
		gap: 1em;
	}

	/* === Components === */

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		font-family: var(--secondary-font);
	}
</style>
