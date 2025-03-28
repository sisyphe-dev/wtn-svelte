<script lang="ts">
	import { canisters, inChart, chartData } from '$lib/stores';
	import type { GetEventsResult, Event } from '$lib/../declarations/water_neuron/water_neuron.did';
	import { Chart } from 'flowbite-svelte';
	import { onMount } from 'svelte';

	type Scale = '1m' | '3m' | '6m' | '1y' | 'All';

	const TS_CACHE_KEY = 'ts';
	const XR_CACHE_KEY = 'xr';
	const CACHE_REFRESH_KEY = 'dailyTaskExpiry';
	const NANOS_PER_SEC = 1_000_000_000n;
	const ONE_MONTH_MILLIS = 30 * 24 * 60 * 60 * 1_000;
	const BATCH_SIZE = 2_000n;

	let dialog: HTMLDialogElement;
	let chart: ApexCharts | undefined;

	export let isInverted: boolean;
	let exchangeRates: number[] = [];
	let timestamps: number[] = [];
	let isFirstLoad = true;
	const scales: Scale[] = ['1m', '3m', '6m', '1y', 'All'];

	let options: ApexCharts.ApexOptions = {
		chart: {
			width: '600px',
			height: '300px',
			type: 'area' as 'area',
			fontFamily: 'var(--main-font)',
			toolbar: { show: false },
			dropShadow: { enabled: false },
			animations: {
				enabled: false,
				dynamicAnimation: { enabled: false }
			}
		},
		series: [
			{
				name: 'Exchange Rate',
				data: isInverted
					? exchangeRates.map((xr) => {
							return 1 / xr;
						})
					: exchangeRates,
				color: '#286e5f'
			}
		] as ApexAxisChartSeries,
		fill: {
			type: 'gradient',
			gradient: {
				opacityFrom: 0.55,
				opacityTo: 0,
				shade: '#286e5f',
				gradientToColors: ['#286e5f']
			}
		},
		stroke: {
			width: 2,
			colors: ['#286e5f']
		},
		xaxis: {
			categories: timestamps,
			type: 'datetime' as 'datetime'
		},
		title: {
			text: `Exchange Rate ${isInverted ? 'ICP/nICP' : 'nICP/ICP'}`,
			style: {
				fontSize: '14px',
				fontFamily: 'var(--secondary-font)'
			}
		},
		tooltip: { enabled: true },
		dataLabels: {
			enabled: false
		}
	};

	async function updateCache() {
		const [ts, xr] = await fetchEvent();
		chartData.set({ timestamps: [1718748000000].concat(ts), exchangeRates: [1].concat(xr) });
		timestamps = [1718748000000].concat(ts);
		exchangeRates = [1].concat(xr);
	}

	function checkCache() {
		if ($chartData) {
			timestamps = $chartData.timestamps;
			exchangeRates = $chartData.exchangeRates;
		} else {
			updateCache();
		}
	}

	async function processBatch(startingPoints: bigint[]): Promise<Event[]> {
		if (!$canisters) return [];

		let promises = [];
		for (const start of startingPoints) {
			promises.push(processEvents(start));
		}
		const results = await Promise.all(promises);
		return results.reduce((acc, ev) => acc.concat(ev), []);
	}

	async function processEvents(start: bigint): Promise<Event[]> {
		if (!$canisters) return [];
		const result = await $canisters.waterNeuron.anonymousActor.get_events({
			start,
			length: BATCH_SIZE
		});

		return result.events.filter((ev) => {
			return ['IcpDeposit', 'NIcpWithdrawal', 'DispatchICPRewards'].some(
				(key) => key in ev.payload
			);
		});
	}

	async function fetchEvent(): Promise<[number[], number[]]> {
		const batchCount = 25;
		const batches = Array.from({ length: batchCount }, (_, i) => BigInt(i) * BATCH_SIZE);
		const events = await processBatch(batches);
		let icp6m = 0n;
		let nicpMinted = 0n;
		let icpVariation = 0n;
		let nicpVariation = 0n;
		let xr = 1;

		let ts: number[] = [];
		let xrs: number[] = [];

		for (const event of events) {
			if ('IcpDeposit' in event.payload) {
				icpVariation += event.payload.IcpDeposit.amount;
				nicpVariation += BigInt(Math.floor(xr * Number(event.payload.IcpDeposit.amount)));
			}
			if ('NIcpWithdrawal' in event.payload) {
				nicpVariation -= event.payload.NIcpWithdrawal.nicp_burned;
				icpVariation -= BigInt(Math.floor(Number(event.payload.NIcpWithdrawal.nicp_burned) / xr));
			}
			if ('DispatchICPRewards' in event.payload) {
				icpVariation += event.payload.DispatchICPRewards.nicp_amount;
				icp6m += icpVariation;
				nicpMinted += nicpVariation;
				xr = Number(nicpMinted) / Number(icp6m);

				const date = new Date(1_000 * Number(event.timestamp / NANOS_PER_SEC));
				ts.push(date.getTime());
				xrs.push(Number(xr.toFixed(4)));

				icpVariation = 0n;
				nicpVariation = 0n;
			}
		}
		return [ts, xrs];
	}

	onMount(() => {
		dialog = document.getElementById('chartDialog') as HTMLDialogElement;
		dialog.showModal();
		checkCache();
	});

	const setDateRange = (scale: Scale) => {
		let cachedTs: string | null = localStorage.getItem('cachedTs');
		let cachedExchangeRates = localStorage.getItem('cachedExchangeRates');

		if (!cachedTs || !cachedExchangeRates) return;

		const fullRangeTs: Date[] = JSON.parse(cachedTs);
		const fullRangeXrs: number[] = JSON.parse(cachedExchangeRates);
		let rangedTs: number[] = [];
		let rangedXrs: number[] = [];
		let now = Date.now();
		let range = now;

		switch (scale) {
			case '1m':
				range = ONE_MONTH_MILLIS;
				break;
			case '3m':
				range = 3 * ONE_MONTH_MILLIS;
				break;
			case '6m':
				range = 6 * ONE_MONTH_MILLIS;
				break;
			case '1y':
				range = 12 * ONE_MONTH_MILLIS;
				break;
			case 'All':
				break;
		}

		for (const [index, rawDate] of fullRangeTs.entries()) {
			const timestamp = new Date(rawDate);
			if (timestamp.getTime() + range >= now) {
				rangedTs.push(timestamp.getTime());
				rangedXrs.push(fullRangeXrs[index]);
			}
		}
		timestamps = rangedTs;
		exchangeRates = rangedXrs;
	};

	const updateOptions = () => {
		options.series = [
			{
				name: 'Exchange Rate',
				data: isInverted
					? exchangeRates.map((xr) => {
							return Number((1 / xr).toFixed(4));
						})
					: exchangeRates,
				color: '#286e5f'
			}
		] as ApexAxisChartSeries;

		options.xaxis = {
			categories: timestamps,
			type: 'datetime' as 'datetime'
		};

		if (options.chart?.animations && !isFirstLoad && chart) {
			options.chart.animations = { enabled: true, dynamicAnimation: { enabled: true, speed: 300 } };
		} else {
			isFirstLoad = false;
		}
	};

	$: timestamps, exchangeRates, updateOptions();
