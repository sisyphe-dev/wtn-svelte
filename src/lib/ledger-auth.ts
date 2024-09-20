import {
	bufEquals,
	DerEncodedPublicKey,
	PublicKey,
	SignIdentity,
	concat,
	type Signature
} from '@dfinity/agent';
import type {
	ResponseAddress,
	ResponseSign,
	ResponseSignUpdateCall,
	ResponseVersion,
    LedgerError,
} from '@zondax/ledger-icp';
import type LedgerApp from '@zondax/ledger-icp';
import type Transport from '@ledgerhq/hw-transport';
import { Principal } from '@dfinity/principal';
import { isNullish, smallerVersion } from '@dfinity/utils';

// This file is highly inspired by the nns-dapp ledger integration.
// See https://github.com/dfinity/nns-dapp.

const LEDGER_DEFAULT_DERIVE_PATH = `m/44'/223'/0'/0/0`;

// Version published in October 2023. Includes all transactions supported in Candid
export const ALL_CANDID_TXS_VERSION = "2.4.9";
export const LEDGER_SIGNATURE_LENGTH = 64;

class Secp256k1PublicKey implements PublicKey {
	// The length of secp256k1 public keys is always 65 bytes.
	private static RAW_KEY_LENGTH = 65;

	// Adding this prefix to a raw public key is sufficient to DER-encode it.
	// prettier-ignore
	private static DER_PREFIX = Uint8Array.from([
        0x30, 0x56, // SEQUENCE
        0x30, 0x10, // SEQUENCE
        0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01, // OID ECDSA
        0x06, 0x05, 0x2b, 0x81, 0x04, 0x00, 0x0a, // OID secp256k1
        0x03, 0x42, // BIT STRING
        0x00, // no padding
    ]);

	public static derEncode(publicKey: ArrayBuffer): DerEncodedPublicKey {
		if (publicKey.byteLength != Secp256k1PublicKey.RAW_KEY_LENGTH) {
			throw new TypeError(
				`Secp256k1 public key must be ${Secp256k1PublicKey.RAW_KEY_LENGTH} bytes long. Current key bytes length is ${publicKey.byteLength}.`
			);
		}

		const derPublicKey = concat(
			Secp256k1PublicKey.DER_PREFIX.buffer,
			publicKey
		) as DerEncodedPublicKey;
		derPublicKey.__derEncodedPublicKey__ = undefined;

		return derPublicKey;
	}

	public static derDecode(key: DerEncodedPublicKey): ArrayBuffer {
		const expected_length =
			Secp256k1PublicKey.DER_PREFIX.length + Secp256k1PublicKey.RAW_KEY_LENGTH;

		if (key.byteLength !== expected_length) {
			throw new TypeError(
				`Secp256k1 public key must be ${Secp256k1PublicKey.RAW_KEY_LENGTH} bytes long. Current key bytes length is ${key.byteLength}.`
			);
		}

		const rawKey = key.slice(0, Secp256k1PublicKey.DER_PREFIX.length);

		if (!bufEquals(this.derEncode(rawKey), key)) {
			throw new TypeError(
				`secp251k1 DER-encoded public key is invalid. A valid secp256k1 DER-encoded public key must have the following prefix: ${Secp256k1PublicKey.DER_PREFIX}`
			);
		}

		return rawKey;
	}

	public static fromDer(derKey: DerEncodedPublicKey): Secp256k1PublicKey {
		return new Secp256k1PublicKey(this.derDecode(derKey));
	}

	public static fromRaw(rawKey: ArrayBuffer): Secp256k1PublicKey {
		return new Secp256k1PublicKey(rawKey);
	}

	public static from(key: PublicKey): Secp256k1PublicKey {
		return this.fromDer(key.toDer());
	}

	public rawKey: ArrayBuffer;
	public derKey: DerEncodedPublicKey;

	private constructor(key: ArrayBuffer) {
		this.rawKey = key;
		this.derKey = Secp256k1PublicKey.derEncode(key);
	}

	public toDer(): DerEncodedPublicKey {
		return this.derKey;
	}

	public toRaw(): ArrayBuffer {
		return this.rawKey;
	}
}

// TransportError is exposed as a function not an interface from @ledgerhq/errors so we redeclare it
// Neither is CustomError exposed
interface LedgerHQTransportError {
	name: string;
	message: string;
	id: string;
}
export class LedgerErrorMessage extends Error {}

// Errors throw by hardware wallet but not defined in LedgerError (https://github.com/zondax/ledger-icp)
export enum ExtendedLedgerError {
    AppNotOpen = 28161,
    CannotFetchPublicKey = 65535,
  }
  export type AllLedgerError = LedgerError | ExtendedLedgerError;

export class LedgerIdentity extends SignIdentity {
	private constructor(
		private readonly derivePath: string,
		private readonly publicKey: Secp256k1PublicKey
	) {
		super();
	}

	public override getPublicKey(): Required<PublicKey> {
		return this.publicKey;
	}

	private static async getTransport(): Promise<Transport> {
		const { default: TransportWebHID } = await import('@ledgerhq/hw-transport-webhid');

		return TransportWebHID.create();
	}

