import type { Identity } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { IDL } from '@dfinity/candid';
import { HttpAgent, Actor, makeNonceTransform } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { fetchActors, HOST } from "$lib/authentification";
import { canisters, user } from "$lib/stores";
import { User, Canisters } from "$lib/state";

export async function mockSignIn() {
	try {
    const dummyIdentity = Ed25519KeyIdentity.generate();
    const agent = new HttpAgent({ host: HOST, identity: dummyIdentity })
		const actors = await fetchActors(agent)

		canisters.set(new Canisters(actors));
		user.set(new User(dummyIdentity.getPrincipal()));
	} catch (error) {
		console.error('Login failed:', error);
	}
}