<script lang="ts">
	import StatsWidget from '../stake/StatsWidget.svelte';
	import SnsListing from './SnsListing.svelte';
</script>

<StatsWidget />
<div class="sns-boomerang-container" in:fade>
	<SnsListing />
	<slot />
</div>

<style>
	/* === Layout === */
	.sns-boomerang-container {
		background-color: var(--background-color);
		border: 2px solid var(--border-color);
		border-radius: 10px;
		display: flex;
		height: 44em;
		width: 60em;
		max-width: 95dvw;
	}

	@media (max-width: 767px) {
		.sns-boomerang-container {
			flex-direction: column;
			justify-content: start;
			align-items: center;
			height: fit-content;
		}
	}
</style>
