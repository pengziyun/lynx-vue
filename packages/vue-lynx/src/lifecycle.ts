/**
 * Lynx-specific Lifecycle Hooks
 *
 * Provides Vue composition API hooks for Lynx page lifecycle events.
 */

import { onMounted, onUnmounted, getCurrentInstance } from '@vue/runtime-core';
import { getLynx } from './lynxAPI';

/**
 * Called when the page becomes visible.
 * Similar to the 'pageshow' event in web.
 *
 * @param callback - Function to call when the page is shown
 */
export function onPageShow(callback: () => void): void {
  const instance = getCurrentInstance();
  if (!instance) {
    if (__DEV__) {
      console.warn('[vue-lynx] onPageShow must be called inside setup().');
    }
    return;
  }

  onMounted(() => {
    const lynx = getLynx();
    const cleanup = lynx.onPageShow(callback);

    onUnmounted(() => {
      cleanup();
    });
  });
}

/**
 * Called when the page becomes hidden.
 * Similar to the 'pagehide' event in web.
 *
 * @param callback - Function to call when the page is hidden
 */
export function onPageHide(callback: () => void): void {
  const instance = getCurrentInstance();
  if (!instance) {
    if (__DEV__) {
      console.warn('[vue-lynx] onPageHide must be called inside setup().');
    }
    return;
  }

  onMounted(() => {
    const lynx = getLynx();
    const cleanup = lynx.onPageHide(callback);

    onUnmounted(() => {
      cleanup();
    });
  });
}

/**
 * Called when the page scrolls.
 *
 * @param callback - Function to call with scroll information
 */
export function onPageScroll(
  callback: (info: { scrollTop: number }) => void
): void {
  const instance = getCurrentInstance();
  if (!instance) {
    if (__DEV__) {
      console.warn('[vue-lynx] onPageScroll must be called inside setup().');
    }
    return;
  }

  onMounted(() => {
    const lynx = getLynx();
    const cleanup = lynx.onPageScroll(callback);

    onUnmounted(() => {
      cleanup();
    });
  });
}

declare const __DEV__: boolean;
