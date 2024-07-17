<script lang="ts">
	import { state } from '$lib/stores';
	import { displayUsFormat } from '$lib';
	import BigNumber from 'bignumber.js';
	import { onMount } from 'svelte';

	let totalIcpDeposited: BigNumber;
	let apy: BigNumber;
	let stakersCount: Number;

	const fetchData = async () => {
		try {
			totalIcpDeposited = $state.totalIcpDeposited();
			apy = $state.apy();
			stakersCount = $state.stakersCount();
		} catch (error) {
			console.error('Error fetching data:', error);
		}
	};

	onMount(() => {
		if ($state) {
			fetchData();
		}
		
		const intervalId = setInterval(fetchData, 5000);

		return () => clearInterval(intervalId);
	});
</script>

<div class="stat-widget-container">
	<div class="stat-item">
		<b>Total Staked</b>
		<b>
			{#if totalIcpDeposited}
				{displayUsFormat(totalIcpDeposited)}
			{:else}
				{0}
			{/if}
			ICP
		</b>
	</div>
	<div class="stat-item">
		<b>APY</b>
		<b
			>{#if apy}
				{displayUsFormat(BigNumber(100).multipliedBy(apy))}
			{:else}
				{0}
			{/if}%</b
		>
	</div>
	<div class="stat-item">
		<b>Stakers</b>
		<b>
			{stakersCount ? stakersCount : 0}
		</b>
	</div>
</div>

<style>
	/* === Layout === */
	.stat-widget-container {
		background: rgb(40 71 105);
		color: white;
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
		font-family: var(--font-type2);
	}
</style>
