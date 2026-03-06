/**
 * Events Module
 *
 * Handles event binding and bridging between Vue and Lynx.
 * Vue uses onXxx naming convention, which is mapped to Lynx event names.
 *
 * [P0-002 FIX] Uses the "invoker" pattern (same as Vue's DOM renderer)
 * to avoid removing and re-adding event listeners on every update.
 * Instead, a stable invoker function is registered once, and its
 * `.value` property is swapped to point to the latest handler.
 */

import type { LynxElement, LynxEvent } from '../types';
import { getLynx } from '../lynxAPI';

/**
 * Mapping from Vue event handler names (onXxx) to Lynx event names.
 * Vue template @tap compiles to onTap, @click compiles to onClick, etc.
 */
const VUE_TO_LYNX_EVENT_MAP: Record<string, string> = {
  // Tap / Click
  onClick: 'tap',
  onTap: 'tap',

  // Touch
  onTouchstart: 'touchstart',
  onTouchStart: 'touchstart',
  onTouchmove: 'touchmove',
  onTouchMove: 'touchmove',
  onTouchend: 'touchend',
  onTouchEnd: 'touchend',
  onTouchcancel: 'touchcancel',
  onTouchCancel: 'touchcancel',

  // Long press
  onLongpress: 'longpress',
  onLongPress: 'longpress',

  // Scroll
  onScroll: 'scroll',
  onScrolltoupper: 'scrolltoupper',
  onScrollToUpper: 'scrolltoupper',
  onScrolltolower: 'scrolltolower',
  onScrollToLower: 'scrolltolower',

  // Form
  onInput: 'input',
  onFocus: 'focus',
  onBlur: 'blur',
  onConfirm: 'confirm',
  onChange: 'change',

  // Media
  onLoad: 'load',
  onError: 'error',

  // Animation
  onAnimationstart: 'animationstart',
  onAnimationStart: 'animationstart',
  onAnimationend: 'animationend',
  onAnimationEnd: 'animationend',
  onAnimationiteration: 'animationiteration',
  onAnimationIteration: 'animationiteration',
  onTransitionend: 'transitionend',
  onTransitionEnd: 'transitionend',
};

/**
 * Check if a key is an event handler (starts with "on" followed by uppercase).
 */
export function isEventKey(key: string): boolean {
  return key.length > 2 && key.startsWith('on') && key[2] !== key[2].toLowerCase();
}

/**
 * Resolve a Vue event handler name to the corresponding Lynx event name.
 *
 * [P1-011 FIX] Simplified resolution: uses explicit mapping with both
 * camelCase variants (e.g., onTouchstart and onTouchStart) instead of
 * buggy lowercase transformation logic.
 *
 * @param rawName - The Vue event handler name (e.g., "onTap", "onClick")
 * @returns The Lynx event name (e.g., "tap")
 */
export function resolveEventName(rawName: string): string {
  // Check the explicit mapping first
  if (VUE_TO_LYNX_EVENT_MAP[rawName]) {
    return VUE_TO_LYNX_EVENT_MAP[rawName];
  }

  // Default: strip "on" prefix and lowercase the first letter
  if (rawName.startsWith('on')) {
    const name = rawName.slice(2);
    return name.charAt(0).toLowerCase() + name.slice(1);
  }

  return rawName;
}

/**
 * Normalize a Lynx event into a standard event object.
 */
export function normalizeEvent(rawEvent: any, eventName: string): LynxEvent {
  return {
    type: eventName,
    target: rawEvent?.target ?? null,
    currentTarget: rawEvent?.currentTarget ?? null,
    detail: rawEvent?.detail ?? {},
    touches: rawEvent?.touches,
    changedTouches: rawEvent?.changedTouches,
    timestamp: rawEvent?.timeStamp ?? Date.now(),
    preventDefault() {
      rawEvent?.preventDefault?.();
    },
    stopPropagation() {
      rawEvent?.stopPropagation?.();
    },
    _raw: rawEvent,
  };
}

/**
 * Event invoker interface.
 * The invoker is a stable function reference registered with Lynx's
 * addEventListener. Its `.value` property holds the actual handler
 * and can be swapped without removing/re-adding the native listener.
 */
interface EventInvoker {
  (rawEvent: any): void;
  value: Function;
}

/**
 * Create an event invoker that wraps the handler function.
 * The invoker normalizes the raw Lynx event before passing to the handler.
 */
function createInvoker(initialValue: Function, eventName: string): EventInvoker {
  const invoker: EventInvoker = (rawEvent: any) => {
    const normalizedEvent = normalizeEvent(rawEvent, eventName);
    invoker.value(normalizedEvent);
  };
  invoker.value = initialValue;
  return invoker;
}

/**
 * Patch an event handler on a Lynx element using the invoker pattern.
 *
 * - When adding a new event: creates an invoker, registers it with Lynx
 * - When updating an event: swaps the invoker's `.value` (no native re-bindhing)
 * - When removing an event: removes the invoker from Lynx and cleans up
 *
 * @param el - The target element
 * @param rawName - Vue event handler name (e.g., "onTap")
 * @param prevValue - Previous handler function
 * @param nextValue - New handler function
 */
export function patchEvent(
  el: LynxElement,
  rawName: string,
  prevValue: Function | null | undefined,
  nextValue: Function | null | undefined
): void {
  const lynxEventName = resolveEventName(rawName);

  // Vue Event Invokers storage on the element
  const invokers = (el as any)._vei || ((el as any)._vei = {} as Record<string, EventInvoker>);
  const existingInvoker = invokers[lynxEventName];

  if (nextValue && existingInvoker) {
    // Update: just swap the handler value, no need to remove/re-add listener
    existingInvoker.value = nextValue;
  } else if (nextValue) {
    // Add new: create invoker and register with Lynx
    const invoker = createInvoker(nextValue, lynxEventName);
    invokers[lynxEventName] = invoker;
    el.eventListeners.set(lynxEventName, invoker);

    if (el.__lynx_element) {
      const lynx = getLynx();
      lynx.addEventListener(el.__lynx_element, lynxEventName, invoker);
    }
  } else if (existingInvoker) {
    // Remove: unregister from Lynx and clean up
    if (el.__lynx_element) {
      const lynx = getLynx();
      lynx.removeEventListener(el.__lynx_element, lynxEventName, existingInvoker);
    }
    el.eventListeners.delete(lynxEventName);
    delete invokers[lynxEventName];
  }
}
