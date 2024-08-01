<script lang="ts">
	import CopyIcon from '$lib/icons/CopyIcon.svelte';
	import { fade, scale } from 'svelte/transition';
	import { boomerang } from '$lib/../declarations/boomerang';
	import { Principal } from '@dfinity/principal';

	export let data;
	let accountId: string;
	let selectedSns = 'custom';

	function notifyIcpDeposit() {
		alert('notify_icp_deposit button clicked!');
	}

	const setAccountId = (principal: string) => {
		boomerang.get_staking_account_id(Principal.fromText(principal)).then((account) => {
			accountId = account;
		});
	};

	function retrieveNicp() {
		alert('retrieve_nicp button clicked!');
	}

	let isAnimating = false;
	let circleVisible = false;

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
</script>

<div class="sns-container">
	<div class="sns-selection-container">
		<h2 id="section-header">Select SNS DAO</h2>
		<div class="sns-listing">
			<div class="sns-btn-container">
				<button
					class:sns-btn-selection={selectedSns !== 'custom'}
					class:sns-btn-selected={selectedSns === 'custom'}
					on:click={() => (selectedSns = 'custom')}>Custom</button
				>
			</div>
			{#each data.sns as sns}
				<div class="sns-btn-container">
					<button
						class:sns-btn-selection={selectedSns !== sns.name}
						class:sns-btn-selected={selectedSns === sns.name}
						on:click={() => {
							selectedSns = sns.name;
							setAccountId(sns.governance_id);
						}}>{sns.name}</button
					>
				</div>
			{/each}
		</div>
	</div>
	<div class="boomerang-container">
		<h1>Stake SNS Treasury</h1>
		<div>
			<h2>Step 1:</h2>
			<p>Make an ICP Treasury proposal to the following account identifier.</p>
			<div class="account-container">
				<h2>{accountId}</h2>
				<button
					class="copy-btn"
					on:click={() => {
						handleAnimation();
						navigator.clipboard.writeText(accountId);
					}}
				>
					<CopyIcon />
					{#if circleVisible}
						<div class="circle" transition:scale={{ duration: 500 }}></div>
					{/if}
				</button>
			</div>
		</div>
		<div>
			<h2>Step 2:</h2>
			<button on:click={notifyIcpDeposit} class="swap-btn">Notify ICP Deposit</button>
		</div>
		<div>
			<h2>Step 3:</h2>
			<button on:click={retrieveNicp} class="swap-btn">Retrieve nICP</button>
		</div>
	</div>
</div>

<style>
	/* === Base Styles === */
	div::-webkit-scrollbar {
		display: none;
	}

	div::-webkit-scrollbar-track {
		display: none;
	}

	div::-webkit-scrollbar-thumb {
		display: none;
	}

	div::-webkit-scrollbar-corner {
		display: none;
	}

	h2 {
		color: white;
		font-size: 16px;
		font-family: var(--font-type2);
		margin: 0;
	}

	h1 {
		color: white;
		font-size: 26px;
		font-family: var(--font-type1);
		align-self: center;
	}

	p {
		font-family: var(--font-type2);
		color: white;
	}

	button {
		margin: 10px;
		padding: 10px;
		font-size: 16px;
	}

	/* === Layout === */
	.sns-container {
		background-color: #0c2c4c;
		border: 2px solid #66adff;
		border-radius: 10px;
		display: flex;
		width: 60em;
		max-height: 90dvh;
		max-width: 80vw;
	}

	.sns-selection-container {
		display: flex;
		flex-direction: column;
		width: 20%;
		align-items: center;
		overflow-y: scroll;
		gap: 1em;
		padding: 1em;
		background-color: #183f66;
		border-radius: 10px;
	}

	.sns-btn-container {
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.boomerang-container {
		display: flex;
		flex-direction: column;
		width: 80%;
		overflow-x: scroll;
		align-items: center;
		justify-content: center;
	}

	.account-container {
		display: flex;
		align-items: center;
	}

	/* === Component === */
	.sns-listing {
		display: flex;
		width: 100%;
		max-height: 80%;
		flex-direction: column;
		margin: 0;
		padding: 0;
		gap: 1em;
	}

	.sns-btn-selected {
		display: flex;
		width: 100%;
		justify-content: center;
		border: 2px solid var(--main-color);
		border-radius: 8px;
		background-color: rgba(107, 249, 201, 0.5);
		cursor: pointer;
		color: black;
	}
	.sns-btn-selection:hover {
		display: flex;
		width: 100%;
		justify-content: center;
		border: 2px solid transparent;
		border-radius: 8px;
		background-color: rgba(107, 249, 201, 0.5);
		cursor: pointer;
		color: black;
	}

	.sns-btn-selection {
		border: 2px solid transparent;
		color: white;
		background: none;
		cursor: pointer;
		display: flex;
		width: 100%;
		justify-content: center;
	}

	.swap-btn {
		background: var(--main-color);
		min-width: 80px;
		max-width: fit-content;
		position: relative;
		border: 2px solid black;
		border-radius: 8px;
		font-size: 16px;
		font-weight: bold;
		box-shadow: 3px 3px 0 0 black;
		padding: 0 1em 0 1em;
		max-width: none;
		height: 4em;
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;
	}

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
