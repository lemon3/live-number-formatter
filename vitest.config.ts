import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8', // or 'istanbul'
      exclude: [
        './dist/**',
        './demo/**',
        './notes/**',
        'vite*.config*',
        '**/_preview.ts',
        '**/*.types.ts',
        '**/*.d.ts',
      ],
    },
  },
});
