import { configDefaults, defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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
