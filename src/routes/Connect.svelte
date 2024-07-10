<script>
	import { isLogging, isBusy, user } from '$lib/stores';
	import { signIn } from '$lib/authentification';
	import { User } from '$lib/state';

	async function internetIdentityConnection() {
		isBusy.set(true);

		try {
			const principal = await signIn();
			user.set(
				new User(principal, BigInt(10_000 * 1e8), BigInt(1_500 * 1e8), BigInt(100_000 * 1e8))
			);
		} catch (error) {
			console.error('Login failed:', error);
		}

		isBusy.set(false);
		isLogging.update((_) => false);
	}
</script>

<div class="cards-container">
	<button id="ii-btn" on:click={internetIdentityConnection}>
		{#if $isBusy}
			<div class="spinner"></div>
		{:else}
			<img src="/astronaut.webp" width="50em" height="50em" alt="Dfinity Astronaut." />
			<h2>Internet Identity</h2>
		{/if}
	</button>

	<button
		id="close-btn"
		on:click={() => {
			isLogging.update((_) => false);
		}}
	>
		<h2>Close</h2>
	</button>
</div>

<style>
	/* === Base Styles === */
	button {
		gap: 0.3em;
		border-radius: 0.3em;
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
		font-family: Arial;
		font-weight: 600;
		font-size: 20px;
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
	#ii-btn {
		background: #18c7c9;
	}

	#close-btn {
		background: #66adff;
	}

	/* === Animation === */

	.spinner {
		width: 2em;
		height: 2em;
		border: 3px solid white;
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
</style>
