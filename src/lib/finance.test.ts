import { describe, expect, test } from 'vitest';
import { computeFinancials, defaultFinanceInputs, type FinanceInputs } from './finance';
import type { SolarPanelConfig } from './solar';

// Round numbers so that every expected value below can be checked by hand:
// consumption = 100 / 0.5 * 12 = 2400 kWh/year, production = 3000 * 0.5 = 1500 kWh/year.
const inputs: FinanceInputs = {
  monthlyAverageEnergyBill: 100,
  energyCostPerKwh: 0.5,
  panelCapacityWatts: 400,
  solarIncentives: 1000,
  installationCostPerWatt: 2,
  installationLifeSpan: 2,
  dcToAcDerate: 0.5,
  efficiencyDepreciationFactor: 1,
  costIncreaseFactor: 1,
  discountRate: 1,
};
const config: SolarPanelConfig = {
  panelsCount: 10,
  yearlyEnergyDcKwh: 3000,
  roofSegmentSummaries: [],
};

describe('computeFinancials', () => {
  test('computes the costs and savings', () => {
    const f = computeFinancials(inputs, config, 400);
    expect(f.panelCapacityRatio).toBe(1);
    expect(f.installationSizeKw).toBe(4);
    expect(f.installationCostTotal).toBe(8000);
    expect(f.yearlyKwhEnergyConsumption).toBe(2400);
    expect(f.yearlyProductionAcKwh).toEqual([1500, 1500]);
    // (2400 - 1500) kWh * $0.5 = $450 per year.
    expect(f.yearlyUtilityBillEstimates).toEqual([450, 450]);
    expect(f.totalCostWithSolar).toBe(8000 + 900 - 1000);
    expect(f.totalCostWithoutSolar).toBe(2400);
    expect(f.savings).toBe(2400 - 7900);
    expect(f.energyCovered).toBe(1500 / 2400);
    expect(f.cumulativeCostsWithSolar).toEqual([7450, 7900]);
    expect(f.cumulativeCostsWithoutSolar).toEqual([1200, 2400]);
    expect(f.breakEvenYear).toBe(-1);
  });

  test('scales the energy by the panel capacity ratio', () => {
    // Panels twice as powerful as the ones the Solar API assumed produce twice the energy.
    const f = computeFinancials({ ...inputs, panelCapacityWatts: 800 }, config, 400);
    expect(f.panelCapacityRatio).toBe(2);
    expect(f.yearlyProductionAcKwh[0]).toBe(3000);
  });

  test('the utility bill is never negative', () => {
    const f = computeFinancials({ ...inputs, dcToAcDerate: 1 }, config, 400);
    // Production (3000) exceeds consumption (2400).
    expect(f.yearlyUtilityBillEstimates).toEqual([0, 0]);
  });

  test('finds the break even year', () => {
    const cheap = { ...inputs, installationCostPerWatt: 0.1 };
    const f = computeFinancials(cheap, config, 400);
    // Year 0: 450 + 400 - 1000 = -150 with solar, versus 1200 without.
    expect(f.breakEvenYear).toBe(0);
  });

  test('applies the yearly factors', () => {
    const f = computeFinancials(
      {
        ...inputs,
        installationLifeSpan: 3,
        efficiencyDepreciationFactor: 0.5,
        costIncreaseFactor: 2,
        discountRate: 4,
      },
      config,
      400,
    );
    expect(f.yearlyProductionAcKwh).toEqual([1500, 750, 375]);
    // 1200 * (2 / 4) ^ year
    expect(f.yearlyCostWithoutSolar).toEqual([1200, 600, 300]);
    // (2400 - production) * 0.5 * (2 / 4) ^ year
    expect(f.yearlyUtilityBillEstimates).toEqual([450, 412.5, 253.125]);
  });

  test('handles a missing configuration', () => {
    const f = computeFinancials(defaultFinanceInputs, undefined, 250);
    expect(f.installationSizeKw).toBe(0);
    expect(f.yearlyProductionAcKwh.every((x) => x == 0)).toBe(true);
  });
});
