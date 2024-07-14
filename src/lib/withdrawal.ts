import type { NeuronId, Account } from '../declarations/water_neuron/water_neuron.did';

export interface WithdrawalDetails {
	status: WithdrawalStatus;
	request: WithdrawalRequest;
}
export interface WithdrawalRequest {
	nicp_burned: bigint;
	withdrawal_id: bigint;
	icp_due: bigint;
	nicp_burn_index: bigint;
	timestamp: bigint;
	receiver: Account;
	neuron_id: [] | [NeuronId];
}
export type WithdrawalStatus =
	| {
			ConversionDone: { transfer_block_height: bigint };
	  }
	| { NotFound: null }
	| { WaitingToSplitNeuron: null }
	| { WaitingDissolvement: { neuron_id: NeuronId } }
	| { WaitingToStartDissolving: { neuron_id: NeuronId } };
export interface WithdrawalSuccess {
	block_index: bigint;
	withdrawal_id: bigint;
}
