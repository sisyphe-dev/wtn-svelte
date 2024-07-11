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

export function numberWithPrecision(x: number, decimals: number): number {
	return Math.floor(x * 10 ** decimals) / 10 ** decimals;
}

export function numberToBigintE8s(x: number): bigint {
	return BigInt(Math.floor(numberWithPrecision(x, 8) * 1e8));
}

export function bigintE8sToNumber(x: bigint): number {
	return Number(x) / 1e8;
}

export enum AssetType {
	ICP,
	nICP,
	WTN
}

interface AssetProps {
	intoStr(): string;
	getUrl(): string;
	type(): AssetType;
}

export class Asset implements AssetProps {
	private asset_type: AssetType;

	constructor(asset: AssetType) {
		this.asset_type = asset;
	}

	intoStr(): string {
		switch (this.asset_type) {
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
		switch (this.asset_type) {
			case AssetType.ICP:
				return '/tokens/icp.webp';
			case AssetType.nICP:
				return '/tokens/nicp.png';
			case AssetType.WTN:
				return '/tokens/WTN.png';
		}
	}

	type(): AssetType {
		return this.asset_type;
	}
}
