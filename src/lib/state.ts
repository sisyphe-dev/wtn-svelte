import { AssetType, bigintE8sToNumber, E8S, numberToBigintE8s } from '$lib';
import { AccountIdentifier, ApproveError } from '@dfinity/ledger-icp';
import type { Principal } from '@dfinity/principal';
import BigNumber from 'bignumber.js';
import type { _SERVICE as nicpLedgerInterface } from '../declarations/nicp_ledger/nicp_ledger.did';
import type { _SERVICE as wtnLedgerInterface } from '../declarations/wtn_ledger/wtn_ledger.did';
import type { _SERVICE as icpLedgerInterface } from '../declarations/nns-ledger/nns-ledger.did';
import type { _SERVICE as waterNeuronInterface } from '../declarations/water_neuron/water_neuron.did';
import { nns_ledger } from '../declarations/nns-ledger';
import { nicp_ledger } from '../declarations/nicp_ledger';
import { wtn_ledger } from '../declarations/wtn_ledger';
import { water_neuron } from '../declarations/water_neuron';

interface UserProps {
	principal: Principal;
	icpBalanceE8s: bigint;
	nicpBalanceE8s: bigint;
	wtnBalanceE8s: bigint;
}

export class User {
	public principal: Principal;
	public accountId: string;
	public icpBalanceE8s: bigint;
	public nicpBalanceE8s: bigint;
	public wtnBalanceE8s: bigint;

	constructor(props: UserProps) {
		this.principal = props.principal;
		this.accountId = AccountIdentifier.fromPrincipal({ principal: props.principal }).toHex();
		this.icpBalanceE8s = props.icpBalanceE8s;
		this.nicpBalanceE8s = props.nicpBalanceE8s;
		this.wtnBalanceE8s = props.wtnBalanceE8s;
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
}

const DAO_SHARE = BigNumber(0.1);
const APY_6M = BigNumber(0.08);
const APY_8Y = BigNumber(0.15);

export class State {
	public neuron8yStakeE8s: bigint;
	public neuron6mStakeE8s: bigint;
	public stakersCount: number;
	public exchangeRateE8s: bigint;
	public icpLedger: icpLedgerInterface;
	public wtnLedger: wtnLedgerInterface;
	public nicpLedger: nicpLedgerInterface;
	public waterNeuron: waterNeuronInterface;

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
		this.nicpLedger = nicp_ledger;
		this.icpLedger = nns_ledger;
		this.wtnLedger = wtn_ledger;
		this.waterNeuron = water_neuron;
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

		return share
			.multipliedBy(amountTotal)
			.multipliedBy(BigNumber(1))
			.dividedBy(this.neuron6mStake());
	}
}

export function provideState(): State {
	return new State(BigInt(350_000 * 1e8), BigInt(1_500_000 * 1e8), 210, BigInt(1.3 * 1e8));
}
