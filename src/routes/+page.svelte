<script lang="ts">
	import { language } from '$lib/stores';
	import StatsWidget from './stake/StatsWidget.svelte';
	import Swap from './stake/Swap.svelte';
	import Faq from './Faq.svelte';
	import { fade, slide } from 'svelte/transition';

	export let data;
</script>

<StatsWidget />
<Swap />
<Faq {data} />
