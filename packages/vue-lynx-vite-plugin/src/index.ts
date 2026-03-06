import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import type { Plugin, PluginOption, UserConfig } from 'vite';

const LYNX_ELEMENTS = new Set([
  'view',
  'text',
  'image',
  'scroll-view',
  'list',
  'list-item',
  'swiper',
  'swiper-item',
  'input',
  'textarea',
  'canvas',
  'video',
  'raw-text',
  'inline-truncation',
  'page',
  'frame',
  'overlay',
]);

export interface VueLynxVitePluginOptions {
  designWidth?: number;
  customElements?: string[];
  includeJsx?: boolean;
  injectPreviewBanner?: boolean;
}

export function getVueCompilerOptions(customElements: string[] = []) {
  return {
    template: {
      compilerOptions: {
        isCustomElement: (tag: string) => LYNX_ELEMENTS.has(tag) || customElements.includes(tag),
      },
    },
  };
}

function transformRpx(code: string, designWidth: number) {
  return code.replace(/(\d+(?:\.\d+)?)rpx/g, (_match, value: string) => {
    const px = (Number.parseFloat(value) / designWidth) * 375;
    return `${px.toFixed(2)}px`;
  });
}

function lynxCssPlugin(designWidth: number): Plugin {
  return {
    name: 'pgg:vue-lynx:css',
    transform(code, id) {
      if (!/\.(css|scss|sass|less)$/.test(id)) {
        return null;
      }

      return {
        code: transformRpx(code, designWidth),
        map: null,
      };
    },
  };
}

function previewBannerPlugin(): Plugin {
  return {
    name: 'pgg:vue-lynx:preview-banner',
    transformIndexHtml(html) {
      return html.replace(
        '</head>',
        `<script>window.__PGG_VUE_LYNX_WEB__ = true;</script></head>`,
      );
    },
  };
}

export function pluginVueLynxVite(options: VueLynxVitePluginOptions = {}): PluginOption[] {
  const {
    designWidth = 750,
    customElements = [],
    includeJsx = true,
    injectPreviewBanner = true,
  } = options;

  const plugins: PluginOption[] = [
    vue(getVueCompilerOptions(customElements)),
    lynxCssPlugin(designWidth),
  ];

  if (includeJsx) {
    plugins.push(vueJsx());
  }

  if (injectPreviewBanner) {
    plugins.push(previewBannerPlugin());
  }

  return plugins;
}

export function defineVueLynxViteConfig(options: VueLynxVitePluginOptions = {}): UserConfig {
  return {
    plugins: pluginVueLynxVite(options),
    resolve: {
      alias: {
        '@pgg/vue-lynx/web': '@pgg/vue-lynx/web',
      },
    },
    define: {
      __LYNX_WEB_PREVIEW__: 'true',
    },
  };
}

export default pluginVueLynxVite;
