import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';
import { HttpAgent, Actor, type Identity } from '@dfinity/agent';
import { idlFactory as idlFactoryIcrc } from '../declarations/icrc_ledger';
import type { _SERVICE as icrcLedgerInterface } from '../declarations/icrc_ledger/icrc_ledger.did';
import { idlFactory as idlFactoryIcp } from '../declarations/icp_ledger';
import type { _SERVICE as icpLedgerInterface } from '../declarations/icp_ledger/icp_ledger.did';
import { idlFactory as idlFactoryWaterNeuron } from '../declarations/water_neuron';
import type { _SERVICE as waterNeuronInterface } from '../declarations/water_neuron/water_neuron.did';
import { idlFactory as idlFactoryBoomerang } from '../declarations/boomerang';
import type { _SERVICE as boomerangInterface } from '../declarations/boomerang/boomerang.did';
import type { _SERVICE as icpswapInterface } from '../declarations/icpswap/icpswap.did';
import { idlFactory as idlFactoryIcpswap } from '../declarations/icpswap';

import { user, canisters } from './stores';
import { Canisters, User } from './state';

// 1 hour in nanoseconds
const AUTH_MAX_TIME_TO_LIVE = BigInt(60 * 60 * 1000 * 1000 * 1000);

export const DEV = import.meta.env ? import.meta.env.DEV : true;

export const HOST = DEV ? 'http://127.0.1:8080' : 'https://ic0.app';

const CANISTER_ID_II = DEV ? 'br5f7-7uaaa-aaaaa-qaaca-cai' : 'rdmx6-jaaaa-aaaaa-aaadq-cai';
const CANISTER_ID_WTN_LEDGER = 'jcmow-hyaaa-aaaaq-aadlq-cai';
const CANISTER_ID_ICP_LEDGER = 'ryjl3-tyaaa-aaaaa-aaaba-cai';
export const CANISTER_ID_NICP_LEDGER = DEV
	? 'ny7ez-6aaaa-aaaam-acc5q-cai'
	: 'buwm7-7yaaa-aaaar-qagva-cai';
export const CANISTER_ID_BOOMERANG = 'daijl-2yaaa-aaaar-qag3a-cai';
export const CANISTER_ID_WATER_NEURON = DEV
	? 'n76cn-tyaaa-aaaam-acc5a-cai'
	: 'tsbvt-pyaaa-aaaar-qafva-cai';
export const CANISTER_ID_ICPSWAP = 'e5a7x-pqaaa-aaaag-qkcga-cai';

export interface AuthResult {
	actors: Actors;
	principal: Principal;
}

export interface Actors {
	icpLedger: icpLedgerInterface;
	nicpLedger: icrcLedgerInterface;
	wtnLedger: icrcLedgerInterface;
	waterNeuron: waterNeuronInterface;
	boomerang: boomerangInterface;
	icpswap: icpswapInterface;
}

export async function internetIdentitySignIn(): Promise<AuthResult> {
	return new Promise<AuthResult>(async (resolve, reject) => {
		try {
			const authClient = await AuthClient.create();
			if (!(await authClient.isAuthenticated())) {
				const identityProvider = import.meta.env.DEV
					? `http://localhost:8080/?canisterId=${CANISTER_ID_II}`
					: `https://identity.${'ic0.app'}`;

				const authClient = await AuthClient.create();

				const derivation = DEV ? undefined : 'https://n3i53-gyaaa-aaaam-acfaq-cai.icp0.io';
				await authClient.login({
					maxTimeToLive: AUTH_MAX_TIME_TO_LIVE,
					allowPinAuthentication: true,
					derivationOrigin: derivation,
					onSuccess: async () => {
						const identity: Identity = authClient?.getIdentity();
						const agent = new HttpAgent({
							identity,
							host: HOST
						});
						const actors = await fetchActors(agent, true);
						resolve({
							actors,
							principal: identity.getPrincipal()
						});
					},
					onError: (error) => {
						reject(error);
					},
					identityProvider
				});
			} else {
				const identity: Identity = authClient?.getIdentity();
				const agent = new HttpAgent({
					identity,
					host: HOST
				});

				const actors = await fetchActors(agent, true);

				resolve({
					actors,
					principal: identity.getPrincipal()
				});
			}
		} catch (error) {
			reject(error);
		}
	});
}

