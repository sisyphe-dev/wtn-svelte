import { test, expect } from '@playwright/test';
import * as fc from 'fast-check';
import {
	numberWithPrecision,
	numberToBigintE8s,
	bigintE8sToNumber,
	TIERS,
	EXPECTED_INITIAL_BALANCE,
	computeRewards,
	displayUsFormat,
	displayPrincipal,
	principalToHex,
	isPrincipalValid,
	displayTimeLeft,
	renderStatus,
	getMaybeAccount
} from '$lib';
import BigNumber from 'bignumber.js';
import { Principal } from '@dfinity/principal';
import type { WithdrawalStatus, NeuronId } from '../src/declarations/water_neuron/water_neuron.did';

const EPSILON = BigNumber(0.00000001);
const VALID_PRINCIPAL = 'l72el-pt5ry-lmj66-3opyw-tl5xx-3wzfl-n3mja-dqirc-oxmqs-uxqe6-6qe';
const WRONG_PRINCIPAL = 'aaaaa-aaaaa-aaaaa-aaaaa-aaaaa-aaaaa-aaaaa-aaaaa-aaaaa-aaaa-aaa';
const ACCOUNT_ID = 'e73a99617af2a8dbfe9b75e463e83a905e30aa50250972ad19c21922c22b2a2a';
const VALID_ACCOUNT =
	'bd3sg-teaaa-aaaaa-qaaba-cai-dl7sbni.4de8758e1d99bd2d97a384af0ffed63403886967d21070e5241b602ebe39f243';
const WRONG_ACCOUNT =
	'bd3sg-teaaa-aaaaa-qaaba-cai-aaaaaaa.4de8758e1d99bd2d97a384af0ffed63403886967d21070e5241b602ebe39f243';

test('numberWithPrecision test', () => {
	expect(numberWithPrecision(BigNumber(12.436), BigNumber(2)).eq(BigNumber(12.43))).toBeTruthy();
	expect(
		numberWithPrecision(BigNumber(1312.436), BigNumber(8)).eq(BigNumber(1312.436))
	).toBeTruthy();

	fc.assert(
		fc.property(
			fc.tuple(
				fc.integer({ min: 0, max: 10 }),
				fc.float({ min: 0, max: 1_000_000_000, noNaN: true })
			),
			([n, x]) => {
				const ref = BigNumber(x);
				const greater = BigNumber(x).plus(EPSILON);
				const decimals = BigNumber(n);
				const greaterThan = numberWithPrecision(greater, decimals).isGreaterThanOrEqualTo(
					numberWithPrecision(ref, decimals)
				);
				expect(greaterThan).toBeTruthy();
			}
		)
	);

	fc.assert(
		fc.property(
			fc.tuple(
				fc.integer({ min: 0, max: 1_000_000_000 }),
				fc.float({ min: 0, max: Math.fround(EPSILON.toNumber()), noNaN: true })
			),
			([n, x]) => {
				const ref = BigNumber(n).plus(BigNumber(x));
				const greater = ref.plus(EPSILON);
				expect(
					numberWithPrecision(greater, BigNumber(8)).isGreaterThan(
						numberWithPrecision(ref, BigNumber(8))
					)
				).toBeTruthy();
			}
		)
	);
});

test('numberToBigintE8s test', () => {
	expect(numberToBigintE8s(BigNumber(1312.436))).toBe(BigInt(131243600000));
	fc.assert(
		fc.property(
			fc.tuple(
				fc.integer({ min: 0, max: 1_000_000_000 }),
				fc.float({ min: 0, max: 1, noNaN: true })
			),
			([n, x]) => {
				const ref = BigNumber(n);
				const greater = ref.plus(BigNumber(x));

				if (x < EPSILON.toNumber()) {
					expect(numberToBigintE8s(greater)).toEqual(numberToBigintE8s(ref));
				} else {
					expect(numberToBigintE8s(greater)).toBeGreaterThan(numberToBigintE8s(ref));
				}
			}
		)
	);
});

test('bigintE8sToNumber test', () => {
	expect(bigintE8sToNumber(131243600000n).eq(BigNumber(1312.436))).toBeTruthy();

	fc.assert(
		fc.property(fc.integer({ min: 0, max: 1_000_000_000_000_000 }), (n) => {
			const ref = BigInt(n);
			const greater = ref + 1n;
			expect(bigintE8sToNumber(greater).isGreaterThan(bigintE8sToNumber(ref))).toBeTruthy();
		})
	);
});

