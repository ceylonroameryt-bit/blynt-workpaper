import { defineConfig } from 'vitest/config';
import path from 'path';

/**
 * Blynt Workpapers - Unit & Acceptance Test Suite Configuration
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
});
