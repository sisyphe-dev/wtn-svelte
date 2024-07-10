import BigNumber from "bignumber.js";

export function displayPrincipal(principal: string) {
	const a = principal.split('-');
	return a[0] + '...' + a[a.length - 1];
}

export function displayUsFormat(value: number, decimals = 2): string {
	const formatter = new Intl.NumberFormat('en-US', {
		minimumFractionDigits: 0,
		maximumFractionDigits: decimals
	});

	return formatter.format(value);
}

// The bignumber.js library allows precise operations to avoid JavaScript unprecise handling of floating-point arithmetic.
export function numberWithPrecision(x: number, decimals: number): number {
	const xScaled = Math.floor(BigNumber(x).multipliedBy(Math.pow(10, decimals)).toNumber());
	return BigNumber(xScaled).dividedBy(Math.pow(10, decimals)).toNumber();
}

export function numberToBigintE8s(x: number): bigint {
	const xScaled = BigNumber(numberWithPrecision(x, 8)).multipliedBy(1e8).toNumber();
	return BigInt(xScaled);
}

export function bigintE8sToNumber(x: bigint): number {
	return BigNumber(Number(x)).dividedBy(1e8).toNumber();
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

	getTransferFee(): number {
		switch (this.type) {
			case AssetType.ICP:
				return 0.0001;
			case AssetType.nICP:
				return 0.0001;
			case AssetType.WTN:
				return 0.01;
		}
	}
}
