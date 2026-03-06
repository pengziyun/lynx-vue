import os from 'node:os';
import { defineConfig } from '@lynx-js/rspeedy';
import { pluginQRCode } from '@lynx-js/qrcode-rsbuild-plugin';
import { pluginVue } from '@rsbuild/plugin-vue';
import { pluginVueLynx } from '@pgg/vue-lynx-rsbuild-plugin';

export default defineConfig({
  source: {
    entry: './src/main.ts',
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: false,
  },
  dev: {
    assetPrefix: `http://${process.env.LYNX_DEV_HOST || getPreferredLanIp()}:<port>/`,
  },
  plugins: [
    pluginVue({
      vueLoaderOptions: {
        hotReload: false,
        compilerOptions: {
          isCustomElement: (tag: string) => ['page', 'view', 'text', 'image', 'scroll-view'].includes(tag),
        },
      },
    }),
    pluginVueLynx(),
    pluginQRCode(),
  ],
});

function getPreferredLanIp() {
  const interfaces = os.networkInterfaces();

  for (const entries of Object.values(interfaces)) {
    for (const entry of entries || []) {
      if (entry.internal || entry.family !== 'IPv4') {
        continue;
      }

      if (
        entry.address.startsWith('192.168.')
        || entry.address.startsWith('10.')
        || /^172\.(1[6-9]|2\d|3[0-1])\./.test(entry.address)
      ) {
        return entry.address;
      }
    }
  }

  return '127.0.0.1';
}