</script>

<dialog
	id="chartDialog"
	on:close={() => {
		inChart.set(false);
	}}
>
	<div class="chart-container">
		<button
			style="background: none; position: absolute; top: 1em; right: 1em; z-index: 10; cursor: pointer;"
			on:click={() => {
				dialog.close();
			}}
		>
			<svg
				fill="black"
				height="15px"
				width="15px"
				version="1.1"
				id="Layer_1"
				xmlns="http://www.w3.org/2000/svg"
				xmlns:xlink="http://www.w3.org/1999/xlink"
				viewBox="0 0 512 512"
				xml:space="preserve"
			>
				<g stroke-width="0"></g><g stroke-linecap="round" stroke-linejoin="round"> </g>
				<g>
					<g>
						<g>
							<polygon
								points="512,59.076 452.922,0 256,196.922 59.076,0 0,59.076 196.922,256 0,452.922 59.076,512 256,315.076 452.922,512 512,452.922 315.076,256 "
							></polygon>
						</g>
					</g>
				</g>
			</svg>
		</button>
		{#if timestamps.length === 0 || exchangeRates.length === 0}
			<div class="spinner"></div>
		{/if}
		<Chart {options} bind:chart />
		<div class="scales">
			{#each scales as scale}
				<button on:click={() => setDateRange(scale)}>{scale}</button>
			{/each}
		</div>
	</div>
</dialog>

<style>
	::backdrop {
		backdrop-filter: blur(5px);
	}

	dialog {
		display: flex;
		background: transparent;
		justify-content: center;
		align-items: center;
		height: fit-content;
		min-height: 100%;
		min-width: 100dvw;
		padding: 0;
		margin: 0;
		border: none;
	}

	.chart-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		background: var(--background-color);
		height: fit-content;
		width: fit-content;
		position: relative;
		padding: 1em;
		border-radius: 8px;
	}

	.scales {
		display: flex;
		width: fit-content;
		gap: 1px;
	}

	.scales button:first-child {
		border-top-left-radius: 8px;
		border-bottom-left-radius: 8px;
	}

	.scales button:last-child {
		border-top-right-radius: 8px;
		border-bottom-right-radius: 8px;
	}

	button {
		border: none;
		background-color: #286e5f5e;
		height: 40px;
		width: 60px;
	}

	button:hover {
		background-color: #286e5fd1;
	}

	.spinner {
		width: 1em;
		height: 1em;
		border: 3px solid var(--main-color);
		border-top-color: transparent;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		position: absolute;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
