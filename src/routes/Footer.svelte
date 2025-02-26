<script>
	import { isLogging } from '$lib/stores';
	import OpenChatIcon from '$lib/icons/OpenChatIcon.svelte';
	import TelegramIcon from '$lib/icons/TelegramIcon.svelte';
	import TwitterIcon from '$lib/icons/TwitterIcon.svelte';
	import GitBookIcon from '$lib/icons/GitBookIcon.svelte';
	import { isMobile } from '$lib';
	import GithubIcon from '$lib/icons/GithubIcon.svelte';
</script>

<footer class:filter={$isLogging}>
	{#if !isMobile}
		<div class="left-container">
			<a href="https://docs.waterneuron.fi/" target="_blank" rel="noreferrer"> Documentation </a>
			<a href="https://wtn.ic.app/" target="_blank" rel="noreferrer"> WTN Calculator </a>
			<a
				href="https://docs.google.com/spreadsheets/d/1Y8JXo8xOB786usk8BaWPPcBJB7oFR0HWvA5y8kcfRqU/edit?gid=746571094#gid=746571094"
				target="_blank"
				rel="noreferrer"
			>
				Spreadsheet
			</a>
		</div>
	{/if}
	<div class="central-container">
		<a
			class="item--1"
			href="https://oc.app/community/3fudd-diaaa-aaaar-bgmca-cai/channel/154489341794150690442253978518193726806"
			rel="noreferrer"
			target="_blank"
		>
			<OpenChatIcon />
		</a>
		<a class="item--5" href="https://github.com/WaterNeuron" target="_blank" rel="noreferrer">
			<GithubIcon />
		</a>
		<a class="item--3" href="https://twitter.com/WaterNeuron" target="_blank" rel="noreferrer">
			<TwitterIcon />
		</a>
		<a class="item--4" href="https://docs.waterneuron.fi/" rel="noreferrer" target="_blank">
			<GitBookIcon />
		</a>
		<a class="item--2" href="https://t.me/waterneuron" rel="noreferrer" target="_blank">
			<TelegramIcon />
		</a>
	</div>
</footer>

<style>
	/* === Base Styles === */
	footer {
		display: flex;
		color: var(--text-color);
		height: fit-content;
		width: 100%;
		justify-content: space-between;
		margin-bottom: 2vh;
	}

	a {
		align-content: center;
	}

	/* === Layout === */
	.central-container {
		display: flex;
		gap: 1em;
		align-self: flex-end;
		padding-right: 1em;
	}

	.left-container {
		display: flex;
		align-self: center;
		padding-left: 1em;
		gap: 1em;
	}

	.left-container a {
		text-decoration: none;
		color: var(--text-color);
		font-family: CircularXX, sans-serif;
		font-size: 0.85em;
	}

	.left-container a:hover {
		text-decoration: underline;
	}

	/* === Utillities === */
	.filter {
		filter: blur(5px);
	}
</style>
