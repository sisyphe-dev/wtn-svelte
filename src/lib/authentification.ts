import { AuthClient } from '@dfinity/auth-client';
import { isNullish } from '@dfinity/utils';
import { Principal } from '@dfinity/principal';
import { HttpAgent, Actor, type Identity } from '@dfinity/agent';
import type { _SERVICE as nicpLedgerInterface } from '../declarations/nicp_ledger/nicp_ledger.did';
import type { _SERVICE as wtnLedgerInterface } from '../declarations/wtn_ledger/wtn_ledger.did';
import type { _SERVICE as icpLedgerInterface } from '../declarations/nns-ledger/nns-ledger.did';
import type { _SERVICE as waterNeuronInterface } from '../declarations/water_neuron/water_neuron.did';
import { idlFactory as idlFactoryNicp } from '../declarations/nicp_ledger';
import { idlFactory as idlFactoryIcp } from '../declarations/nns-ledger';
import { idlFactory as idlFactoryWtn } from '../declarations/wtn_ledger';
import { idlFactory as idlFactoryWaterNeuron } from '../declarations/water_neuron';

// How long the delegation identity should remain valid?
// e.g. BigInt(60 * 60 * 1000 * 1000 * 1000) = 1 hour in nanoseconds
const AUTH_MAX_TIME_TO_LIVE = BigInt(60 * 60 * 1000 * 1000 * 1000);

const AUTH_POPUP_WIDTH = 576;
const AUTH_POPUP_HEIGHT = 625;

export const DEV = import.meta.env.DEV;
const INTERNET_IDENTITY_CANISTER_ID = DEV
	? 'bd3sg-teaaa-aaaaa-qaaba-cai'
	: 'rdmx6-jaaaa-aaaaa-aaadq-cai';

export const HOST = 'http://127.0.0.1:8080/';

const CANISTER_ID_WTN_LEDGER = 'jcmow-hyaaa-aaaaq-aadlq-cai';
const CANISTER_ID_ICP_LEDGER = 'ryjl3-tyaaa-aaaaa-aaaba-cai';
const CANISTER_ID_NICP_LEDGER = 'ny7ez-6aaaa-aaaam-acc5q-cai';
export const CANISTER_ID_WATER_NEURON = 'n76cn-tyaaa-aaaam-acc5a-cai';

interface AuthResult {
	icpLedger: icpLedgerInterface;
	nicpLedger: nicpLedgerInterface;
	wtnLedger: wtnLedgerInterface;
	waterNeuron: waterNeuronInterface;
	principal: Principal;
}
export async function signIn(): Promise<AuthResult> {
	return new Promise<AuthResult>(async (resolve, reject) => {
		try {
			const authClient = await AuthClient.create();
			if (!(await authClient.isAuthenticated())) {
				const identityProvider = import.meta.env.DEV
					? `http://localhost:8080/?canisterId=${INTERNET_IDENTITY_CANISTER_ID}`
					: `https://identity.${'internetcomputer.org'}`;

				const authClient = await AuthClient.create();
				await authClient?.login({
					maxTimeToLive: AUTH_MAX_TIME_TO_LIVE,
					allowPinAuthentication: false,
					onSuccess: () => {
						const identity: Identity = authClient?.getIdentity();
						const agent = new HttpAgent({
							identity,
							host: HOST
						});
						agent.fetchRootKey();
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

						resolve({
							icpLedger: icpLedger,
							nicpLedger: nicpLedger,
							wtnLedger: wtnLedger,
							waterNeuron: waterNeuron,
							principal: identity.getPrincipal()
						});
					},
					onError: (error) => {
						reject(error);
					},
					identityProvider,
					windowOpenerFeatures: popupCenter(AUTH_POPUP_WIDTH, AUTH_POPUP_HEIGHT)
				});
			} else {
				const identity: Identity = authClient?.getIdentity();
				const agent = new HttpAgent({
					identity,
					host: HOST
				});
				agent.fetchRootKey();
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

				resolve({
					icpLedger: icpLedger,
					nicpLedger: nicpLedger,
					wtnLedger: wtnLedger,
					waterNeuron: waterNeuron,
					principal: identity.getPrincipal()
				});
			}
		} catch (error) {
			reject(error);
		}
	});
}

function popupCenter(width: number, height: number): string | undefined {
	if (isNullish(window) || isNullish(window.top)) {
		return undefined;
	}

	const {
		top: { innerWidth, innerHeight }
	} = window;

	const y = innerHeight / 2 + screenY - height / 2;
	const x = innerWidth / 2 + screenX - width / 2;

	return `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=no, copyhistory=no, width=${width}, height=${height}, top=${y}, left=${x}`;
}

export async function logout() {
	const autClient = await AuthClient.create();
	await autClient.logout();
}

export function fetchState(): Promise<waterNeuronInterface> {
	return new Promise<waterNeuronInterface>(async (resolve, reject) => {
		try {
			const agent = new HttpAgent({
				host: HOST
			});
			agent.fetchRootKey();
			const waterNeuron: waterNeuronInterface = Actor.createActor(idlFactoryWaterNeuron, {
				agent,
				canisterId: CANISTER_ID_WATER_NEURON
			});
			resolve(waterNeuron);
		} catch (error) {
			reject(error);
		}
	});
}
