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
	public icpLedger: icpLedgerInterface;
	public wtnLedger: wtnLedgerInterface;
	public nicpLedger: nicpLedgerInterface;
	public waterNeuron: waterNeuronInterface;

	constructor() {
		this.neuron8yStakeE8s = BigInt(0);
		this.neuron6mStakeE8s = BigInt(0);
		this.nicpLedger = nicp_ledger;
		this.icpLedger = nns_ledger;
		this.wtnLedger = wtn_ledger;
		this.waterNeuron = water_neuron;
	}

	async totalIcpDeposited(): Promise<BigNumber> {
		const neuron6mStake = await this.neuron6mStake();
		const neuron8yStake = await this.neuron8yStake();
		return neuron6mStake.plus(neuron8yStake);
	}

	async neuron8yStake(): Promise<BigNumber> {
		if (this.waterNeuron) {
			const info = await this.waterNeuron.get_info();
			return bigintE8sToNumber(info.neuron_8y_stake_e8s);
		} else {
			return BigNumber(0);
		}
	}

	async neuron6mStake(): Promise<BigNumber> {
		if (this.waterNeuron) {
			const info = await this.waterNeuron.get_info();
			return bigintE8sToNumber(info.neuron_6m_stake_e8s);
		} else {
			return BigNumber(0);
		}
	}

	async exchangeRate(): Promise<BigNumber> {
		if (this.waterNeuron) {
			const info = await this.waterNeuron.get_info();
			return bigintE8sToNumber(info.exchange_rate);
		} else {
			return BigNumber(1);
		}
	}

	async wtnAllocation(): Promise<BigNumber> {
		if (this.waterNeuron) {
			const allocation = await this.waterNeuron.get_airdrop_allocation();
			return bigintE8sToNumber(allocation);
		} else {
			return BigNumber(0);
		}
	}

	async apy(): Promise<BigNumber> {
		const neuron6mStake = await this.neuron6mStake();
		const neuron8yStake = await this.neuron8yStake();

		if (neuron6mStake.plus(neuron8yStake).isZero()) return BigNumber(0);

		const amount6m = APY_6M.multipliedBy(neuron6mStake);
		const amount8y = APY_8Y.multipliedBy(neuron8yStake);
		const amountTotal = amount6m.plus(amount8y);
		const share = BigNumber(1).minus(DAO_SHARE);

		return share.multipliedBy(amountTotal).multipliedBy(BigNumber(1)).dividedBy(neuron6mStake);
	}

	async stakersCount(): Promise<Number> {
		if (this.waterNeuron) {
			const info = await this.waterNeuron.get_info();
			return Number(info.stakers_count);
		} else {
			return 0;
		}
	}
}
