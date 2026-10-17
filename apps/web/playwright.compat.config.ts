import { defineConfig } from '@playwright/test';
import baseConfig from './playwright.config';

const baseUse = baseConfig.use ?? {};

export default defineConfig({
  ...baseConfig,
  projects: [
    {
      name: 'firefox',
      outputDir: './test-results/compat-firefox',
      use: { ...baseUse, browserName: 'firefox' },
    },
    {
      name: 'webkit',
      outputDir: './test-results/compat-webkit',
      use: { ...baseUse, browserName: 'webkit' },
    },
  ],
});
