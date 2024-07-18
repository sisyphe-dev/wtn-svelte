import { AuthClient } from '@dfinity/auth-client';
import { isNullish } from '@dfinity/utils';
import { Principal } from '@dfinity/principal';
import { HttpAgent, Actor, type Identity } from '@dfinity/agent';
import type { _SERVICE as nicpLedgerInterface } from '../declarations/nicp_ledger/nicp_ledger.did';
import type { _SERVICE as wtnLedgerInterface } from '../declarations/wtn_ledger/wtn_ledger.did';
import type { _SERVICE as icpLedgerInterface } from '../declarations/nns-ledger/nns-ledger.did';
import type {
	CanisterInfo,
	_SERVICE as waterNeuronInterface
} from '../declarations/water_neuron/water_neuron.did';
import { idlFactory as idlFactoryNicp } from '../declarations/nicp_ledger';
import { idlFactory as idlFactoryWtn } from '../declarations/wtn_ledger';
import { idlFactory as idlFactoryWaterNeuron } from '../declarations/water_neuron';
import { idlFactory as idlFactoryIcp } from '../declarations/nns-ledger';

// How long the delegation identity should remain valid?
// e.g. BigInt(60 * 60 * 1000 * 1000 * 1000) = 1 hour in nanoseconds
const AUTH_MAX_TIME_TO_LIVE = BigInt(60 * 60 * 1000 * 1000 * 1000);

export const DEV = import.meta.env.DEV;
const INTERNET_IDENTITY_CANISTER_ID = DEV
	? 'bd3sg-teaaa-aaaaa-qaaba-cai'
	: 'rdmx6-jaaaa-aaaaa-aaadq-cai';

export const HOST = 'http://127.0.1:8080';

const CANISTER_ID_WTN_LEDGER = 'jcmow-hyaaa-aaaaq-aadlq-cai';
const CANISTER_ID_ICP_LEDGER = 'ryjl3-tyaaa-aaaaa-aaaba-cai';
const CANISTER_ID_NICP_LEDGER = 'ny7ez-6aaaa-aaaam-acc5q-cai';
export const CANISTER_ID_WATER_NEURON = 'n76cn-tyaaa-aaaam-acc5a-cai';

export interface AuthResult {
	actors: Actors;
	principal: Principal;
}

export interface Actors {
	icpLedger: icpLedgerInterface;
	nicpLedger: nicpLedgerInterface;
	wtnLedger: wtnLedgerInterface;
	waterNeuron: waterNeuronInterface;
	wtnCanisterInfo: CanisterInfo;
}
export async function internetIdentitySignIn(): Promise<AuthResult> {
	return new Promise<AuthResult>(async (resolve, reject) => {
		try {
			const authClient = await AuthClient.create();
			if (!(await authClient.isAuthenticated())) {
				const identityProvider = import.meta.env.DEV
					? `http://127.0.1:8080/?canisterId=${INTERNET_IDENTITY_CANISTER_ID}`
					: `https://identity.${'internetcomputer.org'}`;

				const authClient = await AuthClient.create();

				await authClient.login({
					maxTimeToLive: AUTH_MAX_TIME_TO_LIVE,
					allowPinAuthentication: false,
					onSuccess: async () => {
						const identity: Identity = authClient?.getIdentity();
						const agent = new HttpAgent({
							identity,
							host: HOST
						});
						const actors = await fetchActors(agent);

						resolve({
							actors,
							principal: identity.getPrincipal()
						});
					},
					onError: (error) => {
						reject(error);
					},
					identityProvider,
				});
			} else {
				const identity: Identity = authClient?.getIdentity();
				const agent = new HttpAgent({
					identity,
					host: HOST
				});

				const actors = await fetchActors(agent);

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
			if (!(await window.ic.plug.isConnected())) {
				let whitelist: string[] = [
					CANISTER_ID_ICP_LEDGER,
					CANISTER_ID_NICP_LEDGER,
					CANISTER_ID_WTN_LEDGER,
					CANISTER_ID_WATER_NEURON
				];
				const onConnectionUpdate = () => {
					console.log(window.ic.plug.sessionManager.sessionData);
				};

				const result = await window.ic.plug.requestConnect({
					whitelist,
					host: HOST,
					onConnectionUpdate,
					timeout: 50000
				});

				console.log(result);
			}

			const principal: Principal = await window.ic.plug.getPrincipal();

			const waterNeuron = await window.ic.plug.createActor({
				canisterId: CANISTER_ID_WATER_NEURON,
				interfaceFactory: idlFactoryWaterNeuron
			});

			const nicpLedger: nicpLedgerInterface = await window.ic.plug.createActor({
				canisterId: CANISTER_ID_NICP_LEDGER,
				interfaceFactory: idlFactoryNicp
			});

			const icpLedger: icpLedgerInterface = await window.ic.plug.createActor({
				canisterId: CANISTER_ID_ICP_LEDGER,
				interfaceFactory: idlFactoryIcp
			});

			const wtnLedger: wtnLedgerInterface = await window.ic.plug.createActor({
				canisterId: CANISTER_ID_WTN_LEDGER,
				interfaceFactory: idlFactoryWtn
			});

			const wtnCanisterInfo = await waterNeuron.get_info();

			const actors: Actors = { nicpLedger, waterNeuron, icpLedger, wtnCanisterInfo, wtnLedger };

			resolve({ actors, principal });
		} catch (error) {
			reject(error);
		}
	});
}

export async function internetIdentityLogout() {
	const autClient = await AuthClient.create();
	await autClient.logout();
}

export function fetchActors(agent?: HttpAgent): Promise<Actors> {
	return new Promise<Actors>(async (resolve, reject) => {
		try {
			if (!agent) {
				agent = new HttpAgent({
					host: HOST
				});
			}

			if (process.env.DFX_NETWORK !== 'ic') {
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

			const nicpLedger: nicpLedgerInterface = Actor.createActor(idlFactoryNicp, {
				agent,
				canisterId: CANISTER_ID_NICP_LEDGER
			});
			const wtnLedger: wtnLedgerInterface = Actor.createActor(idlFactoryWtn, {
				agent,
				canisterId: CANISTER_ID_WTN_LEDGER
			});
			const waterNeuron: waterNeuronInterface = Actor.createActor(idlFactoryWaterNeuron, {
				agent,
				canisterId: CANISTER_ID_WATER_NEURON
			});

			const wtnCanisterInfo = await waterNeuron.get_info();

			resolve({ icpLedger, wtnLedger, nicpLedger, waterNeuron, wtnCanisterInfo });
		} catch (error) {
			reject(error);
		}
	});
}
