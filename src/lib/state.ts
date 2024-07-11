import { AssetType, bigintE8sToNumber, E8S, numberToBigintE8s } from '$lib';
import { AccountIdentifier } from '@dfinity/ledger-icp';
import type { Principal } from '@dfinity/principal';
import BigNumber from 'bignumber.js';

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

	icpBalance(): BigNumber {
		return bigintE8sToNumber(this.icpBalanceE8s);
	}

	nicpBalance(): BigNumber {
		return bigintE8sToNumber(this.nicpBalanceE8s);
	}

	wtnBalance(): BigNumber {
		return bigintE8sToNumber(this.wtnBalanceE8s);
	}

	getBalance(asset: AssetType): BigNumber {
		switch (asset) {
			case AssetType.ICP:
				return this.icpBalance();
			case AssetType.nICP:
				return this.nicpBalance();
			case AssetType.WTN:
				return this.wtnBalance();
		}
	}

	addBalance(asset: AssetType, amount: BigNumber) {
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

	substractBalance(asset: AssetType, amount: BigNumber) {
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

const DAO_SHARE = BigNumber(0.1);
const APY_6M = BigNumber(0.08);
const APY_8Y = BigNumber(0.15);

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

	totalIcpDeposited(): BigNumber {
		return this.neuron6mStake().plus(this.neuron8yStake());
	}

	neuron8yStake(): BigNumber {
		return bigintE8sToNumber(this.neuron8yStakeE8s);
	}

	neuron6mStake(): BigNumber {
		return bigintE8sToNumber(this.neuron6mStakeE8s);
	}

	exchangeRate(): BigNumber {
		return bigintE8sToNumber(this.exchangeRateE8s);
	}

	apy(): BigNumber {
		const amount6m = APY_6M.multipliedBy(this.neuron6mStake());
		const amount8y = APY_8Y.multipliedBy(this.neuron8yStake());
		const amountTotal = amount6m.plus(amount8y);
		const share = BigNumber(1).minus(DAO_SHARE);

		return share.multipliedBy(amountTotal).multipliedBy(BigNumber(1)).dividedBy(this.neuron6mStake());
	}
}

export const DEFAULT_PRINCIPAL = 'dwx4w-plydf-jxgs5-uncbu-mfyds-5vjzm-oohax-gmvja-cypv7-tmbt4-dqe';

export function provideState(): State {
	return new State(BigInt(350_000 * 1e8), BigInt(1_500_000 * 1e8), 210, BigInt(1.3 * 1e8));
}
