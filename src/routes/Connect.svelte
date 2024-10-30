<script lang="ts">
	import { isLogging, isBusy } from '$lib/stores';
	import {
		DEV,
		STAGING,
		connectWithInternetIdentity,
		connectWithTransport,
		connectWithPlug,
		localSignIn
	} from '$lib/authentification';
	import { fade } from 'svelte/transition';
	import { isMobile } from '$lib';

	async function handleConnection(identityProvider: 'internetIdentity' | 'plug' | 'transport') {
		if ($isBusy) return;
		isBusy.set(true);

		switch (identityProvider) {
			case 'internetIdentity':
				await connectWithInternetIdentity();
				break;
			case 'plug':
				await connectWithPlug();
				break;
			case 'transport':
				await connectWithTransport();
				break;
		}

		isBusy.set(false);
		isLogging.set(false);
	}
</script>

<div class="cards-container" in:fade={{ duration: 500 }} class:mobile-size={isMobile}>
	{#if $isBusy}
		<button class="login-btn">
			<div class="spinner"></div>
		</button>
	{:else}
		<button class="login-btn" on:click={() => handleConnection('internetIdentity')}>
			<img src="/icon/astronaut.webp" width="50em" height="50em" alt="Dfinity Astronaut." />
			<h2>Internet Identity</h2>
		</button>
		<button class="login-btn" on:click={() => handleConnection('transport')}>
			<img src="/icon/nfid.webp" width="auto" height="50em" alt="NFID Logo." />
		</button>
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
					isLogging.set(false);
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
			isLogging.set(false);
		}}
	>
		<h2>Close</h2>
	</button>
</div>

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

	/* === Layout === */
	.cards-container {
		max-width: 450px;
		max-height: 180px;
		width: 60%;
		height: fit-content;
		display: flex;
		flex-wrap: wrap;
		gap: 1em;
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
