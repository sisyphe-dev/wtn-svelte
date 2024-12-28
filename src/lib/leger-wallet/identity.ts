import { Principal } from '@dfinity/principal';
import { Secp256k1PublicKey } from './secp256k1';
import {
	Cbor,
	HttpAgent,
	requestIdOf,
	SignIdentity,
	type CallRequest,
	type HttpAgentRequest,
	type PublicKey,
	type ReadRequest,
	type ReadStateRequest,
	type ReadRequestType,
	type RequestId,
	type Signature
} from '@dfinity/agent';
import { smallerVersion } from '@dfinity/utils';
import type Transport from '@ledgerhq/hw-transport';
import LedgerApp from '@zondax/ledger-icp';
import {
	LedgerError,
	ResponseAddress,
	ResponseSign,
	ResponseVersion,
	ResponseSignUpdateCall
} from '@zondax/ledger-icp';
import { AccountIdentifier, LedgerCanister } from '@dfinity/ledger-icp';
import { bigintE8sToNumber } from '$lib';
import BigNumber from 'bignumber.js';
import { IcrcLedgerCanister } from '@dfinity/ledger-icrc';

const LEDGER_DEFAULT_DERIVE_PATH = `m/44'/223'/0'/0/0`;
const LEDGER_SIGNATURE_LENGTH = 64;
// Version published in October 2023. Includes all transactions supported in Candid
export const ALL_CANDID_TXS_VERSION = '2.4.9';

type ReadStateData = {
	signature: Signature;
	body: ReadStateRequest;
};

type RequestSignatures = {
	callSignature: Signature;
	readStateSignature: Signature;
};

interface LedgerHQTransportError {
	name: string;
	message: string;
	id: string;
}

export class LedgerDevice {
	public agent: HttpAgent;
	public identity: LedgerIdentity;
	public principal: Principal;
	public accountId: string;
	public icpLedger: LedgerCanister;
	public nicpLedger: IcrcLedgerCanister;
	public wtnLedger: IcrcLedgerCanister;
	public icpBalanceE8s: bigint;
	public nicpBalanceE8s: bigint;
	public wtnBalanceE8s: bigint;
	public wtnAllocationE8s: bigint;

	constructor({
		principal,
		identity,
		agent,
		icpLedger,
		nicpLedger,
		wtnLedger
	}: {
		principal: Principal;
		identity: LedgerIdentity;
		agent: HttpAgent;
		icpLedger: LedgerCanister;
		nicpLedger: IcrcLedgerCanister;
		wtnLedger: IcrcLedgerCanister;
	}) {
		this.agent = agent;
		this.identity = identity;
		this.principal = principal;
		this.icpLedger = icpLedger;
		this.nicpLedger = nicpLedger;
		this.wtnLedger = wtnLedger;
		this.accountId = AccountIdentifier.fromPrincipal({ principal }).toHex();
		this.icpBalanceE8s = 0n;
		this.nicpBalanceE8s = 0n;
		this.wtnBalanceE8s = 0n;
		this.wtnAllocationE8s = 0n;
	}

	icpBalance(): BigNumber {
		return bigintE8sToNumber(this.icpBalanceE8s);
	}

	nicpBalance(): BigNumber {
		return bigintE8sToNumber(this.nicpBalanceE8s);
	}

	wtnBalance(): BigNumber {
		return bigintE8sToNumber(this.wtnBalanceE8s);
	}

	wtnAllocation(): BigNumber {
		return bigintE8sToNumber(this.wtnAllocationE8s);
	}

	getBalance(asset: 'ICP' | 'nICP' | 'WTN'): BigNumber {
		switch (asset) {
			case 'ICP':
				return this.icpBalance();
			case 'nICP':
				return this.nicpBalance();
			case 'WTN':
				return this.wtnBalance();
		}
	}
}

export class LedgerIdentity extends SignIdentity {
	// TODO(L2-433): is there a better way to solve this requirements than a class variable that is set and unset?
	// A flag to signal that the next transaction to be signed will be a "stake neuron" transaction.
	private neuronStakeFlag = false;

	private constructor(
		private readonly derivePath: string,
		private readonly publicKey: Secp256k1PublicKey
	) {
		super();
	}

	public static async create(derivePath = LEDGER_DEFAULT_DERIVE_PATH): Promise<LedgerIdentity> {
		const { app, transport } = await this.connect();

		try {
			const publicKey = await this.fetchPublicKeyFromDevice({
				app,
				derivePath
			});

			return new this(derivePath, publicKey);
		} finally {
			// Always close the transport.
			await transport.close();
		}
	}

	// For tests only
	public static createMockIdentity(mockIdentity: Secp256k1PublicKey): LedgerIdentity {
		return new this(LEDGER_DEFAULT_DERIVE_PATH, mockIdentity);
	}

