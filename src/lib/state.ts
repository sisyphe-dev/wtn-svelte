import { AssetType, bigintE8sToNumber, numberToBigintE8s } from '$lib';
import { AccountIdentifier } from '@dfinity/ledger-icp';
import type { Principal } from '@dfinity/principal';

export class User {
	public principal: string;
	public accountId: string;
	private icp_balance_e8s: bigint;
	private nicp_balance_e8s: bigint;
	private wtn_balance_e8s: bigint;

	constructor(
		principal: Principal,
		icp_balance_e8s: bigint,
		nicp_balance_e8s: bigint,
		wtn_balance_e8s: bigint
	) {
		this.principal = principal.toString();
		this.accountId = AccountIdentifier.fromPrincipal({ principal: principal }).toHex();
		this.icp_balance_e8s = icp_balance_e8s;
		this.nicp_balance_e8s = nicp_balance_e8s;
		this.wtn_balance_e8s = wtn_balance_e8s;
	}

	icpBalance(): number {
		return bigintE8sToNumber(this.icp_balance_e8s);
	}

	nicpBalance(): number {
		return bigintE8sToNumber(this.nicp_balance_e8s);
	}

	wtnBalance(): number {
		return bigintE8sToNumber(this.wtn_balance_e8s);
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
		const e8s_amount = numberToBigintE8s(amount);
		switch (asset) {
			case AssetType.ICP:
				this.icp_balance_e8s += e8s_amount;
				break;
			case AssetType.nICP:
				this.nicp_balance_e8s += e8s_amount;
				break;
			case AssetType.WTN:
				this.wtn_balance_e8s += e8s_amount;
				break;
		}
	}

	substractBalance(asset: AssetType, amount: number) {
		const e8s_amount = numberToBigintE8s(amount);
		switch (asset) {
			case AssetType.ICP:
				this.icp_balance_e8s -= e8s_amount;
				break;
			case AssetType.nICP:
				this.nicp_balance_e8s -= e8s_amount;
				break;
			case AssetType.WTN:
				this.wtn_balance_e8s -= e8s_amount;
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

export const DEFAULT_PRINCIPAL = 'dwx4w-plydf-jxgs5-uncbu-mfyds-5vjzm-oohax-gmvja-cypv7-tmbt4-dqe';

export function provideState(): State {
	return new State(BigInt(350_000 * 1e8), BigInt(1_500_000 * 1e8), 210, BigInt(1.3 * 1e8));
}
