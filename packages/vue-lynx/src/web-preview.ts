/**
 * Vue-Lynx Web Preview Adapter
 *
 * Maps Lynx native API calls to real DOM operations,
 * allowing vue-lynx apps to be previewed in a browser during development.
 *
 * This is NOT for production — it's a development tool to visually verify
 * component layout, styling, and interactions before deploying to Lynx.
 *
 * Usage:
 *   import { installWebPreview } from 'vue-lynx/web-preview';
 *   installWebPreview();  // call before createApp()
 */

/// <reference lib="dom" />

import type { LynxGlobalAPI, LynxNativeElement } from './types';
import { setLynxAPI } from './lynxAPI';

/** Lynx tag → DOM tag mapping */
const TAG_MAP: Record<string, string> = {
  view: 'div',
  text: 'span',
  image: 'img',
  'scroll-view': 'div',
  list: 'div',
  'list-item': 'div',
  swiper: 'div',
  'swiper-item': 'div',
  input: 'input',
  textarea: 'textarea',
  canvas: 'canvas',
  video: 'video',
  'raw-text': 'span',
  'inline-truncation': 'span',
  page: 'div',
  root: 'div',
  __text__: 'span',
};

/** Internal interface for a DOM-backed native element */
interface DOMNativeElement {
  __dom: HTMLElement;
  __type: string;
  __children: DOMNativeElement[];
  __id: number;
}

/**
 * Create a Lynx API implementation backed by real DOM elements.
 */
function createWebPreviewAPI(mountTarget: HTMLElement): LynxGlobalAPI {
  let idCounter = 0;

  function createNode(type: string): DOMNativeElement {
    const domTag = TAG_MAP[type] || 'div';
    const dom = document.createElement(domTag);
    dom.dataset.lynx = type;

    return {
      __dom: dom,
      __type: type,
      __children: [],
      __id: ++idCounter,
    };
  }

  function getDOM(el: LynxNativeElement): HTMLElement {
    return (el as DOMNativeElement).__dom;
  }

  function asDOMNode(el: LynxNativeElement): DOMNativeElement {
    return el as DOMNativeElement;
  }

  return {
    createElement(type: string): LynxNativeElement {
      return createNode(type) as unknown as LynxNativeElement;
    },

    createTextNode(text: string): LynxNativeElement {
      const node = createNode('__text__');
      node.__dom.textContent = text;
      return node as unknown as LynxNativeElement;
    },

    appendChild(parent: LynxNativeElement, child: LynxNativeElement): void {
      getDOM(parent).appendChild(getDOM(child));
      asDOMNode(parent).__children.push(asDOMNode(child));
    },

    removeChild(parent: LynxNativeElement, child: LynxNativeElement): void {
      const parentDOM = getDOM(parent);
      const childDOM = getDOM(child);
      if (parentDOM.contains(childDOM)) {
        parentDOM.removeChild(childDOM);
      }
      const p = asDOMNode(parent);
      const idx = p.__children.indexOf(asDOMNode(child));
      if (idx > -1) p.__children.splice(idx, 1);
    },

    insertBefore(
      parent: LynxNativeElement,
      child: LynxNativeElement,
      anchor: LynxNativeElement
    ): void {
      getDOM(parent).insertBefore(getDOM(child), getDOM(anchor));
      const p = asDOMNode(parent);
      const anchorIdx = p.__children.indexOf(asDOMNode(anchor));
      if (anchorIdx > -1) {
        p.__children.splice(anchorIdx, 0, asDOMNode(child));
      } else {
        p.__children.push(asDOMNode(child));
      }
    },

    setAttribute(element: LynxNativeElement, key: string, value: any): void {
      const dom = getDOM(element);
      // Set as DOM property for certain keys
      if (key === 'src' || key === 'placeholder' || key === 'value' || key === 'type') {
        (dom as any)[key] = value;
      }
      dom.setAttribute(key, String(value));
    },

    removeAttribute(element: LynxNativeElement, key: string): void {
      getDOM(element).removeAttribute(key);
    },

    setProperty(element: LynxNativeElement, key: string, value: any): void {
      const dom = getDOM(element);
      // Set as DOM property directly
      if (key in dom) {
        (dom as any)[key] = value;
      }
      dom.setAttribute(key, String(value));
    },

    setTextContent(element: LynxNativeElement, text: string): void {
      getDOM(element).textContent = text;
    },

    /**
     * Set a style property on a DOM element.
     * Note: The style module sends kebab-case keys (e.g., "font-size", "flex-direction")
     * so we use dom.style.setProperty() which accepts kebab-case.
     */
    setStyleProperty(element: LynxNativeElement, key: string, value: string): void {
      const dom = getDOM(element);
      // style.setProperty() natively accepts kebab-case CSS property names
      dom.style.setProperty(key, value);
    },

    removeStyleProperty(element: LynxNativeElement, key: string): void {
      getDOM(element).style.removeProperty(key);
    },

    /**
     * Add an event listener with Lynx→DOM event mapping.
     *
     * Special handling:
     * - 'tap' → 'click' (Lynx tap = DOM click)
     * - 'input' → wraps DOM event to include `detail.value` (Lynx convention)
     * - 'confirm' → 'keydown' with Enter key filter (Lynx input confirm)
     */
    addEventListener(element: LynxNativeElement, event: string, handler: Function): void {
      const dom = getDOM(element);
      let domEvent = event;
      let wrappedHandler: Function = handler;

      if (event === 'tap') {
        // Lynx 'tap' maps to DOM 'click'
        domEvent = 'click';
      } else if (event === 'input') {
        // Lynx input events have { detail: { value } } shape
        // DOM input events have event.target.value
        wrappedHandler = (e: Event) => {
          const inputEl = e.target as HTMLInputElement;
          const syntheticEvent = Object.create(e, {
            detail: {
              value: { value: inputEl.value },
              enumerable: true,
            },
          });
          handler(syntheticEvent);
        };
      } else if (event === 'confirm') {
        // Lynx 'confirm' fires when user presses Enter in an input
        domEvent = 'keydown';
        wrappedHandler = (e: Event) => {
          const keyEvent = e as KeyboardEvent;
          if (keyEvent.key === 'Enter') {
            handler(e);
          }
        };
      }

      dom.addEventListener(domEvent, wrappedHandler as EventListener);
      // Store the wrapped handler and DOM event name for cleanup
      (dom as any)[`__lynx_handler_${event}`] = wrappedHandler;
      (dom as any)[`__lynx_domevt_${event}`] = domEvent;
    },

    removeEventListener(element: LynxNativeElement, event: string, _handler: Function): void {
      const dom = getDOM(element);
      const storedHandler = (dom as any)[`__lynx_handler_${event}`] || _handler;
      const domEvent = (dom as any)[`__lynx_domevt_${event}`] || (event === 'tap' ? 'click' : event);
      dom.removeEventListener(domEvent, storedHandler as EventListener);
      delete (dom as any)[`__lynx_handler_${event}`];
      delete (dom as any)[`__lynx_domevt_${event}`];
    },

    getRootElement(): LynxNativeElement {
      const root = createNode('root');
      mountTarget.appendChild(root.__dom);
      return root as unknown as LynxNativeElement;
    },

    navigateTo(options: { url: string; params?: Record<string, any> }): void {
      console.log('[web-preview] navigateTo:', options.url, options.params);
    },

    navigateBack(_options?: { delta?: number }): void {
      console.log('[web-preview] navigateBack');
    },

    redirectTo(options: { url: string; params?: Record<string, any> }): void {
      console.log('[web-preview] redirectTo:', options.url);
    },

    onPageShow(callback: () => void): () => void {
      window.addEventListener('focus', callback);
      return () => window.removeEventListener('focus', callback);
    },

    onPageHide(callback: () => void): () => void {
      window.addEventListener('blur', callback);
      return () => window.removeEventListener('blur', callback);
    },

    onPageScroll(callback: (info: { scrollTop: number }) => void): () => void {
      const handler = () => callback({ scrollTop: window.scrollY });
      window.addEventListener('scroll', handler);
      return () => window.removeEventListener('scroll', handler);
    },
  };
}

