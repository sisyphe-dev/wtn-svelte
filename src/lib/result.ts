import { Principal } from '@dfinity/principal';
import type {
	Allowance,
	AllowanceArgs,
	Account,
	ApproveArgs,
	ApproveResult,
	ApproveError
} from '../declarations/icrc_ledger/icrc_ledger.did';
import type {
	ConversionError,
	Result_1 as IcpToNicpResult,
	Result_2 as NicpToIcpResult,
	TransferError,
	TransferFromError
} from '../declarations/water_neuron/water_neuron.did';
import type {
	BoomerangError,
	Result_1 as SnsIcpDepositResult,
	Result_2 as SnsRetrieveNicpResult
} from '../declarations/boomerang/boomerang.did';
import { Asset, AssetType, bigintE8sToNumber, displayUsFormat } from '$lib';
import type {
	TransferResult,
	Icrc1TransferResult
} from '../declarations/nns-ledger/nns-ledger.did';
import type { _SERVICE as icpLedgerInterface } from '../declarations/nns-ledger/nns-ledger.did';
import type { _SERVICE as nicpLedgerInterface } from '../declarations/icrc_ledger/icrc_ledger.did';
import { CANISTER_ID_WATER_NEURON } from './authentification';

export const DEFAULT_ERROR_MESSAGE: string = 'Unknown result, please refresh the page.';

export interface ToastResult {
	success: boolean;
	message: string;
}

function handleApproveError(error: ApproveError) {
	const key = Object.keys(error)[0] as keyof ApproveError;

	switch (key) {
		case 'GenericError':
			return {
				success: false,
				message: `Generic Error: ${error[key]['message']}`
			};

		case 'TemporarilyUnavailable':
			return { success: false, message: 'Ledger is temporarily unavailable.' };

		case 'AllowanceChanged':
			return {
				success: false,
				message: `Insufficient allowance: ${displayUsFormat(bigintE8sToNumber(error[key]['current_allowance']))}`
			};

		case 'Expired':
			return {
				success: false,
				message: `Approval expired: ${error[key]['ledger_time']}`
			};

		case 'Duplicate':
			return {
				success: false,
				message: `Duplicate transfer of: ${error[key]['duplicate_of']}`
			};

		case 'BadFee':
			return {
				success: false,
				message: `Bad fee, expected: ${displayUsFormat(bigintE8sToNumber(error[key]['expected_fee']))}`
			};

		case 'CreatedInFuture':
			return {
				success: false,
				message: `Created in future: ${error[key]['ledger_time']}`
			};

		case 'TooOld':
			return { success: false, message: `The transfer is too old.` };

		case 'InsufficientFunds':
			return {
				success: false,
				message: `Insufficient funds, balance: ${displayUsFormat(bigintE8sToNumber(error[key]['balance']))}`
			};

		default:
			return { success: false, message: DEFAULT_ERROR_MESSAGE };
	}
}

export function handleApproveResult(result: ApproveResult): ToastResult {
	const key = Object.keys(result)[0] as keyof ApproveResult;
	switch (key) {
		case 'Ok':
			return { success: true, message: '' };
		case 'Err': {
			return handleApproveError(result[key]);
		}
		default:
			return { success: false, message: DEFAULT_ERROR_MESSAGE };
	}
}

export async function nicpTransferApproved(
	amount: bigint,
	account: Account,
	nicpLedger: nicpLedgerInterface
): Promise<ToastResult> {
	const spender = {
		owner: Principal.fromText(CANISTER_ID_WATER_NEURON),
		subaccount: []
	} as Account;
	const allowanceResult: Allowance = await nicpLedger.icrc2_allowance({
		account,
		spender
	} as AllowanceArgs);
	const allowance = allowanceResult['allowance'];
	if (amount > allowance) {
		try {
			const approveResult: ApproveResult = await nicpLedger.icrc2_approve({
				spender,
				fee: [],
				memo: [],
				from_subaccount: [],
				created_at_time: [],
				expires_at: [],
				expected_allowance: [],
				amount: amount * BigInt(3)
			} as ApproveArgs);
			return handleApproveResult(approveResult);
		} catch (error) {
			return { success: false, message: `${error}.` };
		}
	}
	return { success: true, message: '' };
}

