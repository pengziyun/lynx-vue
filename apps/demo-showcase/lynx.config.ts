import { defineConfig, type Config } from '@lynx-js/rspeedy';
import { pluginQRCode } from '@lynx-js/qrcode-rsbuild-plugin';
import { pluginVue } from '@rsbuild/plugin-vue';
import { pluginVueLynx } from '@pgg/vue-lynx-rsbuild-plugin';
import { createLynxAppOptions } from '../shared/lynx.mjs';

const config: Config = {
  ...(createLynxAppOptions(import.meta.url) as Config),
  plugins: [
    pluginVue({
      vueLoaderOptions: {
        hotReload: false,
        compilerOptions: {
          isCustomElement: (tag: string) => ['view', 'text', 'image', 'scroll-view', 'page'].includes(tag),
        },
      },
    }),
    pluginVueLynx(),
    pluginQRCode(),
  ],
};

export default defineConfig(config);
