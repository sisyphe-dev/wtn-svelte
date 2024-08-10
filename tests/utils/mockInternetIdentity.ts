import { HttpAgent,  } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { fetchActors } from "$lib/authentification";
import { canisters, user } from "$lib/stores";
import { User, Canisters } from "$lib/state";
import { AuthClient } from '@dfinity/auth-client';

export async function mockSignIn() {
	try {
    const dummyIdentity = Ed25519KeyIdentity.generate();
    const agent = new HttpAgent({ host: "http://127.0.1:8080", identity: dummyIdentity })
		const actors = await fetchActors(agent);

		canisters.set(new Canisters(actors));
		user.set(new User(dummyIdentity.getPrincipal()));
	const authClient = await AuthClient.create();

	console.log(authClient.isAuthenticated());
	} catch (error) {
		console.error('Login failed:', error);
	}
}