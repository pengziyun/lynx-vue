/**
 * Patch Prop
 *
 * Main entry point for patching properties on Lynx elements.
 * Dispatches to the appropriate module based on the property key.
 */

import type { LynxElement } from './types';
import { patchStyle } from './modules/style';
import { patchEvent, isEventKey } from './modules/events';
import { patchAttr, patchClass } from './modules/attrs';

function isModelListenerKey(key: string): boolean {
  return key.startsWith('onUpdate:');
}

/**
 * Patch a property on a Lynx element.
 * This is called by Vue's renderer whenever a prop changes.
 *
 * @param el - The target element
 * @param key - The property key
 * @param prevValue - Previous value
 * @param nextValue - New value
 */
export function patchProp(
  el: LynxElement,
  key: string,
  prevValue: any,
  nextValue: any,
  _namespace?: string,
  _parentComponent?: any
): void {
  // Style
  if (key === 'style') {
    patchStyle(el, prevValue, nextValue);
  }
  // Class
  else if (key === 'class') {
    patchClass(el, nextValue);
  }
  // v-model update listeners are consumed by native directives, not the event bridge
  else if (isModelListenerKey(key)) {
    if (nextValue == null) {
      delete el.props[key];
    } else {
      el.props[key] = nextValue;
    }
  }
  // Events (onXxx)
  else if (isEventKey(key)) {
    patchEvent(el, key, prevValue, nextValue);
  }
  // Special keys to skip
  else if (key === 'key' || key === 'ref') {
    // These are handled by Vue internals, not passed to the element
  }
  // Generic attributes
  else {
    patchAttr(el, key, nextValue);
  }
}
