import type { SolarPanelConfig } from './solar';

export interface FinanceInputs {
  // Basic settings
  monthlyAverageEnergyBill: number;
  energyCostPerKwh: number;
  panelCapacityWatts: number;
  solarIncentives: number;
  installationCostPerWatt: number;
  installationLifeSpan: number;
  // Advanced settings
  dcToAcDerate: number;
  efficiencyDepreciationFactor: number;
  costIncreaseFactor: number;
  discountRate: number;
}

export const defaultFinanceInputs: FinanceInputs = {
  monthlyAverageEnergyBill: 300,
  energyCostPerKwh: 0.31,
  panelCapacityWatts: 250,
  solarIncentives: 7000,
  installationCostPerWatt: 4.0,
  installationLifeSpan: 20,
  dcToAcDerate: 0.85,
  efficiencyDepreciationFactor: 0.995,
  costIncreaseFactor: 1.022,
  discountRate: 1.04,
};

export interface Financials {
  panelCapacityRatio: number;
  installationSizeKw: number;
  installationCostTotal: number;
  yearlyKwhEnergyConsumption: number;
  yearlyProductionAcKwh: number[];
  yearlyUtilityBillEstimates: number[];
  yearlyCostWithoutSolar: number[];
  cumulativeCostsWithSolar: number[];
  cumulativeCostsWithoutSolar: number[];
  remainingLifetimeUtilityBill: number;
  totalCostWithSolar: number;
  totalCostWithoutSolar: number;
  savings: number;
  energyCovered: number;
  /** Index of the first year in which solar is cheaper overall, or -1 if it never is. */
  breakEvenYear: number;
}

const sum = (xs: number[]) => xs.reduce((x, y) => x + y, 0);
const cumulative = (xs: number[]) => {
  let total = 0;
  return xs.map((x) => (total += x));
};

/**
 * Financial model for the USA, from
 * https://developers.google.com/maps/documentation/solar/calculate-costs-us
 *
 * @param inputs                     User settings.
 * @param config                     Selected solar panel configuration, if any.
 * @param defaultPanelCapacityWatts  Panel capacity the Solar API based its estimates on.
 */
export function computeFinancials(
  inputs: FinanceInputs,
  config: SolarPanelConfig | undefined,
  defaultPanelCapacityWatts: number,
): Financials {
  const panelCapacityRatio = inputs.panelCapacityWatts / defaultPanelCapacityWatts;

  // Solar installation
  const installationSizeKw = ((config?.panelsCount ?? 0) * inputs.panelCapacityWatts) / 1000;
  const installationCostTotal = inputs.installationCostPerWatt * installationSizeKw * 1000;

  // Energy consumption
  const monthlyKwhEnergyConsumption = inputs.monthlyAverageEnergyBill / inputs.energyCostPerKwh;
  const yearlyKwhEnergyConsumption = monthlyKwhEnergyConsumption * 12;

  // Energy produced for installation life span
  const initialAcKwhPerYear =
    (config?.yearlyEnergyDcKwh ?? 0) * panelCapacityRatio * inputs.dcToAcDerate;
  const years = [...Array(inputs.installationLifeSpan).keys()];
  const yearlyProductionAcKwh = years.map(
    (year) => initialAcKwhPerYear * inputs.efficiencyDepreciationFactor ** year,
  );

  // Cost with solar for installation life span
  const yearlyUtilityBillEstimates = yearlyProductionAcKwh.map((yearlyKwhEnergyProduced, year) => {
    const billEnergyKwh = yearlyKwhEnergyConsumption - yearlyKwhEnergyProduced;
    const billEstimate =
      (billEnergyKwh * inputs.energyCostPerKwh * inputs.costIncreaseFactor ** year) /
      inputs.discountRate ** year;
    return Math.max(billEstimate, 0); // bill cannot be negative
  });
  const remainingLifetimeUtilityBill = sum(yearlyUtilityBillEstimates);
  const totalCostWithSolar =
    installationCostTotal + remainingLifetimeUtilityBill - inputs.solarIncentives;

  // Cost without solar for installation life span
  const yearlyCostWithoutSolar = years.map(
    (year) =>
      (inputs.monthlyAverageEnergyBill * 12 * inputs.costIncreaseFactor ** year) /
      inputs.discountRate ** year,
  );
  const totalCostWithoutSolar = sum(yearlyCostWithoutSolar);

  // Cumulative costs, used for the chart and the break even year.
  const cumulativeCostsWithSolar = cumulative(
    yearlyUtilityBillEstimates.map((billEstimate, i) =>
      i == 0 ? billEstimate + installationCostTotal - inputs.solarIncentives : billEstimate,
    ),
  );
  const cumulativeCostsWithoutSolar = cumulative(yearlyCostWithoutSolar);
  const breakEvenYear = cumulativeCostsWithSolar.findIndex(
    (costWithSolar, i) => costWithSolar <= cumulativeCostsWithoutSolar[i],
  );

  return {
    panelCapacityRatio,
    installationSizeKw,
    installationCostTotal,
    yearlyKwhEnergyConsumption,
    yearlyProductionAcKwh,
    yearlyUtilityBillEstimates,
    yearlyCostWithoutSolar,
    cumulativeCostsWithSolar,
    cumulativeCostsWithoutSolar,
    remainingLifetimeUtilityBill,
    totalCostWithSolar,
    totalCostWithoutSolar,
    savings: totalCostWithoutSolar - totalCostWithSolar,
    energyCovered: yearlyProductionAcKwh[0] / yearlyKwhEnergyConsumption,
    breakEvenYear,
  };
}
