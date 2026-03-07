import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { RuntimeWrapperWebpackPlugin } from '@lynx-js/runtime-wrapper-webpack-plugin';
import { LynxEncodePlugin, LynxTemplatePlugin } from '@lynx-js/template-webpack-plugin';
import {
  MAIN_THREAD_ENTRY_SUFFIX,
  getThreadEntryPairs,
  isMainThreadEntryName,
  normalizeSourceEntries,
  type SourceEntryDescriptor,
  type SourceEntryItem,
} from '@pgg/vue-lynx-compiler';

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
const BACKGROUND_JS_ASSET = /^(?!.*main-thread(?:\.[A-Fa-f0-9]+)?\.js$).*\.js$/;
const NATIVE_VUE_RUNTIME = '@pgg/vue-lynx/native-vue';
const BACKGROUND_PRELUDE_MODULE = '@pgg/vue-lynx/internal/thread-background';
const MAIN_THREAD_PRELUDE_MODULE = '@pgg/vue-lynx/internal/thread-main';
const GENERATED_ENTRY_ROOT = '.rspeedy/vue-lynx-entries';

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
        source: {
          entry: createGeneratedThreadEntries(api.context.rootPath, config.source?.entry),
        },
      }));

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

        chain.plugin('vue-lynx:runtime-wrapper').use(RuntimeWrapperWebpackPlugin, [
          {
            targetSdkVersion: resolvedOptions.targetSdkVersion,
            test: BACKGROUND_JS_ASSET,
          },
        ]);

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
            entries: Object.keys(entryPoints).filter((entryName) => isMainThreadEntryName(entryName)),
          },
        ]);

        getThreadEntryPairs(Object.keys(entryPoints)).forEach(({ backgroundName, mainThreadName }) => {
          chain.plugin(`vue-lynx:template:${backgroundName}`).use(LynxTemplatePlugin, [
            {
              dsl: resolvedOptions.dsl,
              chunks: [backgroundName, mainThreadName].filter((entryName) => entryName in entryPoints),
              filename: replaceToken(replaceToken(templateFilename, '[name]', backgroundName), '[platform]', environmentName),
              intermediate: `.rspeedy/${backgroundName}`,
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

function createGeneratedThreadEntries(rootPath: string, sourceEntry: unknown) {
  const normalizedEntries = normalizeSourceEntries(sourceEntry);
  const dualEntries: Record<string, SourceEntryItem> = {};

  Object.entries(normalizedEntries)
    .filter(([entryName]) => !isMainThreadEntryName(entryName))
    .forEach(([entryName, entryValue]) => {
      dualEntries[entryName] = createThreadEntryDescriptor(
        rootPath,
        entryName,
        entryValue,
        'background',
      );
      dualEntries[`${entryName}${MAIN_THREAD_ENTRY_SUFFIX}`] = createThreadEntryDescriptor(
        rootPath,
        entryName,
        entryValue,
        'main-thread',
      );
    });

  return dualEntries;
}

function createThreadEntryDescriptor(
  rootPath: string,
  entryName: string,
  entryValue: SourceEntryItem,
  threadMode: 'background' | 'main-thread',
): SourceEntryDescriptor {
  const imports = getEntryImports(entryValue);
  const wrapperFile = createThreadWrapperFile(rootPath, entryName, imports, threadMode);
  const entryDescriptor = typeof entryValue === 'object' && !Array.isArray(entryValue)
    ? entryValue
    : {};

  return {
    ...entryDescriptor,
    import: wrapperFile,
    filename: threadMode === 'background'
      ? `.rspeedy/${entryName}/background.js`
      : `.rspeedy/${entryName}/main-thread.js`,
  };
}

function getEntryImports(entryValue: SourceEntryItem) {
  if (typeof entryValue === 'string') {
    return [entryValue];
  }

  if (Array.isArray(entryValue)) {
    return entryValue;
  }

  if (entryValue.import == null) {
    return [];
  }

  return Array.isArray(entryValue.import) ? entryValue.import : [entryValue.import];
}

function createThreadWrapperFile(
  rootPath: string,
  entryName: string,
  imports: string[],
  threadMode: 'background' | 'main-thread',
) {
  const wrapperDir = path.join(rootPath, GENERATED_ENTRY_ROOT, entryName);
  const wrapperFile = path.join(wrapperDir, `${threadMode}-entry.mjs`);
  const preludeImport = threadMode === 'background'
    ? BACKGROUND_PRELUDE_MODULE
    : MAIN_THREAD_PRELUDE_MODULE;
  const content = [
    `import ${JSON.stringify(preludeImport)};`,
    ...imports.map((request) => `import ${JSON.stringify(toWrapperImport(rootPath, wrapperDir, request))};`),
    '',
  ].join('\n');

  mkdirSync(wrapperDir, { recursive: true });
  writeFileSync(wrapperFile, content, 'utf8');

  return wrapperFile;
}

function toWrapperImport(rootPath: string, wrapperDir: string, request: string) {
  if (!request.startsWith('.') && !path.isAbsolute(request)) {
    return request;
  }

  const absoluteRequest = path.isAbsolute(request)
    ? request
    : path.resolve(rootPath, request);
  let relativeRequest = path.relative(wrapperDir, absoluteRequest);

  if (!relativeRequest.startsWith('.')) {
    relativeRequest = `./${relativeRequest}`;
  }

  return relativeRequest.split(path.sep).join('/');
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
