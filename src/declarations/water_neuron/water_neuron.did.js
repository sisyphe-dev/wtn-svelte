export const idlFactory = ({ IDL }) => {
	const UpgradeArg = IDL.Record({
		wtn_ledger_id: IDL.Opt(IDL.Principal),
		governance_fee_share_e8s: IDL.Opt(IDL.Nat64),
		sns_governance_id: IDL.Opt(IDL.Principal)
	});
	const InitArg = IDL.Record({ nicp_ledger_id: IDL.Principal });
	const LiquidArg = IDL.Variant({
		Upgrade: IDL.Opt(UpgradeArg),
		Init: InitArg
	});
	const TransferError = IDL.Variant({
		GenericError: IDL.Record({
			message: IDL.Text,
			error_code: IDL.Nat
		}),
		TemporarilyUnavailable: IDL.Null,
		BadBurn: IDL.Record({ min_burn_amount: IDL.Nat }),
		Duplicate: IDL.Record({ duplicate_of: IDL.Nat }),
		BadFee: IDL.Record({ expected_fee: IDL.Nat }),
		CreatedInFuture: IDL.Record({ ledger_time: IDL.Nat64 }),
		TooOld: IDL.Null,
		InsufficientFunds: IDL.Record({ balance: IDL.Nat })
	});
	const TransferFromError = IDL.Variant({
		GenericError: IDL.Record({
			message: IDL.Text,
			error_code: IDL.Nat
		}),
		TemporarilyUnavailable: IDL.Null,
		InsufficientAllowance: IDL.Record({ allowance: IDL.Nat }),
		BadBurn: IDL.Record({ min_burn_amount: IDL.Nat }),
		Duplicate: IDL.Record({ duplicate_of: IDL.Nat }),
		BadFee: IDL.Record({ expected_fee: IDL.Nat }),
		CreatedInFuture: IDL.Record({ ledger_time: IDL.Nat64 }),
		TooOld: IDL.Null,
		InsufficientFunds: IDL.Record({ balance: IDL.Nat })
	});
	const GuardError = IDL.Variant({
		AlreadyProcessing: IDL.Null,
		TooManyConcurrentRequests: IDL.Null
	});
	const ConversionError = IDL.Variant({
		GenericError: IDL.Record({ code: IDL.Int32, message: IDL.Text }),
		TransferError: TransferError,
		AmountTooLow: IDL.Record({ minimum_amount_e8s: IDL.Nat64 }),
		TransferFromError: TransferFromError,
		GuardError: IDL.Record({ guard_error: GuardError })
	});
	const Result = IDL.Variant({ Ok: IDL.Nat64, Err: ConversionError });
	const GetEventsArg = IDL.Record({
		start: IDL.Nat64,
		length: IDL.Nat64
	});
	const NeuronOrigin = IDL.Variant({
		NICPSixMonths: IDL.Null,
		SnsGovernanceEightYears: IDL.Null
	});
	const NeuronId = IDL.Record({ id: IDL.Nat64 });
	const Account = IDL.Record({
		owner: IDL.Principal,
		subaccount: IDL.Opt(IDL.Vec(IDL.Nat8))
	});
	const EventType = IDL.Variant({
		ClaimedAirdrop: IDL.Record({
			block_index: IDL.Nat64,
			caller: IDL.Principal
		}),
		StartedToDissolve: IDL.Record({ withdrawal_id: IDL.Nat64 }),
		MaturityNeuron: IDL.Record({
			from_neuron_type: NeuronOrigin,
			neuron_id: NeuronId
		}),
		NeuronSixMonths: NeuronId,
		Upgrade: UpgradeArg,
		Init: InitArg,
		MirroredProposal: IDL.Record({
			nns_proposal_id: NeuronId,
			sns_proposal_id: NeuronId
		}),
		NeuronEightYears: NeuronId,
		DistributeICPtoSNS: IDL.Record({
			amount: IDL.Nat64,
			receiver: IDL.Principal
		}),
		NIcpWithdrawal: IDL.Record({
			nicp_burned: IDL.Nat64,
			nicp_burn_index: IDL.Nat64,
			receiver: Account
		}),
		IcpDeposit: IDL.Record({
			block_index: IDL.Nat64,
			amount: IDL.Nat64,
			receiver: Account
		}),
		DisbursedUserNeuron: IDL.Record({
			withdrawal_id: IDL.Nat64,
			transfer_block_height: IDL.Nat64
		}),
		TransferExecuted: IDL.Record({
			block_index: IDL.Opt(IDL.Nat64),
			transfer_id: IDL.Nat64
		}),
		DisbursedMaturityNeuron: IDL.Record({
			transfer_block_height: IDL.Nat64,
			neuron_id: NeuronId
		}),
		DispatchICPRewards: IDL.Record({
			nicp_amount: IDL.Nat64,
			sns_gov_amount: IDL.Nat64,
			from_neuron_type: NeuronOrigin
		}),
		SplitNeuron: IDL.Record({
			withdrawal_id: IDL.Nat64,
			neuron_id: NeuronId
		})
	});
	const Event = IDL.Record({ timestamp: IDL.Nat64, payload: EventType });
	const GetEventsResult = IDL.Record({
		total_event_count: IDL.Nat64,
		events: IDL.Vec(Event)
	});
	const BallotInfo = IDL.Record({
		vote: IDL.Int32,
		proposal_id: IDL.Opt(NeuronId)
	});
	const DissolveState = IDL.Variant({
		DissolveDelaySeconds: IDL.Nat64,
		WhenDissolvedTimestampSeconds: IDL.Nat64
	});
	const Followees = IDL.Record({ followees: IDL.Vec(NeuronId) });
	const NeuronStakeTransfer = IDL.Record({
		to_subaccount: IDL.Vec(IDL.Nat8),
		neuron_stake_e8s: IDL.Nat64,
		from: IDL.Opt(IDL.Principal),
		memo: IDL.Nat64,
		from_subaccount: IDL.Vec(IDL.Nat8),
		transfer_timestamp: IDL.Nat64,
		block_height: IDL.Nat64
	});
	const KnownNeuronData = IDL.Record({
		name: IDL.Text,
		description: IDL.Opt(IDL.Text)
	});
	const Neuron = IDL.Record({
		id: IDL.Opt(NeuronId),
		staked_maturity_e8s_equivalent: IDL.Opt(IDL.Nat64),
		controller: IDL.Opt(IDL.Principal),
		recent_ballots: IDL.Vec(BallotInfo),
		kyc_verified: IDL.Bool,
		neuron_type: IDL.Opt(IDL.Int32),
		not_for_profit: IDL.Bool,
		maturity_e8s_equivalent: IDL.Nat64,
		cached_neuron_stake_e8s: IDL.Nat64,
		created_timestamp_seconds: IDL.Nat64,
		auto_stake_maturity: IDL.Opt(IDL.Bool),
		aging_since_timestamp_seconds: IDL.Nat64,
		hot_keys: IDL.Vec(IDL.Principal),
		account: IDL.Vec(IDL.Nat8),
		joined_community_fund_timestamp_seconds: IDL.Opt(IDL.Nat64),
		dissolve_state: IDL.Opt(DissolveState),
		followees: IDL.Vec(IDL.Tuple(IDL.Int32, Followees)),
		neuron_fees_e8s: IDL.Nat64,
		transfer: IDL.Opt(NeuronStakeTransfer),
		known_neuron_data: IDL.Opt(KnownNeuronData),
		spawn_at_timestamp_seconds: IDL.Opt(IDL.Nat64)
	});
	const GovernanceError = IDL.Record({
		error_message: IDL.Text,
		error_type: IDL.Int32
	});
	const Result_1 = IDL.Variant({ Ok: Neuron, Err: GovernanceError });
	const Result_2 = IDL.Variant({ Ok: Result_1, Err: IDL.Text });
	const CanisterInfo = IDL.Record({
		neuron_6m_account: Account,
		neuron_id_6m: IDL.Opt(NeuronId),
		neuron_id_8y: IDL.Opt(NeuronId),
		tracked_6m_stake: IDL.Nat64,
		minimum_withdraw_amount: IDL.Nat64,
		neuron_8y_stake_e8s: IDL.Nat64,
		neuron_8y_account: Account,
		minimum_deposit_amount: IDL.Nat64,
		governance_fee_share_e8s: IDL.Nat64,
		neuron_6m_stake_e8s: IDL.Nat64,
		exchange_rate: IDL.Nat64,
		nicp_supply: IDL.Nat64,
		total_icp_deposited: IDL.Nat64,
		stakers_count: IDL.Nat64
	});
	const Unit = IDL.Variant({
		ICP: IDL.Null,
		WTN: IDL.Null,
		NICP: IDL.Null
	});
	const PendingTransfer = IDL.Record({
		memo: IDL.Opt(IDL.Nat64),
		unit: Unit,
		from_subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
		transfer_id: IDL.Nat64,
		amount: IDL.Nat64,
		receiver: Account
	});
	const ExecutedTransfer = IDL.Record({
		block_index: IDL.Opt(IDL.Nat64),
		timestamp: IDL.Nat64,
		transfer: PendingTransfer
	});
	const TransferStatus = IDL.Variant({
		Executed: ExecutedTransfer,
		Unknown: IDL.Null,
		Pending: PendingTransfer
	});
	const WithdrawalStatus = IDL.Variant({
		ConversionDone: IDL.Record({ transfer_block_height: IDL.Nat64 }),
		NotFound: IDL.Null,
		WaitingToSplitNeuron: IDL.Null,
		WaitingDissolvement: IDL.Record({ neuron_id: NeuronId }),
		WaitingToStartDissolving: IDL.Record({ neuron_id: NeuronId })
	});
	const WithdrawalRequest = IDL.Record({
		nicp_burned: IDL.Nat64,
		withdrawal_id: IDL.Nat64,
		icp_due: IDL.Nat64,
		nicp_burn_index: IDL.Nat64,
		timestamp: IDL.Nat64,
		receiver: Account,
		neuron_id: IDL.Opt(NeuronId)
	});
	const WithdrawalDetails = IDL.Record({
		status: WithdrawalStatus,
		request: WithdrawalRequest
	});
	const ConversionArg = IDL.Record({
		maybe_subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
		amount_e8s: IDL.Nat64
	});
	const DepositSuccess = IDL.Record({
		block_index: IDL.Nat,
		transfer_id: IDL.Nat64
	});
	const Result_3 = IDL.Variant({
		Ok: DepositSuccess,
		Err: ConversionError
	});
	const WithdrawalSuccess = IDL.Record({
		block_index: IDL.Nat,
		withdrawal_id: IDL.Nat64
	});
	const Result_4 = IDL.Variant({
		Ok: WithdrawalSuccess,
		Err: ConversionError
	});
	return IDL.Service({
		claim_airdrop: IDL.Func([], [Result], []),
		get_airdrop_allocation: IDL.Func([], [IDL.Nat64], ['query']),
		get_events: IDL.Func([GetEventsArg], [GetEventsResult], ['query']),
		get_full_neuron: IDL.Func([IDL.Nat64], [Result_2], []),
		get_info: IDL.Func([], [CanisterInfo], ['query']),
		get_transfer_statuses: IDL.Func([IDL.Vec(IDL.Nat64)], [IDL.Vec(TransferStatus)], ['query']),
		get_withdrawal_requests: IDL.Func(
			[IDL.Opt(IDL.Principal)],
			[IDL.Vec(WithdrawalDetails)],
			['query']
		),
		icp_to_nicp: IDL.Func([ConversionArg], [Result_3], []),
		nicp_to_icp: IDL.Func([ConversionArg], [Result_4], [])
	});
};
export const init = ({ IDL }) => {
	const UpgradeArg = IDL.Record({
		wtn_ledger_id: IDL.Opt(IDL.Principal),
		governance_fee_share_e8s: IDL.Opt(IDL.Nat64),
		sns_governance_id: IDL.Opt(IDL.Principal)
	});
	const InitArg = IDL.Record({ nicp_ledger_id: IDL.Principal });
	const LiquidArg = IDL.Variant({
		Upgrade: IDL.Opt(UpgradeArg),
		Init: InitArg
	});
	return [LiquidArg];
};
