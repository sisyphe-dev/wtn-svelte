<script>
	import { ToastType } from '$lib/toast';
	import { toasts, isSelecting, isLogging } from '$lib/stores';
</script>

<div class="toasts-container" class:filter={$isSelecting || $isLogging}>
	{#each $toasts as toast, index}
		<div class="toast-container">
			<div class="info-container">
				{#if toast.type == ToastType.Success}
					<div>
						<svg
							width="20"
							height="20"
							viewBox="0 0 20 20"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							data-tid="icon-info"
							class="svelte-1lui9gh"
						>
							<path
								d="M10.2222 17.5C14.3643 17.5 17.7222 14.1421 17.7222 10C17.7222 5.85786 14.3643 2.5 10.2222 2.5C6.08003 2.5 2.72217 5.85786 2.72217 10C2.72217 14.1421 6.08003 17.5 10.2222 17.5Z"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							></path>
							<path
								d="M10.2222 13.3333V10"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							></path>
							<path
								d="M10.2222 6.66699H10.2305"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							></path>
						</svg>
					</div>
				{:else}
					<svg
						style:color={'red'}
						xmlns="http://www.w3.org/2000/svg"
						height="20"
						viewBox="0 0 24 24"
						width="20"
						fill="currentColor"
					>
						<path d="M0 0h24v24H0z" fill="none"></path>
						<path
							d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
						></path>
					</svg>
				{/if}
				<p>{toast.message}</p>
			</div>
			<button
				class="toast-close"
				on:click={() => {
					toasts.set($toasts.filter((_, i) => i !== index));
				}}
			>
				<svg
					height={20}
					width={20}
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
						fill="currentColor"
					/>
					<rect
						x="4.5199"
						y="5.58496"
						width="1.5"
						height="14"
						rx="0.75"
						transform="rotate(-45 4.5199 5.58496)"
						fill="currentColor"
					/>
				</svg>
			</button>
		</div>
	{/each}
</div>

<style>
	/* === Layout === */
	.toast-container {
		background-color: var(--main-color);
		box-shadow: 8px 8px 16px 0 rgba(0, 0, 0, 0.25);
		display: flex;
		border-radius: 8px;
		align-items: center;
		justify-content: space-between;
		max-width: 30%;
		padding: 0 2%;
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
	}

	/* === Components === */
	.toast-close {
		border: 0;
		outline: 0;
		background: transparent;
		margin: 0;
		cursor: pointer;
		padding: 0 var(--padding-0_5x);
	}

	/* === Utillities === */
	.filter {
		filter: blur(5px);
	}
</style>
