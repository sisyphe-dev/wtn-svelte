<script lang="ts">
	import { isLogging, isBusy, user, state } from '$lib/stores';
	import { signIn } from '$lib/authentification';
	import { User } from '$lib/state';
	import type { Account } from '@dfinity/ledger-icp';
	async function internetIdentityConnection() {
		isBusy.set(true);

		try {
			const authResult = await signIn();

			$state.wtnLedger = authResult.wtnLedger;
			$state.icpLedger = authResult.icpLedger;
			$state.nicpLedger = authResult.nicpLedger;
			$state.waterNeuron = authResult.waterNeuron;

			const user_account: Account = {
				owner: authResult.principal,
				subaccount: []
			};
			const icpBalanceE8s = await $state.icpLedger.icrc1_balance_of(user_account);
			const nicpBalanceE8s = await $state.nicpLedger.icrc1_balance_of(user_account);
			const wtnBalanceE8s = await $state.wtnLedger.icrc1_balance_of(user_account);

			user.set(
				new User({ principal: authResult.principal, icpBalanceE8s, nicpBalanceE8s, wtnBalanceE8s })
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
		background: var(--main-color);
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
