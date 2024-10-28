<script lang="ts">
	import BigNumber from 'bignumber.js';
	import { onMount } from 'svelte';
	import { inCancelWarningMenu } from '$lib/stores';
	import { isContainerHigher } from '$lib';

	let id: BigNumber;
	let cancelWarningDialog: HTMLDialogElement;
    let isHigher = false;

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			cancelWarningDialog.close();
			inCancelWarningMenu.set(false);
		}
	}

	onMount(() => {
		cancelWarningDialog = document.getElementById('cancelWarningDialog') as HTMLDialogElement;
		cancelWarningDialog.showModal();
		isHigher = isContainerHigher('send');
		cancelWarningDialog.addEventListener('keydown', handleKeydown);

		return () => {
			cancelWarningDialog.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<dialog id="cancelWarningDialog" style:align-items={isHigher ? 'flex-start' : 'center'}></dialog>

<style>
	/* === Base styles === */
	::backdrop {
		backdrop-filter: blur(5px);
	}

	dialog {
		display: flex;
		background: transparent;
		justify-content: center;
		height: fit-content;
		min-height: 100%;
		min-width: 100dvw;
		padding: 0;
		margin: 0;
		border: none;
	}
</style>
