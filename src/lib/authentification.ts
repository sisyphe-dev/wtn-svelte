import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';
import { HttpAgent, Actor, type Identity, Cbor } from '@dfinity/agent';
import { idlFactory as idlFactoryIcrc } from '../declarations/icrc_ledger';
import type { _SERVICE as icrcLedgerInterface } from '../declarations/icrc_ledger/icrc_ledger.did';
import { idlFactory as idlFactoryIcp } from '../declarations/icp_ledger';
import type { _SERVICE as icpLedgerInterface } from '../declarations/icp_ledger/icp_ledger.did';
import { idlFactory as idlFactoryWaterNeuron } from '../declarations/water_neuron';
import type { _SERVICE as waterNeuronInterface } from '../declarations/water_neuron/water_neuron.did';
import { idlFactory as idlFactoryBoomerang } from '../declarations/boomerang';
import type { _SERVICE as boomerangInterface } from '../declarations/boomerang/boomerang.did';
import type { _SERVICE as icpswapPoolInterface } from '../declarations/icpswap_pool/icpswap_pool.did';
import { idlFactory as idlFactoryIcpswapPool } from '../declarations/icpswap_pool';
import { Signer } from '@slide-computer/signer';
import { PostMessageTransport } from '@slide-computer/signer-web';
import { user, canisters, signer } from './stores';
import { CanisterActor, Canisters, User } from './state';
import { SignerAgent } from '@slide-computer/signer-agent';
import { AuthClientTransport } from '@slide-computer/signer-transport-auth-client';
import { PlugTransport } from '@slide-computer/signer-transport-plug';

// 1 hour in nanoseconds
const AUTH_MAX_TIME_TO_LIVE = BigInt(60 * 60 * 1000 * 1000 * 1000);

export const DEV = import.meta.env ? import.meta.env.DEV : true;
export const STAGING = process.env.CANISTER_ID === '47pxu-byaaa-aaaap-ahpsa-cai';

export const HOST = DEV ? 'http://127.0.1:8080' : 'https://ic0.app';
const DAPP_DERIVATION_ORIGIN = 'https://n3i53-gyaaa-aaaam-acfaq-cai.icp0.io';
const IDENTITY_PROVIDER = 'https://identity.ic0.app';

const CANISTER_ID_II = DEV ? 'iidmm-fiaaa-aaaaq-aadmq-cai' : 'rdmx6-jaaaa-aaaaa-aaadq-cai';
const CANISTER_ID_WTN_LEDGER = 'jcmow-hyaaa-aaaaq-aadlq-cai';
export const CANISTER_ID_ICP_LEDGER = 'ryjl3-tyaaa-aaaaa-aaaba-cai';
export const CANISTER_ID_NICP_LEDGER = DEV
	? 'ny7ez-6aaaa-aaaam-acc5q-cai'
	: 'buwm7-7yaaa-aaaar-qagva-cai';
export const CANISTER_ID_BOOMERANG = 'daijl-2yaaa-aaaar-qag3a-cai';
export const CANISTER_ID_WATER_NEURON = DEV
	? 'n76cn-tyaaa-aaaam-acc5a-cai'
	: 'tsbvt-pyaaa-aaaar-qafva-cai';
export const CANISTER_ID_ICPSWAP_POOL = 'e5a7x-pqaaa-aaaag-qkcga-cai';

export async function connectWithInternetIdentity() {
	try {
		const authClient = await AuthClient.create();

		if (await authClient.isAuthenticated()) {
			const identity = authClient.getIdentity();
			const agent = HttpAgent.createSync({
				identity,
				host: HOST
			});
			canisters.set(await fetchActors(agent));
			user.set(new User(identity.getPrincipal()));
		} else {
			await authClient.login({
				maxTimeToLive: AUTH_MAX_TIME_TO_LIVE,
				allowPinAuthentication: true,
				derivationOrigin: DAPP_DERIVATION_ORIGIN,
				identityProvider: IDENTITY_PROVIDER,
				onSuccess: async () => {
					const identity = authClient.getIdentity();
					const agent = HttpAgent.createSync({
						identity,
						host: HOST
					});
					canisters.set(await fetchActors(agent));
					user.set(new User(identity.getPrincipal()));
				},
				onError: (error) => {
					throw Error(error);
				}
			});
		}
	} catch (error) {
		console.error(error);
	}
}

export async function tryConnectOnReload() {
	const authClient = await AuthClient.create();

	if (await authClient.isAuthenticated()) {
		const identity = authClient.getIdentity();
		const agent = HttpAgent.createSync({
			identity,
			host: HOST
		});
		canisters.set(await fetchActors(agent));
		user.set(new User(identity.getPrincipal()));
	} else {
		canisters.set(await fetchActors());
	}
}

interface LoginWindow {
	ic: any;
}

declare global {
	interface Window extends LoginWindow {}
}

export async function connectWithPlug() {
	try {
		let whitelist: string[] = [
			CANISTER_ID_ICP_LEDGER,
			CANISTER_ID_NICP_LEDGER,
			CANISTER_ID_WTN_LEDGER,
			CANISTER_ID_WATER_NEURON, 
			CANISTER_ID_ICPSWAP_POOL
		];

		const key: { rawKey: ArrayBuffer, derKey: ArrayBuffer } = await window.ic.plug.requestConnect({
			whitelist,
			host: HOST
		});

		const transport = new PlugTransport();
		const signer = new Signer({
			transport
		});
		console.log(key);

		signer.delegation({publicKey: key.derKey});

		const signerAgent = SignerAgent.createSync({
			signer, 
			account: window.ic.plug.getPrincipal()
		});

		canisters.set(await fetchActors(signerAgent));
		user.set(new User(await window.ic.plug.getPrincipal()));
	} catch (error) {
		console.error(error);
	}
}

