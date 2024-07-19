<script lang="ts">
	import { isLogging, isBusy, user, state } from '$lib/stores';
	import { internetIdentitySignIn, plugSignIn } from '$lib/authentification';
	import { User } from '$lib/state';
	import type { Account } from '@dfinity/ledger-icp';

	async function internetIdentityConnection() {
		if ($isBusy) return;
		isBusy.set(true);

		try {
			const authResult = await internetIdentitySignIn();

			$state.wtnLedger = authResult.actors.wtnLedger;
			$state.icpLedger = authResult.actors.icpLedger;
			$state.nicpLedger = authResult.actors.nicpLedger;
			$state.waterNeuron = authResult.actors.waterNeuron;
			$state.wtnCanisterInfo = authResult.actors.wtnCanisterInfo;

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
		isLogging.set(false);
	}

	async function plugConnection() {
		if ($isBusy) return;

		isBusy.set(true);
		try {
			const authResult = await plugSignIn();

			$state.wtnLedger = authResult.actors.wtnLedger;
			$state.icpLedger = authResult.actors.icpLedger;
			$state.nicpLedger = authResult.actors.nicpLedger;
			$state.waterNeuron = authResult.actors.waterNeuron;
			$state.wtnCanisterInfo = authResult.actors.wtnCanisterInfo;

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
		isLogging.set(false);
	}

	const userAgent = navigator.userAgent;

	const isMobile = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
</script>

<div class="cards-container">
	{#if $isBusy}
		<button class="login-btn">
			<div class="spinner"></div>
		</button>
	{:else}
		<button class="login-btn" on:click={internetIdentityConnection}>
			<img src="/icon/astronaut.webp" width="50em" height="50em" alt="Dfinity Astronaut." />
			<h2>Internet Identity</h2>
		</button>
		{#if !isMobile}
			<button class="login-btn" id="plug-btn" on:click={plugConnection}>
				<img src="/icon/plug.svg" width="50em" height="50em" alt="Plug Icon." />
				<h2>Plug Wallet</h2>
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
		font-family: var(--font-type2);
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
	.login-btn {
		background: var(--main-color);
	}

	#close-btn {
		background: #66adff;
	}

	/* === Animation === */

	.spinner {
		width: 2em;
		height: 2em;
		border: 3px solid black;
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
