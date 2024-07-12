import { Principal } from '@dfinity/principal';
import type {
	Allowance,
	AllowanceArgs,
	Account,
	ApproveArgs,
	ApproveResult,
	ApproveError
} from '../declarations/nns-ledger/nns-ledger.did';
import type { Result_3, Result_4 } from '../declarations/water_neuron/water_neuron.did';
import { bigintE8sToNumber } from '$lib';
import type { Icrc1TransferResult } from '../declarations/nns-ledger/nns-ledger.did';
import type { _SERVICE as icpLedgerInterface } from '../declarations/nns-ledger/nns-ledger.did';
import type { _SERVICE as nicpLedgerInterface } from '../declarations/nicp_ledger/nicp_ledger.did';
import { CANISTER_ID_WATER_NEURON } from './authentification';

function handleApproveError(error: ApproveError) {
	if ('GenericError' in error) {
		console.error(`Error: ${error.GenericError.message}, Code: ${error.GenericError.error_code}`);
	} else if ('TemporarilyUnavailable' in error) {
		console.error('Service is temporarily unavailable.');
	} else if ('Duplicate' in error) {
		console.error(`Duplicate transaction with block index: ${error.Duplicate.duplicate_of}`);
	} else if ('BadFee' in error) {
		console.error(`Bad fee. Expected fee: ${error.BadFee.expected_fee}`);
	} else if ('AllowanceChanged' in error) {
		console.error(
			`Allowance changed. Current allowance: ${error.AllowanceChanged.current_allowance}`
		);
	} else if ('CreatedInFuture' in error) {
		console.error(`Created in future. Ledger time: ${error.CreatedInFuture.ledger_time}`);
	} else if ('TooOld' in error) {
		console.error('Transaction is too old.');
	} else if ('Expired' in error) {
		console.error(`Transaction expired. Ledger time: ${error.Expired.ledger_time}`);
	} else if ('InsufficientFunds' in error) {
		console.error(`Insufficient funds. Balance: ${error.InsufficientFunds.balance}`);
	} else {
		console.error('Unknown error type.');
	}
}

export function handleApproveResult(result: ApproveResult): string {
	if ('Err' in result) {
		return `Error: ${handleApproveError(result.Err)}`;
	} else if ('Ok' in result) {
		return '';
	} else {
		return 'Unknown result, refresh the page';
	}
}

export async function nicpTransferApproved(
	amount: bigint,
	account: Account,
	nicpLedger: nicpLedgerInterface
): Promise<void | string> {
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
		const messageError = handleApproveResult(approveResult);
		if (messageError !== '') {
			return messageError;
		} else {
			return;
		}
	}
	return;
}

export async function icpTransferApproved(
	amount: bigint,
	account: Account,
	icpLedger: icpLedgerInterface
): Promise<void | string> {
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
		const messageError = handleApproveResult(approveResult);
		if (messageError !== '') {
			return messageError;
		} else {
			return;
		}
	}
	return;
}

interface ConversionResult {
	success: boolean;
	message: string;
}

