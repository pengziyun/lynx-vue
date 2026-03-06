/**
 * Vue-Lynx Entry Point
 *
 * This is the main entry point for the vue-lynx package.
 * It exports the createApp function and re-exports all Vue 3 core APIs
 * that are compatible with the Lynx runtime.
 */

import { createLynxApp } from './app';
import type { LynxNode } from './types';

export type { LynxApp } from './app';
export { LYNX_ELEMENTS, createRootContainer, isLynxElement } from './app';
export { defineLynxEntry, lynxPageDataKey, useLynxData, type LynxEntryOptions } from './entry';

export const createApp = createLynxApp;

// ============================================================
// Re-exports from @vue/runtime-core
// ============================================================

// Reactivity API
export {
  ref,
  reactive,
  readonly,
  computed,
  watch,
  watchEffect,
  watchPostEffect,
  watchSyncEffect,
  isRef,
  unref,
  toRef,
  toRefs,
  isReactive,
  isReadonly,
  isProxy,
  shallowRef,
  triggerRef,
  customRef,
  shallowReactive,
  shallowReadonly,
  toRaw,
  markRaw,
  effectScope,
  getCurrentScope,
  onScopeDispose,
} from '@vue/runtime-core';

// Lifecycle hooks
export {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onActivated,
  onDeactivated,
  onErrorCaptured,
  onRenderTracked,
  onRenderTriggered,
} from '@vue/runtime-core';

// Component API
export {
  defineComponent,
  defineAsyncComponent,
  getCurrentInstance,
  h,
  createVNode,
  cloneVNode,
  mergeProps,
  isVNode,
} from '@vue/runtime-core';

export {
  KeepAlive,
  Suspense,
  Teleport,
  Transition,
  TransitionGroup,
  withDirectives,
  resolveDirective,
} from './native-vue';

// Dependency injection
export {
  provide,
  inject,
} from '@vue/runtime-core';

// Miscellaneous
export {
  nextTick,
  version,
} from '@vue/runtime-core';

// Types
export type {
  Ref,
  ComputedRef,
  UnwrapRef,
  ShallowRef,
  WritableComputedRef,
  ToRef,
  ToRefs,
  WatchEffect,
  WatchOptions,
  WatchStopHandle,
  ComponentPublicInstance,
  PropType,
  ComponentOptions,
  SetupContext,
  App,
  Plugin,
  Directive,
  DirectiveBinding,
  VNode,
} from '@vue/runtime-core';

// Lynx-specific lifecycle hooks
export { onPageShow, onPageHide, onPageScroll } from './lifecycle';

// Lynx API utilities
export {
  createMockLynxAPI,
  getLynx,
  hasNativeElementPAPI,
  installNativeLynxAPI,
  setLynxAPI,
} from './lynxAPI';

// Types
export type {
  LynxNode,
  LynxElement,
  LynxTextNode,
  LynxEvent,
  LynxTapEvent,
  LynxScrollEvent,
  LynxInputEvent,
  LynxStyleProperties,
  LynxGlobalAPI,
  ViewProps,
  TextProps,
  ImageProps,
  ScrollViewProps,
  InputProps,
  ListProps,
  ListItemProps,
} from './types';

// Node operations (for advanced usage / testing)
export { nodeOps, resetNodeIdCounter } from './nodeOps';
export { patchProp } from './patchProp';
export { renderer } from './renderer';
