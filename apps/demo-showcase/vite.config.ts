import path from 'node:path';
import { defineConfig } from 'vite';
import { defineVueLynxViteConfig } from '@pgg/vue-lynx-vite-plugin';

export default defineConfig({
  ...defineVueLynxViteConfig(),
  resolve: {
    alias: [
      { find: '@pgg/vue-lynx/web', replacement: path.resolve(__dirname, '../../packages/vue-lynx/src/web.ts') },
      { find: '@pgg/vue-lynx/ssr', replacement: path.resolve(__dirname, '../../packages/vue-lynx/src/ssr.ts') },
      { find: '@pgg/vue-lynx', replacement: path.resolve(__dirname, '../../packages/vue-lynx/src/index.ts') },
    ],
  },
  build: {
    outDir: 'dist/web',
  },
});
