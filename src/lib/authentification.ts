import { AuthClient } from "@dfinity/auth-client";
import { isNullish } from '@dfinity/utils';
import type { Principal } from "@dfinity/principal";


// How long the delegation identity should remain valid?
// e.g. BigInt(60 * 60 * 1000 * 1000 * 1000) = 1 hour in nanoseconds
const AUTH_MAX_TIME_TO_LIVE = BigInt(60 * 60 * 1000 * 1000 * 1000);

const AUTH_POPUP_WIDTH = 576;
const AUTH_POPUP_HEIGHT = 625;

const DEV = import.meta.env.DEV;
const INTERNET_IDENTITY_CANISTER_ID = DEV ? 'bkyz2-fmaaa-aaaaa-qaaaq-cai' : 'rdmx6-jaaaa-aaaaa-aaadq-cai';

export async function signIn(): Promise<Principal>{
	return new Promise<Principal>(async (resolve, reject) => {
		try {
            let authClient: AuthClient = await createAuthClient();

            const identityProvider = import.meta.env.DEV
                ? `http://localhost:8080/?canisterId=${INTERNET_IDENTITY_CANISTER_ID}`
                : `https://identity.${'internetcomputer.org'}`;

            await authClient?.login({
                maxTimeToLive: AUTH_MAX_TIME_TO_LIVE,
                allowPinAuthentication: false,
                onSuccess: () => {
                    const principal = authClient?.getIdentity().getPrincipal();
                    resolve(principal);
                },
                onError: (error) => {
                    reject(error);
                },
                identityProvider,
                windowOpenerFeatures: popupCenter(AUTH_POPUP_WIDTH, AUTH_POPUP_HEIGHT)
            });
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
};

	
function createAuthClient(): Promise<AuthClient>{
	return AuthClient.create({
		idleOptions: {
			disableIdle: true,
			disableDefaultIdleCallback: true
		}
	});
}
	