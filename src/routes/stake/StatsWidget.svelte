<script>
	import { state } from '$lib/stores';
	import { numberWithDecimals, displayUsFormat } from '$lib';
</script>

<div class="stat-widget-container">
	<div class="stat-item">
		<b>Total Staked</b>
		<b
			>{($state.totalIcpDeposited() + $state.neuron8yStake()).toLocaleString(undefined, {
				minimumFractionDigits: 0,
				maximumFractionDigits: 2
			})}
			ICP
		</b>
	</div>
	<div class="stat-item">
		<b>APY</b>
		<b>{displayUsFormat(numberWithDecimals($state.apy(), 2))}%</b>
	</div>
	<div class="stat-item">
		<b>Stakers</b>
		<b>
			{$state.stakers_count}
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
		font-family: Arial, Helvetica, sans-serif;
	}
</style>
