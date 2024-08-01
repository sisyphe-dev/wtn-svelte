<script lang="ts">
	import CopyIcon from '$lib/icons/CopyIcon.svelte';
	import { fade, scale } from 'svelte/transition';
	import { boomerang } from '$lib/../declarations/boomerang';
	import { Principal } from '@dfinity/principal';
	import { afterUpdate } from 'svelte';

	export let data;
	let accountId: string;
	let principal: string;
	let isValid = true;
	let selectedSns = 'Custom';
	let selectedStep: 'Step1' | 'Step2' | 'Step3' = 'Step1';

	function notifyIcpDeposit() {
		alert('notify_icp_deposit button clicked!');
	}

	const setAccountId = (principal: string) => {
		try {
			boomerang.get_staking_account_id(Principal.fromText(principal)).then((account) => {
				accountId = account;
				isValid = true;
			});
		} catch (error) {
			isValid = false;
		}
	};

	$: principal, setAccountId(principal);

	function retrieveNicp() {
		alert('retrieve_nicp button clicked!');
	}

	afterUpdate(() => {
		if (selectedSns !== 'Custom') {
			QrCreator.render(
				{
					text: `${accountId}`,
					radius: 0.0, // 0.0 to 0.5
					ecLevel: 'H', // L, M, Q, H
					fill: 'rgb(12, 44, 76)',
					background: null,
					size: 1000 // in pixels
				},
				document.querySelector('#qr-code-sns')
			);
		} else if (principal && isValid){
			QrCreator.render(
				{
					text: `${accountId}`,
					radius: 0.0, // 0.0 to 0.5
					ecLevel: 'H', // L, M, Q, H
					fill: 'rgb(12, 44, 76)',
					background: null,
					size: 1000 // in pixels
				},
				document.querySelector('#qr-code-sns')
			);
		}
	});

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