export async function connectWithTransport() {
	const transport = new PostMessageTransport({
		url: 'https://nfid.one/rpc'
	});

	const newSigner = new Signer({ transport });

	console.log('The wallet set the following permission scope:', await newSigner.permissions());

	signer.set(newSigner);

	const signerAgent = SignerAgent.createSync({
		signer: newSigner,
		account: (await newSigner.accounts())[0].owner
	});

	canisters.set(await fetchActors(signerAgent));
	user.set(new User((await newSigner.accounts())[0].owner));
}

// Un call qui marche:
// const response = await newSigner.callCanister({
// 	canisterId: Principal.fromText(CANISTER_ID_ICP_LEDGER),
// 	sender: Principal.fromText('6gw4e-65bmy-nvl7o-m3mwf-2enxh-fmt6h-dknya-3vvrg-lvkz3-su3nh-xae'),
// 	method: 'icrc1_balance_of',
// 	arg: Buffer.from(
// 		IDL.encode(
// 			[IDL.Record({ owner: IDL.Principal, subaccount: IDL.Opt(IDL.Vec(IDL.Nat64)) })],
// 			[
// 				{
// 					owner: Principal.fromText(
// 						'6gw4e-65bmy-nvl7o-m3mwf-2enxh-fmt6h-dknya-3vvrg-lvkz3-su3nh-xae'
// 					),
// 					subaccount: []
// 				}
// 			]
// 		)
// 	)
// });

export async function localSignIn() {
	try {
		const authClient = await AuthClient.create();

		const identityProvider = DEV
			? `http://localhost:8080/?canisterId=${CANISTER_ID_II}`
			: IDENTITY_PROVIDER;
		await authClient.login({
			maxTimeToLive: AUTH_MAX_TIME_TO_LIVE,
			allowPinAuthentication: true,
			derivationOrigin: undefined,
			identityProvider,
			onSuccess: async () => {
				const identity: Identity = authClient.getIdentity();
				const agent = HttpAgent.createSync({
					identity,
					host: HOST
				});

				canisters.set(await fetchActors(agent));
				user.set(new User(identity.getPrincipal()));
			},
			onError: (error) => {
				throw new Error(error);
			}
		});
	} catch (error) {
		console.error(error);
	}
}

export async function internetIdentityLogout() {
	const autClient = await AuthClient.create();
	await autClient.logout();
}

export function fetchActors<T extends Pick<Signer, 'callCanister'>>(
	authenticatedAgent?: HttpAgent | SignerAgent<T>,
	isPlug = false
): Promise<Canisters> {
	return new Promise<Canisters>(async (resolve, reject) => {
		try {
			const agent = HttpAgent.createSync({
				host: HOST
			})

			if (DEV && !isPlug) {
				agent.fetchRootKey().catch((err) => {
					console.warn(
						'Unable to fetch root key. Check to ensure that your local replica is running'
					);
					console.error(err);
				});
			}

			const icpLedger = new CanisterActor<icpLedgerInterface>(
				agent,
				idlFactoryIcp,
				CANISTER_ID_ICP_LEDGER
			);
			const nicpLedger = new CanisterActor<icrcLedgerInterface>(
				agent,
				idlFactoryIcrc,
				CANISTER_ID_NICP_LEDGER
			);
			const wtnLedger = new CanisterActor<icrcLedgerInterface>(
				agent,
				idlFactoryIcrc,
				CANISTER_ID_WTN_LEDGER
			);
			const waterNeuron = new CanisterActor<waterNeuronInterface>(
				agent,
				idlFactoryWaterNeuron,
				CANISTER_ID_WATER_NEURON
			);
			const boomerang = new CanisterActor<boomerangInterface>(
				agent,
				idlFactoryBoomerang,
				CANISTER_ID_BOOMERANG
			);
			const icpswapPool = new CanisterActor<icpswapPoolInterface>(
				agent,
				idlFactoryIcpswapPool,
				CANISTER_ID_ICPSWAP_POOL
			);

			if (authenticatedAgent) {
				if (DEV && !isPlug) {
					authenticatedAgent.fetchRootKey().catch((err) => {
						console.warn(
							'Unable to fetch root key. Check to ensure that your local replica is running'
						);
						console.error(err);
					});
				}

				icpLedger.setAuthenticatedActor(authenticatedAgent);
				nicpLedger.setAuthenticatedActor(authenticatedAgent);
				wtnLedger.setAuthenticatedActor(authenticatedAgent);
				waterNeuron.setAuthenticatedActor(authenticatedAgent);
				boomerang.setAuthenticatedActor(authenticatedAgent);
				icpswapPool.setAuthenticatedActor(authenticatedAgent);
			}

			resolve(new Canisters(icpLedger, nicpLedger, wtnLedger, waterNeuron, boomerang, icpswapPool));
		} catch (error) {
			reject(error);
		}
	});
}
