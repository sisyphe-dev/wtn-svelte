import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Account {
	owner: Principal;
	subaccount: [] | [Uint8Array | number[]];
}
export interface BallotInfo {
	vote: number;
	proposal_id: [] | [NeuronId];
}
export interface CanisterInfo {
	neuron_6m_account: Account;
	neuron_id_6m: [] | [NeuronId];
	neuron_id_8y: [] | [NeuronId];
	tracked_6m_stake: bigint;
	minimum_withdraw_amount: bigint;
	neuron_8y_stake_e8s: bigint;
	neuron_8y_account: Account;
	minimum_deposit_amount: bigint;
	governance_fee_share_e8s: bigint;
	neuron_6m_stake_e8s: bigint;
	exchange_rate: bigint;
	nicp_supply: bigint;
	total_icp_deposited: bigint;
	stakers_count: bigint;
}
export interface ConversionArg {
	maybe_subaccount: [] | [Uint8Array | number[]];
	amount_e8s: bigint;
}
export type ConversionError =
	| {
			GenericError: { code: number; message: string };
	  }
	| { TransferError: TransferError }
	| { AmountTooLow: { minimum_amount_e8s: bigint } }
	| { TransferFromError: TransferFromError }
	| { GuardError: { guard_error: GuardError } };
export interface DepositSuccess {
	block_index: bigint;
	transfer_id: bigint;
}
export type DissolveState =
	| { DissolveDelaySeconds: bigint }
	| { WhenDissolvedTimestampSeconds: bigint };
export interface Event {
	timestamp: bigint;
	payload: EventType;
}
export type EventType =
	| {
			ClaimedAirdrop: { block_index: bigint; caller: Principal };
	  }
	| { StartedToDissolve: { withdrawal_id: bigint } }
	| {
			MaturityNeuron: {
				from_neuron_type: NeuronOrigin;
				neuron_id: NeuronId;
			};
	  }
	| { NeuronSixMonths: NeuronId }
	| { Upgrade: UpgradeArg }
	| { Init: InitArg }
	| {
			MirroredProposal: {
				nns_proposal_id: NeuronId;
				sns_proposal_id: NeuronId;
			};
	  }
	| { NeuronEightYears: NeuronId }
	| { DistributeICPtoSNS: { amount: bigint; receiver: Principal } }
	| {
			NIcpWithdrawal: {
				nicp_burned: bigint;
				nicp_burn_index: bigint;
				receiver: Account;
			};
	  }
	| {
			IcpDeposit: {
				block_index: bigint;
				amount: bigint;
				receiver: Account;
			};
	  }
	| {
			DisbursedUserNeuron: {
				withdrawal_id: bigint;
				transfer_block_height: bigint;
			};
	  }
	| {
			TransferExecuted: {
				block_index: [] | [bigint];
				transfer_id: bigint;
			};
	  }
	| {
			DisbursedMaturityNeuron: {
				transfer_block_height: bigint;
				neuron_id: NeuronId;
			};
	  }
	| {
			DispatchICPRewards: {
				nicp_amount: bigint;
				sns_gov_amount: bigint;
				from_neuron_type: NeuronOrigin;
			};
	  }
	| { SplitNeuron: { withdrawal_id: bigint; neuron_id: NeuronId } };
