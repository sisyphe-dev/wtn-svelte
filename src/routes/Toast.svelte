<script lang="ts">
	import { toasts } from '$lib/stores';
	import { fade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import ErrorIcon from '$lib/icons/ErrorIcon.svelte';
	import CloseIcon from '$lib/icons/CloseIcon.svelte';
	import SuccessIcon from '$lib/icons/SuccessIcon.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import { Toast, TOAST_LIFETIME_MS } from '$lib';
	import { onDestroy, onMount } from 'svelte';

	let idToTimeLeft: { [key: number]: number } = {};
	let idToIntervals: Map<number, NodeJS.Timeout> = new Map();
	const REFRESH_RATE_MS = 10;

	function updateToasts() {
		toasts.subscribe((value) => {
			value.forEach((toast: Toast) => {
				if (toast.isTemporary && !idToIntervals.has(toast.id)) {
					idToTimeLeft[toast.id] = TOAST_LIFETIME_MS;
					idToIntervals.set(
						toast.id,
						setInterval(() => {
							if (idToTimeLeft[toast.id] > 0) {
								idToTimeLeft[toast.id] -= REFRESH_RATE_MS;
								handleElapsedBarWidth(toast.id);
							} else {
								toasts.remove(toast.id);
								clearInterval(idToIntervals.get(toast.id));
							}
						}, REFRESH_RATE_MS)
					);
				}
			});
		});
	}

	onMount(() => {
		updateToasts();
	});

	onDestroy(() => {
		idToIntervals.forEach((interval) => clearInterval(interval));
	});

	function handleElapsedBarWidth(id: number) {
		if (!idToIntervals.has(id)) return;
		const toastContainer = document.getElementById('container') as HTMLDivElement;
		const bar = document.getElementById(`elapsed-bar-${id}`) as HTMLDivElement;
		if (!bar) return;
		bar.style.width =
			((toastContainer.clientWidth * idToTimeLeft[id]) / TOAST_LIFETIME_MS).toString() + 'px';
	}
</script>

<div class="toasts-container">
	{#each $toasts as toast (toast.id)}
		<div id="container" class="toast-container" animate:flip transition:fade>
			<div class="toast-content-container">
				<div class="info-container">
					<div class="info-icon">
						{#if toast.type === 'success'}
							<SuccessIcon />
						{:else if toast.type === 'error'}
							<ErrorIcon />
						{:else}
							<WarningIcon />
						{/if}
					</div>
					<p title="toast-message">{@html toast.message}</p>
				</div>
				<button
					class="toast-close"
					on:click={() => {
						toasts.remove(toast.id);
					}}
				>
					<CloseIcon color="--main-button-text-color" />
				</button>
			</div>
			<div
				id="elapsed-bar-{toast.id}"
				class="elapsed-bar"
				class:warning={toast.type === 'warning'}
				class:error={toast.type === 'error'}
			></div>
		</div>
	{/each}
</div>

<style>
	/* === Base Styles === */
	p {
		font-weight: lighter;
		font-family: sans-serif;
		color: var(--main-button-text-color);
	}

	/* === Layout === */
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

	.toast-container {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.toast-content-container {
		background-color: var(--main-color);
		box-shadow: 0px 6px 16px 2px #000000;
		display: flex;
		border-radius: 8px;
		align-items: center;
		justify-content: space-between;
		width: 30em;
		max-width: 90vw;
		padding: 0 1%;
		box-sizing: border-box;
	}

	.info-container {
		display: flex;
		align-items: center;
		gap: 0.5em;
		margin-right: 1em;
	}

	/* === Components === */
	.info-icon {
		display: flex;
		align-items: center;
		margin-left: 1em;
	}

	.toast-close {
		border: 0;
		outline: 0;
		background: transparent;
		margin: 0;
		cursor: pointer;
		padding: 0 var(--padding-0_5x);
	}

	.elapsed-bar {
		background: var(--main-button-text-color);
		height: 2px;
	}

	/* === Utilities === */
	.warning {
		background: #ff9900;
	}

	.error {
		background: #d95454;
	}
</style>
