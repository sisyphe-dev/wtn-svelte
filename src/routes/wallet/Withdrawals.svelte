<script lang="ts">
	import CancelWarning from './CancelWarning.svelte';
	import {
		bigintE8sToNumber,
		displayUsFormat,
		renderStatus,
		displayTimeLeft,
		fetchCreationTimestampSecs,
		isMobile
	} from '$lib';
	import { user, canisters, inCancelWarningMenu } from '$lib/stores';
	import { onMount } from 'svelte';
	import type {
		WithdrawalDetails,
		NeuronId
	} from '$lib/../declarations/water_neuron/water_neuron.did';
	import { fade } from 'svelte/transition';

	let withdrawalRequests: WithdrawalDetails[];
	let withdrawalStatuses: {
		[key: string]: string;
	} = {};
	let selectedWithdrawal: WithdrawalDetails;

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
		if ($user && $canisters) {
			withdrawalRequests = await $canisters.waterNeuron.actor.get_withdrawal_requests([
				{ owner: $user.principal, subaccount: [] }
			]);
			await fetchStatuses();
		}
	};

	const handleCancelClick = (details: WithdrawalDetails) => {
		selectedWithdrawal = details;
		inCancelWarningMenu.set(true);
	};

	const fetchStatuses = async () => {
		if ($user) {
			for (const detail of withdrawalRequests) {
				const neuronId = detail.request.neuron_id;
				if (neuronId.length !== 0) {
					try {
						const createdAt = await fetchCreationTimestampSecs(neuronId[0]);
						withdrawalStatuses[neuronId[0].id.toString()] = displayTimeLeft(createdAt, isMobile);
					} catch (e) {
						console.error(e);
					}
				}
			}
		}
	};

	onMount(() => {
		fetchWithdrawals();
	});
</script>

{#if $inCancelWarningMenu}
	<CancelWarning details={selectedWithdrawal} />
{/if}
{#if withdrawalRequests && withdrawalRequests.length >= 1}
	<div class="withdrawals-container" in:fade={{ duration: 500 }}>
		<h1>Withdrawal Requests</h1>
		<table>
			<thead>
				{#if isMobile}
					<tr>
						<th>ICP Due</th>
						<th>Neuron Id</th>
						<th>Status</th>
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
							<td>
								{details.request.neuron_id[0]
									? withdrawalStatuses[details.request.neuron_id[0].id.toString()]
									: 'Waiting Dissolvement'}
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
									{displayNeuronId(details.request.neuron_id, false)}
								</a>
							</td>
							<td>
								{@html renderStatus(details.status)}
							</td>
							<td>{details.request.withdrawal_id}</td>
							<td>
								<button
									on:click={() => {
										handleCancelClick(details);
									}}
								>
									Cancel
								</button>
							</td>
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
		background-color: var(--background-color);
		border: var(--input-border);
		border-radius: 10px;
		color: var(--stake-text-color);
		padding: 2em;
		display: flex;
		flex-direction: column;
		width: 44em;
		max-width: 97vw;
	}

	/* === Base Styles ==== */
	h1 {
		text-align: center;
		font-family: var(--main-font);
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
		color: var(--stake-text-color);
	}

	button {
		background: var(--main-color);
		color: var(--main-button-text-color);
		min-width: 80px;
		border-radius: 8px;
		position: relative;
		border: 2px solid black;
		font-size: 14px;
		box-shadow: 3px 3px 0 0 black;
		padding: 0 1em 0 1em;
		max-width: none;
		height: 3em;
		font-weight: bold;
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: pointer;
		margin-right: 1em;
	}

	button:hover {
		transform: scale(0.95);
		transition: all 0.3s;
		box-shadow: 6px 6px 0 0 black;
	}

	/* === Responsive === */
	@media (max-width: 767px) {
		.withdrawals-container {
			padding: 0em;
		}
	}
</style>
