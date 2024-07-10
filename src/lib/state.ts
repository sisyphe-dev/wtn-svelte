import { AssetType, bigintE8sToNumber, numberToBigintE8s } from '$lib';
import { AccountIdentifier } from '@dfinity/ledger-icp';
import type { Principal } from '@dfinity/principal';

export class User {
	public principal: string;
	public accountId: string;
	private icpBalanceE8s: bigint;
	private nicpBalanceE8s: bigint;
	private wtnBalanceE8s: bigint;

	constructor(
		principal: Principal,
		icpBalanceE8s: bigint,
		nicpBalanceE8s: bigint,
		wtnBalanceE8s: bigint
	) {
		this.principal = principal.toString();
		this.accountId = AccountIdentifier.fromPrincipal({ principal: principal }).toHex();
		this.icpBalanceE8s = icpBalanceE8s;
		this.nicpBalanceE8s = nicpBalanceE8s;
		this.wtnBalanceE8s = wtnBalanceE8s;
	}

	icpBalance(): number {
		return bigintE8sToNumber(this.icpBalanceE8s);
	}

	nicpBalance(): number {
		return bigintE8sToNumber(this.nicpBalanceE8s);
	}

	wtnBalance(): number {
		return bigintE8sToNumber(this.wtnBalanceE8s);
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
		const e8sAmount = numberToBigintE8s(amount);
		switch (asset) {
			case AssetType.ICP:
				this.icpBalanceE8s += e8sAmount;
				break;
			case AssetType.nICP:
				this.nicpBalanceE8s += e8sAmount;
				break;
			case AssetType.WTN:
				this.wtnBalanceE8s += e8sAmount;
				break;
		}
	}

	substractBalance(asset: AssetType, amount: number) {
		const e8sAmount = numberToBigintE8s(amount);
		switch (asset) {
			case AssetType.ICP:
				this.icpBalanceE8s -= e8sAmount;
				break;
			case AssetType.nICP:
				this.nicpBalanceE8s -= e8sAmount;
				break;
			case AssetType.WTN:
				this.wtnBalanceE8s -= e8sAmount;
				break;
		}
	}
}

const DAO_SHARE = 0.1;
const APY_6M = 0.08;
const APY_8Y = 0.15;

export class State {
	public neuron8yStakeE8s: bigint;
	public neuron6mStakeE8s: bigint;
	public stakersCount: number;
	public exchangeRateE8s: bigint;

	constructor(
		neuron8yStakeE8s: bigint,
		neuron6mStakeE8s: bigint,
		stakersCount: number,
		exchangeRateE8s: bigint
	) {
		this.neuron8yStakeE8s = neuron8yStakeE8s;
		this.neuron6mStakeE8s = neuron6mStakeE8s;
		this.stakersCount = stakersCount;
		this.exchangeRateE8s = exchangeRateE8s;
	}

	totalIcpDeposited(): number {
		return this.neuron6mStake() + this.neuron8yStake();
	}

	neuron8yStake(): number {
		return Number(this.neuron8yStakeE8s) / 1e8;
	}

	neuron6mStake(): number {
		return Number(this.neuron6mStakeE8s) / 1e8;
	}

	exchangeRate(): number {
		return Number(this.exchangeRateE8s) / 1e8;
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
