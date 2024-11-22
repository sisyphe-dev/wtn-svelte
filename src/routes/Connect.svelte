<script lang="ts">
	import { isLogging, isBusy } from '$lib/stores';
	import {
		DEV,
		STAGING,
		connectWithInternetIdentity,
		connectWithTransport,
		connectWithPlug,
		localSignIn,
		NFID_RPC,
		OISY_RPC
	} from '$lib/authentification';
	import { fade } from 'svelte/transition';
	import { isMobile } from '$lib';
	import { onMount } from 'svelte';

	let dialog: HTMLDialogElement;

	async function handleConnection(identityProvider: 'internetIdentity' | 'plug' | 'oisy' | 'nfid') {
		if ($isBusy) return;
		isBusy.set(true);

		try {
			switch (identityProvider) {
				case 'internetIdentity':
					await connectWithInternetIdentity();
					break;
				case 'plug':
					await connectWithPlug();
					break;
				case 'oisy':
					await connectWithTransport(OISY_RPC);
					break;
				case 'nfid':
					await connectWithTransport(NFID_RPC);
					break;
			}
		} catch (e) {
			console.error(e);
		}
		dialog.close();
		isBusy.set(false);
	}
	onMount(() => {
		dialog = document.getElementById('connectDialog') as HTMLDialogElement;
		dialog.showModal();
	});
</script>

<dialog
	id="connectDialog"
	in:fade={{ duration: 500 }}
	class:mobile-size={isMobile}
	on:close={() => {
		isLogging.set(false);
	}}
>
	{#if $isBusy}
		<button class="login-btn">
			<div class="spinner"></div>
		</button>
	{:else}
		<button class="login-btn" on:click={() => handleConnection('internetIdentity')}>
			<img src="/icon/astronaut.webp" width="50em" height="50em" alt="Dfinity Astronaut." />
			<h2>Internet Identity</h2>
		</button>
		<button class="login-btn" on:click={() => handleConnection('nfid')}>
			<img src="/icon/google.svg" width="auto" height="40em" alt="Google Logo." />
			<h2>Google</h2>
			<span>|</span>
			<img src="/icon/nfid.webp" width="auto" height="30em" alt="NFID Logo." />
		</button>
		<!-- <button class="login-btn" on:click={() => handleConnection('oisy')}>
			<img src="/icon/oisy.webp" width="auto" height="40em" alt="Oisy Logo." />
			<h2>Oisy</h2>
		</button> -->
		{#if !isMobile}
			<button class="login-btn" on:click={() => handleConnection('plug')}>
				<img src="/icon/plug.png" width="50em" height="50em" alt="Plug Icon." />
				<h2>Plug Wallet</h2>
			</button>
		{/if}
		{#if DEV || STAGING}
			<button
				class="login-btn"
				style:background-color="red"
				on:click={async () => {
					if ($isBusy) return;

					isBusy.set(true);
					await localSignIn();
					isBusy.set(false);
					dialog.close();
				}}
				title="ii-connect-btn"
			>
				<h2>Local Development</h2>
			</button>
		{/if}
	{/if}

	<button
		id="close-btn"
		on:click={() => {
			dialog.close();
		}}
	>
		<h2>Close</h2>
	</button>
</dialog>

<style>
	/* === Base Styles === */
	button {
		gap: 0.3em;
		border-radius: 8px;
		border: 2px solid black;
		box-shadow: 3px 3px 0 0 black;
		width: 100%;
		height: 5em;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		display: flex;
	}

	button:hover {
		transform: scale(0.95);
		transition: all 0.3s;
		box-shadow: 6px 6px 0 0 black;
	}

	h2 {
		font-family: var(--secondary-font);
		font-weight: 600;
		font-size: 20px;
		color: var(--main-button-text-color);
	}

	::backdrop {
		backdrop-filter: blur(5px);
	}

	dialog {
		max-width: 450px;
		height: fit-content;
		display: flex;
		flex-wrap: wrap;
		gap: 1em;
		border: none;
		background: none;
	}

	/* === Components === */
	.login-btn {
		background: var(--main-color);
		color: var(--main-button-text-color);
	}

	#close-btn {
		background: #66adff;
	}

	/* === Animation === */

	.spinner {
		width: 2em;
		height: 2em;
		border: 3px solid var(--main-button-text-color);
		border-top-color: transparent;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	/* === Utilities === */
	.mobile-size {
		width: 90%;
	}
</style>
