import { AssetType, bigintE8sToNumber } from '$lib';
import { AccountIdentifier, type Account } from '@dfinity/ledger-icp';
import { Principal } from '@dfinity/principal';
import BigNumber from 'bignumber.js';
import type { _SERVICE as icrcLedgerInterface } from '../declarations/icrc_ledger/icrc_ledger.did';
import type { _SERVICE as icpLedgerInterface } from '../declarations/nns-ledger/nns-ledger.did';
import type {
	CanisterInfo,
	_SERVICE as waterNeuronInterface
} from '../declarations/water_neuron/water_neuron.did';
import {
	type AuthResult,
	fetchActors,
	type Actors,
	internetIdentitySignIn,
	plugSignIn,
	HOST,
	CANISTER_ID_WATER_NEURON
} from './authentification';
import { state, user } from './stores';
import { AuthClient } from '@dfinity/auth-client';
import { HttpAgent, Actor, makeNonceTransform } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { idlFactory as idlFactoryWaterNeuron } from '../declarations/water_neuron';
import { IDL } from '@dfinity/candid';

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

export async function signIn(walletOrigin: 'internetIdentity' | 'plug' | 'reload') {
	try {
		let authResult: AuthResult;

		switch (walletOrigin) {
			case 'internetIdentity':
				authResult = await internetIdentitySignIn();
				break;
			case 'plug':
				authResult = await plugSignIn();
				break;
			case 'reload':
				const authClient = await AuthClient.create();
				if (!(await authClient.isAuthenticated())) return;
				authResult = await internetIdentitySignIn();
				break;
		}

		state.set(new State(authResult.actors));

		user.set(
			new User({
				principal: authResult.principal,
				icpBalanceE8s: 0n,
				nicpBalanceE8s: 0n,
				wtnBalanceE8s: 0n
			})
		);
	} catch (error) {
		console.error('Login failed:', error);
	}
}

export async function fetchBalances(
	principal: Principal
): Promise<{ icp: bigint; nicp: bigint; wtn: bigint }> {
	const user_account: Account = {
		owner: principal,
		subaccount: []
	};

	const actors = await fetchActors(undefined, true);

	const nicpBalanceE8s = await actors.nicpLedger.icrc1_balance_of(user_account);
	const wtnBalanceE8s = await actors.wtnLedger.icrc1_balance_of(user_account);
	const icpBalanceE8s = await actors.icpLedger.icrc1_balance_of(user_account);

	return { icp: icpBalanceE8s, nicp: nicpBalanceE8s, wtn: wtnBalanceE8s };
}

async function createSecp256k1IdentityActor(
	canisterId: Principal,
	idl: IDL.InterfaceFactory
): Promise<any> {
	const dummyIdentity = Ed25519KeyIdentity.generate();

	const dummyAgent = Promise.resolve(new HttpAgent({ host: HOST, identity: dummyIdentity })).then(async (agent) => {
		if (process.env.DFX_NETWORK !== 'ic') {
			console.log('fetching root key');
			agent.fetchRootKey().catch((err) => {
				console.warn(
					'Unable to fetch root key. Check to ensure that your local replica is running'
				);
				console.error(err);
			});
		}
		agent.addTransform('query', makeNonceTransform());
		return agent;
	});

	return Actor.createActor(idl, {
		canisterId,
		agent: await dummyAgent
	}) as any;
}

export class State {
	public neuron8yStakeE8s: bigint;
	public neuron6mStakeE8s: bigint;
	public icpLedger: icpLedgerInterface;
	public wtnLedger: icrcLedgerInterface;
	public nicpLedger: icrcLedgerInterface;
	public waterNeuron: waterNeuronInterface;
	public wtnCanisterInfo: CanisterInfo;

	constructor(actors: Actors) {
		this.neuron8yStakeE8s = BigInt(0);
		this.neuron6mStakeE8s = BigInt(0);
		this.nicpLedger = actors.nicpLedger;
		this.wtnLedger = actors.wtnLedger;
		this.icpLedger = actors.icpLedger;
		this.waterNeuron = actors.waterNeuron;
		this.wtnCanisterInfo = actors.wtnCanisterInfo;
	}

	totalIcpDeposited(): BigNumber {
		return bigintE8sToNumber(this.wtnCanisterInfo.total_icp_deposited);
	}

	neuron8yStake(): BigNumber {
		return bigintE8sToNumber(this.wtnCanisterInfo.neuron_8y_stake_e8s);
	}

	neuron6mStake(): BigNumber {
		return bigintE8sToNumber(this.wtnCanisterInfo.neuron_6m_stake_e8s);
	}

	exchangeRate(): BigNumber {
		return bigintE8sToNumber(this.wtnCanisterInfo.exchange_rate);
	}

	async wtnAllocation(principal: Principal): Promise<BigNumber | undefined> {
		try {
			const waterNeuron = await createSecp256k1IdentityActor(
				Principal.fromText(CANISTER_ID_WATER_NEURON),
				idlFactoryWaterNeuron
			);
			const allocation = await waterNeuron.get_airdrop_allocation([principal]);
			return bigintE8sToNumber(allocation);
		} catch (e) {
			console.log('Error while fetching airdrop allocation:', e);
		}
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
		return Number(this.wtnCanisterInfo.stakers_count);
	}
}

export async function provideState(): Promise<State> {
	let actors = await fetchActors(undefined, true);
	return new State(actors);
}
