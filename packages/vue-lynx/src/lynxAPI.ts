/**
 * Lynx API Adapter
 *
 * Provides an abstraction layer over the Lynx native JavaScript API.
 * This adapter isolates the rest of the codebase from the specifics
 * of the Lynx runtime API, making it easier to:
 * - Mock for testing
 * - Adapt to API changes
 * - Support different Lynx versions
 */

import type { LynxGlobalAPI, LynxNativeElement } from './types';

type NativePAPIHost = typeof globalThis & {
  __CreateElement?: (tag: string, parentComponentUniqueId: number) => LynxNativeElement;
  __CreateImage?: (parentComponentUniqueId: number) => LynxNativeElement;
  __CreatePage?: (tag: string, parentComponentUniqueId: number) => LynxNativeElement;
  __CreateRawText?: (text: string) => LynxNativeElement;
  __CreateScrollView?: (parentComponentUniqueId: number) => LynxNativeElement;
  __CreateText?: (parentComponentUniqueId: number) => LynxNativeElement;
  __CreateView?: (parentComponentUniqueId: number) => LynxNativeElement;
  __AppendElement?: (parent: LynxNativeElement, child: LynxNativeElement) => void;
  __RemoveElement?: (parent: LynxNativeElement, child: LynxNativeElement) => void;
  __InsertElementBefore?: (
    parent: LynxNativeElement,
    child: LynxNativeElement,
    anchor?: LynxNativeElement,
  ) => void;
  __SetAttribute?: (element: LynxNativeElement, key: string, value: unknown) => void;
  __AddInlineStyle?: (element: LynxNativeElement, key: string, value: unknown) => void;
  __AddEvent?: (
    element: LynxNativeElement,
    eventType: string,
    eventName: string,
    eventHandler?: unknown,
  ) => void;
  __GetPageElement?: () => LynxNativeElement | undefined;
  lynx?: Record<string, any>;
};

const EMPTY_UNSUBSCRIBE = () => {};

export function hasNativeElementPAPI(target: unknown = globalThis): target is NativePAPIHost {
  const host = target as NativePAPIHost;
  return typeof host.__CreatePage === 'function'
    && typeof host.__AppendElement === 'function'
    && typeof host.__SetAttribute === 'function';
}

/**
 * Get the global Lynx API.
 * In the Lynx runtime, this is available as a global object.
 * For testing, it can be mocked.
 */
function getLynxAPI(): LynxGlobalAPI {
  // In Lynx runtime, the API is available globally
  // The exact global name may vary; we check multiple possibilities
  const g = globalThis as any;

  if (hasNativeElementPAPI(g)) {
    return createNativePAPIAdapter(g);
  }

  if (g.__lynx__?.createElement) return g.__lynx__;
  if (g.lynx?.createElement) return g.lynx;

  // Return a mock/noop implementation for non-Lynx environments
  if (g.__VUE_LYNX_MOCK__) return g.__VUE_LYNX_MOCK__;

  // If we're in a test environment, return the mock
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') {
    return createMockLynxAPI();
  }

  console.warn(
    '[vue-lynx] Lynx runtime API not found. ' +
      'Make sure you are running in a Lynx environment.'
  );

  return createMockLynxAPI();
}

/**
 * Create a mock Lynx API for testing and development.
 */
export function createMockLynxAPI(): LynxGlobalAPI {
  let idCounter = 0;

  const createNode = (type: string): any => ({
    __mock: true,
    __id: ++idCounter,
    __type: type,
    __children: [] as any[],
    __parent: null as any,
    __props: {} as Record<string, any>,
    __styles: {} as Record<string, string>,
    __events: {} as Record<string, Function>,
    __text: '',
  });

  return {
    createElement(type: string): LynxNativeElement {
      return createNode(type);
    },

    createTextNode(text: string): LynxNativeElement {
      const node = createNode('__text__');
      (node as any).__text = text;
      return node;
    },

    appendChild(parent: LynxNativeElement, child: LynxNativeElement): void {
      const p = parent as any;
      const c = child as any;
      p.__children.push(c);
      c.__parent = p;
    },

    removeChild(parent: LynxNativeElement, child: LynxNativeElement): void {
      const p = parent as any;
      const c = child as any;
      const index = p.__children.indexOf(c);
      if (index > -1) {
        p.__children.splice(index, 1);
        c.__parent = null;
      }
    },

    insertBefore(
      parent: LynxNativeElement,
      child: LynxNativeElement,
      anchor: LynxNativeElement
    ): void {
      const p = parent as any;
      const c = child as any;
      const a = anchor as any;
      const index = p.__children.indexOf(a);
      if (index > -1) {
        p.__children.splice(index, 0, c);
        c.__parent = p;
      } else {
        p.__children.push(c);
        c.__parent = p;
      }
    },

    setAttribute(element: LynxNativeElement, key: string, value: any): void {
      (element as any).__props[key] = value;
    },

    removeAttribute(element: LynxNativeElement, key: string): void {
      delete (element as any).__props[key];
    },

    setProperty(element: LynxNativeElement, key: string, value: any): void {
      (element as any).__props[key] = value;
    },

    setTextContent(element: LynxNativeElement, text: string): void {
      (element as any).__text = text;
    },

    setStyleProperty(
      element: LynxNativeElement,
      key: string,
      value: string
    ): void {
      (element as any).__styles[key] = value;
    },

    removeStyleProperty(element: LynxNativeElement, key: string): void {
      delete (element as any).__styles[key];
    },

    addEventListener(
      element: LynxNativeElement,
      event: string,
      handler: Function
    ): void {
      (element as any).__events[event] = handler;
    },

    removeEventListener(
      element: LynxNativeElement,
      event: string,
      _handler: Function
    ): void {
      delete (element as any).__events[event];
    },

    getRootElement(): LynxNativeElement {
      return createNode('root');
    },

    navigateTo(_options: { url: string; params?: Record<string, any> }): void {
      // noop in mock
    },

    navigateBack(_options?: { delta?: number }): void {
      // noop in mock
    },

    redirectTo(_options: { url: string; params?: Record<string, any> }): void {
      // noop in mock
    },

    onPageShow(callback: () => void): () => void {
      return () => {};
    },

    onPageHide(callback: () => void): () => void {
      return () => {};
    },

    onPageScroll(
      callback: (info: { scrollTop: number }) => void
    ): () => void {
      return () => {};
    },
  };
}

