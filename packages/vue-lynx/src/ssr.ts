import type { App as VueApp, Component } from 'vue';
import { createSSRApp as createVueSSRApp } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { ensureTeleportRoots, installWebPlatform } from './web';

export function createLynxSSRApp(rootComponent: Component, rootProps?: Record<string, unknown>) {
  return createVueSSRApp(rootComponent as any, rootProps);
}

export async function renderLynxToString(rootComponent: Component, rootProps?: Record<string, unknown>) {
  const app = createLynxSSRApp(rootComponent, rootProps);
  return renderToString(app);
}

export function installHydrationPlatform() {
  installWebPlatform();
  ensureTeleportRoots();
}

export { renderToString };
export * from 'vue';