export async function icpTransferApproved(
	amount: bigint,
	account: Account,
	icpLedger: icpLedgerInterface
): Promise<ToastResult> {
	const spender = {
		owner: Principal.fromText(CANISTER_ID_WATER_NEURON),
		subaccount: []
	} as Account;
	const allowanceResult: Allowance = await icpLedger.icrc2_allowance({
		account,
		spender
	} as AllowanceArgs);
	const allowance = allowanceResult['allowance'];
	if (amount > allowance) {
		try {
			const approveResult: ApproveResult = await icpLedger.icrc2_approve({
				spender,
				fee: [],
				memo: [],
				from_subaccount: [],
				created_at_time: [],
				expires_at: [],
				expected_allowance: [],
				amount: amount * BigInt(3)
			} as ApproveArgs);
			return handleApproveResult(approveResult);
		} catch (error) {
			return { success: false, message: `${error}` };
		}
	}
	return { success: true, message: '' };
}

function handleTransferError(error: TransferError) {
	const key = Object.keys(error)[0] as keyof TransferError;

	switch (key) {
		case 'GenericError':
			return {
				success: false,
				message: `Generic Error: ${error[key]['message']}`
			};

		case 'TemporarilyUnavailable':
			return { success: false, message: 'Ledger is temporarily unavailable.' };

		case 'BadBurn':
			return {
				success: false,
				message: `Bad burn. Minimum burn amount: ${displayUsFormat(bigintE8sToNumber(error[key]['min_burn_amount']))}`
			};

		case 'Duplicate':
			return {
				success: false,
				message: `Duplicate transfer of: ${error[key]['duplicate_of']}`
			};

		case 'BadFee':
			return {
				success: false,
				message: `Bad fee, expected ${displayUsFormat(bigintE8sToNumber(error[key]['expected_fee']))}`
			};

		case 'CreatedInFuture':
			return {
				success: false,
				message: `Created in future: ${error[key]['ledger_time']}`
			};

		case 'TooOld':
			return { success: false, message: `The transfer is too old.` };

		case 'InsufficientFunds':
			return {
				success: false,
				message: `Insufficient funds, current balance: ${displayUsFormat(bigintE8sToNumber(error[key]['balance']))}`
			};

		default:
			return { success: false, message: DEFAULT_ERROR_MESSAGE };
	}
}

function handleTransferFromError(error: TransferFromError) {
	const key = Object.keys(error)[0] as keyof TransferFromError;

	switch (key) {
		case 'GenericError':
			return {
				success: false,
				message: `Generic Error: ${error[key]['message']}`
			};

		case 'TemporarilyUnavailable':
			return { success: false, message: 'Ledger is temporarily unavailable.' };

		case 'InsufficientAllowance':
			return {
				success: false,
				message: `Insufficient allowance: ${displayUsFormat(bigintE8sToNumber(error[key]['allowance']))}`
			};

		case 'BadBurn':
			return {
				success: false,
				message: `Bad burn, minimum burn amount: ${displayUsFormat(bigintE8sToNumber(error[key]['min_burn_amount']))}`
			};

		case 'Duplicate':
			return {
				success: false,
				message: `Duplicate transfer of: ${error[key]['duplicate_of']}`
			};

		case 'BadFee':
			return {
				success: false,
				message: `Bad fee, expected: ${displayUsFormat(bigintE8sToNumber(error[key]['expected_fee']))}`
			};

		case 'CreatedInFuture':
			return {
				success: false,
				message: `Created in future: ${error[key]['ledger_time']}`
			};

		case 'TooOld':
			return { success: false, message: `The transfer is too old.` };

		case 'InsufficientFunds':
			return {
				success: false,
				message: `Insufficient funds, balance: ${displayUsFormat(bigintE8sToNumber(error[key]['balance']))}`
			};

		default:
			return { success: false, message: 'Unknown transferfrom error.' };
	}
}

function handleConversionError(error: ConversionError): ToastResult {
	const errorKey = Object.keys(error)[0] as keyof ConversionError;

	switch (errorKey) {
		case 'GenericError':
			return { success: false, message: `Generic Error: ${error[errorKey]['message']}` };

		case 'TransferError':
			return handleTransferError(error[errorKey]);

		case 'AmountTooLow':
			return {
				success: false,
				message: `Amount too low. Should be greater than ${displayUsFormat(bigintE8sToNumber(error[errorKey]['minimum_amount_e8s']))}`
			};

		case 'TransferFromError':
			return handleTransferFromError(error[errorKey]);
		case 'GuardError':
			const guardErrorKey = Object.keys(error[errorKey])[0];

			switch (guardErrorKey) {
				case 'AlreadyProcessing':
					return { success: false, message: `Conversion already processing.` };
				case 'TooManyConcurrentRequests':
					return { success: false, message: `Too many concurrent requests.` };
			}

		default:
			return { success: false, message: DEFAULT_ERROR_MESSAGE };
	}
}

