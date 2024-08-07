import { AssetType, bigintE8sToNumber } from '$lib';
import { AccountIdentifier, type Account, SubAccount } from '@dfinity/ledger-icp';
import { Principal } from '@dfinity/principal';
import BigNumber from 'bignumber.js';
import type { _SERVICE as icrcLedgerInterface } from '../declarations/icrc_ledger/icrc_ledger.did';
import type { _SERVICE as icpLedgerInterface } from '../declarations/icp_ledger/icp_ledger.did';
import type { _SERVICE as boomerangInterface } from '../declarations/boomerang/boomerang.did';
import type {
	CanisterInfo,
	_SERVICE as waterNeuronInterface
} from '../declarations/water_neuron/water_neuron.did';
import { idlFactory as idlFactoryWaterNeuron } from '../declarations/water_neuron';
import { HOST, CANISTER_ID_WATER_NEURON, type Actors } from './authentification';
import { HttpAgent, Actor, makeNonceTransform } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { IDL } from '@dfinity/candid';

export class User {
	public principal: Principal;
	public accountId: string;
	public icpBalanceE8s: bigint;
	public nicpBalanceE8s: bigint;
	public wtnBalanceE8s: bigint;
	public wtnAllocationE8s: bigint;

	constructor(principal: Principal) {
		this.principal = principal;
		this.accountId = AccountIdentifier.fromPrincipal({ principal }).toHex();
		this.icpBalanceE8s = 0n;
		this.nicpBalanceE8s = 0n;
		this.wtnBalanceE8s = 0n;
		this.wtnAllocationE8s = 0n;
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

	wtnAllocation(): BigNumber {
		return bigintE8sToNumber(this.wtnAllocationE8s);
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

async function createSecp256k1IdentityActor(
	canisterId: Principal,
	idl: IDL.InterfaceFactory
): Promise<any> {
	const dummyIdentity = Ed25519KeyIdentity.generate();

	const dummyAgent = Promise.resolve(new HttpAgent({ host: HOST, identity: dummyIdentity })).then(
		async (agent) => {
			if (process.env.DFX_NETWORK !== 'ic') {
				agent.fetchRootKey().catch((err) => {
					console.warn(
						'Unable to fetch root key. Check to ensure that your local replica is running'
					);
					console.error(err);
				});
			}
			agent.addTransform('query', makeNonceTransform());
			return agent;
		}
	);

	return Actor.createActor(idl, {
		canisterId,
		agent: await dummyAgent
	}) as any;
}

export async function fetchWtnAllocation(principal: Principal): Promise<bigint | undefined> {
	try {
		const waterNeuron = await createSecp256k1IdentityActor(
			Principal.fromText(CANISTER_ID_WATER_NEURON),
			idlFactoryWaterNeuron
		);
		return await waterNeuron.get_airdrop_allocation([principal]);
	} catch (e) {
		console.log('Error while fetching airdrop allocation:', e);
	}
}

export class Canisters {
	public icpLedger: icpLedgerInterface;
	public wtnLedger: icrcLedgerInterface;
	public nicpLedger: icrcLedgerInterface;
	public waterNeuron: waterNeuronInterface;
	public boomerang: boomerangInterface;

	constructor(actors: Actors) {
		this.nicpLedger = actors.nicpLedger;
		this.wtnLedger = actors.wtnLedger;
		this.icpLedger = actors.icpLedger;
		this.waterNeuron = actors.waterNeuron;
		this.boomerang = actors.boomerang;
	}
}

export async function fetchIcpBalance(
	principal: Principal,
	icpLedger: icpLedgerInterface,
	maybe_subaccount?: SubAccount
): Promise<bigint> {
	const user_account: Account = {
		owner: principal,
		subaccount: maybe_subaccount ? [maybe_subaccount.toUint8Array()] : []
	};
	return await icpLedger.icrc1_balance_of(user_account);
}

export async function fetchNicpBalance(
	principal: Principal,
	nicpLedger: icrcLedgerInterface,
	maybe_subaccount?: SubAccount
): Promise<bigint> {
	const user_account: Account = {
		owner: principal,
		subaccount: maybe_subaccount ? [maybe_subaccount.toUint8Array()] : []
	};
	return await nicpLedger.icrc1_balance_of(user_account);
}

export async function fetchWtnBalance(
	principal: Principal,
	wtnLedger: icrcLedgerInterface
): Promise<bigint> {
	const user_account: Account = {
		owner: principal,
		subaccount: []
	};
	return await wtnLedger.icrc1_balance_of(user_account);
}

export class WaterNeuronInfo {
	public info: CanisterInfo;

	constructor(wtnCanisterInfo: CanisterInfo) {
		this.info = wtnCanisterInfo;
	}

	totalIcpDeposited(): BigNumber {
		return bigintE8sToNumber(this.info.total_icp_deposited);
	}

	neuron8yStake(): BigNumber {
		return bigintE8sToNumber(this.info.neuron_8y_stake_e8s);
	}

	neuron6mStake(): BigNumber {
		return bigintE8sToNumber(this.info.neuron_6m_stake_e8s);
	}

	exchangeRate(): BigNumber {
		return bigintE8sToNumber(this.info.exchange_rate);
	}

	apy(): BigNumber {
		const neuron6mStake = this.neuron6mStake();
		const neuron8yStake = this.neuron8yStake();

		if (neuron6mStake.plus(neuron8yStake).isZero()) return BigNumber(0);

		const amount6m = APY_6M.multipliedBy(neuron6mStake);
		const amount8y = APY_8Y.multipliedBy(neuron8yStake);
		const amountTotal = amount6m.plus(amount8y);
		const share = BigNumber(1).minus(DAO_SHARE);

		return share.multipliedBy(amountTotal).multipliedBy(BigNumber(1)).dividedBy(neuron6mStake);
	}

	stakersCount(): Number {
		return Number(this.info.stakers_count);
	}
}
