import type { App as VueApp, Component, ComponentPublicInstance } from 'vue';
import { createApp as createVueApp } from 'vue';

const STYLE_ID = 'pgg-vue-lynx-web-style';
const CLICK_BRIDGE = '__pgg_vue_lynx_click_bridge__';
const CONFIRM_BRIDGE = '__pgg_vue_lynx_confirm_bridge__';

export interface WebPlatformOptions {
  injectBaseStyles?: boolean;
  tapBridge?: boolean;
  confirmBridge?: boolean;
}

const DEFAULT_WEB_OPTIONS: Required<WebPlatformOptions> = {
  injectBaseStyles: true,
  tapBridge: true,
  confirmBridge: true,
};

export function installWebPlatform(options: WebPlatformOptions = {}) {
  if (typeof document === 'undefined') {
    return;
  }

  const resolved = { ...DEFAULT_WEB_OPTIONS, ...options };

  if (resolved.injectBaseStyles && !document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      view,page,list,list-item,scroll-view,swiper,swiper-item,frame,overlay {
        display: block;
        box-sizing: border-box;
      }
      text,raw-text,inline-truncation {
        display: inline;
        box-sizing: border-box;
      }
      image {
        display: inline-block;
        max-width: 100%;
      }
      input,textarea {
        box-sizing: border-box;
      }
      [data-lynx-teleport-root="overlay"],
      [data-lynx-teleport-root="modal"] {
        position: fixed;
        inset: 0;
        pointer-events: none;
      }
      [data-lynx-teleport-root="overlay"] > *,
      [data-lynx-teleport-root="modal"] > * {
        pointer-events: auto;
      }
    `;
    document.head.appendChild(style);
  }

  if (resolved.tapBridge && !(window as any)[CLICK_BRIDGE]) {
    (window as any)[CLICK_BRIDGE] = true;
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement | null;
      target?.dispatchEvent(new CustomEvent('tap', {
        bubbles: true,
        cancelable: true,
        detail: {
          x: (event as MouseEvent).clientX,
          y: (event as MouseEvent).clientY,
        },
      }));
    }, true);
  }

  if (resolved.confirmBridge && !(window as any)[CONFIRM_BRIDGE]) {
    (window as any)[CONFIRM_BRIDGE] = true;
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') {
        return;
      }
      const target = event.target as HTMLElement | null;
      target?.dispatchEvent(new CustomEvent('confirm', {
        bubbles: true,
        cancelable: true,
        detail: {
          value: (target as HTMLInputElement | null)?.value ?? '',
        },
      }));
    }, true);
  }

  ensureTeleportRoots();
}

export function ensureTeleportRoots() {
  if (typeof document === 'undefined') {
    return;
  }

  const roots: Array<{ id: string; dataset: string }> = [
    { id: 'overlay', dataset: 'overlay' },
    { id: 'modal', dataset: 'modal' },
  ];

  roots.forEach(({ id, dataset }) => {
    if (!document.getElementById(id)) {
      const root = document.createElement('div');
      root.id = id;
      root.dataset.lynxTeleportRoot = dataset;
      document.body.appendChild(root);
    }
  });
}

export function createWebApp(rootComponent: Component, rootProps?: Record<string, unknown>) {
  installWebPlatform();
  return createVueApp(rootComponent as any, rootProps);
}

export function mountWebApp(
  rootComponent: Component,
  container: string | Element,
  rootProps?: Record<string, unknown>,
): ComponentPublicInstance {
  const app = createWebApp(rootComponent, rootProps);
  return app.mount(container);
}

export type { App, Component, ComponentPublicInstance } from 'vue';
export * from 'vue';
