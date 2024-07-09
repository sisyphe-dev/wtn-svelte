import { describe, it, expect } from 'vitest';
import { numberWithDecimals } from '$lib';

describe('numberWithDecimals test', () => {
	it('Round a value with a given number of decimals', () => {
		expect(numberWithDecimals(12.436, 2)).toBe(12.43);
		expect(numberWithDecimals(12.436, 8)).toBe(12.436);
	});
});
