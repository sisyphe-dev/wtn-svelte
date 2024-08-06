<script lang="ts">
	import { selectedSns, snsPrincipal, inSnsMenu } from '$lib/stores';
	import { isMobile } from '$lib';
	import snsMetadata from './sns_metadata.json';
</script>

<div class="sns-selection-container">
	{#if !isMobile}
		<div class="sns-listing">
			{#each snsMetadata.metadata as sns}
				<div class="sns-btn-container">
					<button
						class:selected-sns={$selectedSns === sns.name}
						class:default-sns={$selectedSns !== sns.name}
						on:click={() => {
							selectedSns.set(sns.name);
							snsPrincipal.set(sns.governance_id);
						}}>{sns.name}</button
					>
				</div>
			{/each}
			<div class="sns-btn-container">
				<button
					class:selected-sns={$selectedSns === 'Custom'}
					class:default-sns={$selectedSns !== 'Custom'}
					on:click={() => {
						selectedSns.set('Custom');
						snsPrincipal.set('');
					}}>{'Custom'}</button
				>
			</div>
		</div>
	{:else}
		<div class="select-container">
			<button on:click={() => inSnsMenu.set(true)}>
				<span>{$selectedSns}</span>
				<img width="20em" height="20em" src="/icon/down-arrow.svg" alt="Down arrow." />
			</button>
		</div>
	{/if}
</div>

<style>
	/* === Base Styles === */
	div::-webkit-scrollbar {
		width: 1em;
		position: absolute;
		top: 0;
		right: 0;
		width: 0.4em;
		height: 100%;
		background: transparent;
	}

	div::-webkit-scrollbar-track {
		background: transparent;
	}

	div::-webkit-scrollbar-thumb {
		background: #0a285063;
		border-radius: 0.5em;
	}

	div::-webkit-scrollbar-corner {
		background: transparent;
	}

	button {
		color: white;
		cursor: pointer;
		display: flex;
		width: 90%;
		justify-content: center;
		padding: 1em;
		font-size: 16px;
		border-radius: 8px;
	}

	button:hover {
		border: 2px solid transparent;
		background-color: rgba(107, 249, 201, 0.5);
	}

	img {
		transform: rotate(180deg);
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
		max-height: 25em;
		flex-direction: column;
		margin: 1em;
		padding: 0;
		gap: 1em;
		position: relative;
	}

	.sns-btn-container {
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.select-container {
		display: flex;
		width: 100%;
		justify-content: center;
		align-items: center;
	}

	/* === Utilities === */
	.selected-sns {
		border: 2px solid var(--main-color);
		background-color: rgba(107, 249, 201, 0.5);
	}

	.default-sns {
		border: 2px solid transparent;
		background: none;
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
			width: 80%;
			justify-content: center;
			position: relative;
			padding: 1em;
			font-size: 16px;
			border-radius: 8px;
			border: 2px solid var(--main-color);
			background-color: rgba(107, 249, 201, 0.5);
		}

		img {
			position: absolute;
			right: 1em;
		}
	}
</style>
