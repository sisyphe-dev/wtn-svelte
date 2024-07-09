<script lang="ts">
	import { displayUsFormat, numberWithDecimals } from '$lib';
	import { DEFAULT_WITHDRAWAL_DETAILS, type NeuronId } from '$lib/state';

	function displayNeuronId(neuron_id: [] | [NeuronId]): string {
		if (neuron_id.length == 0) {
			return 'Not Set';
		} else {
			return neuron_id[0].id.toString();
		}
	}
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
			{#each DEFAULT_WITHDRAWAL_DETAILS as details}
				<tr>
					<td>{details.request.withdrawal_id}</td>
					<td
						>{displayUsFormat(numberWithDecimals(Number(details.request.nicp_burned) / 1e8, 8))}</td
					>
					<td>{displayUsFormat(numberWithDecimals(Number(details.request.icp_due) / 1e8, 8))}</td>
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
					<td>{Object.keys(details.status)[0]}</td>
				</tr>
			{/each}
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