interface LoginWindow {
	ic: any;
}

declare global {
	interface Window extends LoginWindow {}
}

export async function plugSignIn(): Promise<AuthResult> {
	return new Promise<AuthResult>(async (resolve, reject) => {
		try {
			let whitelist: string[] = [
				CANISTER_ID_ICP_LEDGER,
				CANISTER_ID_NICP_LEDGER,
				CANISTER_ID_WTN_LEDGER,
				CANISTER_ID_WATER_NEURON
			];

			await window.ic.plug.requestConnect({
				whitelist,
				host: HOST
			});

			const principal: Principal = await window.ic.plug.getPrincipal();
			const agent = window.ic.plug.agent;

			const actors = await fetchActors(agent);

			resolve({ actors, principal });
		} catch (error) {
			reject(error);
		}
	});
}

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
				if (!(await authClient.isAuthenticated())) {
					const actors = await fetchActors(undefined, true);
					canisters.set(new Canisters(actors));
					return;
				}
				authResult = await internetIdentitySignIn();
				break;
		}
		canisters.set(new Canisters(authResult.actors));
		user.set(new User(authResult.principal));
	} catch (error) {
		console.error('Login failed:', error);
	}
}

export async function internetIdentityLogout() {
	const autClient = await AuthClient.create();
	await autClient.logout();
}
import { AccountIdentifier, type Account, SubAccount } from '@dfinity/ledger-icp';

export function fetchActors(agent?: HttpAgent, isInternetIdentity = false): Promise<Actors> {
	return new Promise<Actors>(async (resolve, reject) => {
		try {
			if (!agent) {
				agent = new HttpAgent({
					host: HOST
				});
			}
			if (process.env.DFX_NETWORK !== 'ic' && isInternetIdentity) {
				agent.fetchRootKey().catch((err) => {
					console.warn(
						'Unable to fetch root key. Check to ensure that your local replica is running'
					);
					console.error(err);
				});
			}

			const icpLedger: icpLedgerInterface = Actor.createActor(idlFactoryIcp, {
				agent,
				canisterId: CANISTER_ID_ICP_LEDGER
			});

			const nicpLedger: icrcLedgerInterface = Actor.createActor(idlFactoryIcrc, {
				agent,
				canisterId: CANISTER_ID_NICP_LEDGER
			});
			const wtnLedger: icrcLedgerInterface = Actor.createActor(idlFactoryIcrc, {
				agent,
				canisterId: CANISTER_ID_WTN_LEDGER
			});
			const waterNeuron: waterNeuronInterface = Actor.createActor(idlFactoryWaterNeuron, {
				agent,
				canisterId: CANISTER_ID_WATER_NEURON
			});
			const boomerang: boomerangInterface = Actor.createActor(idlFactoryBoomerang, {
				agent,
				canisterId: CANISTER_ID_BOOMERANG
			});
			const icpswap: icpswapInterface = Actor.createActor(idlFactoryIcpswap, {
				agent,
				canisterId: CANISTER_ID_ICPSWAP
			});

			console.log(
				SubAccount.fromPrincipal(
					Principal.fromText('hudsi-btfzv-gsj5f-osgu5-bgxkx-p7hqg-43rto-5r2iv-4ajey-hg6ip-7qe')
				)
			);

			resolve({ icpLedger, wtnLedger, nicpLedger, waterNeuron, boomerang, icpswap });
		} catch (error) {
			reject(error);
		}
	});
}
