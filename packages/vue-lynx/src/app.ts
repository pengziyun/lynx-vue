import type { App, Component } from '@vue/runtime-core';
import type { LynxElement, LynxNativeElement } from './types';
import { renderer } from './renderer';
import { getLynx } from './lynxAPI';

export interface LynxApp extends Omit<App, 'mount'> {
  mount(container?: LynxElement | string): ReturnType<App['mount']>;
}

export const LYNX_ELEMENTS = new Set([
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
]);

export function isLynxElement(tag: string): boolean {
  return LYNX_ELEMENTS.has(tag);
}

export function createRootContainer(nativeRoot?: LynxNativeElement): LynxElement {
  const lynx = getLynx();

  return {
    id: 0,
    type: 'root',
    tagName: 'root',
    parentNode: null,
    children: [],
    props: {},
    eventListeners: new Map(),
    __lynx_element: nativeRoot ?? lynx.getRootElement(),
  };
}

export function createLynxApp(
  rootComponent: Component,
  rootProps?: Record<string, unknown>,
): LynxApp {
  const app = renderer.createApp(rootComponent, rootProps);
  const originalMount = app.mount;

  const mount = (containerOrSelector?: LynxElement | string): ReturnType<App['mount']> => {
    const container = containerOrSelector || createRootContainer();
    return originalMount(container as unknown as string);
  };

  app.config.compilerOptions = {
    ...app.config.compilerOptions,
    isCustomElement: isLynxElement,
  };

  if (!app.config.errorHandler) {
    app.config.errorHandler = (err, _instance, info) => {
      console.error(`[vue-lynx] Error in ${info}:`, err);
    };
  }

  const lynxApp = app as unknown as LynxApp;
  (lynxApp as unknown as { mount: typeof mount }).mount = mount;

  return lynxApp;
}