function createNativePAPIAdapter(host: NativePAPIHost): LynxGlobalAPI {
  let rootElement: LynxNativeElement | null = null;

  const createElement = (type: string) => {
    switch (type) {
      case 'view':
        return host.__CreateView?.(0);
      case 'text':
        return host.__CreateText?.(0);
      case 'image':
        return host.__CreateImage?.(0);
      case 'scroll-view':
        return host.__CreateScrollView?.(0);
      case 'page':
        return host.__CreatePage?.('0', 0);
      default:
        return host.__CreateElement?.(type, 0);
    }
  };

  return {
    createElement(type: string): LynxNativeElement {
      const nativeElement = createElement(type);
      if (!nativeElement) {
        throw new Error(`[vue-lynx] Failed to create native element "${type}".`);
      }
      return nativeElement;
    },

    createTextNode(text: string): LynxNativeElement {
      const rawText = host.__CreateRawText?.(text) ?? createElement('raw-text');
      if (!rawText) {
        throw new Error('[vue-lynx] Failed to create native text node.');
      }
      host.__SetAttribute?.(rawText, 'text', text);
      return rawText;
    },

    appendChild(parent: LynxNativeElement, child: LynxNativeElement): void {
      host.__AppendElement?.(parent, child);
    },

    removeChild(parent: LynxNativeElement, child: LynxNativeElement): void {
      host.__RemoveElement?.(parent, child);
    },

    insertBefore(
      parent: LynxNativeElement,
      child: LynxNativeElement,
      anchor: LynxNativeElement,
    ): void {
      host.__InsertElementBefore?.(parent, child, anchor);
    },

    setAttribute(element: LynxNativeElement, key: string, value: any): void {
      host.__SetAttribute?.(element, key, value);
    },

    removeAttribute(element: LynxNativeElement, key: string): void {
      host.__SetAttribute?.(element, key, null);
    },

    setProperty(element: LynxNativeElement, key: string, value: any): void {
      host.__SetAttribute?.(element, key, value);
    },

    setTextContent(element: LynxNativeElement, text: string): void {
      host.__SetAttribute?.(element, 'text', text);
    },

    setStyleProperty(element: LynxNativeElement, key: string, value: string): void {
      host.__AddInlineStyle?.(element, key, value);
    },

    removeStyleProperty(element: LynxNativeElement, key: string): void {
      host.__AddInlineStyle?.(element, key, null);
    },

    addEventListener(
      element: LynxNativeElement,
      event: string,
      handler: Function,
    ): void {
      host.__AddEvent?.(element, 'bindEvent', event, handler);
    },

    removeEventListener(
      element: LynxNativeElement,
      event: string,
      _handler: Function,
    ): void {
      host.__AddEvent?.(element, 'bindEvent', event, undefined);
    },

    getRootElement(): LynxNativeElement {
      rootElement ||= host.__GetPageElement?.() ?? host.__CreatePage?.('0', 0) ?? null;

      if (!rootElement) {
        throw new Error('[vue-lynx] Failed to create the Lynx page root.');
      }

      return rootElement;
    },

    navigateTo(options: { url: string; params?: Record<string, any> }): void {
      host.lynx?.navigateTo?.(options);
    },

    navigateBack(options?: { delta?: number }): void {
      host.lynx?.navigateBack?.(options);
    },

    redirectTo(options: { url: string; params?: Record<string, any> }): void {
      host.lynx?.redirectTo?.(options);
    },

    onPageShow(callback: () => void): () => void {
      return host.lynx?.onPageShow?.(callback) ?? EMPTY_UNSUBSCRIBE;
    },

    onPageHide(callback: () => void): () => void {
      return host.lynx?.onPageHide?.(callback) ?? EMPTY_UNSUBSCRIBE;
    },

    onPageScroll(callback: (info: { scrollTop: number }) => void): () => void {
      return host.lynx?.onPageScroll?.(callback) ?? EMPTY_UNSUBSCRIBE;
    },
  };
}

/**
 * The singleton Lynx API instance.
 * Lazily initialized on first access.
 */
let _lynxAPI: LynxGlobalAPI | null = null;

export function getLynx(): LynxGlobalAPI {
  if (!_lynxAPI) {
    _lynxAPI = getLynxAPI();
  }
  return _lynxAPI;
}

/**
 * Set a custom Lynx API implementation.
 * Useful for testing or custom environments.
 */
export function setLynxAPI(api: LynxGlobalAPI): void {
  _lynxAPI = api;
}

export function installNativeLynxAPI(target: unknown = globalThis): LynxGlobalAPI {
  if (!hasNativeElementPAPI(target)) {
    return getLynx();
  }

  const api = createNativePAPIAdapter(target as NativePAPIHost);
  setLynxAPI(api);
  return api;
}

/**
 * Reset the Lynx API (mainly for testing).
 */
export function resetLynxAPI(): void {
  _lynxAPI = null;
}
