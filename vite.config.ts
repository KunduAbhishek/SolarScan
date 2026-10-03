import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  // `npm run start` serves the build behind Cloud Run, which uses its own host names.
  preview: { allowedHosts: true },
  test: {
    include: ['src/**/*.{test,spec}.{js,ts,tsx}'],
    environment: 'jsdom',
    deps: {
      inline: ['proj4'],
    },
  },
});
