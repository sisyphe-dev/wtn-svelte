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
			ConversionDone: { transferBlockHeight: bigint };
	  }
	| { NotFound: null }
	| { WaitingToSplitNeuron: null }
	| { WaitingDissolvement: { neuronId: NeuronId } }
	| { WaitingToStartDissolving: { neuronId: NeuronId } };

export class WithdrawalDetails {
	private nicpBurnedE8s: bigint;
	private icpDueE8s: bigint;
	public withdrawalId: bigint;
	public nicpBurnIndex: bigint;
	public timestamp: bigint;
	public receiver: Account;
	public neuronId: [] | [NeuronId];
	public status: WithdrawalStatus;

	constructor(
		nicpBurnedE8s: bigint,
		icpDueE8s: bigint,
		withdrawalId: bigint,
		nicpBurnIndex: bigint,
		timestamp: bigint,
		receiver: Account,
		neuronId: [] | [NeuronId],
		status: WithdrawalStatus
	) {
		this.nicpBurnedE8s = nicpBurnedE8s;
		this.icpDueE8s = icpDueE8s;
		this.nicpBurnIndex = nicpBurnIndex;
		this.withdrawalId = withdrawalId;
		this.timestamp = timestamp;
		this.receiver = receiver;
		this.neuronId = neuronId;
		this.status = status;
	}

	nicpBurned(): number {
		return bigintE8sToNumber(this.nicpBurnedE8s);
	}

	icpDue(): number {
		return bigintE8sToNumber(this.icpDueE8s);
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
		{ WaitingDissolvement: { neuronId: { id: 123n } } }
	)
];
