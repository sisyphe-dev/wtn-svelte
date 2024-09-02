<script>
	export let invert;
</script>

<svg
	width="20px"
	height="20px"
	viewBox="0 0 1024 1024"
	class="icon"
	version="1.1"
	xmlns="http://www.w3.org/2000/svg"
>
	{#if !invert}
		<path
			d="M903.232 768l56.768-50.432L512 256l-448 461.568 56.768 50.432L512 364.928z"
			fill="var(--svg-fill-color)"
			transform="rotate(180, 512, 512)"
		/>
	{:else}
		<path
			d="M903.232 768l56.768-50.432L512 256l-448 461.568 56.768 50.432L512 364.928z"
			fill="var(--svg-fill-color)"
		/>
	{/if}
</svg>