	public static async connect(): Promise<{ app: LedgerApp; transport: Transport }> {
		try {
			const transport = await this.getTransport();

			const { default: LedgerAppConstructor } = await import('@zondax/ledger-icp');

			const app = new LedgerAppConstructor(transport);

			return { app, transport };
		} catch (err: unknown) {
			if ((err as LedgerHQTransportError)?.name === 'TransportOpenUserCancelled') {
				if ((err as LedgerHQTransportError)?.message.includes('not supported')) {
					throw new LedgerErrorMessage('error__ledger.browser_not_supported');
				}
				throw new LedgerErrorMessage('error__ledger.access_denied');
			}

			if ((err as LedgerHQTransportError)?.id === 'NoDeviceFound') {
				throw new LedgerErrorMessage('error__ledger.connect_no_device');
			}

			if ((err as LedgerHQTransportError).message?.includes('cannot open device with path')) {
				throw new LedgerErrorMessage('error__ledger.connect_many_apps');
			}

			// Unsupported browser. Data on browser compatibility is taken from https://caniuse.com/webhid

			throw new LedgerErrorMessage(`${err}`);
		}
	}

    public static async fetchPublicKeyFromDevice({
        app, derivePath
    }:  { app: LedgerApp; derivePath: string }): Promise<Secp256k1PublicKey> {
        const response = await app.getAddressAndPubKey(derivePath);
        
        const code = response.returnCode as AllLedgerError;

        if (code == ExtendedLedgerError.AppNotOpen) {
            throw new LedgerErrorMessage("error__ledger.please_open");
        }

        const { LedgerError } = await import("@zondax/ledger-icp");

        if (code == LedgerError.TransactionRejected) {
            throw new LedgerErrorMessage("error__ledger.locked");
        }

        if (code == ExtendedLedgerError.CannotFetchPublicKey) {
            throw new LedgerErrorMessage("error__ledger.fetch_public_key");
        }

        const publicKey = Secp256k1PublicKey.fromRaw(new Uint8Array(response.publicKey));

        if (response.principalText !== Principal.selfAuthenticating(new Uint8Array(publicKey.toDer())).toText()) {
            throw new LedgerErrorMessage("error__ledger.principal_not_match");
        }

        return publicKey;
    }

    private async executeWithApp<T>(callback: (app:LedgerApp) => Promise<T>): Promise<T> {
        const { app, transport } = await LedgerIdentity.connect();

        try {
            // Verify that the public key of the device matches the public key of this identity.
            const devicePublicKey = await LedgerIdentity.fetchPublicKeyFromDevice({app, derivePath: this.derivePath});

            if (JSON.stringify(devicePublicKey) !== JSON.stringify(this.publicKey)) {
                throw new LedgerErrorMessage("error__ledger.unexpected_wallet");
            }

            return await callback(app);
        } finally {
            await transport.close();
        }
    }

	/**
	 * @returns The version of the `Internet Computer' app installed on the Ledger device and the device model used under the `targeId` key:
	 *
	 * 0x3110???? => LNS
	 * 0x3300???? => LNX
	 * 0x3310???? => LNS+
	 * 0x3320???? => stax
	 *
	 * Source: https://github.com/LedgerHQ/blue-loader-python?tab=readme-ov-file#target-id
	 *
	 * PS: Another way to find the device model is under the `Transport` object, the `deviceModel` field.
	 */

	public async getVersion(): Promise<ResponseVersion> {
		// See comment about `app` in function `showAddressAndPubKeyOnDevice`
		const callback = async (app: LedgerApp): Promise<ResponseVersion> => app.getVersion();

		return this.executeWithApp<ResponseVersion>(callback);
	}

    private raiseVersionIfDeprecated = async () => {
        const { major, minor, patch } = await this.getVersion();  
        const currentVersion = `${major}.${minor}.${patch}`;
        
        if (smallerVersion({ minVersion: ALL_CANDID_TXS_VERSION, currentVersion})) {
            throw new LedgerErrorMessage("error__ledger.app_version_not_supported");
        }
    }

    /**
     * Required by Ledger.com that the user should be able to press a Button in UI
     * and verify the address/pubkey are the same as on the device screen.
    */
    public async showAddressAndPublicKeyOnDevice(): Promise<ResponseAddress> {
        const callback = (app: LedgerApp): Promise<ResponseAddress> => app.showAddressAndPubKey(this.derivePath);
        return this.executeWithApp(callback);
    }

    public override async sign(blob: ArrayBuffer): Promise<Signature> {
        await this.raiseVersionIfDeprecated();

        const callback = async (app: LedgerApp): Promise<Signature> => {
            const responseSign: ResponseSign = await app.sign(this.derivePath, Buffer.from(blob), 0);

            if (isNullish(responseSign.signatureRS)) {
                throw new LedgerErrorMessage(`error__ledger.signature_unexpected, (code ${responseSign.returnCode}):` + JSON.stringify(responseSign.errorMessage));
            }

            const { byteLength, length } = responseSign.signatureRS;

            if (byteLength !== LEDGER_SIGNATURE_LENGTH) {
                throw new LedgerErrorMessage(`error__ledger.signature_length: should be 64 but got ${length}`);
            }

            return bufferToArrayBuffer(responseSign.signatureRS) as Signature;
        } 

        return this.executeWithApp(callback);
    }
}

const checkResponseCode = async (returnCode: LedgerError) => {
    const { LedgerError } = await import("@zondax/ledger-icp");

    if (returnCode === LedgerError.TransactionRejected) {
        throw new LedgerErrorMessage("error__ledger.user_rejected_transaction");
    }
}

const bufferToArrayBuffer = (buffer: Buffer): ArrayBuffer => {
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteLength+buffer.byteOffset);
}