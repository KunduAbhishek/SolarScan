/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleCharts } from 'google-charts';
import { useEffect, useMemo, useRef, useState } from 'react';
import Collapsible from '../components/Collapsible';
import Expandable from '../components/Expandable';
import InputMoney from '../components/InputMoney';
import InputNumber from '../components/InputNumber';
import InputPanelsCount from '../components/InputPanelsCount';
import InputPercent from '../components/InputPercent';
import InputRatio from '../components/InputRatio';
import SummaryCard from '../components/SummaryCard';
import Table from '../components/Table';
import { computeFinancials, type FinanceInputs } from '../lib/finance';
import type { SolarPanelConfig } from '../lib/solar';
import { showMoney, showNumber } from '../lib/utils';
import { useSolar } from '../state/SolarContext';

const icon = 'payments';
const title = 'Solar Potential analysis';

const batteryIcons = [
  'battery_0_bar',
  'battery_1_bar',
  'battery_2_bar',
  'battery_3_bar',
  'battery_4_bar',
  'battery_5_bar',
  'battery_full',
];

export default function SolarPotentialSection({
  solarPanelConfigs,
  defaultPanelCapacityWatts,
}: {
  solarPanelConfigs: SolarPanelConfig[];
  defaultPanelCapacityWatts: number;
}) {
  const { state, dispatch } = useSolar();
  const { inputs, configId, expandedSection } = state;
  const expanded = expandedSection == title;

  const costChart = useRef<HTMLDivElement>(null);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  const config = configId !== undefined ? solarPanelConfigs[configId] : undefined;
  const financials = useMemo(
    () => computeFinancials(inputs, config, defaultPanelCapacityWatts),
    [inputs, config, defaultPanelCapacityWatts],
  );

  // Changing any input picks the panel configuration that covers the energy consumption again.
  const setInput = (patch: Partial<FinanceInputs>) =>
    dispatch({ type: 'setInputs', patch, recomputeConfig: true });
  const updateConfig = () => dispatch({ type: 'recomputeConfig' });

  // Draw the cost chart. Its container only exists while the section is expanded.
  useEffect(() => {
    if (!expanded) return;
    let cancelled = false;
    GoogleCharts.load(
      () => {
        if (cancelled || !costChart.current) return;
        const year = new Date().getFullYear();
        const data = google.visualization.arrayToDataTable([
          ['Year', 'Solar', 'No solar'],
          [year.toString(), 0, 0],
          ...financials.cumulativeCostsWithSolar.map((cost, i) => [
            (year + i + 1).toString(),
            cost,
            financials.cumulativeCostsWithoutSolar[i],
          ]),
        ]);

        const googleCharts = google.charts as any;
        const chart = new googleCharts.Line(costChart.current);
        const options = googleCharts.Line.convertOptions({
          title: `Cost analysis for ${inputs.installationLifeSpan} years`,
          width: 350,
          height: 200,
        });
        chart.draw(data, options);
      },
      { packages: ['line'] },
    );
    return () => {
      cancelled = true;
    };
  }, [expanded, financials, inputs.installationLifeSpan]);

  if (configId === undefined || !config) return null;

  const energyCoveredIcon =
    batteryIcons[Math.floor(Math.min(Math.round(financials.energyCovered * 100) / 100, 1) * 6)];

  return (
    <>
      <Expandable
        icon={icon}
        title={title}
        subtitle="Values are only placeholders."
        subtitle2="Update with your own values."
        secondary
        expanded={expanded}
        onToggle={() => dispatch({ type: 'toggleSection', section: title })}
      >
        <div className="flex flex-col space-y-4 pt-1">
          <div className="p-4 mb-4 surface-variant outline-text rounded-lg">
            <p className="relative inline-flex items-center space-x-2">
              <md-icon className="md:w-6 w-8">info</md-icon>
              <span>
                Projections use a{' '}
                <a
                  className="primary-text"
                  href="https://developers.google.com/maps/documentation/solar/calculate-costs-us"
                  target="_blank"
                  rel="noreferrer"
                >
                  USA financial model
                  <md-icon className="text-sm">open_in_new</md-icon>
                </a>
              </span>
            </p>
          </div>

          <InputMoney
            value={inputs.monthlyAverageEnergyBill}
            icon="credit_card"
            label="Monthly average energy bill"
            onChange={(monthlyAverageEnergyBill) => setInput({ monthlyAverageEnergyBill })}
          />

          <div className="inline-flex items-center space-x-2">
            <div className="grow">
              <InputPanelsCount
                configId={configId}
                solarPanelConfigs={solarPanelConfigs}
                onChange={(configId) => dispatch({ type: 'setConfigId', configId })}
              />
            </div>
            <md-icon-button onClick={updateConfig}>
              <md-icon>sync</md-icon>
            </md-icon-button>
          </div>

          <InputMoney
            value={inputs.energyCostPerKwh}
            icon="paid"
            label="Energy cost per kWh"
            onChange={(energyCostPerKwh) => setInput({ energyCostPerKwh })}
          />

          <InputMoney
            value={inputs.solarIncentives}
            icon="redeem"
            label="Solar incentives"
            onChange={(solarIncentives) => setInput({ solarIncentives })}
          />

          <InputMoney
            value={inputs.installationCostPerWatt}
            icon="request_quote"
            label="Installation cost per Watt"
            onChange={(installationCostPerWatt) => setInput({ installationCostPerWatt })}
          />

          <InputNumber
            value={inputs.panelCapacityWatts}
            icon="bolt"
            label="Panel capacity"
            suffix="Watts"
            onChange={(panelCapacityWatts) => setInput({ panelCapacityWatts })}
          />

          <div className="flex flex-col items-center w-full">
            <md-text-button
              trailing-icon
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            >
              {showAdvancedSettings ? 'Hide' : 'Show'} advanced settings
              <md-icon slot="icon">{showAdvancedSettings ? 'expand_less' : 'expand_more'}</md-icon>
            </md-text-button>
          </div>

          <Collapsible open={showAdvancedSettings}>
            <div className="flex flex-col space-y-4">
              <InputNumber
                value={inputs.installationLifeSpan}
                icon="date_range"
                label="Installation lifespan"
                suffix="years"
                onChange={(installationLifeSpan) => setInput({ installationLifeSpan })}
              />

              <InputPercent
                value={inputs.dcToAcDerate}
                icon="dynamic_form"
                label="DC to AC conversion "
                onChange={(dcToAcDerate) => setInput({ dcToAcDerate })}
              />

              <InputRatio
                value={inputs.efficiencyDepreciationFactor}
                icon="trending_down"
                label="Panel efficiency decline per year"
                decrease
                onChange={(efficiencyDepreciationFactor) =>
                  setInput({ efficiencyDepreciationFactor })
                }
              />

              <InputRatio
                value={inputs.costIncreaseFactor}
                icon="price_change"
                label="Energy cost increase per year"
                onChange={(costIncreaseFactor) => setInput({ costIncreaseFactor })}
              />

              <InputRatio
                value={inputs.discountRate}
                icon="local_offer"
                label="Discount rate per year"
                onChange={(discountRate) => setInput({ discountRate })}
              />
            </div>
          </Collapsible>

          <div className="grid justify-items-end">
            <md-filled-tonal-button
              trailing-icon
              href="https://developers.google.com/maps/documentation/solar/calculate-costs-us"
              target="_blank"
            >
              More details
              <md-icon slot="icon">open_in_new</md-icon>
            </md-filled-tonal-button>
          </div>
        </div>
      </Expandable>

      <div className="absolute top-0 left-0">
        {expanded && (
          <>
            <div className="flex flex-col space-y-2 m-2">
              <SummaryCard
                icon={icon}
                title={title}
                rows={[
                  {
                    icon: 'energy_savings_leaf',
                    name: 'Yearly energy',
                    value: showNumber(config.yearlyEnergyDcKwh * financials.panelCapacityRatio),
                    units: 'kWh',
                  },
                  {
                    icon: 'speed',
                    name: 'Installation size',
                    value: showNumber(financials.installationSizeKw),
                    units: 'kW',
                  },
                  {
                    icon: 'request_quote',
                    name: 'Installation cost',
                    value: showMoney(financials.installationCostTotal),
                  },
                  {
                    icon: energyCoveredIcon ?? '',
                    name: 'Energy covered',
                    value: Math.round(financials.energyCovered * 100).toString(),
                    units: '%',
                  },
                ]}
              />
            </div>

            <div className="mx-2 p-4 surface on-surface-text rounded-lg shadow-lg">
              <div ref={costChart} />
              <div className="w-full secondary-text">
                <Table
                  rows={[
                    {
                      icon: 'wallet',
                      name: 'Cost without solar',
                      value: showMoney(financials.totalCostWithoutSolar),
                    },
                    {
                      icon: 'wb_sunny',
                      name: 'Cost with solar',
                      value: showMoney(financials.totalCostWithSolar),
                    },
                    {
                      icon: 'savings',
                      name: 'Savings',
                      value: showMoney(financials.savings),
                    },
                    {
                      icon: 'balance',
                      name: 'Break even',
                      value:
                        financials.breakEvenYear >= 0
                          ? `${financials.breakEvenYear + new Date().getFullYear() + 1} in ${financials.breakEvenYear + 1}`
                          : '--',
                      units: 'years',
                    },
                  ]}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
