<script lang="ts">
	import { bigintE8sToNumber, displayUsFormat, renderStatus } from '$lib';
	import { state, user } from '$lib/stores';
	import { onMount, afterUpdate } from 'svelte';
	import type {
		WithdrawalDetails,
		NeuronId
	} from '../../declarations/water_neuron/water_neuron.did';
	import { fade } from 'svelte/transition';

	let withdrawalRequests: WithdrawalDetails[];
	let withdrawalStatuses: {};


	function displayNeuronId(neuronId: [] | [NeuronId], truncate = true): string {
		if (neuronId.length == 0) {
			return 'Not Set';
		} else if (truncate) {
			const id = neuronId[0].id.toString();
			return id.substring(0, 4) + '...' + id.substring(id.length - 5, id.length - 1);
		} else {
			return neuronId[0].id.toString();
		}
	}

	const fetchWithdrawals = async () => {
		if ($user && $state) {
			withdrawalRequests = await $state.waterNeuron.get_withdrawal_requests([$user.principal]);
		}
	};

	const fetchStatuses = async () => {
		if ($user && $state) {
			withdrawalRequests.forEach(detail => {
				const status = await renderStatus(detail);
				
			});
		}
	};

	afterUpdate(() => {
		fetchWithdrawals();
	});

	$: $user, (() => fetchWithdrawals());

	const userAgent = navigator.userAgent;
	const isMobile = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
</script>

{#if withdrawalRequests && withdrawalRequests.length >= 1}
	<div class="withdrawals-container" in:fade={{ duration: 500 }}>
		<h1>Withdrawal Requests</h1>
		<table>
			<thead>
				{#if isMobile}
					<tr>
						<th>ICP Due</th>
						<th>Neuron Id</th>
					</tr>
				{:else}
					<tr>
						<th>nICP Burned</th>
						<th>ICP Due</th>
						<th>Neuron Id</th>
						<th>Status</th>
						<th>Id</th>
					</tr>
				{/if}
			</thead>
			<tbody>
				{#each withdrawalRequests as details}
					{#if isMobile}
						<tr>
							<td>{displayUsFormat(bigintE8sToNumber(details.request.icp_due))}</td>
							<td>
								<a
									target="_blank"
									rel="noreferrer"
									href={'https://dashboard.internetcomputer.org/neuron/' +
										displayNeuronId(details.request.neuron_id, false)}
								>
									{displayNeuronId(details.request.neuron_id)}
								</a>
							</td>
						</tr>
					{:else}
						<tr>
							<td>{displayUsFormat(bigintE8sToNumber(details.request.nicp_burned))}</td>
							<td>{displayUsFormat(bigintE8sToNumber(details.request.icp_due))}</td>
							<td>
								<a
									target="_blank"
									rel="noreferrer"
									href={'https://dashboard.internetcomputer.org/neuron/' +
										displayNeuronId(details.request.neuron_id, false)}
								>
									{displayNeuronId(details.request.neuron_id)}
								</a>
							</td>
							<td
								>{#if renderStatus(details.status)}
									...
								{:then status}
									{@html status}
								{/await}
							</td>
							<td>{details.request.withdrawal_id}</td>
						</tr>
					{/if}
				{/each}
			</tbody>
		</table>
	</div>
{/if}

<style>
	/* === Layout === */
	.withdrawals-container {
		background-color: #0c2c4c;
		border: 2px solid #66adff;
		border-radius: 10px;
		color: white;
		padding: 2em;
		display: flex;
		flex-direction: column;
		width: 40em;
		max-width: 97vw;
	}

	/* === Base Styles ==== */
	h1 {
		text-align: center;
		font-family: var(--font-type1);
	}

	table {
		display: table;
		border-collapse: collapse;
		margin: 1.5em;
		font-family: sans-serif;
	}

	th {
		text-align: center;
		padding: 0.5em;
	}

	td {
		border-top: 2px solid;
		text-align: center;
		padding: 1em;
	}

	a {
		text-decoration: underline;
		color: var(--text-color);
	}

	/* === Responsive === */
	@media (max-width: 767px) {
		.withdrawals-container {
			padding: 0em;
		}
	}
</style>
