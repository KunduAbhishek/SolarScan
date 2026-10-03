import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react';
import { defaultFinanceInputs, type FinanceInputs } from '../lib/finance';
import type { BuildingInsightsResponse } from '../lib/solar';
import { pickSolarConfigId } from '../lib/utils';

interface SolarState {
  buildingInsights?: BuildingInsightsResponse;
  /** Index into `buildingInsights.solarPotential.solarPanelConfigs`. */
  configId?: number;
  /** Title of the section that is currently expanded, or an empty string. */
  expandedSection: string;
  showPanels: boolean;
  inputs: FinanceInputs;
}

type Action =
  | { type: 'buildingLoaded'; insights: BuildingInsightsResponse }
  | { type: 'buildingCleared' }
  | { type: 'setConfigId'; configId: number }
  /** Updates the user inputs, optionally picking the config that covers the energy consumption. */
  | { type: 'setInputs'; patch: Partial<FinanceInputs>; recomputeConfig?: boolean }
  | { type: 'recomputeConfig' }
  | { type: 'toggleSection'; section: string }
  | { type: 'setShowPanels'; value: boolean };

const initialState: SolarState = {
  expandedSection: '',
  showPanels: true,
  inputs: defaultFinanceInputs,
};

/** Finds the config that covers the yearly energy consumption of the user. */
function configIdFor(insights: BuildingInsightsResponse, inputs: FinanceInputs) {
  const solarPotential = insights.solarPotential;
  const panelCapacityRatio = inputs.panelCapacityWatts / solarPotential.panelCapacityWatts;
  const yearlyKwhEnergyConsumption =
    (inputs.monthlyAverageEnergyBill / inputs.energyCostPerKwh) * 12;
  return pickSolarConfigId(
    solarPotential.solarPanelConfigs,
    yearlyKwhEnergyConsumption,
    panelCapacityRatio,
    inputs.dcToAcDerate,
  );
}

function reducer(state: SolarState, action: Action): SolarState {
  switch (action.type) {
    case 'buildingLoaded':
      // Always pick a config for the new building, the previous index might not exist in it.
      return {
        ...state,
        buildingInsights: action.insights,
        configId: configIdFor(action.insights, state.inputs),
      };
    case 'buildingCleared':
      return { ...state, buildingInsights: undefined, configId: undefined };
    case 'setConfigId':
      return { ...state, configId: action.configId };
    case 'setInputs': {
      const inputs = { ...state.inputs, ...action.patch };
      const configId =
        action.recomputeConfig && state.buildingInsights
          ? configIdFor(state.buildingInsights, inputs)
          : state.configId;
      return { ...state, inputs, configId };
    }
    case 'recomputeConfig':
      return state.buildingInsights
        ? { ...state, configId: configIdFor(state.buildingInsights, state.inputs) }
        : state;
    case 'toggleSection':
      return {
        ...state,
        expandedSection: state.expandedSection == action.section ? '' : action.section,
      };
    case 'setShowPanels':
      return { ...state, showPanels: action.value };
  }
}

const SolarContext = createContext<{ state: SolarState; dispatch: Dispatch<Action> } | undefined>(
  undefined,
);

export function SolarProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <SolarContext.Provider value={value}>{children}</SolarContext.Provider>;
}

export function useSolar() {
  const context = useContext(SolarContext);
  if (!context) throw new Error('useSolar must be used inside a SolarProvider');
  return context;
}
