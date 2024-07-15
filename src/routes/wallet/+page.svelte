<script lang="ts">
	import Withdrawals from './Withdrawals.svelte';
	import { AssetType, Asset } from '$lib';
	import { user } from '$lib/stores';
	import SendButton from './SendButton.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { scale } from 'svelte/transition';

	let isAnimating = false;
    let circleVisible = false;
	let accountId = false;

    function handleAnimation() {
        if (!isAnimating) {
            isAnimating = true;
            circleVisible = true;
            setTimeout(() => {
                circleVisible = false;
                setTimeout(() => {
                    isAnimating = false;
                }, 500);
            }, 500);
        }
    }

	onMount(() => {
		if (!$user) {
			goto('/stake');
		}
	});
</script>

<div class="wallet-menu-container">
	<h1>Wallet</h1>
	<div class="address-container">
		<h2>ICP Account Id</h2>
		<div class="principal-container">
			<b>{$user?.accountId}</b>
			<button
				class="copy-btn"
				on:click={() => {
					accountId = true;
					handleAnimation();
					navigator.clipboard.writeText($user ? $user.accountId : '');
				}}
			>
				<svg
					height="20px"
					width="20px"
					viewBox="0 0 20 20"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						fill-rule="evenodd"
						clip-rule="evenodd"
						d="M6.75 3C5.23207 3 4 4.22862 4 5.74826V14.75H5.5V5.74826C5.5 5.05875 6.05879 4.5 6.75 4.5H12.75V3H6.75ZM8.75 7.25H13.75C14.0261 7.25 14.25 7.47386 14.25 7.75V15.75C14.25 16.0261 14.0261 16.25 13.75 16.25H8.75C8.47386 16.25 8.25 16.0261 8.25 15.75V7.75C8.25 7.47386 8.47386 7.25 8.75 7.25ZM6.75 7.75C6.75 6.64543 7.64543 5.75 8.75 5.75H13.75C14.8546 5.75 15.75 6.64543 15.75 7.75V15.75C15.75 16.8546 14.8546 17.75 13.75 17.75H8.75C7.64543 17.75 6.75 16.8546 6.75 15.75V7.75Z"
						fill="currentColor"
					></path>
				</svg>
				{#if circleVisible && accountId}
					<div class="circle" transition:scale={{ duration: 500 }}></div>
				{/if}
			</button>
		</div>
		<SendButton asset={new Asset(AssetType.ICP)} />
	</div>
	<div class="address-container">
		<h2>Principal Address</h2>
		<div class="principal-container">
			<b>{$user?.principal}</b>
			<button
				class="copy-btn"
				on:click={() => {
					accountId = false;
					handleAnimation();
					navigator.clipboard.writeText($user ? $user.principal.toString() : '');
				}}
			>
				<svg
					height="20px"
					width="20px"
					viewBox="0 0 20 20"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						fill-rule="evenodd"
						clip-rule="evenodd"
						d="M6.75 3C5.23207 3 4 4.22862 4 5.74826V14.75H5.5V5.74826C5.5 5.05875 6.05879 4.5 6.75 4.5H12.75V3H6.75ZM8.75 7.25H13.75C14.0261 7.25 14.25 7.47386 14.25 7.75V15.75C14.25 16.0261 14.0261 16.25 13.75 16.25H8.75C8.47386 16.25 8.25 16.0261 8.25 15.75V7.75C8.25 7.47386 8.47386 7.25 8.75 7.25ZM6.75 7.75C6.75 6.64543 7.64543 5.75 8.75 5.75H13.75C14.8546 5.75 15.75 6.64543 15.75 7.75V15.75C15.75 16.8546 14.8546 17.75 13.75 17.75H8.75C7.64543 17.75 6.75 16.8546 6.75 15.75V7.75Z"
						fill="currentColor"
					></path>
				</svg>
				{#if circleVisible && !accountId}
					<div class="circle" transition:scale={{ duration: 500 }}></div>
				{/if}
			</button>
		</div>
		<SendButton asset={new Asset(AssetType.nICP)} />
		<SendButton asset={new Asset(AssetType.WTN)} />
	</div>
</div>
<Withdrawals />

<style>
	/* === Base Styles === */
	h1 {
		text-align: center;
		margin: 0;
		font-family: Arial, Helvetica, sans-serif;
	}

	h2 {
		margin: 0;
		margin-top: 1em;
		font-family: Arial, Helvetica, sans-serif;
	}

	b {
		font-family: Arial, Helvetica, sans-serif;
		overflow-wrap: anywhere;
	}

	/* === Layout === */
	.wallet-menu-container {
		background-color: #0c2c4c;
		border: 2px solid #66adff;
		border-radius: 10px;
		color: white;
		padding: 2em;
		display: flex;
		flex-direction: column;
		width: 50em;
		max-width: 80vw;
	}

	.principal-container {
		margin-left: 1em;
		display: flex;
		margin-top: 1em;
		align-items: center;
	}

	.address-container {
		gap: 1em;
		display: flex;
		flex-direction: column;
	}

	/* === Components ==== */
	.copy-btn {
		background-color: transparent;
		border: none;
		cursor: pointer;
		border-radius: 0.3em;
		transition: all 0.3s ease;
		color: white;
		font-weight: bold;
		display: flex;
		position: relative;
	}

	/* === Animation === */
	
	.circle {
        position: absolute;
        border-radius: 50%;
        background-color: rgb(37, 139, 255, 0.5);
        width: 25px;
        height: 25px;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

</style>
