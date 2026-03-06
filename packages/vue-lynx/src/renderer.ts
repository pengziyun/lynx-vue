/**
 * Vue-Lynx Renderer
 *
 * Creates the Vue 3 custom renderer configured for Lynx.
 */

import { createRenderer } from '@vue/runtime-core';
import type { LynxNode, LynxElement } from './types';
import { nodeOps } from './nodeOps';
import { patchProp } from './patchProp';

/**
 * The Vue-Lynx renderer instance.
 * Created using Vue 3's createRenderer with Lynx-specific node operations.
 */
export const renderer = createRenderer<LynxNode, LynxElement>({
  ...nodeOps,
  patchProp,
});
