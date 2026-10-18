import { configDefaults, defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  worker: { format: 'es' },
  build: {
    modulePreload: false,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [{ name: 'cubing', test: /node_modules[\\/]cubing[\\/]/, entriesAware: true }],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    clearMocks: true,
    restoreMocks: true,
    pool: 'vmThreads',
    maxWorkers: 2,
    sequence: { shuffle: false },
    exclude: [...configDefaults.exclude, '**/e2e/**'],
  },
});
