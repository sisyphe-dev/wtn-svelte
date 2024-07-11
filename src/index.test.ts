import { describe, it, expect } from 'vitest';
import { numberWithPrecision, numberToBigintE8s, bigintE8sToNumber } from '$lib';

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
