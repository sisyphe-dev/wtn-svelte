import {
	type CallRequest,
	Cbor,
	type HttpAgentRequest,
	type PublicKey,
	type ReadRequest,
	type Signature,
	SignIdentity
} from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import LedgerApp, { LedgerError, ResponseAddress, ResponseSign } from '@zondax/ledger-icp';
import { Secp256k1PublicKey } from './secp256k1';
import type Transport from '@ledgerhq/hw-transport';

export const LEDGER_DEFAULT_DERIVE_PATH = `m/44'/223'/0'/0/0`;

/**
 * Convert the HttpAgentRequest body into cbor which can be signed by the Ledger Hardware Wallet.
 * @param request - body of the HttpAgentRequest
 */
function _prepareCborForLedger(request: ReadRequest | CallRequest): ArrayBuffer {
	console.log(request);

	return Cbor.encode({ content: { ...request, method: 'icrc1_transfer' } });
}

/**
 * A Hardware Ledger Internet Computer Agent identity.
 */
export class LedgerIdentity extends SignIdentity {
	/**
	 * Create a LedgerIdentity using the Web USB transport.
	 * @param derivePath The derivation path.
	 */
	public static async create(derivePath = LEDGER_DEFAULT_DERIVE_PATH): Promise<LedgerIdentity> {
		const { app, transport } = await this._connect();

		try {
			const publicKey = await this._fetchPublicKeyFromDevice(app, derivePath);

			return new this(derivePath, publicKey);
		} finally {
			// Always close the transport.
			await transport.close();
		}
	}

	public static async getTransport(): Promise<Transport> {
		const { default: TransportWebHID } = await import('@ledgerhq/hw-transport-webhid');
		return TransportWebHID.create();
	}

	/**
	 * Connect to a ledger hardware wallet.
	 */
	private static async _connect(): Promise<{ app: LedgerApp; transport: Transport }> {
		try {
			const transport = await this.getTransport();
			const app = new LedgerApp(transport);
			return { app, transport };
		} catch (err) {
			// @ts-ignore
			if (err.id && err.id == 'NoDeviceFound') {
				throw 'No Ledger device found. Is the wallet connected and unlocked?';
			} else if (
				// @ts-ignore
				err.message &&
				// @ts-ignore
				err.message.includes('cannot open device with path')
			) {
				throw 'Cannot connect to Ledger device. Please close all other wallet applications (e.g. Ledger Live) and try again.';
			} else {
				// Unsupported browser. Data on browser compatibility is taken from https://caniuse.com/webhid
				throw `Cannot connect to Ledger Wallet. Either you have other wallet applications open (e.g. Ledger Live), or your browser doesn't support WebHID, which is necessary to communicate with your Ledger hardware wallet.\n\nSupported browsers:\n* Chrome (Desktop) v89+\n* Edge v89+\n* Opera v76+\n\nError: ${err}`;
			}
		}
	}

	private constructor(
		public readonly derivePath: string,
		private readonly _publicKey: Secp256k1PublicKey
	) {
		super();
	}

	private static async _fetchPublicKeyFromDevice(
		app: LedgerApp,
		derivePath: string
	): Promise<Secp256k1PublicKey> {
		const resp: ResponseAddress = await app.getAddressAndPubKey(derivePath);
		// @ts-ignore
		if (resp.returnCode == 28161) {
			throw 'Please open the Internet Computer app on your wallet and try again.';
		} else if (resp.returnCode == LedgerError.TransactionRejected) {
			throw 'Ledger Wallet is locked. Unlock it and try again.';
			// @ts-ignore
		} else if (resp.returnCode == 65535) {
			throw 'Unable to fetch the public key. Please try again.';
		}

		// This type doesn't have the right fields in it, so we have to manually type it.
		const principal = (resp as unknown as { principalText: string }).principalText;
		const publicKey = Secp256k1PublicKey.fromRaw(bufferToArrayBuffer(resp.publicKey));

		if (principal !== Principal.selfAuthenticating(new Uint8Array(publicKey.toDer())).toText()) {
			throw new Error('Principal returned by device does not match public key.');
		}

		return publicKey;
	}

	/**
	 * Required by Ledger.com that the user should be able to press a Button in UI
	 * and verify the address/pubkey are the same as on the device screen.
	 */
	public async showAddressAndPubKeyOnDevice(): Promise<void> {
		this._executeWithApp(async (app: LedgerApp) => {
			await app.showAddressAndPubKey(this.derivePath);
		});
	}

	/**
	 * @returns The verion of the `Internet Computer' app installed on the Ledger device.
	 */
	public async getVersion(): Promise<Version> {
		return this._executeWithApp(async (app: LedgerApp) => {
			const res = await app.getVersion();
			return {
				major: res.major,
				minor: res.minor,
				patch: res.patch
			};
		});
	}

	public getPublicKey(): PublicKey {
		return this._publicKey;
	}

	public async sign(blob: ArrayBuffer): Promise<Signature> {
		return await this._executeWithApp(async (app: LedgerApp) => {
			const resp: ResponseSign = await app.sign(this.derivePath, Buffer.from(blob), 1);
			console.log(resp);
			const signatureRS = resp.signatureRS;
			if (!signatureRS) {
				throw new Error(
					`A ledger error happened during signature:\n` +
						`Code: ${resp.returnCode}\n` +
						`Message: ${JSON.stringify(resp.errorMessage)}\n`
				);
			}

			if (signatureRS?.byteLength !== 64) {
				throw new Error(`Signature must be 64 bytes long (is ${signatureRS.length})`);
			}

			return bufferToArrayBuffer(signatureRS) as Signature;
		});
	}

	public async transformRequest(request: HttpAgentRequest): Promise<unknown> {
		const { body, ...fields } = request;
		const signature = await this.sign(_prepareCborForLedger(body));
		return {
			...fields,
			body: {
				content: body,
				sender_pubkey: this._publicKey.toDer(),
				sender_sig: signature
			}
		};
	}

	private async _executeWithApp<T>(func: (app: LedgerApp) => Promise<T>): Promise<T> {
		const { app, transport } = await LedgerIdentity._connect();

		try {
			// Verify that the public key of the device matches the public key of this identity.
			const devicePublicKey = await LedgerIdentity._fetchPublicKeyFromDevice(app, this.derivePath);
			if (JSON.stringify(devicePublicKey) !== JSON.stringify(this._publicKey)) {
				throw new Error("Found unexpected public key. Are you sure you're using the right wallet?");
			}

			// Run the provided function.
			return await func(app);
		} finally {
			transport.close();
		}
	}
}

interface Version {
	major: number;
	minor: number;
	patch: number;
}

function bufferToArrayBuffer(buffer: Buffer): ArrayBuffer {
	if (!buffer) throw new Error('Please make sure your Ledger device is live. Try again.');
	const sourceView = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
	const result = new ArrayBuffer(buffer.byteLength);
	const targetView = new Uint8Array(result);
	targetView.set(sourceView);

	return result;
}
