<script>
	import CopyIcon from '$lib/icons/CopyIcon.svelte';
	import { fade, scale } from 'svelte/transition';

	let selectedOption = 'openchat';
	let accountId = 'fa6bcd917e5e1605f38ebfc3c50a4a59830236c8e2308f59ffa42000d69b2e21';

	function notifyIcpDeposit() {
		alert('notify_icp_deposit button clicked!');
	}

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

<div class="wallet-menu-container">
	<h1>Stake SNS Treasury</h1>
	<div>
		<label for="options">Select SNS DAO:</label>
		<select bind:value={selectedOption} id="options" class="swap-btn">
			<option value="openchat">OpenChat</option>
			<option value="catalyze">Catalyze</option>
			<option value="boom">Boom DAO</option>
		</select>
	</div>
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

<style>
	.wallet-menu-container {
		background-color: #0c2c4c;
		border: 2px solid #66adff;
		border-radius: 10px;
		color: white;
		padding: 2em;
		display: flex;
		flex-direction: column;
		width: 44em;
		max-width: 80vw;
		align-items: left;
		text-align: left;
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

	.container {
		max-width: 800px;
		margin: 0 auto;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	select,
	button {
		margin: 10px;
		padding: 10px;
		font-size: 16px;
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

	.account-container {
		display: flex;
		align-items: center;
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