	public override getPublicKey(): Required<PublicKey> {
		return this.publicKey;
	}

	private raiseIfVersionIsDeprecated = async () => {
		const { major, minor, patch } = await this.getVersion();
		const currentVersion = `${major}.${minor}.${patch}`;
		if (smallerVersion({ minVersion: ALL_CANDID_TXS_VERSION, currentVersion })) {
			throw new Error('error__ledger.app_version_not_supported');
		}
	};

	private async signWithReadState(
		callBlob: ArrayBuffer,
		readStateBlob: ArrayBuffer
	): Promise<RequestSignatures> {
		await this.raiseIfVersionIsDeprecated();

		const callback = async (app: LedgerApp): Promise<RequestSignatures> => {
			const responseSign: ResponseSignUpdateCall = await app.signUpdateCall(
				this.derivePath,
				Buffer.from(callBlob),
				Buffer.from(readStateBlob),
				this.neuronStakeFlag ? 1 : 0
			);

			// Remove the "neuron stake" flag, since we already signed the transaction.
			this.neuronStakeFlag = false;

			return decodeUpdateSignatures(responseSign);
		};

		return this.executeWithApp<RequestSignatures>(callback);
	}

	public override async sign(blob: ArrayBuffer): Promise<Signature> {
		await this.raiseIfVersionIsDeprecated();

		const callback = async (app: LedgerApp): Promise<Signature> => {
			const responseSign: ResponseSign = await app.sign(
				this.derivePath,
				Buffer.from(blob),
				this.neuronStakeFlag ? 1 : 0
			);
			console.log(responseSign);

			// Remove the "neuron stake" flag, since we already signed the transaction.
			this.neuronStakeFlag = false;

			return decodeSignature(responseSign);
		};

		return this.executeWithApp<Signature>(callback);
	}

	/**
	 * Signals that the upcoming transaction to be signed will be a "stake neuron" transaction.
	 */
	public flagUpcomingStakeNeuron(): void {
		this.neuronStakeFlag = true;
	}