export interface ExecutedTransfer {
	block_index: [] | [bigint];
	timestamp: bigint;
	transfer: PendingTransfer;
}
export interface Followees {
	followees: Array<NeuronId>;
}
export interface GetEventsArg {
	start: bigint;
	length: bigint;
}
export interface GetEventsResult {
	total_event_count: bigint;
	events: Array<Event>;
}
export interface GovernanceError {
	error_message: string;
	error_type: number;
}
export type GuardError = { AlreadyProcessing: null } | { TooManyConcurrentRequests: null };
export interface InitArg {
	nicp_ledger_id: Principal;
}
export interface KnownNeuronData {
	name: string;
	description: [] | [string];
}
export type LiquidArg = { Upgrade: [] | [UpgradeArg] } | { Init: InitArg };
export interface Neuron {
	id: [] | [NeuronId];
	staked_maturity_e8s_equivalent: [] | [bigint];
	controller: [] | [Principal];
	recent_ballots: Array<BallotInfo>;
	kyc_verified: boolean;
	neuron_type: [] | [number];
	not_for_profit: boolean;
	maturity_e8s_equivalent: bigint;
	cached_neuron_stake_e8s: bigint;
	created_timestamp_seconds: bigint;
	auto_stake_maturity: [] | [boolean];
	aging_since_timestamp_seconds: bigint;
	hot_keys: Array<Principal>;
	account: Uint8Array | number[];
	joined_community_fund_timestamp_seconds: [] | [bigint];
	dissolve_state: [] | [DissolveState];
	followees: Array<[number, Followees]>;
	neuron_fees_e8s: bigint;
	transfer: [] | [NeuronStakeTransfer];
	known_neuron_data: [] | [KnownNeuronData];
	spawn_at_timestamp_seconds: [] | [bigint];
}
export interface NeuronId {
	id: bigint;
}
export type NeuronOrigin = { NICPSixMonths: null } | { SnsGovernanceEightYears: null };
export interface NeuronStakeTransfer {
	to_subaccount: Uint8Array | number[];
	neuron_stake_e8s: bigint;
	from: [] | [Principal];
	memo: bigint;
	from_subaccount: Uint8Array | number[];
	transfer_timestamp: bigint;
	block_height: bigint;
}
export interface PendingTransfer {
	memo: [] | [bigint];
	unit: Unit;
	from_subaccount: [] | [Uint8Array | number[]];
	transfer_id: bigint;
	amount: bigint;
	receiver: Account;
}
export type Result = { Ok: bigint } | { Err: ConversionError };
export type Result_1 = { Ok: Neuron } | { Err: GovernanceError };
export type Result_2 = { Ok: Result_1 } | { Err: string };
export type Result_3 = { Ok: DepositSuccess } | { Err: ConversionError };
export type Result_4 = { Ok: WithdrawalSuccess } | { Err: ConversionError };
export type TransferError =
	| {
			GenericError: { message: string; error_code: bigint };
	  }
	| { TemporarilyUnavailable: null }
	| { BadBurn: { min_burn_amount: bigint } }
	| { Duplicate: { duplicate_of: bigint } }
	| { BadFee: { expected_fee: bigint } }
	| { CreatedInFuture: { ledger_time: bigint } }
	| { TooOld: null }
	| { InsufficientFunds: { balance: bigint } };
export type TransferFromError =
	| {
			GenericError: { message: string; error_code: bigint };
	  }
	| { TemporarilyUnavailable: null }
	| { InsufficientAllowance: { allowance: bigint } }
	| { BadBurn: { min_burn_amount: bigint } }
	| { Duplicate: { duplicate_of: bigint } }
	| { BadFee: { expected_fee: bigint } }
	| { CreatedInFuture: { ledger_time: bigint } }
	| { TooOld: null }
	| { InsufficientFunds: { balance: bigint } };
export type TransferStatus =
	| { Executed: ExecutedTransfer }
	| { Unknown: null }
	| { Pending: PendingTransfer };
export type Unit = { ICP: null } | { WTN: null } | { NICP: null };
export interface UpgradeArg {
	wtn_ledger_id: [] | [Principal];
	governance_fee_share_e8s: [] | [bigint];
	sns_governance_id: [] | [Principal];
}
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
export interface _SERVICE {
	claim_airdrop: ActorMethod<[], Result>;
	get_airdrop_allocation: ActorMethod<[], bigint>;
	get_events: ActorMethod<[GetEventsArg], GetEventsResult>;
	get_full_neuron: ActorMethod<[bigint], Result_2>;
	get_info: ActorMethod<[], CanisterInfo>;
	get_transfer_statuses: ActorMethod<[BigUint64Array | bigint[]], Array<TransferStatus>>;
	get_withdrawal_requests: ActorMethod<[[] | [Principal]], Array<WithdrawalDetails>>;
	icp_to_nicp: ActorMethod<[ConversionArg], Result_3>;
	nicp_to_icp: ActorMethod<[ConversionArg], Result_4>;
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
