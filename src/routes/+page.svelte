<script lang="ts">
	import { language } from '$lib/stores';
	import StatsWidget from './stake/StatsWidget.svelte';
	import Swap from './stake/Swap.svelte';
	import { fade, slide } from 'svelte/transition';
</script>

<StatsWidget />
<Swap />
