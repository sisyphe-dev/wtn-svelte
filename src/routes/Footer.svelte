<script>
	import { isSelecting, isLogging } from '$lib/stores';
</script>

<footer class:filter={$isLogging || $isSelecting}>
	<div class="central-container">
		<a href="https://github.com/WaterNeuron" target="_blank" rel="noreferrer">
			<img alt="Github Icon" src="landing/github-white.svg" />
		</a>
		<div class="central-icons">
			<a href="https://twitter.com/WaterNeuron" target="_blank" rel="noreferrer">
				<img alt="Twitter Icon" src="landing/twitter.svg" />
			</a>
			<img alt="WTN icon" src="/WTN.png" id="wtn-icon" />
		</div>
		<a href="https://docs.waterneuron.fi/" rel="noreferrer" target="_blank">
			<img alt="Git book icon" src="icon/gitbook.svg" />
		</a>
	</div>
</footer>

<style>
	/* === Base Styles === */
	footer {
		display: flex;
		flex-direction: column;
		align-items: center;
		color: white;
		height: fit-content;
		padding: 0 2vw;
		margin-bottom: 2vh;
	}

	img {
		height: 2em;
		width: 2em;
	}

	/* === Layout === */
	.central-container {
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1em;
		padding: 4em 0;
	}

	.central-icons {
		display: flex;
		flex-direction: column;
		gap: 1em;
		align-items: center;
	}

	/* === Component === */
	#wtn-icon {
		height: 4em;
		width: 4em;
	}

	/* === Utillities === */
	.filter {
		filter: blur(5px);
	}
</style>
