import { describe, it, expect } from 'vitest';
import { numberWithPrecision } from '$lib';

describe('numberWithPrecision test', () => {
	it('Round a value with a given number of decimals', () => {
		expect(numberWithPrecision(12.436, 2)).toBe(12.43);
		expect(numberWithPrecision(12.436, 8)).toBe(12.436);
	});
});