export function handleStakeResult(result: Result_3): ConversionResult {
	if ('Ok' in result) {
		return {
			success: true,
			message: `Converted ICP to nICP at ${
				'https://dashboard.internetcomputer.org/transaction/' + result.Ok.block_index.toString()
			}`
		};
	} else if ('Err' in result) {
		if ('GenericError' in result.Err) {
			return { success: false, message: `Generic Error: ${result.Err.GenericError.message}` };
		} else if ('TransferError' in result.Err) {
			return { success: false, message: `Transfer Error: ${result.Err.TransferError}` };
		} else if ('AmountTooLow' in result.Err) {
			return {
				success: false,
				message: `Amount too low. Minimum amount: ${bigintE8sToNumber(result.Err.AmountTooLow.minimum_amount_e8s)}`
			};
		} else if ('TransferFromError' in result.Err) {
			const error = result.Err.TransferFromError;
			if ('GenericError' in error){
				return { success: false, message: `Generic Error: ${error.GenericError.message}` };
			} else if ('TemporarilyUnavailable' in error) {
				return { success: false, message: "Ledger is temporarily unvailable." };
			} else if ('InsufficientAllowance' in error) {
				return { success: false, message: `Insufficient allowance.  Allowance amount: ${error.InsufficientAllowance.allowance}` };
			}else if ('BadBurn' in error) {
				return { success: false, message: `Bad burn. Minimum burn amount: ${error.BadBurn.min_burn_amount}` };
			}else if ('Duplicate' in error) {
				return { success: false, message: `Duplicate. Already occuring transfer: ${error.Duplicate.duplicate_of.toString()}` };
			}else if ('BadFee' in error) {
				return { success: false, message: `Bad fee. Expected fee: ${error.BadFee.expected_fee}`};
			}else if ('CreatedInFuture' in error) {
				return { success: false, message: `Created in future: ${error.CreatedInFuture.ledger_time.toString()}` };
			}else if ('TooOld' in error) {
				return { success: false, message:  `The transfer is too old.`};
			}else if ('InsufficientFunds' in error) {
				return { success: false, message:  `Insufficient funds. Balance: ${error.InsufficientFunds.balance}`};
			} else {
				return { success: false, message: 'Unknown transferfrom error.' } 
			}
		} else if ('GuardError' in result.Err) {
			return { success: false, message: `Guard Error: ${result.Err.GuardError.guard_error}` };
		} else {
			return { success: false, message: 'Unkown Conversion Error. Please refresh the page.' };
		}
	} else {
		return { success: false, message: 'Unknown error.' };
	}
}

export function handleRetrieveResult(result: Result_4): ConversionResult {
	if ('Ok' in result) {
		return {
			success: true,
			message: `Converted ICP to nICP at ${
				'https://dashboard.internetcomputer.org/transaction/' + result.Ok.block_index.toString()
			}`
		};
	} else if ('Err' in result) {
		if ('GenericError' in result.Err) {
			return { success: false, message: `Generic Error: ${result.Err.GenericError.message}` };
		} else if ('TransferError' in result.Err) {
			return { success: false, message: `Transfer Error: ${result.Err.TransferError}` };
		} else if ('AmountTooLow' in result.Err) {
			return {
				success: false,
				message: `Amount too low. Minimum amount: ${bigintE8sToNumber(result.Err.AmountTooLow.minimum_amount_e8s)}`
			};
		} else if ('TransferFromError' in result.Err) {
			const error = result.Err.TransferFromError;
			if ('GenericError' in error){
				return { success: false, message: `Generic Error: ${error.GenericError.message}` };
			} else if ('TemporarilyUnavailable' in error) {
				return { success: false, message: "Ledger is temporarily unvailable." };
			} else if ('InsufficientAllowance' in error) {
				return { success: false, message: `Insufficient allowance. Allowance amount: ${error.InsufficientAllowance.allowance}` };
			}else if ('BadBurn' in error) {
				return { success: false, message: `Bad burn. Minimum burn amount: ${error.BadBurn.min_burn_amount}` };
			}else if ('Duplicate' in error) {
				return { success: false, message: `Duplicate. Already occuring transfer: ${error.Duplicate.duplicate_of.toString()}` };
			}else if ('BadFee' in error) {
				return { success: false, message: `Bad fee. Expected fee: ${error.BadFee.expected_fee}`};
			}else if ('CreatedInFuture' in error) {
				return { success: false, message: `Created in future: ${error.CreatedInFuture.ledger_time.toString()}` };
			}else if ('TooOld' in error) {
				return { success: false, message:  `The transfer is too old.`};
			}else if ('InsufficientFunds' in error) {
				return { success: false, message:  `Insufficient funds. Balance: ${error.InsufficientFunds.balance}`};
			} else {
				return { success: false, message: 'Unknown transferfrom error.' } 
			}
		} else if ('GuardError' in result.Err) {
			return { success: false, message: `Guard Error: ${result.Err.GuardError.guard_error}` };
		} else {
			return { success: false, message: 'Unkown Conversion Error. Please refresh the page.' };
		}
	} else {
		return { success: false, message: 'Unknown Error.' };
	}
}

export function handleTransferResult(result: Icrc1TransferResult): ConversionResult {
	if ('Ok' in result) {
		return { success: true, message: `block index ${result.Ok.toString()}` };
	} else if ('Err' in result) {
		return { success: true, message: `Transfer Error: ${result.Err}` };
	} else {
		return { success: true, message: 'Error Unkown. Please refresh the page.' };
	}
}
