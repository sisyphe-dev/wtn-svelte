<script lang="ts">
	import { selectedSns, snsPrincipal } from '$lib/stores';

	export let data;
</script>

<div class="sns-selection-container">
	<div class="sns-listing">
		{#each data.sns as sns}
			<div class="sns-btn-container">
				<button
					class="sns-btn-selection"
					class:selected-sns={$selectedSns === sns.name}
					on:click={() => {
						selectedSns.set(sns.name);
						snsPrincipal.set(sns.governance_id);
					}}>{sns.name}</button
				>
			</div>
		{/each}
	</div>
</div>

<style>
	/* === Base Styles === */
	div::-webkit-scrollbar {
		display: none;
	}

	div::-webkit-scrollbar-track {
		display: none;
	}

	div::-webkit-scrollbar-thumb {
		display: none;
	}

	div::-webkit-scrollbar-corner {
		display: none;
	}

	button {
		color: white;
		cursor: pointer;
		display: flex;
		width: 100%;
		justify-content: center;
		padding: 1em;
		font-size: 16px;
		border-radius: 8px;
		border: 2px solid transparent;
		background: none;
	}

	button:hover {
		border: 2px solid transparent;
		background-color: rgba(107, 249, 201, 0.5);
	}

	/* === Layout === */
	.sns-selection-container {
		display: flex;
		flex-direction: column;
		width: 20%;
		align-items: center;
		gap: 1em;
		padding: 1em;
		background-color: #183f66;
		border-radius: 10px;
	}

	/* === Component === */
	.sns-listing {
		display: flex;
		overflow-y: scroll;
		width: 100%;
		max-height: 35em;
		flex-direction: column;
		margin: 0;
		padding: 0;
		gap: 1em;
	}

	.sns-btn-container {
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	/* === Utilities === */
	.selected-sns {
		border: 2px solid var(--main-color);
		background-color: rgba(107, 249, 201, 0.5);
	}

	@media (max-width: 767px) {
		.sns-selection-container {
			width: 100%;
			height: 5em;
			flex-direction: row;
			padding: 0;
		}

		.sns-listing {
			overflow-x: scroll;
			overflow-y: hidden;
			flex-direction: row;
			margin-left: 1em;
		}

		button {
			display: flex;
			width: 10em;
			justify-content: center;
			padding: 1em;
			font-size: 16px;
			border-radius: 8px;
			border: 2px solid transparent;
			background: none;
		}
	}
</style>
