import { bigintE8sToNumber } from '$lib';
import { DEFAULT_PRINCIPAL } from './state';

interface Principal {
	value: string;
}

export interface NeuronId {
	id: bigint;
}

export interface Account {
	owner: Principal;
	subaccount: [] | [Uint8Array | number[]];
}

export type WithdrawalStatus =
	| {
			ConversionDone: { transfer_block_height: bigint };
	  }
	| { NotFound: null }
	| { WaitingToSplitNeuron: null }
	| { WaitingDissolvement: { neuron_id: NeuronId } }
	| { WaitingToStartDissolving: { neuron_id: NeuronId } };

export class WithdrawalDetails {
	private nicp_burned_e8s: bigint;
	private icp_due_e8s: bigint;
	public withdrawal_id: bigint;
	public nicp_burn_index: bigint;
	public timestamp: bigint;
	public receiver: Account;
	public neuron_id: [] | [NeuronId];
	public status: WithdrawalStatus;

	constructor(
		nicp_burned_e8s: bigint,
		icp_due_e8s: bigint,
		withdrawal_id: bigint,
		nicp_burn_index: bigint,
		timestamp: bigint,
		receiver: Account,
		neuron_id: [] | [NeuronId],
		status: WithdrawalStatus
	) {
		this.nicp_burned_e8s = nicp_burned_e8s;
		this.icp_due_e8s = icp_due_e8s;
		this.nicp_burn_index = nicp_burn_index;
		this.withdrawal_id = withdrawal_id;
		this.timestamp = timestamp;
		this.receiver = receiver;
		this.neuron_id = neuron_id;
		this.status = status;
	}

	nicpBurned(): number {
		return bigintE8sToNumber(this.nicp_burned_e8s);
	}

	icpDue(): number {
		return bigintE8sToNumber(this.icp_due_e8s);
	}
}

export const DEFAULT_WITHDRAWAL_DETAILS: WithdrawalDetails[] = [
	new WithdrawalDetails(
		BigInt(10 * 1e8),
		0n,
		BigInt(12 * 1e8),
		5n,
		1715676048n,
		{
			owner: { value: DEFAULT_PRINCIPAL },
			subaccount: []
		},
		[],
		{ WaitingToSplitNeuron: null }
	),
	new WithdrawalDetails(
		BigInt(10 * 1e8),
		1n,
		BigInt(12 * 1e8),
		5n,
		1715676048n,
		{
			owner: { value: DEFAULT_PRINCIPAL },
			subaccount: []
		},
		[{ id: 123n }],
		{ WaitingDissolvement: { neuron_id: { id: 123n } } }
	)
];
