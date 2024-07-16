<script>
	import { ToastType } from '$lib/toast';
	import { toasts } from '$lib/stores';
	import { fade, fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';
</script>

<div class="toasts-container">
	{#each $toasts as toast (toast.id)}
		<div class="toast-container" animate:flip in:fly={{ y: -200, duration: 1000 }} out:fade>
			<div class="info-container">
				<div class="info-icon">
					{#if toast.type == ToastType.Success}
						<img alt="Info Icon" src="/icon/infoIcon.svg" />
					{:else}
						<img alt="Error Icon" src="/icon/errorIcon.svg" />
					{/if}
				</div>
				<p>{@html toast.message}</p>
			</div>
			<button
				class="toast-close"
				on:click={() => {
					toasts.remove(toast.id);
				}}
			>
				<svg
					height="20px"
					width="20px"
					viewBox="0 0 20 20"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<rect
						x="14.4194"
						y="4.52441"
						width="1.5"
						height="14"
						rx="0.75"
						transform="rotate(45 14.4194 4.52441)"
						fill="rgb(176, 163, 217)"
					/>
					<rect
						x="4.5199"
						y="5.58496"
						width="1.5"
						height="14"
						rx="0.75"
						transform="rotate(-45 4.5199 5.58496)"
						fill="rgb(176, 163, 217)"
					/>
				</svg>
			</button>
		</div>
	{/each}
</div>

<style>
	/* === Base Styles === */
	p {
		font-weight: lighter;
		font-family: sans-serif;
	}

	/* === Layout === */
	.toast-container {
		background-color: var(--main-color);
		box-shadow: 8px 8px 16px 0 rgba(0, 0, 0, 0.25);
		display: flex;
		border-radius: 8px;
		align-items: center;
		justify-content: space-between;
		width: 30%;
		min-width: max-content;
		padding: 0 1%;
	}

	.toasts-container {
		position: fixed;
		display: flex;
		flex-direction: column-reverse;
		align-items: center;
		justify-content: center;
		bottom: 0;
		width: 100%;
		gap: 0.5em;
		margin-bottom: 1em;
	}

	.info-container {
		display: flex;
		align-items: center;
		gap: 1em;
		margin-right: 1em;
	}

	.toast-close {
		border: 0;
		outline: 0;
		background: transparent;
		margin: 0;
		cursor: pointer;
		padding: 0 var(--padding-0_5x);
	}

	/* === Components === */
	.info-icon {
		display: flex;
		align-items: center;
	}
</style>
