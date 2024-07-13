<script lang="ts">
	import Navbar from './Navbar.svelte';
	import Footer from './Footer.svelte';
	import Connect from './Connect.svelte';
	import Send from './wallet/Send.svelte';
	import Menu from './Menu.svelte';
	import { isLogging, menu, isSending } from '$lib/stores';
	import Toast from './Toast.svelte';
	import { onMount } from 'svelte';
	import { user, state } from '$lib/stores';
	import type { Account } from '@dfinity/ledger-icp';
	import { signIn } from '$lib/authentification';
	import { User } from '$lib/state';
	import { AuthClient } from '@dfinity/auth-client';

	const fetchUser = async () => {
		try {
			const authClient = await AuthClient.create();
			if (await authClient.isAuthenticated()) return;

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
	};
	onMount(() => {
		fetchUser();

		const intervalId = setInterval(async () => {
			if ($user) {
				const user_account: Account = {
					owner: $user.principal,
					subaccount: []
				} as Account;

				const icpBalance = await $state.icpLedger.icrc1_balance_of(user_account);
				const nicpBalance = await $state.nicpLedger.icrc1_balance_of(user_account);
				const wtnBalance = await $state.wtnLedger.icrc1_balance_of(user_account);
				$user.icpBalanceE8s = icpBalance;
				$user.nicpBalanceE8s = nicpBalance;
				$user.wtnBalanceE8s = wtnBalance;
			}
		}, 5000);

		return () => clearInterval(intervalId);
	});
</script>

{#if $isLogging}
	<div class="background-filter">
		<Connect />
	</div>
{:else if $isSending}
	<div class="background-filter">
		<Send />
	</div>
{/if}
{#if $menu}
	<Menu />
{:else}
	<div class="page-container">
		<Navbar />
		<div class="content-container" class:filter={$isSending || $isLogging}>
			<slot />
		</div>
		<Footer />
	</div>
	<Toast />
{/if}

<style>
	/* === Layout === */
	.page-container {
		display: flex;
		flex-direction: column;
		height: fit-content;
		min-height: 100vh;
		width: 100%;
		background: radial-gradient(farthest-corner circle at 0% 0%, rgb(18 69 89), #0f0f4d);
	}

	.content-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: fit-content;
		min-height: 45vh;
		width: 100%;
		gap: 2em;
		padding-top: 2em;
		color: white;
	}

	/* === Components === */
	.background-filter {
		position: fixed;
		width: 100vw;
		height: 100vh;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* === Utilities ===*/
	.filter {
		filter: blur(5px);
	}
</style>
