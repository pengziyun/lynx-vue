import type { Component, InjectionKey, ShallowRef } from '@vue/runtime-core';
import { defineComponent, h, inject, nextTick, shallowReadonly, shallowRef } from '@vue/runtime-core';
import { createLynxApp, createRootContainer, type LynxApp } from './app';
import { hasNativeElementPAPI, installNativeLynxAPI } from './lynxAPI';
import type { LynxElement, LynxNativeElement } from './types';

type LynxPageData = Record<string, unknown>;

export interface LynxEntryOptions<TData extends LynxPageData = LynxPageData> {
  autoMount?: boolean;
  defaultDataProcessor?: (data: unknown) => TData;
  dataProcessors?: Record<string, (data: unknown) => unknown>;
  initialData?: TData;
}

const EMPTY_PAGE_DATA: LynxPageData = {};
const injectedEmptyData = shallowReadonly(shallowRef(EMPTY_PAGE_DATA));

export const lynxPageDataKey: InjectionKey<Readonly<ShallowRef<LynxPageData>>> = Symbol('vue-lynx:page-data');

export function useLynxData<TData extends LynxPageData = LynxPageData>() {
  return inject(
    lynxPageDataKey,
    injectedEmptyData as Readonly<ShallowRef<LynxPageData>>,
  ) as Readonly<ShallowRef<TData>>;
}

export function defineLynxEntry<TData extends LynxPageData = LynxPageData>(
  rootComponent: Component,
  options: LynxEntryOptions<TData> = {},
) {
  const dataRef = shallowRef<LynxPageData>(normalizePageData(options.initialData));
  const providedDataRef = shallowReadonly(dataRef) as Readonly<ShallowRef<LynxPageData>>;

  const EntryRoot = defineComponent({
    name: 'VueLynxEntryRoot',
    render() {
      return h(rootComponent);
    },
  });

  let app: LynxApp | null = null;
  let container: LynxElement | null = null;

  function ensureRootContainer() {
    container ||= createRootContainer(getOrCreateNativePage());
    return container;
  }

  function ensureMounted() {
    if (app) {
      return app;
    }

    installNativeLynxAPI();

    app = createLynxApp(EntryRoot);
    app.provide(lynxPageDataKey, providedDataRef);
    app.mount(ensureRootContainer());

    return app;
  }

  function runDataProcessor(input: unknown, processorName?: string) {
    if (processorName) {
      return normalizePageData(options.dataProcessors?.[processorName]?.(input) ?? input);
    }

    return normalizePageData(options.defaultDataProcessor?.(input) ?? input);
  }

  function syncData(input: unknown, processorName?: string) {
    const nextData = runDataProcessor(input, processorName);
    dataRef.value = nextData;

    const lynx = (globalThis as { lynx?: Record<string, unknown> }).lynx;
    if (lynx && typeof lynx === 'object') {
      lynx.__initData = nextData;
    }

    return nextData;
  }

  function renderPage(input?: unknown) {
    syncData(input);
    ensureMounted();
    flushNativeTree();
  }

  function updatePage(input?: unknown, flushOptions?: Record<string, unknown>) {
    if (!app) {
      renderPage(input);
      return;
    }

    syncData(input);
    void nextTick(() => {
      flushNativeTree(flushOptions);
    });
  }

  const globalTarget = globalThis as {
    processData?: (data: unknown, processorName?: string) => LynxPageData;
    renderPage?: (data?: unknown) => void;
    updatePage?: (data?: unknown, options?: Record<string, unknown>) => void;
    getPageData?: () => LynxPageData;
    removeComponents?: () => void;
  };

  globalTarget.processData = (data, processorName) => runDataProcessor(data, processorName);
  globalTarget.renderPage = renderPage;
  globalTarget.updatePage = updatePage;
  globalTarget.getPageData = () => dataRef.value;
  globalTarget.removeComponents = () => {};

  if (!hasNativeElementPAPI() && options.autoMount !== false) {
    ensureMounted();
  }

  return {
    data: providedDataRef,
    renderPage,
    updatePage,
  };
}

function normalizePageData(data: unknown): LynxPageData {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return { ...(data as LynxPageData) };
  }

  return EMPTY_PAGE_DATA;
}

function getOrCreateNativePage(): LynxNativeElement | undefined {
  const g = globalThis as {
    __GetPageElement?: () => LynxNativeElement | undefined;
    __CreatePage?: (tag: string, parentComponentUniqueId: number) => LynxNativeElement;
  };

  return g.__GetPageElement?.() ?? g.__CreatePage?.('0', 0);
}

function flushNativeTree(options?: Record<string, unknown>) {
  const g = globalThis as {
    __FlushElementTree?: (page?: LynxNativeElement, options?: Record<string, unknown>) => void;
  };

  g.__FlushElementTree?.(getOrCreateNativePage(), options ?? {});
}
