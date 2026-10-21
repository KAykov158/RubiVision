import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.ts';

export default mergeConfig(viteConfig, defineConfig({
  test: {
    include: ['src/features/scrambles/scrambleProvider.integration.ts'],
    testTimeout: 120_000,
    hookTimeout: 120_000,
    maxWorkers: 1,
    disableConsoleIntercept: true,
  },
}));
