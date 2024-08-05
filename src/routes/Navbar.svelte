<script>
	import { isLogging, inMobileMenu, user } from '$lib/stores';
	import { displayUsFormat, displayPrincipal } from '$lib';
	import { internetIdentityLogout } from '$lib/authentification';
</script>

<nav class:filter={$isLogging}>
	<a href="/stake" class="menu-selection-container">
		<img src="/tokens/WTN.webp" width="100em" height="100em" alt="WTN logo." />
		<div class="wave-title">
			<h1 id="static-header">WaterNeuron</h1>
			<h1 id="blue-wave">WaterNeuron</h1>
		</div>
	</a>
	<div class="right-container">
		<a href="/sns" class="smart"> SNS </a>
		{#if !$user}
			<button
				class="smart"
				on:click={() => {
					isLogging.set(true);
				}}
			>
				Connect
			</button>
		{:else}
			<a href="/wallet" class="wallet-btn" id="wallet-info">
				<h2 style:font-weight={'bold'}>{displayPrincipal($user.principal)}</h2>
				<p id="special">{displayUsFormat($user.icpBalance())} ICP</p>
				<p>{displayUsFormat($user.nicpBalance())} nICP</p>
				<p>{displayUsFormat($user.wtnBalance())} WTN</p>
			</a>
			<button
				id="disconnect-btn"
				class="wallet-action-btn"
				on:click={async () => {
					await internetIdentityLogout();
					user.set(undefined);
				}}
			>
				<img src="/icon/power-off.svg" width="15em" height="15em" alt="Disconnect Icon" />
			</button>
			<button
				id="menu-btn"
				class="wallet-action-btn"
				on:click={() => {
					inMobileMenu.set(true);
				}}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					height="24"
					viewBox="0 -960 960 960"
					width="24"
					fill="white"
				>
					<path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"></path>
				</svg>
			</button>
		{/if}
	</div>
</nav>

<style>
	/* === Base Styles === */
	nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		color: white;
		height: fit-content;
		padding: 0 2vw;
		margin-top: 2vh;
	}

	button,
	a {
		background-color: transparent;
		border: none;
		cursor: pointer;
		border-radius: 0.3em;
		transition: all 0.3s ease;
		margin: 0 1em;
		color: white;
		font-weight: bold;
	}

	button:hover {
		background-color: #1e3466;
	}

	div {
		display: flex;
		align-items: center;
	}

	a {
		display: flex;
		align-items: center;
		text-decoration: none;
		color: inherit;
		font-family: var(--secondary-font);
	}

	p,
	h2 {
		margin: 0;
		padding: 0;
		font-size: 13px;
	}

	p {
		text-align: end;
		font-weight: normal;
	}

	/* ===Layout=== */
	.menu-selection-container {
		gap: 1em;
	}

	.menu-selection-container:hover {
		cursor: pointer;
	}

	.menu-selection-container h1 {
		font-size: 4em;
		cursor: pointer;
		font-family: var(--main-font);
		position: absolute;
	}

	.wallet-actions-container {
		margin: 0;
	}

	.wave-title {
		position: relative;
	}

	.right-container {
		display: flex;
		align-items: center;
		gap: 1em;
	}

	/* === Components === */
	.smart {
		display: flex;
		align-items: center;
		height: fit-content;
		font-size: 16px;
		padding: 0.5em;
		margin: 0;
	}

	.smart:hover {
		background-color: #1e3466;
	}

	.wallet-action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 2em;
		width: 3em;
		padding: 1.3em 0.5em;
		margin: 0;
	}

	.wallet-btn {
		display: flex;
		flex-direction: column;
		text-align: right;
		font-size: 16px;
		padding: 0.5em;
		margin: 0;
	}

	#menu-btn {
		display: none;
	}

	#wallet-info {
		align-items: end;
	}
	#wallet-info:hover {
		background-color: #1e3466;
	}

	/* === Utillities === */
	.filter {
		filter: blur(5px);
	}

	/* === Animations === */
	.wave-title:hover h1:nth-child(2) {
		animation: wave_animation 3s ease-in-out infinite;
	}

	#blue-wave {
		color: transparent;
		background: linear-gradient(to right, #3dae3c, #d6fea9);
		background-clip: text;
		clip-path: polygon(
			0% 35%,
			16% 44%,
			33% 50%,
			54% 60%,
			70% 61%,
			84% 59%,
			100% 52%,
			100% 100%,
			0% 100%
		);
	}

	@keyframes wave_animation {
		0%,
		100% {
			clip-path: polygon(
				0% 35%,
				16% 44%,
				33% 50%,
				54% 60%,
				70% 61%,
				84% 59%,
				100% 52%,
				100% 100%,
				0% 100%
			);
		}

		50% {
			clip-path: polygon(
				0% 60%,
				15% 65%,
				34% 66%,
				51% 62%,
				67% 50%,
				84% 45%,
				100% 46%,
				100% 100%,
				0% 100%
			);
		}
	}

	/* === Responsive Design === */
	@media (max-width: 767px) {
		nav {
			background: none;
			box-shadow: none;
			height: 100px;
		}

		.menu-selection-container h1 {
			display: none;
		}

		#disconnect-btn {
			display: none;
		}

		#menu-btn {
			display: flex;
		}

		img {
			height: 5em;
			width: 5em;
		}
	}
</style>
