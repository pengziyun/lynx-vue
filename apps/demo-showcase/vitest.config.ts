import { defineConfig } from 'vitest/config';
import { defineVueLynxViteConfig } from '@pgg/vue-lynx-vite-plugin';

export default defineConfig({
  ...defineVueLynxViteConfig(),
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
  },
});
