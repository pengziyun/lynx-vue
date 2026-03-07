type DataProcessorDefinition = {
  defaultDataProcessor?: (data: unknown) => unknown;
  dataProcessors?: Record<string, (data: unknown) => unknown>;
};

type MainThreadDelegates = {
  getPageData?: () => Record<string, unknown>;
  removeComponents?: () => void;
  renderPage?: (data?: unknown) => void;
  updatePage?: (data?: unknown, options?: Record<string, unknown>) => void;
};

type BootstrapState = {
  delegates: MainThreadDelegates;
  mainThreadInstalled: boolean;
};

type BootstrapHost = typeof globalThis & {
  __VUE_LYNX_BOOTSTRAP__?: BootstrapState;
  getPageData?: () => Record<string, unknown>;
  lynx?: Record<string, any>;
  processData?: (data: unknown, processorName?: string) => unknown;
  removeComponents?: () => void;
  renderPage?: (data?: unknown) => void;
  updatePage?: (data?: unknown, options?: Record<string, unknown>) => void;
};

const BOOTSTRAP_KEY = '__VUE_LYNX_BOOTSTRAP__';
const LEGACY_MAIN_THREAD_GLOBALS = [
  'processData',
  'renderPage',
  'updatePage',
  'getPageData',
  'removeComponents',
] as const;

export function installBackgroundBootstrap() {
  const host = globalThis as BootstrapHost;
  const lynx = ensureLynxGlobal(host);
  lynx.__initData ??= {};
  lynx.registerDataProcessors ??= function registerDataProcessorsNoop() {};
}

export function installMainThreadBootstrap() {
  const host = globalThis as BootstrapHost;
  const state = getBootstrapState(host);
  const lynx = ensureLynxGlobal(host);

  lynx.__initData ??= {};

  if (!state.mainThreadInstalled) {
    if (typeof lynx.reportError !== 'function') {
      lynx.reportError = function reportError(error: unknown) {
        if (typeof console !== 'undefined' && typeof console.error === 'function') {
          console.error(error);
        }
      };
    }

    lynx.registerDataProcessors = function registerDataProcessors(
      dataProcessorDefinition?: DataProcessorDefinition,
    ) {
      host.processData = createProcessData(host, dataProcessorDefinition);
      installLegacyMainThreadGlobals();
    };
    state.mainThreadInstalled = true;
  }

  if (typeof host.renderPage !== 'function') {
    host.renderPage = (data) => {
      state.delegates.renderPage?.(data);
    };
  }

  if (typeof host.updatePage !== 'function') {
    host.updatePage = (data, options) => {
      state.delegates.updatePage?.(data, options);
    };
  }

  if (typeof host.getPageData !== 'function') {
    host.getPageData = () => state.delegates.getPageData?.() ?? normalizeBootstrapData(lynx.__initData);
  }

  if (typeof host.removeComponents !== 'function') {
    host.removeComponents = () => {
      state.delegates.removeComponents?.();
    };
  }

  installLegacyMainThreadGlobals();
  lynx.registerDataProcessors?.();

  return state;
}

export function registerMainThreadDataProcessors(dataProcessorDefinition?: DataProcessorDefinition) {
  const host = globalThis as BootstrapHost;
  const lynx = ensureLynxGlobal(host);

  if (typeof lynx.registerDataProcessors !== 'function') {
    installMainThreadBootstrap();
  }

  lynx.registerDataProcessors?.(dataProcessorDefinition);
}

export function setMainThreadDelegates(delegates: MainThreadDelegates) {
  const state = installMainThreadBootstrap();
  state.delegates = {
    ...state.delegates,
    ...delegates,
  };
}

function createProcessData(host: BootstrapHost, dataProcessorDefinition?: DataProcessorDefinition) {
  return (data: unknown, processorName?: string) => {
    try {
      const processed = processorName
        ? dataProcessorDefinition?.dataProcessors?.[processorName]?.(data) ?? data
        : dataProcessorDefinition?.defaultDataProcessor?.(data) ?? data;

      return normalizeBootstrapData(processed);
    } catch (error) {
      host.lynx?.reportError?.(error);
      return {};
    }
  };
}

function ensureLynxGlobal(host: BootstrapHost) {
  host.lynx ??= {};
  return host.lynx;
}

function getBootstrapState(host: BootstrapHost) {
  host[BOOTSTRAP_KEY] ??= {
    delegates: {},
    mainThreadInstalled: false,
  };

  return host[BOOTSTRAP_KEY];
}

function installLegacyMainThreadGlobals() {
  const code = LEGACY_MAIN_THREAD_GLOBALS
    .map((name) => `${name} = globalThis.${name};`)
    .join('\n');

  if (typeof Function !== 'function') {
    return;
  }

  try {
    Function(code)();
  } catch {
    // Ignore environments that forbid creating sloppy-mode globals.
  }
}

function normalizeBootstrapData(data: unknown) {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return { ...(data as Record<string, unknown>) };
  }

  return {};
}
