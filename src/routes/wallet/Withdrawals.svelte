<script lang="ts">
	import { bigintE8sToNumber, displayUsFormat, renderStatus } from '$lib';
	import { state, user } from '$lib/stores';
	import { onMount } from 'svelte';
	import type {
		WithdrawalDetails,
		NeuronId
	} from '../../declarations/water_neuron/water_neuron.did';

	let withdrawalRequests: WithdrawalDetails[];
	function displayNeuronId(neuronId: [] | [NeuronId]): string {
		if (neuronId.length == 0) {
			return 'Not Set';
		} else {
			return neuronId[0].id.toString();
		}
	}

	const fetchWithdrawals = async () => {
		if ($user) {
			withdrawalRequests = await $state.waterNeuron.get_withdrawal_requests([$user.principal]);
		}
	};

	onMount(() => {
		fetchWithdrawals();

		const intervalId = setInterval(async () => {
			if ($user) {
				withdrawalRequests = await $state.waterNeuron.get_withdrawal_requests([$user.principal]);
			}
		}, 5000);

		return () => clearInterval(intervalId);
	});
</script>

<div class="withdrawals-container">
	<h1>Withdrawal Requests</h1>
	<table class="withdrawal-requests-table">
		<thead>
			<tr>
				<th>Id</th>
				<th>nICP Burned</th>
				<th>ICP Due</th>
				<th>Neuron Id</th>
				<th>Status</th>
			</tr>
		</thead>
		<tbody>
			{#if withdrawalRequests}
				{#each withdrawalRequests as details}
					<tr>
						<td>{details.request.withdrawal_id}</td>
						<td>{displayUsFormat(bigintE8sToNumber(details.request.nicp_burned))}</td>
						<td>{displayUsFormat(bigintE8sToNumber(details.request.icp_due))}</td>
						<td>
							<a
								target="_blank"
								rel="noreferrer"
								href={'https://dashboard.internetcomputer.org/neuron/' +
									displayNeuronId(details.request.neuron_id)}
							>
								{displayNeuronId(details.request.neuron_id)}
							</a>
						</td>
						<td>{renderStatus(details.status)}</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>

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
		max-width: 80vw;
		overflow: auto;
	}

	/* === Base Styles ==== */
	h1 {
		text-align: center;
		font-family: Arial, Helvetica, sans-serif;
	}

	table {
		display: table;
		border-collapse: collapse;
		margin: 1em;
		padding: 1em;
		font-family: Arial, Helvetica, sans-serif;
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
		color: inherit;
	}
</style>
