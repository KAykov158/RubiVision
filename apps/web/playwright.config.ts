import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: true,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: 'list',
  outputDir: './test-results',
  use: {
    baseURL: 'http://127.0.0.1:5175',
    ...devices['Desktop Chrome'],
    browserName: 'chromium',
    headless: true,
    screenshot: 'off',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'public-ui',
      testIgnore: ['**/auth-routes.spec.ts', '**/precommit-qa.spec.ts', '**/timer-layout.spec.ts'],
    },
    {
      name: 'auth-integration',
      testMatch: ['**/auth-routes.spec.ts', '**/precommit-qa.spec.ts', '**/timer-layout.spec.ts'],
      use: { baseURL: 'http://127.0.0.1:5174' },
    },
  ],
  webServer: [
    {
      command: 'node ./e2e/support/supabaseMockServer.mjs',
      url: 'http://127.0.0.1:54322/health',
      reuseExistingServer: false,
      timeout: 30_000,
    },
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 5174 --strictPort',
      url: 'http://127.0.0.1:5174',
      // Browser tests mock auth flows and use this local stub for any other request.
      // These non-secret values keep the app configured without developer env files.
      env: {
        VITE_SUPABASE_URL: 'http://127.0.0.1:54322',
        VITE_SUPABASE_PUBLISHABLE_KEY: 'e2e-public-client-key',
      },
      reuseExistingServer: false,
      timeout: 30_000,
    },
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 5175 --strictPort',
      url: 'http://127.0.0.1:5175',
      // Older visual tests intentionally exercise the no-backend public shell.
      env: {
        VITE_SUPABASE_URL: 'http://e2e.invalid',
        VITE_SUPABASE_PUBLISHABLE_KEY: 'e2e-public-client-key',
      },
      reuseExistingServer: false,
      timeout: 30_000,
    },
  ],
});