/**
 * Install the web preview adapter.
 * Call this BEFORE `createApp()` to render Lynx elements as real DOM.
 *
 * @param mountTarget - DOM element to render into (default: document.body)
 *
 * @example
 * ```ts
 * import { installWebPreview } from 'vue-lynx/web-preview';
 * import { createApp } from 'vue-lynx';
 * import App from './App';
 *
 * installWebPreview();
 * const app = createApp(App);
 * app.mount();
 * ```
 */
export function installWebPreview(mountTarget?: HTMLElement): void {
  const target = mountTarget || document.body;

  // Inject base reset styles to approximate Lynx's layout model
  const style = document.createElement('style');
  style.textContent = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
      background-color: #f5f5f5;
    }
    [data-lynx="view"] {
      display: flex;
      flex-direction: column;
      position: relative;
    }
    [data-lynx="text"], [data-lynx="__text__"] {
      white-space: pre-wrap;
    }
    [data-lynx="image"] {
      display: block;
      object-fit: cover;
    }
    [data-lynx="scroll-view"] {
      display: flex;
      flex-direction: column;
      overflow: auto;
    }
    [data-lynx="list"] {
      display: flex;
      flex-direction: column;
      overflow: auto;
    }
    [data-lynx="list-item"] {
      display: flex;
      flex-direction: column;
    }
    [data-lynx="input"] {
      outline: none;
      border: none;
    }
    [data-lynx="root"] {
      display: flex;
      flex-direction: column;
      width: 100%;
      min-height: 100vh;
    }
    /* Make tap targets feel clickable */
    [data-lynx="view"][style*="background-color"] {
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);

  // Install the web preview API
  const api = createWebPreviewAPI(target);
  setLynxAPI(api);

  console.log(
    '%c[vue-lynx] 🌐 Web Preview Mode',
    'color: #42b883; font-weight: bold; font-size: 14px;',
    '\nRendering Lynx elements as DOM for development preview.',
    '\nThis is NOT production — deploy to Lynx runtime for native rendering.'
  );
}