	/**
	 * Required by Ledger.com that the user should be able to press a Button in UI
	 * and verify the address/pubkey are the same as on the device screen.
	 */
	public async showAddressAndPubKeyOnDevice(): Promise<ResponseAddress> {
		// The function `showAddressAndPubKey` should not be destructured from the `app` because it internally accesses `this.transport` that refers to an `app` variable
		const callback = (app: LedgerApp): Promise<ResponseAddress> =>
			app.showAddressAndPubKey(this.derivePath);

		return this.executeWithApp<ResponseAddress>(callback);
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

	public static async getTransport(): Promise<Transport> {
		const { default: TransportWebHID } = await import('@ledgerhq/hw-transport-webhid');
		return TransportWebHID.create();
	}

	// Public to be able to mock it in tests.
	public static async connect(): Promise<{
		app: LedgerApp;
		transport: Transport;
	}> {
		try {
			const transport = await this.getTransport();

			const { default: LedgerAppConstructor } = await import('@zondax/ledger-icp');
			const app = new LedgerAppConstructor(transport);

			return { app, transport };
		} catch (err: unknown) {
			if ((err as LedgerHQTransportError)?.name === 'TransportOpenUserCancelled') {
				if ((err as LedgerHQTransportError)?.message.includes('not supported')) {
					throw new Error('error__ledger.browser_not_supported');
				}
				throw new Error('error__ledger.access_denied');
			}

			if ((err as LedgerHQTransportError)?.id === 'NoDeviceFound') {
				throw new Error('error__ledger.connect_no_device');
			}

			if ((err as LedgerHQTransportError).message?.includes('cannot open device with path')) {
				throw new Error('error__ledger.connect_many_apps');
			}

			// Unsupported browser. Data on browser compatibility is taken from https://caniuse.com/webhid
			throw new Error(`${err}`);
		}
	}

	// Public to be able to mock it in tests.
	public static async fetchPublicKeyFromDevice({
		app,
		derivePath
	}: {
		app: LedgerApp;
		derivePath: string;
	}): Promise<Secp256k1PublicKey> {
		const resp = await app.getAddressAndPubKey(derivePath);

		// This type doesn't have the right fields in it, so we have to manually type it.
		const principal = (resp as unknown as { principalText: string }).principalText;

		if (!resp.publicKey) {
			throw new Error('Failed to fetch public key from device.');
		}
		const publicKey = Secp256k1PublicKey.fromRaw(bufferToArrayBuffer(resp.publicKey));

		if (principal !== Principal.selfAuthenticating(new Uint8Array(publicKey.toDer())).toText()) {
			throw new Error('Principal returned by device does not match public key.');
		}

		return publicKey;
	}

	private async executeWithApp<T>(callback: (app: LedgerApp) => Promise<T>): Promise<T> {
		const { app, transport } = await LedgerIdentity.connect();

		try {
			// Verify that the public key of the device matches the public key of this identity.
			const devicePublicKey: Secp256k1PublicKey = await LedgerIdentity.fetchPublicKeyFromDevice({
				app,
				derivePath: this.derivePath
			});

			if (JSON.stringify(devicePublicKey) !== JSON.stringify(this.publicKey)) {
				throw new Error('error__ledger.unexpected_wallet');
			}

			// Run the provided function.
			return await callback(app);
		} finally {
			await transport.close();
		}
	}

	/**
	 * Convert the HttpAgentRequest body into cbor which can be signed by the Ledger Device.
	 * @param request - body of the HttpAgentRequest
	 */
	private prepareCborForLedger = (request: ReadRequest | CallRequest): ArrayBuffer => {
		return Cbor.encode({ content: request });
	};

	private async createReadStateRequest(body: CallRequest): Promise<ReadStateRequest> {
		const requestId = requestIdOf(body);
		const readStateBody: ReadStateRequest = {
			request_type: 'read_state' as ReadRequestType.ReadState,
			paths: createReadStatePaths(requestId),
			ingress_expiry: body.ingress_expiry,
			sender: body.sender
		};
		return readStateBody;
	}

	private async transformCallRequest(request: HttpAgentRequest) {
		const { body, ...fields } = request;
		// If the request endpoint is a "call", then the body is a CallRequest.
		// Reference: https://github.com/dfinity/agent-js/blob/ce772199189748f9b77c8eb3ceeb3fdd11c70b5b/packages/agent/src/agent/http/types.ts#L28
		const callBody = body as CallRequest;
		const readStateBody = await this.createReadStateRequest(callBody);
		console.log(readStateBody, body);
		const signatures = await this.signWithReadState(
			this.prepareCborForLedger(body),
			this.prepareCborForLedger(readStateBody)
		);

		return {
			...fields,
			body: {
				content: body,
				sender_pubkey: this.publicKey.toDer(),
				sender_sig: signatures.callSignature
			}
		};
	}

	public async transformRequest(request: HttpAgentRequest): Promise<unknown> {
		if (request.endpoint === 'call') {
			return this.transformCallRequest(request);
		}

		const { body, ...fields } = request;
		return {
			...fields,
			body: {
				content: body,
				sender_pubkey: this.publicKey.toDer(),
				sender_sig: await this.sign(this.prepareCborForLedger(body))
			}
		};
	}
}

const checkResponseCode = async (returnCode: LedgerError): Promise<void> => {
	const { LedgerError } = await import('@zondax/ledger-icp');
	if (returnCode === LedgerError.TransactionRejected) {
		throw new Error('error__ledger.user_rejected_transaction');
	}
};

const bufferToArrayBuffer = (buffer: Buffer): ArrayBuffer => {
	return buffer.buffer.slice(
		buffer.byteOffset,
		buffer.byteOffset + buffer.byteLength
	) as ArrayBuffer;
};

export const decodeUpdateSignatures = async ({
	RequestSignatureRS,
	StatusReadSignatureRS,
	returnCode,
	errorMessage
}: ResponseSignUpdateCall): Promise<RequestSignatures> => {
	await checkResponseCode(returnCode);
	checkSignature({ signature: RequestSignatureRS, returnCode, errorMessage });
	checkSignature({
		signature: StatusReadSignatureRS,
		returnCode,
		errorMessage
	});

	return {
		callSignature: bufferToArrayBuffer(RequestSignatureRS) as Signature,
		readStateSignature: bufferToArrayBuffer(StatusReadSignatureRS) as Signature
	};
};

export const decodeSignature = async ({
	signatureRS,
	returnCode,
	errorMessage
}: ResponseSign): Promise<Signature> => {
	await checkResponseCode(returnCode);
	checkSignature({ signature: signatureRS, returnCode, errorMessage });

	return bufferToArrayBuffer(signatureRS) as Signature;
};

const checkSignature = ({
	signature,
	returnCode,
	errorMessage
}: {
	signature?: Buffer;
	returnCode: LedgerError;
	errorMessage?: string;
}) => {
	if (returnCode === LedgerError.NoErrors) return;

	if (!signature) {
		throw new Error(`Signature error (${returnCode}): ${errorMessage}`);
	}
	const { byteLength, length } = signature;

	if (byteLength !== LEDGER_SIGNATURE_LENGTH) {
		throw new Error(`Signature has length ${length} instead of ${LEDGER_SIGNATURE_LENGTH}.`);
	}

	throw new Error(`Signature error (${returnCode}): ${errorMessage}`);
};

export const createReadStatePaths = (requestId: RequestId): ArrayBuffer[][] => {
	return [[new TextEncoder().encode('request_status'), requestId]] as ArrayBuffer[][];
};