<div class="sns-container" transition:fade>
	<div class="sns-selection-container">
		<div class="sns-listing">
			<div class="sns-btn-container">
				<button
					class="sns-btn-selection"
					class:selected-sns={selectedSns === 'Custom'}
					on:click={() => (selectedSns = 'Custom')}>Custom</button
				>
			</div>
			{#each data.sns as sns}
				<div class="sns-btn-container">
					<button
						class="sns-btn-selection"
						class:selected-sns={selectedSns === sns.name}
						on:click={() => {
							selectedSns = sns.name;
							setAccountId(sns.governance_id);
						}}>{sns.name}</button
					>
				</div>
			{/each}
		</div>
	</div>
	{#key selectedSns}
	<div class="boomerang-container" in:fade={{ duration: 500 }}>
		<h1>Stake {selectedSns} Treasury</h1>
		<nav>
			<button class="step-btn" class:selected-step={selectedStep === 'Step1'}>Step 1 </button>
			<button class="step-btn">Step 2 </button>
			<button class="step-btn">Step 3 </button>
		</nav>
		{#if selectedStep === 'Step1'}
			<div class="step1-container">
				<div class="instruction-container">
					<span class="round">1</span>
					<span>Make an ICP Treasury proposal to the following account identifier.</span>
				</div>
				{#if selectedSns !== 'Custom'}
					<div class="qr-code-container">
						<canvas id="qr-code-sns" />
						<img id="wtn-logo" src="/tokens/WTN.webp" width="70px" height="70px" alt="WTN logo." />
					</div>
					<div class="principal-container">
						<p>{accountId}</p>
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
				{:else}
					<div class="input-container">
						<input type="text" placeholder="Principal" bind:value={principal} />
					</div>
					
						{#if isValid && principal}
						<div class="qr-code-container" transition:fade={{ duration: 500 }}>
							<canvas id="qr-code-sns" />
							<img id="wtn-logo" src="/tokens/WTN.webp" width="70px" height="70px" alt="WTN logo." />
						</div>
						<div class="principal-container" transition:fade={{ duration: 500 }}>
							<p>{accountId}</p>
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
						{/if}
					
				{/if}
			</div>
		{/if}
	</div>
	{/key}
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

	h1 {
		color: white;
		font-size: 26px;
		font-family: var(--font-type1);
		align-self: center;
	}

	p {
		font-family: var(--font-type2);
		overflow-wrap: anywhere;
		font-weight: bold;
	}

	span {
		color: var(--text-color);
		overflow-wrap: anywhere;
		font-family: var(--font-type2);
	}

	nav {
		display: flex;
		width: 100%;
		justify-content: space-around;
	}

	canvas {
		background: oklab(0.88 -0.18 0.03);
		padding: 0.5em;
		border-radius: 8px;
	}

	input {
		border: none;
		padding-left: 0.4em;
		height: 3em;
		font-size: 16px;
		color: white;
		background: rgb(30, 52, 102);
		outline: none;
		width: 13em;
		border-radius: 0.4em;
	}

	/* === Layout === */
	.sns-container {
		background-color: #0c2c4c;
		border: 2px solid #66adff;
		border-radius: 10px;
		display: flex;
		width: 60em;
		max-height: 80dvh;
		max-width: 80vw;
	}

	.sns-selection-container {
		display: flex;
		flex-direction: column;
		width: 20%;
		align-items: center;
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
		align-items: start;
		justify-content: start;
		gap: 2em;
	}

	.account-container {
		display: flex;
		align-items: center;
	}

	.principal-container {
		display: flex;
		align-items: center;
	}

	.instruction-container {
		display: flex;
		align-items: center;
		gap: 1em;
	}

	.qr-code-container {
		position: relative;
		width: 100%;
		display: flex;
		justify-content: center;
	}

	.step1-container {
		display: flex;
		flex-direction: column;
		justify-content: start;
		background: none;
		align-items: center;
		height: fit-content;
		height: 100%;
		width: 100%;
		border: none;
		gap: 2em;
	}

	.header-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 2%;
		width: 100%;
		font-family: var(--font-type2);
	}

	.input-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	/* === Component === */
	.sns-listing {
		display: flex;
		overflow-y: scroll;
		width: 100%;
		flex-grow: 1;
		flex-direction: column;
		margin: 0;
		padding: 0;
		gap: 1em;
	}

	.sns-btn-selection {
		color: white;
		cursor: pointer;
		display: flex;
		width: 100%;
		justify-content: center;
		padding: 1em;
		font-size: 16px;
		border-radius: 8px;
		border: 2px solid transparent;
		background: none;
	}

	.sns-btn-selection:hover {
		border: 2px solid transparent;
		background-color: rgba(107, 249, 201, 0.5);
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

	.step-btn {
		background-color: transparent;
		border: none;
		cursor: pointer;
		border-radius: 0.3em;
		transition: all 0.3s ease;
		padding: 0.8em 1em;
		font-size: 20px;
		flex-grow: 1;
		color: white;
		font-weight: bold;
	}

	.step-btn:hover {
		background-color: #1e3466;
	}

	.round {
		border-radius: 50%;
		color: var(--text-color);
		border: 2px solid;
		width: 1em;
		height: fit-content;
		padding: 0.2em;
		font-weight: bold;
		text-align: center;
		font-family: var(--font-type2);
	}

	#qr-code-sns {
		height: 268px;
		width: 268px;
	}

	#wtn-logo {
		position: absolute;
		top: 50%;
		transform: translate(0, -50%);
	}

	.theme-btn {
		background: var(--main-color);
		min-width: 80px;
		position: relative;
		border: 2px solid black;
		border-radius: 8px;
		font-size: 16px;
		box-shadow: 3px 3px 0 0 black;
		padding: 0 1em 0 1em;
		width: 10em;
		height: 60px;
		font-weight: bold;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	/* === Utilities === */
	.selected-sns {
		border: 2px solid var(--main-color);
		background-color: rgba(107, 249, 201, 0.5);
	}

	.selected-step {
		background-color: #1e3466;
	}
</style>
