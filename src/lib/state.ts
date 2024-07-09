import { AssetType } from '$lib';

interface Principal {
	value: string;
}

export class User {
	public principal: string;
	private icp_balance_e8s: bigint;
	private nicp_balance_e8s: bigint;
	private wtn_balance_e8s: bigint;

	constructor(
		principal: string,
		icp_balance_e8s: bigint,
		nicp_balance_e8s: bigint,
		wtn_balance_e8s: bigint
	) {
		this.principal = principal;
		this.icp_balance_e8s = icp_balance_e8s;
		this.nicp_balance_e8s = nicp_balance_e8s;
		this.wtn_balance_e8s = wtn_balance_e8s;
	}

	icpBalance(): number {
		return Number(this.icp_balance_e8s) / 1e8;
	}

	nicpBalance(): number {
		return Number(this.nicp_balance_e8s) / 1e8;
	}

	wtnBalance(): number {
		return Number(this.wtn_balance_e8s) / 1e8;
	}

	getBalance(asset: AssetType): number {
		switch (asset) {
			case AssetType.ICP:
				return this.icpBalance();
			case AssetType.nICP:
				return this.nicpBalance();
			case AssetType.WTN:
				return this.wtnBalance();
		}
	}

	addBalance(asset: AssetType, amount: number) {
		switch (asset) {
			case AssetType.ICP:
				this.icp_balance_e8s += BigInt(Math.floor(amount * 1e8));
				break;
			case AssetType.nICP:
				this.nicp_balance_e8s += BigInt(Math.floor(amount * 1e8));
				break;
			case AssetType.WTN:
				this.wtn_balance_e8s += BigInt(Math.floor(amount * 1e8));
				break;
		}
	}

	substractBalance(asset: AssetType, amount: number) {
		switch (asset) {
			case AssetType.ICP:
				this.icp_balance_e8s -= BigInt(Math.floor(amount * 1e8));
				break;
			case AssetType.nICP:
				this.nicp_balance_e8s -= BigInt(Math.floor(amount * 1e8));
				break;
			case AssetType.WTN:
				this.wtn_balance_e8s -= BigInt(Math.floor(amount * 1e8));
				break;
		}
	}
}

const DAO_SHARE = 0.1;
const APY_6M = 0.08;
const APY_8Y = 0.15;

export class State {
	public neuron_8y_stake_e8s: bigint;
	public neuron_6m_stake_e8s: bigint;
	public stakers_count: number;
	public exchange_rate_e8s: bigint;

	constructor(
		neuron_8y_stake_e8s: bigint,
		neuron_6m_stake_e8s: bigint,
		stakers_count: number,
		exchange_rate_e8s: bigint
	) {
		this.neuron_8y_stake_e8s = neuron_8y_stake_e8s;
		this.neuron_6m_stake_e8s = neuron_6m_stake_e8s;
		this.stakers_count = stakers_count;
		this.exchange_rate_e8s = exchange_rate_e8s;
	}

	totalIcpDeposited(): number {
		return this.neuron6mStake() + this.neuron8yStake();
	}

	neuron8yStake(): number {
		return Number(this.neuron_8y_stake_e8s) / 1e8;
	}

	neuron6mStake(): number {
		return Number(this.neuron_6m_stake_e8s) / 1e8;
	}

	exchangeRate(): number {
		return Number(this.exchange_rate_e8s) / 1e8;
	}

	apy(): number {
		return (
			(100 * (1 - DAO_SHARE) * (APY_6M * this.neuron6mStake() + APY_8Y * this.neuron8yStake())) /
			this.neuron6mStake()
		);
	}
}

export interface NeuronId {
	id: bigint;
}

export interface Account {
	owner: Principal;
	subaccount: [] | [Uint8Array | number[]];
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

const DEFAULT_PRINCIPAL = 'dwx4w-plydf-jxgs5-uncbu-mfyds-5vjzm-oohax-gmvja-cypv7-tmbt4-dqe';

export function provideUser(): User {
	return new User(
		DEFAULT_PRINCIPAL,
		BigInt(10_000 * 1e8),
		BigInt(1_500 * 1e8),
		BigInt(100_000 * 1e8)
	);
}

export function provideState(): State {
	return new State(BigInt(350_000 * 1e8), BigInt(1_500_000 * 1e8), 210, BigInt(1.3 * 1e8));
}

export const DEFAULT_WITHDRAWAL_DETAILS: WithdrawalDetails[] = [
	{
		status: { WaitingToSplitNeuron: null },
		request: {
			nicp_burned: BigInt(10 * 1e8),
			withdrawal_id: 0n,
			icp_due: BigInt(12 * 1e8),
			nicp_burn_index: 5n,
			timestamp: 1715676048n,
			receiver: {
				owner: { value: DEFAULT_PRINCIPAL },
				subaccount: []
			},
			neuron_id: []
		}
	},
	{
		status: { WaitingDissolvement: { neuron_id: { id: 123n } } },
		request: {
			nicp_burned: BigInt(10 * 1e8),
			withdrawal_id: 1n,
			icp_due: BigInt(12 * 1e8),
			nicp_burn_index: 5n,
			timestamp: 1715676048n,
			receiver: {
				owner: { value: DEFAULT_PRINCIPAL },
				subaccount: []
			},
			neuron_id: [{ id: 123n }]
		}
	}
];
