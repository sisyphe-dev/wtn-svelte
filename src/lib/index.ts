export function displayUsFormat(value: number): string {
	const formatter = new Intl.NumberFormat('en');

	return formatter.format(value);
}

export function displayPrincipal(principal: string) {
	const a = principal.split('-');
	return a[0] + '...' + a[a.length - 1];
}

export function numberWithDecimals(x: number, decimals: number): number {
	return Math.floor(x * 10 ** decimals) / 10 ** decimals;
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
