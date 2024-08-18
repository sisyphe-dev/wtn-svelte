<script lang="ts">
	import { language } from '$lib/stores';
	import StatsWidget from './stake/StatsWidget.svelte';
	import Swap from './stake/Swap.svelte';
	import Faq from './Faq.svelte';
	import { fade, slide } from 'svelte/transition';

	export let data;

	function getContent(language: string) {
		switch (language) {
			case 'en':
				return data.en.sections;
			case 'es':
				return data.es.sections;
			case 'ru':
				return data.ru.sections;
			case 'ja':
				return data.ja.sections;
			default:
				return [];
		}
	}

	let toggledMap = getContent($language).map(() => {
		return false;
	});
</script>

<StatsWidget />
<Swap />
<Faq  {data} />
