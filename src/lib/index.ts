import type { Principal } from '@dfinity/principal';
import BigNumber from 'bignumber.js';
import type { NeuronId, WithdrawalStatus } from '../declarations/water_neuron/water_neuron.did';
import { DEV } from './authentification';

export const E8S = BigNumber(10).pow(BigNumber(8));

export function displayPrincipal(principal: Principal) {
	const a = principal.toString().split('-');
	return a[0] + '...' + a[a.length - 1];
}

export function displayUsFormat(value: BigNumber, decimals = 2): string {
	const formatter = new Intl.NumberFormat('en-US', {
		minimumFractionDigits: 0,
		maximumFractionDigits: decimals
	});

	return formatter.format(value.toNumber()).replace(/,/g, "'");
}

export function numberWithPrecision(x: BigNumber, decimals: BigNumber): BigNumber {
	const scaleFactor = BigNumber(10).pow(decimals);
	const xScaled = BigNumber(x).multipliedBy(scaleFactor).integerValue(BigNumber.ROUND_FLOOR);
	return BigNumber(xScaled ? xScaled : 0).dividedBy(scaleFactor);
}

export function numberToBigintE8s(x: BigNumber): bigint {
	const xScaled = numberWithPrecision(x, BigNumber(8)).multipliedBy(E8S);
	return BigInt(xScaled.toNumber());
}

export function bigintE8sToNumber(x: bigint): BigNumber {
	return BigNumber(Number(x)).dividedBy(E8S);
}

export enum AssetType {
	ICP,
	nICP,
	WTN
}

export class Asset {
	public type: AssetType;

	constructor(asset: AssetType) {
		this.type = asset;
	}

	intoStr(): string {
		switch (this.type) {
			case AssetType.ICP:
				return 'ICP';
			case AssetType.nICP:
				return 'nICP';
			case AssetType.WTN:
				return 'WTN';
			default:
				throw new Error('Unknown asset');
		}
	}

	getUrl(): string {
		switch (this.type) {
			case AssetType.ICP:
				return '/tokens/icp.webp';
			case AssetType.nICP:
				return '/tokens/nicp.png';
			case AssetType.WTN:
				return '/tokens/WTN.png';
		}
	}

	getTransferFee(): BigNumber {
		switch (this.type) {
			case AssetType.ICP:
				return BigNumber(0.0001);
			case AssetType.nICP:
				return BigNumber(0.0001);
			case AssetType.WTN:
				return BigNumber(0.01);
		}
	}
}

export const TIERS: [BigNumber, BigNumber][] = [
	[BigNumber(80_000), BigNumber(8)],
	[BigNumber(160_000), BigNumber(4)],
	[BigNumber(320_000), BigNumber(2)],
	[BigNumber(640_000), BigNumber(1)],
	[BigNumber(1_280_000), BigNumber(0.5)],
	[BigNumber(2_560_000), BigNumber(0.25)],
	[BigNumber(5_120_000), BigNumber(0.125)]
];

export const EXPECTED_INITIAL_BALANCE: BigNumber = BigNumber(4_480_000);

export function computeRewards(alreadyDistributed: BigNumber, converting: BigNumber): BigNumber {
	let totalRewards = BigNumber(0);
	let amountToDistribute = BigNumber(converting);
	let cumulativeAmount = BigNumber(alreadyDistributed);

	for (const [threshold, rate] of TIERS) {
		const nicpThreshold = BigNumber(threshold);
		const allocationRate = BigNumber(rate);
		if (cumulativeAmount.comparedTo(nicpThreshold) === 1) {
			cumulativeAmount = cumulativeAmount.minus(nicpThreshold);
			continue;
		}
		const tierAvailable = nicpThreshold.minus(cumulativeAmount);
		cumulativeAmount = BigNumber(0);
		const amountInThisTier = BigNumber(
			Math.min(amountToDistribute.toNumber(), tierAvailable.toNumber())
		);

		totalRewards = totalRewards.plus(amountInThisTier.multipliedBy(allocationRate));

		amountToDistribute = amountToDistribute.minus(amountInThisTier);

		if (amountToDistribute.comparedTo(BigNumber(0)) === 0) {
			break;
		}
	}

	return totalRewards;
}

export async function renderStatus(status: WithdrawalStatus): Promise<string> {
	if ('ConversionDone' in status) {
		return `<p>
	  Conversion done at{" "}
	  <a
		target="_blank"
		rel="noreferrer"
		href={
		  ${
				'https://dashboard.internetcomputer.org/transaction/' +
				status.ConversionDone.transfer_block_height
			}
		}
	  >
		${'height ' + status.ConversionDone.transfer_block_height}
	  </a>
	</p>`;
	} else if ('NotFound' in status) {
		return 'Not Found';
	} else if ('WaitingToSplitNeuron' in status) {
		return 'Waiting to Split Neuron';
	} else if ('WaitingDissolvement' in status) {
		if (status.WaitingDissolvement.neuron_id.id) {
			return displayStatus(status.WaitingDissolvement.neuron_id);
		} else {
			return 'Waiting dissolvement';
		}
	} else if ('WaitingToStartDissolving' in status) {
		return `Waiting to Start Dissolving (Neuron ID: ${status.WaitingToStartDissolving.neuron_id.id})`;
	}
	return 'Unknown Status';
}

export async function displayStatus(neuron_id: NeuronId): Promise<string> {
	if (DEV) {
		return 'Waiting dissolvement';
	}
	try {
		const response = await fetch('https://ic-api.internetcomputer.org/api/v3/neurons/' + neuron_id);
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		const data = await response.json();
		const neuron_created_at = data['created_timestamp_seconds'];
		return displayTimeLeft(Number(neuron_created_at));
	} catch (error) {
		throw new Error('Failed to fetch with error: ' + error);
	}
}

function displayTimeLeft(created_at: number) {
	const currentTimestamp = Math.floor(Date.now() / 1000);
	const sixMonthsInSeconds = 6 * 30.44 * 24 * 60 * 60;
	const timeLeft = created_at + sixMonthsInSeconds - currentTimestamp;
	const daysLeft = Math.floor(timeLeft / 60 / 60 / 24);
	const hoursLeft = Math.floor((timeLeft - daysLeft * 60 * 60 * 24) / 60 / 60);

	return `Dissolvement in ${daysLeft} days and ${hoursLeft} hours`;
}
