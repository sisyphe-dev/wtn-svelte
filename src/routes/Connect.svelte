<script>
	import { is_logging, user } from '$lib/stores';
	import { provideUser } from '$lib/state';

	function internetIdentityConnection() {
		user.set(provideUser());
		is_logging.update((_) => false);
	}
</script>

<div class="cards-container">
	<button id="ii-btn" on:click={internetIdentityConnection}>
		<img src="/astronaut.webp" width="50px" height="50px" alt="Dfinity Astronaut." />
		<h2>Internet Identity</h2>
	</button>

	<button
		id="close-btn"
		on:click={() => {
			is_logging.update((_) => false);
		}}
	>
		<h2>Close</h2>
	</button>
</div>

<style>
	/* ===Base Styles===*/
	button {
		gap: 0.3em;
		border-radius: 0.3em;
		border: 2px solid black;
		box-shadow: 3px 3px 0 0 black;
		width: 100%;
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

	/*===Layout===*/
	.cards-container {
		max-width: 450px;
		max-height: 180px;
		width: 60%;
		height: fit-content;
		display: flex;
		flex-wrap: wrap;
		gap: 1em;
	}

	/*===Components*/
	#ii-btn {
		background: #18c7c9;
	}

	#close-btn {
		background: #66adff;
	}
</style>
