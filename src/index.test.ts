import { describe, it, expect } from 'vitest';
import {
	numberWithPrecision,
	numberToBigintE8s,
	bigintE8sToNumber,
	TIERS,
	EXPECTED_INITIAL_BALANCE,
	computeRewards
} from '$lib';

describe('numberWithPrecision test', () => {
	it('Round a value with a given number of decimals', () => {
		expect(numberWithPrecision(12.436, 2)).toBe(12.43);
		expect(numberWithPrecision(1312.436, 8)).toBe(1312.436);
	});
});

describe('numberToBigintE8s test', () => {
	it('Scale a number with an e8s format and make it a bigint.', () => {
		expect(numberToBigintE8s(1312.436)).toBe(BigInt(131243600000));
	});
});

describe('bigintE8sToNumber test', () => {
	it('Unscale a number with an e8s format and make it a number.', () => {
		expect(bigintE8sToNumber(131243600000n)).toBe(1312.436);
	});
});

describe('computeRewards', () => {
	it('should return expected rewards', () => {
		const totalThresholds = TIERS.reduce((acc, [threshold, _]) => acc + threshold, 0);
		expect(computeRewards(20_000, 100)).toBe(800);
		expect(computeRewards(0, 10)).toBe(80);
		expect(computeRewards(totalThresholds, 10)).toBe(0);
		expect(totalThresholds).toBe(10_160_000);
	});

	it('tiers should add up to expected', () => {
		const total = TIERS.reduce((acc, [threshold, amount]) => acc + threshold * amount, 0);
		expect(total).toBe(EXPECTED_INITIAL_BALANCE);
	});
});
