import { HttpAgent } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { fetchActors } from '$lib/authentification';
import { canisters, user } from '$lib/stores';
import { User, Canisters } from '$lib/state';
import { AccountIdentifier } from '@dfinity/ledger-icp';

const key = [
	'302a300506032b657003210093d488f46b485c07e09b554d9451574bfc669912b99d453722c474e6a7f90fcc',
	'90252a6913658dbb4b36b276410216d47a1891280493cd485328279a12a53e2c'
];

const parsedKey = JSON.stringify(key);

// AccountId = 90526bdfd692793cba1f96bde9079994ce4d40033746f04c12064ea599e2c274

export const mockSetup = async () => {
	try {
		const dummyIdentity = Ed25519KeyIdentity.fromJSON(parsedKey);
		const agent = new HttpAgent({ host: 'http://127.0.1:8080', identity: dummyIdentity });
		agent.fetchRootKey().catch((err) => {
			console.warn('Unable to fetch root key. Check to ensure that your local replica is running');
			console.error(err);
		});
		const actors = await fetchActors(agent);

		canisters.set(new Canisters(actors));
		user.set(new User(dummyIdentity.getPrincipal()));
	} catch (error) {
		console.error('Login failed:', error);
	}
};
