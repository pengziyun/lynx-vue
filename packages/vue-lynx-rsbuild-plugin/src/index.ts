import { LynxEncodePlugin, LynxTemplatePlugin } from '@lynx-js/template-webpack-plugin';

export interface VueLynxRsbuildPluginOptions {
  targetSdkVersion?: string;
  debugInfoOutside?: boolean;
  defaultDisplayLinear?: boolean;
  enableAccessibilityElement?: boolean;
  enableCSSInheritance?: boolean;
  enableCSSInvalidation?: boolean;
  enableCSSSelector?: boolean;
  enableNewGesture?: boolean;
  enableRemoveCSSScope?: boolean;
  removeDescendantSelectorScope?: boolean;
  dsl?: 'tt' | 'react' | 'react_nodiff';
}

const DEFAULT_TEMPLATE_FILENAME = '[name].lynx.bundle';
const NON_HMR_JS_ASSET = /\.js(?:\?.*)?$/;
const HOT_UPDATE_ASSET = /\.hot-update\./;
const NATIVE_VUE_RUNTIME = '@pgg/vue-lynx/native-vue';

export function pluginVueLynx(userOptions: VueLynxRsbuildPluginOptions = {}) {
  const resolvedOptions = {
    targetSdkVersion: '3.2',
    debugInfoOutside: true,
    defaultDisplayLinear: true,
    enableAccessibilityElement: false,
    enableCSSInheritance: false,
    enableCSSInvalidation: true,
    enableCSSSelector: true,
    enableNewGesture: false,
    enableRemoveCSSScope: true,
    removeDescendantSelectorScope: true,
    dsl: 'tt' as const,
    ...userOptions,
  };

  return {
    name: 'vue-lynx:rsbuild',
    pre: ['lynx:rsbuild:plugin-api'],
    setup(api: any) {
      api.modifyRsbuildConfig((config: any, { mergeRsbuildConfig }: any) => mergeRsbuildConfig(config, {
        dev: {
          hmr: false,
          liveReload: false,
        },
        output: {
          injectStyles: false,
        },
        performance: {
          chunkSplit: {
            strategy: 'all-in-one',
          },
        },
        tools: {
          rspack: {
            output: {
              iife: false,
            },
          },
        },
      }));

      api.modifyBundlerChain((chain: any, { environment, CHAIN_ID }: any) => {
        const environmentName = typeof environment === 'string' ? environment : environment.name;

        if (typeof environmentName !== 'string' || !environmentName.startsWith('lynx')) {
          return;
        }

        chain.resolve.alias.set('vue$', NATIVE_VUE_RUNTIME);
        if (CHAIN_ID?.PLUGIN?.MINI_CSS_EXTRACT && chain.plugins.has(CHAIN_ID.PLUGIN.MINI_CSS_EXTRACT)) {
          chain.plugin(CHAIN_ID.PLUGIN.MINI_CSS_EXTRACT).tap((args: any[] = []) => {
            const [options = {}] = args;
            return [
              {
                ...options,
                runtime: false,
              },
            ];
          });
        }

        const rspeedyApi = api.useExposed(Symbol.for('rspeedy.api'));
        const rspeedyConfig = rspeedyApi?.config;
        const entryPoints = chain.entryPoints.entries?.() ?? {};
        const templateFilename = getTemplateFilename(rspeedyConfig?.output?.filename);
        const enableChunkSplitting = environment.config?.performance?.chunkSplit?.strategy !== 'all-in-one';
        const inlineScripts = environment.config?.output?.inlineScripts ?? !enableChunkSplitting;

        chain.plugin('vue-lynx:encode').use(LynxEncodePlugin, [
          {
            inlineScripts,
          },
        ]);

        chain.plugin('vue-lynx:mark-main-thread').use(MarkMainThreadRspackPlugin, [
          {
            entries: Object.keys(entryPoints),
          },
        ]);

        Object.keys(entryPoints).forEach((entryName) => {
          chain.plugin(`vue-lynx:template:${entryName}`).use(LynxTemplatePlugin, [
            {
              dsl: resolvedOptions.dsl,
              chunks: [entryName],
              filename: replaceToken(replaceToken(templateFilename, '[name]', entryName), '[platform]', environmentName),
              intermediate: `.rspeedy/${entryName}`,
              customCSSInheritanceList: undefined,
              debugInfoOutside: resolvedOptions.debugInfoOutside,
              defaultDisplayLinear: resolvedOptions.defaultDisplayLinear,
              enableA11y: true,
              enableAccessibilityElement: resolvedOptions.enableAccessibilityElement,
              enableCSSInheritance: resolvedOptions.enableCSSInheritance,
              enableCSSInvalidation: resolvedOptions.enableCSSInvalidation,
              enableCSSSelector: resolvedOptions.enableCSSSelector,
              enableNewGesture: resolvedOptions.enableNewGesture,
              enableRemoveCSSScope: resolvedOptions.enableRemoveCSSScope,
              removeDescendantSelectorScope: resolvedOptions.removeDescendantSelectorScope,
              targetSdkVersion: resolvedOptions.targetSdkVersion,
              cssPlugins: [],
            },
          ]);
        });
      });
    },
  };
}

function getTemplateFilename(filename: unknown) {
  if (typeof filename === 'string') {
    return filename;
  }

  if (filename && typeof filename === 'object') {
    const typedFilename = filename as { bundle?: string; template?: string };
    return typedFilename.bundle ?? typedFilename.template ?? DEFAULT_TEMPLATE_FILENAME;
  }

  return DEFAULT_TEMPLATE_FILENAME;
}

function replaceToken(source: string, token: string, value: string) {
  return source.split(token).join(value);
}

class MarkMainThreadRspackPlugin {
  private readonly options: { entries: string[] };

  constructor(options: { entries: string[] }) {
    this.options = options;
  }

  apply(compiler: any) {
    compiler.hooks.thisCompilation.tap('vue-lynx:mark-main-thread', (compilation: any) => {
      compilation.hooks.processAssets.tap(
        {
          name: 'vue-lynx:mark-main-thread',
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
        },
        () => {
          this.options.entries.forEach((entryName) => {
            const entryPoint = compilation.entrypoints.get(entryName);
            const files = entryPoint?.getFiles?.() ?? [];

            files
              .filter((filename: string) => NON_HMR_JS_ASSET.test(filename) && !HOT_UPDATE_ASSET.test(filename))
              .forEach((filename: string) => {
                const asset = compilation.getAsset(filename);
                if (!asset) {
                  return;
                }

                compilation.updateAsset(filename, asset.source, {
                  ...asset.info,
                  'lynx:main-thread': true,
                });
              });
          });
        },
      );
    });
  }
}
