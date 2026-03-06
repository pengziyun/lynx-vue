import type { Component } from 'vue';
import { createApp } from '../../vue-lynx/src/index';
import { createMockLynxAPI, setLynxAPI } from '../../vue-lynx/src/lynxAPI';
import { resetNodeIdCounter } from '../../vue-lynx/src/nodeOps';

export function renderNative(component: Component) {
  resetNodeIdCounter();
  const lynx = createMockLynxAPI();
  setLynxAPI(lynx);
  const app = createApp(component);
  const vm = app.mount();

  return {
    app,
    vm,
    lynx,
  };
}

export async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
}
