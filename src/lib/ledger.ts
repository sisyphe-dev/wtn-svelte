import { Principal } from '@dfinity/principal';
import type {
	Allowance,
	AllowanceArgs,
	Account,
	ApproveArgs,
	ApproveResult,
	ApproveError
} from '../declarations/nicp_ledger/nicp_ledger.did';
import type { Result_3, Result_4 } from '../declarations/water_neuron/water_neuron.did';
import { bigintE8sToNumber } from '$lib';
import type {
	TransferResult,
	Icrc1TransferResult
} from '../declarations/nns-ledger/nns-ledger.did';
import type { _SERVICE as icpLedgerInterface } from '../declarations/nns-ledger/nns-ledger.did';
import type { _SERVICE as nicpLedgerInterface } from '../declarations/nicp_ledger/nicp_ledger.did';
import { CANISTER_ID_WATER_NEURON } from './authentification';

const DEFAULT_ERROR_MESSAGE: string = 'Unknown result, please refresh the page.';

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
		return DEFAULT_ERROR_MESSAGE;
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

export interface ConversionResult {
	success: boolean;
	message: string;
}

export function handleStakeResult(result: Result_3): ConversionResult {
	const key = Object.keys(result)[0] as keyof Result_4;
	switch (key) {
		case 'Ok':
			return {
				success: true,
				message: `Successful conversion at <a target='_blank' style="text-decoration: underline; color: var(--text-color);" href=https://dashboard.internetcomputer.org/transaction/${result[key]['block_index']}>block index ${result[key]['block_index']}</a>.`
			};
		case 'Err':
			const error = result[key];
			const errorKey = Object.keys(result[key])[0];

			switch (errorKey) {
				case 'GenericError':
					return { success: false, message: `Generic Error: ${error[errorKey]['message']}` };

				case 'TransferError':
					const transferError = error[errorKey];
					const transferErrorKey = Object.keys(error[errorKey])[0];

					switch (transferErrorKey) {
						case 'GenericError':
							return {
								success: false,
								message: `Generic Error: ${transferError[transferErrorKey]['message']}`
							};

						case 'TemporarilyUnavailable':
							return { success: false, message: 'Ledger is temporarily unavailable.' };

						case 'BadBurn':
							return {
								success: false,
								message: `Bad burn. Minimum burn amount: ${bigintE8sToNumber(transferError[transferErrorKey]['min_burn_amount'])}`
							};

						case 'Duplicate':
							return {
								success: false,
								message: `Duplicate transfer of: ${transferError[transferErrorKey]['duplicate_of']}`
							};

						case 'BadFee':
							return {
								success: false,
								message: `Bad fee, expected ${bigintE8sToNumber(transferError[transferErrorKey]['expected_fee'])}`
							};

						case 'CreatedInFuture':
							return {
								success: false,
								message: `Created in future: ${transferError[transferErrorKey]['ledger_time']}`
							};

						case 'TooOld':
							return { success: false, message: `The transfer is too old.` };

						case 'InsufficientFunds':
							return {
								success: false,
								message: `Insufficient funds, current balance: ${bigintE8sToNumber(transferError[transferErrorKey]['balance'])}`
							};

						default:
							return { success: false, message: 'Unknown transferfrom error.' };
					}

				case 'AmountTooLow':
					return {
						success: false,
						message: `Amount too low. Should be greater than ${bigintE8sToNumber(error[errorKey]['minimum_amount_e8s'])}`
					};

				case 'TransferFromError':
					const transferFromError = error[errorKey];
					const transferFromErrorKey = Object.keys(error[errorKey])[0];

					switch (transferFromErrorKey) {
						case 'GenericError':
							return {
								success: false,
								message: `Generic Error: ${transferFromError[transferFromErrorKey]['message']}`
							};

						case 'TemporarilyUnavailable':
							return { success: false, message: 'Ledger is temporarily unavailable.' };

						case 'InsufficientAllowance':
							return {
								success: false,
								message: `Insufficient allowance: ${bigintE8sToNumber(transferFromError[transferFromErrorKey]['allowance'])}`
							};

						case 'BadBurn':
							return {
								success: false,
								message: `Bad burn, minimum burn amount: ${bigintE8sToNumber(transferFromError[transferFromErrorKey]['min_burn_amount'])}`
							};

						case 'Duplicate':
							return {
								success: false,
								message: `Duplicate transfer of: ${transferFromError[transferFromErrorKey]['duplicate_of']}`
							};

						case 'BadFee':
							return {
								success: false,
								message: `Bad fee, expected: ${bigintE8sToNumber(transferFromError[transferFromErrorKey]['expected_fee'])}`
							};

						case 'CreatedInFuture':
							return {
								success: false,
								message: `Created in future: ${transferFromError[transferFromErrorKey]['ledger_time']}`
							};

						case 'TooOld':
							return { success: false, message: `The transfer is too old.` };

						case 'InsufficientFunds':
							return {
								success: false,
								message: `Insufficient funds, balance: ${bigintE8sToNumber(transferFromError[transferFromErrorKey]['balance'])}`
							};

						default:
							return { success: false, message: 'Unknown transferfrom error.' };
					}

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
		default:
			return { success: false, message: 'Unknown Error.' };
	}
}

export function handleRetrieveResult(result: Result_4): ConversionResult {
	const key = Object.keys(result)[0] as keyof Result_4;

	switch (key) {
		case 'Ok':
			return {
				success: true,
				message: `Successful conversion at block index ${result[key]['block_index']}`
			};
		case 'Err':
			const error = result[key];
			const errorKey = Object.keys(result[key])[0];
			switch (errorKey) {
				case 'GenericError':
					return { success: false, message: `Generic Error: ${error[errorKey]['message']}` };

				case 'TransferError':
					const transferError = error[errorKey];
					const transferErrorKey = Object.keys(error[errorKey])[0];

					switch (transferErrorKey) {
						case 'GenericError':
							return {
								success: false,
								message: `Generic Error: ${transferError[transferErrorKey]['message']}`
							};

						case 'TemporarilyUnavailable':
							return { success: false, message: 'Ledger is temporarily unavailable.' };

						case 'BadBurn':
							return {
								success: false,
								message: `Bad burn, minimum burn amount: ${bigintE8sToNumber(transferError[transferErrorKey]['min_burn_amount'])}`
							};

						case 'Duplicate':
							return {
								success: false,
								message: `Duplicate, already occurring transfer: ${transferError[transferErrorKey]['duplicate_of']}`
							};

						case 'BadFee':
							return {
								success: false,
								message: `Bad fee, expected: ${bigintE8sToNumber(transferError[transferErrorKey]['expected_fee'])}`
							};

						case 'CreatedInFuture':
							return {
								success: false,
								message: `Created in future: ${transferError[transferErrorKey]['ledger_time']}`
							};

						case 'TooOld':
							return { success: false, message: `Transfer is too old.` };

						case 'InsufficientFunds':
							return {
								success: false,
								message: `Insufficient funds, balance: ${bigintE8sToNumber(transferError[transferErrorKey]['balance'])}`
							};

						default:
							return { success: false, message: 'Unknown transferfrom error.' };
					}

				case 'AmountTooLow':
					return {
						success: false,
						message: `Amount too low, minimum amount: ${bigintE8sToNumber(error[errorKey]['minimum_amount_e8s'])}`
					};

				case 'TransferFromError':
					const transferFromError = error[errorKey][0];
					const transferFromErrorKey = Object.keys(error[errorKey][0])[0];

					switch (transferFromErrorKey) {
						case 'GenericError':
							return {
								success: false,
								message: `Generic Error: ${transferFromError[transferFromErrorKey]['message']}`
							};

						case 'TemporarilyUnavailable':
							return { success: false, message: 'Ledger is temporarily unavailable.' };

						case 'InsufficientAllowance':
							return {
								success: false,
								message: `Insufficient allowance, current allowance: ${bigintE8sToNumber(transferFromError[transferFromErrorKey]['allowance'])}`
							};

						case 'BadBurn':
							return {
								success: false,
								message: `Bad burn, minimum burn amount: ${bigintE8sToNumber(transferFromError[transferFromErrorKey]['min_burn_amount'])}`
							};

						case 'Duplicate':
							return {
								success: false,
								message: `Duplicate. Already occurring transfer: ${transferFromError[transferFromErrorKey]['duplicate_of']}`
							};

						case 'BadFee':
							return {
								success: false,
								message: `Bad fee. Expected fee: ${bigintE8sToNumber(transferFromError[transferFromErrorKey]['expected_fee'])}`
							};

						case 'CreatedInFuture':
							return {
								success: false,
								message: `Created in future: ${bigintE8sToNumber(transferFromError[transferFromErrorKey]['ledger_time'])}`
							};

						case 'TooOld':
							return { success: false, message: `The transfer is too old.` };

						case 'InsufficientFunds':
							return {
								success: false,
								message: `Insufficient funds. Balance: ${bigintE8sToNumber(transferFromError[transferFromErrorKey]['balance'])}`
							};

						default:
							return { success: false, message: 'Unknown transferfrom error.' };
					}

				case 'GuardError':
					const guardErrorKey = Object.keys(error[errorKey])[0];

					switch (guardErrorKey) {
						case 'AlreadyProcessing':
							return { success: false, message: `Guard Error. Conversion already processing.` };
						case 'TooManyConcurrentRequests':
							return { success: false, message: `Guard Error. Too many concurrent requests.` };
					}

				default:
					return { success: false, message: DEFAULT_ERROR_MESSAGE };
			}
		default:
			return { success: false, message: 'Unknown Error.' };
	}
}

export function handleTransferResult(result: TransferResult): ConversionResult {
	const key = Object.keys(result)[0] as keyof TransferResult;

	switch (key) {
		case 'Ok':
			return {
				success: true,
				message: `Successful transfer at <a target='_blank' style="text-decoration: underline; color: var(--text-color);" href=https://dashboard.internetcomputer.org/transaction/${result[key]}>block index ${result[key]}</a>.`
			};
		case 'Err': {
			const error = result[key];
			const errorKey = Object(error[key])[0];

			switch (errorKey) {
				case 'TxTooOld':
					return { success: false, message: `The transfer is too old.` };
				case 'BadFee':
					return {
						success: false,
						message: `Bad fee, expected: ${bigintE8sToNumber(error[errorKey]['expected_fee'])}`
					};
				case 'TxDuplicate':
					return {
						success: false,
						message: `Duplicate, already occurring transfer: ${error[errorKey]['duplicate_of']}`
					};
				case 'TxCreatedInFuture':
					return {
						success: false,
						message: `The transfer is created in future.`
					};

				case 'InsufficientFunds':
					return {
						success: false,
						message: `Insufficient funds, balance: ${bigintE8sToNumber(error[errorKey]['balance'])}`
					};
				default:
					return {
						success: false,
						message: `Unknown Error. Try again and verify the Account Id.`
					};
			}
		}

		default:
			return {
				success: false,
				message: `Unknown Error. Try again.`
			};
	}
}

export function handleIcrcTransferResult(result: Icrc1TransferResult): ConversionResult {
	const key = Object.keys(result)[0] as keyof TransferResult;

	switch (key) {
		case 'Ok':
			return {
				success: true,
				message: `Successful transfer at <a target='_blank' style="text-decoration: underline; color: var(--text-color);" href=https://dashboard.internetcomputer.org/transaction/${result[key]}>block index ${result[key]}</a>.`
			};
		case 'Err': {
			const error = result[key];
			const errorKey = Object(error[key])[0];

			switch (errorKey) {
				case 'TooOld':
					return { success: false, message: `The transfer is too old.` };
				case 'BadFee':
					return {
						success: false,
						message: `Bad fee, expected: ${bigintE8sToNumber(error[errorKey]['min_burn_amount'])}`
					};
				case 'Duplicate':
					return {
						success: false,
						message: `Duplicate transfer of: ${error[errorKey]['duplicate_of']}`
					};
				case 'CreatedInFuture':
					return {
						success: false,
						message: `Created in future: ${error[errorKey]['ledger_time']}`
					};

				case 'InsufficientFunds':
					return {
						success: false,
						message: `Insufficient funds, balance: ${bigintE8sToNumber(error[errorKey]['balance'])}`
					};

				case 'GenericError':
					return { success: false, message: `Generic Error: ${error[errorKey]['message']}` };

				case 'TemporarilyUnavailable':
					return { success: false, message: 'Ledger is temporarily unavailable.' };

				case 'BadBurn':
					return {
						success: false,
						message: `Bad burn, minimum burn amount: ${bigintE8sToNumber(error[errorKey]['min_burn_amount'])}`
					};

				default:
					return {
						success: false,
						message: `Unknown Error. Try again and verify the Account Id.`
					};
			}
		}

		default:
			return {
				success: false,
				message: DEFAULT_ERROR_MESSAGE
			};
	}
}