export function handleStakeResult(result: IcpToNicpResult): ToastResult {
	const key = Object.keys(result)[0] as keyof IcpToNicpResult;
	switch (key) {
		case 'Ok':
			return {
				success: true,
				message: `Successful conversion at <a target='_blank' style="text-decoration: underline; color: var(--text-color);" href=https://dashboard.internetcomputer.org/transaction/${result[key]['block_index']}>block index ${result[key]['block_index']}</a>.`
			};
		case 'Err':
			return handleConversionError(result[key]);
		default:
			return { success: false, message: DEFAULT_ERROR_MESSAGE };
	}
}

export function handleRetrieveResult(result: NicpToIcpResult): ToastResult {
	const key = Object.keys(result)[0] as keyof NicpToIcpResult;

	switch (key) {
		case 'Ok':
			return {
				success: true,
				message: `Successful conversion at block index ${result[key]['block_index']}. Follow your <a style="text-decoration: underline; color: var(--text-color);" href='/wallet'>withdrawal status</a>.`
			};
		case 'Err':
			return handleConversionError(result[key]);
		default:
			return { success: false, message: DEFAULT_ERROR_MESSAGE };
	}
}

function handleBoomerangError(error: BoomerangError): ToastResult {
	const key = Object.keys(error)[0] as keyof BoomerangError;

	switch (key) {
		case 'GenericError':
			return { success: false, message: `Generic Error: ${error[key]['message']}` };

		case 'TransferError':
			return handleTransferError(error[key]);

		case 'ConversionError':
			return handleConversionError(error[key]);

		case 'ApproveError':
			return handleApproveError(error[key]);

		case 'NotEnoughICP':
			return { success: false, message: `Sorry, there are not enough funds in this account.` };

		default:
			return { success: false, message: DEFAULT_ERROR_MESSAGE };
	}
}

export function handleSnsIcpDepositResult(result: SnsIcpDepositResult): ToastResult {
	const key = Object.keys(result)[0] as keyof SnsIcpDepositResult;

	switch (key) {
		case 'Ok':
			return {
				success: true,
				message: `Successful conversion at <a target='_blank' style="text-decoration: underline; color: var(--text-color);" href=https://dashboard.internetcomputer.org/transaction/${result[key]['block_index']}>block index ${result[key]['block_index']}</a>.`
			};
		case 'Err':
			return handleBoomerangError(result[key]);

		default:
			return { success: false, message: DEFAULT_ERROR_MESSAGE };
	}
}

export function handleSnsRetrieveNicpResult(result: SnsRetrieveNicpResult): ToastResult {
	const key = Object.keys(result)[0] as keyof SnsRetrieveNicpResult;

	switch (key) {
		case 'Ok':
			return {
				success: true,
				message: `Successful conversion at <a target='_blank' style="text-decoration: underline; color: var(--text-color);" href="/wallet">block index ${result[key]}</a>.`
			};
		case 'Err':
			return handleBoomerangError(result[key]);

		default:
			return { success: false, message: DEFAULT_ERROR_MESSAGE };
	}
}

export function handleTransferResult(result: TransferResult): ToastResult {
	const key = Object.keys(result)[0] as keyof TransferResult;

	switch (key) {
		case 'Ok':
			return {
				success: true,
				message: `Successful transfer at <a target='_blank' style="text-decoration: underline; color: var(--text-color);" href=https://dashboard.internetcomputer.org/transaction/${result[key]}>block index ${result[key]}</a>.`
			};
		case 'Err':
			return handleTransferError(result[key]);

		default:
			return {
				success: false,
				message: DEFAULT_ERROR_MESSAGE
			};
	}
}

export function handleIcrcTransferResult(result: Icrc1TransferResult, asset: Asset): ToastResult {
	const key = Object.keys(result)[0] as keyof Icrc1TransferResult;

	switch (key) {
		case 'Ok':
			switch (asset.type) {
				case AssetType.nICP:
					return {
						success: true,
						message: `Successful transfer at block index ${result[key]}.`
					};
				default:
					return {
						success: true,
						message: `Successful transfer at <a target='_blank' style="text-decoration: underline; color: var(--text-color);" href=${asset.getDashboardUrl()}${result[key]}>block index ${result[key]}</a>.`
					};
			}

		case 'Err':
			return handleTransferFromError(result[key]);

		default:
			return {
				success: false,
				message: DEFAULT_ERROR_MESSAGE
			};
	}
}
