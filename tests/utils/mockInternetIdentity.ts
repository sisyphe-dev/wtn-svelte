import { HttpAgent,  } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { fetchActors } from "$lib/authentification";
import { canisters, user } from "$lib/stores";
import { User, Canisters } from "$lib/state";

export async function mockSignIn() {
	try {
    const dummyIdentity = Ed25519KeyIdentity.generate();
    const agent = new HttpAgent({ host: "http://127.0.1:8080", identity: dummyIdentity })
		const actors = await fetchActors(agent);

		canisters.set(new Canisters(actors));
		user.set(new User(dummyIdentity.getPrincipal()));
	} catch (error) {
		console.error('Login failed:', error);
	}
}