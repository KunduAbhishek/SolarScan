import { describe, expect, test } from 'vitest';
import type { SolarPanelConfig } from './solar';
import { findSolarConfig, pickSolarConfigId, showMoney, showNumber } from './utils';

const configs = [1000, 2000, 3000].map(
  (yearlyEnergyDcKwh, i): SolarPanelConfig => ({
    panelsCount: i + 1,
    yearlyEnergyDcKwh,
    roofSegmentSummaries: [],
  }),
);

describe('findSolarConfig', () => {
  test('returns the first config that covers the consumption', () => {
    expect(findSolarConfig(configs, 1500, 1, 1)).toBe(1);
    expect(findSolarConfig(configs, 1000, 1, 1)).toBe(0);
  });

  test('takes the panel capacity ratio and the DC to AC derate into account', () => {
    expect(findSolarConfig(configs, 1500, 2, 1)).toBe(0);
    expect(findSolarConfig(configs, 1500, 1, 0.5)).toBe(2);
  });

  test('returns -1 when no config is enough', () => {
    expect(findSolarConfig(configs, 10000, 1, 1)).toBe(-1);
  });
});

describe('pickSolarConfigId', () => {
  test('matches findSolarConfig when a config is enough', () => {
    expect(pickSolarConfigId(configs, 1500, 1, 1)).toBe(1);
  });

  test('falls back to the largest config', () => {
    expect(pickSolarConfigId(configs, 10000, 1, 1)).toBe(2);
    expect(pickSolarConfigId([], 10000, 1, 1)).toBe(0);
  });
});

describe('formatting', () => {
  test('showNumber keeps one decimal at most', () => {
    expect(showNumber(1234.567)).toBe(
      (1234.6).toLocaleString(undefined, { maximumFractionDigits: 1 }),
    );
  });

  test('showMoney always shows cents', () => {
    expect(showMoney(5)).toContain('5.00');
    expect(showMoney(5).startsWith('$')).toBe(true);
  });
});