test('computeRewards', () => {
	const totalThresholds = TIERS.reduce((acc, [threshold, _]) => acc + threshold.toNumber(), 0);
	expect(computeRewards(BigNumber(20_000), BigNumber(100)).eq(BigNumber(800))).toBeTruthy();
	expect(computeRewards(BigNumber(0), BigNumber(10)).eq(BigNumber(80))).toBeTruthy();
	expect(computeRewards(BigNumber(totalThresholds), BigNumber(10)).isZero()).toBeTruthy();
	expect(totalThresholds).toBe(10_160_000);

	const total = TIERS.reduce(
		(acc, [threshold, amount]) => acc + threshold.toNumber() * amount.toNumber(),
		0
	);
	expect(BigNumber(total).eq(EXPECTED_INITIAL_BALANCE)).toBeTruthy();
});

test('Display US-format', () => {
	expect(displayUsFormat(BigNumber(1_000_000.0123942))).toBe("1'000'000.0124");
	expect(displayUsFormat(BigNumber(1_000_000.018942))).toBe("1'000'000.0189");
	expect(displayUsFormat(BigNumber(1_000_000.0123942), 8)).toBe("1'000'000.0123942");
});

test('Test truncated format for principal', () => {
	const principal = Principal.fromText(
		'l72el-pt5ry-lmj66-3opyw-tl5xx-3wzfl-n3mja-dqirc-oxmqs-uxqe6-6qe'
	);
	expect(displayPrincipal(principal)).toBe('l72el...6qe');
});

test('Should display the hex from the acccount identifier when the principal is valid.', () => {
	expect(principalToHex(VALID_PRINCIPAL)).toBe(
		'e73a99617af2a8dbfe9b75e463e83a905e30aa50250972ad19c21922c22b2a2a'
	);
	expect(principalToHex(WRONG_PRINCIPAL)).toBe('');
});

test('check if the principal is valid', () => {
	expect(isPrincipalValid(VALID_PRINCIPAL)).toBeTruthy();
	expect(isPrincipalValid(WRONG_PRINCIPAL)).toBeFalsy();
});

test('check time display', () => {
	const now = Math.floor(Date.now() / 1_000);
	const sixMonthsInSeconds = 6 * 30.44 * 24 * 60 * 60;
	expect(displayTimeLeft(now - sixMonthsInSeconds)).toBe('Less than an hour left');
	expect(displayTimeLeft(now - sixMonthsInSeconds, true)).toBe('Less than an hour left');
	expect(displayTimeLeft(now)).toBe('182 days and 15 hours left');
	expect(displayTimeLeft(now, true)).toBe('182 days left');
	expect(displayTimeLeft(now - 15 * 60 * 60)).toBe('182 days left');
	expect(displayTimeLeft(now + 2 * 60 * 60 - sixMonthsInSeconds)).toBe('2 hours left');
});

test('check withdrawal status display', () => {
	let status = {
		ConversionDone: { transfer_block_height: 1000n }
	} as WithdrawalStatus;

	expect(renderStatus(status)).toBe(`<p>
	  Conversion done at{" "}
	  <a
		target="_blank"
		rel="noreferrer"
		href={https://dashboard.internetcomputer.org/transaction/1000}
	  >
		Height 1000
	  </a>
	</p>`);

	status = {
		NotFound: null
	} as WithdrawalStatus;

	expect(renderStatus(status)).toBe('Not found');

	status = {
		WaitingToSplitNeuron: null
	} as WithdrawalStatus;

	expect(renderStatus(status)).toBe('Waiting to Split Neuron');

	status = {
		WaitingDissolvement: { neuron_id: { id: 20387492837429837n } as NeuronId }
	} as WithdrawalStatus;

	expect(renderStatus(status)).toBe('Waiting Dissolvement');

	status = {
		WaitingToStartDissolving: { neuron_id: { id: 20387492837429837n } as NeuronId }
	} as WithdrawalStatus;

	expect(renderStatus(status)).toBe('Waiting to Start Dissolving');
});

test('getMaybeAccount test', () => {
	expect(getMaybeAccount(ACCOUNT_ID)).toBeDefined();
	expect(getMaybeAccount(VALID_PRINCIPAL)).toBeDefined();
	expect(getMaybeAccount(WRONG_PRINCIPAL)).not.toBeDefined();
	expect(getMaybeAccount(VALID_ACCOUNT)).toBeDefined();
	expect(getMaybeAccount(WRONG_ACCOUNT)).not.toBeDefined();
});