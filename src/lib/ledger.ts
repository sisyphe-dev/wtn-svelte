import { nicp_ledger } from '../declarations/nicp_ledger';
import { Principal } from '@dfinity/principal';
import type {
	Allowance,
	AllowanceArgs,
	Account,
	ApproveArgs,
	ApproveResult,
	ApproveError
} from '../declarations/nns-ledger/nns-ledger.did';
import { nns_ledger } from '../declarations/nns-ledger';
import type { Result_3, Result_4 } from '../declarations/water_neuron/water_neuron.did';
import { bigintE8sToNumber } from '$lib';

const CANISTER_ID_WATER_NEURON = 'n76cn-tyaaa-aaaam-acc5a-cai';

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
	account: Account
): Promise<void | string> {
	const spender = {
		owner: Principal.fromText(CANISTER_ID_WATER_NEURON),
		subaccount: []
	} as Account;
	const allowanceResult: Allowance = await nicp_ledger.icrc2_allowance({
		account,
		spender
	} as AllowanceArgs);
	const allowance = allowanceResult['allowance'];
	if (amount > allowance) {
		const approveResult: ApproveResult = await nicp_ledger.icrc2_approve({
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
	return 'Not enough nICP.';
}

export async function icpTransferApproved(
	amount: bigint,
	account: Account
): Promise<void | string> {
	const spender = {
		owner: Principal.fromText(CANISTER_ID_WATER_NEURON),
		subaccount: []
	} as Account;
	const allowanceResult: Allowance = await nns_ledger.icrc2_allowance({
		account,
		spender
	} as AllowanceArgs);
	const allowance = allowanceResult['allowance'];
	if (amount > allowance) {
		const approveResult: ApproveResult = await nns_ledger.icrc2_approve({
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
	return 'Not enough nICP.';
}

interface ConversionResult {
    success: boolean,
    message: string, 
}

export function handleStakeResult(result: Result_3): ConversionResult {
	if ('Ok' in result) {
        return {success: true, message: `Converted ICP to nICP at ${"https://dashboard.internetcomputer.org/transaction/" +
				result.Ok.block_index.toString()}`};
    } else if ('Err' in result){
        if ('GenericError' in result.Err) {
            return {success: false, message: `Generic Error: ${result.Err.GenericError.message}`};
        } else if ('TransferError' in result.Err) {
            return {success: false, message: `Transfer Error: ${result.Err.TransferError}`};
        }  else if ('AmountTooLow' in result.Err) {
            return {success: false, message: `Amount too low. Minimum amount: ${bigintE8sToNumber(result.Err.AmountTooLow.minimum_amount_e8s)}`};
        } else if ('TransferFromError' in result.Err) {
            return {success: false, message: `TransferFrom Error: ${result.Err.TransferFromError}`};
        }  else if ('GuardError' in result.Err) {
            return {success: false, message: `Guard Error: ${result.Err.GuardError.guard_error}`};
        } else {
            return {success: false, message: 'Unkown Error. Please refresh the page.'}
        }
    } else {
        return {success: false, message: 'Did not catch yor name'};
    }
  }

  export function handleRetrieveResult(result: Result_4): ConversionResult {
	if ('Ok' in result) {
        return {success: true, message: `Converted ICP to nICP at ${"https://dashboard.internetcomputer.org/transaction/" +
				result.Ok.block_index.toString()}`};
    } else if ('Err' in result){
        if ('GenericError' in result.Err) {
            return {success: false, message: `Generic Error: ${result.Err.GenericError.message}`};
        } else if ('TransferError' in result.Err) {
            return {success: false, message: `Transfer Error: ${result.Err.TransferError}`};
        }  else if ('AmountTooLow' in result.Err) {
            return {success: false, message: `Amount too low. Minimum amount: ${bigintE8sToNumber(result.Err.AmountTooLow.minimum_amount_e8s)}`};
        } else if ('TransferFromError' in result.Err) {
            return {success: false, message: `TransferFrom Error: ${result.Err.TransferFromError}`};
        }  else if ('GuardError' in result.Err) {
            return {success: false, message: `Guard Error: ${result.Err.GuardError.guard_error}`};
        } else {
            return {success: false, message: 'Unkown Error. Please refresh the page.'}
        }
    } else {
        return {success: false, message: 'Did not catch yor name'};
    }
  }