import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['packages/**/__tests__/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['packages/*/src/**/*.ts'],
      exclude: ['packages/create-vue-lynx/**'],
    },
  },
  resolve: {
    alias: {
      '@pgg/vue-lynx': path.resolve(__dirname, 'packages/vue-lynx/src/index.ts'),
      '@pgg/vue-lynx/web': path.resolve(__dirname, 'packages/vue-lynx/src/web.ts'),
      '@pgg/vue-lynx/ssr': path.resolve(__dirname, 'packages/vue-lynx/src/ssr.ts'),
      '@pgg/vue-lynx-compiler': path.resolve(__dirname, 'packages/vue-lynx-compiler/src/index.ts'),
      '@pgg/vue-lynx-testing': path.resolve(__dirname, 'packages/vue-lynx-testing/src/index.ts'),
    },
  },
});
