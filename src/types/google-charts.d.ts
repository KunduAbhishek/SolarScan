declare module 'google-charts' {
  export const GoogleCharts: {
    load(callback: () => void, settings?: { packages?: string[] }): void;
  };
}
