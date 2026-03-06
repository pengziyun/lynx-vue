/**
 * Attributes Module
 *
 * Handles patching of generic attributes on Lynx elements.
 * These are properties that are not style, class, or events.
 */

import type { LynxElement } from '../types';
import { getLynx } from '../lynxAPI';

/**
 * Properties that should be set via setProperty instead of setAttribute.
 * These are typically properties with special behavior in Lynx.
 */
const DIRECT_PROPERTIES = new Set([
  'value',
  'checked',
  'selected',
  'disabled',
  'autoFocus',
  'scrollTop',
  'scrollLeft',
  'scrollX',
  'scrollY',
]);

/**
 * Boolean attributes - these are set as empty string when true, removed when false.
 */
const BOOLEAN_ATTRS = new Set([
  'disabled',
  'readonly',
  'autofocus',
  'autoFocus',
  'checked',
  'selected',
  'scrollX',
  'scrollY',
  'scroll-x',
  'scroll-y',
]);

/**
 * Patch an attribute on a Lynx element.
 */
export function patchAttr(
  el: LynxElement,
  key: string,
  value: any
): void {
  if (!el.__lynx_element) return;

  const lynx = getLynx();

  // Handle removal
  if (value == null || value === false) {
    if (BOOLEAN_ATTRS.has(key)) {
      lynx.removeAttribute(el.__lynx_element, key);
    } else {
      lynx.removeAttribute(el.__lynx_element, key);
    }
    // Update local props
    delete el.props[key];
    return;
  }

  // Handle boolean attributes
  if (BOOLEAN_ATTRS.has(key)) {
    value = value === true || value === '' ? '' : value;
  }

  // Set the property/attribute
  if (DIRECT_PROPERTIES.has(key)) {
    lynx.setProperty(el.__lynx_element, key, value);
  } else {
    lynx.setAttribute(el.__lynx_element, key, value);
  }

  // Update local props
  el.props[key] = value;
}

/**
 * Patch class on a Lynx element.
 * Supports:
 *  - String: "foo bar"
 *  - Object: { foo: true, bar: false }
 *  - Array: ["foo", { bar: true }]
 */
export function patchClass(
  el: LynxElement,
  value: string | Record<string, boolean> | Array<string | Record<string, boolean>> | null | undefined
): void {
  if (!el.__lynx_element) return;

  const lynx = getLynx();
  const className = normalizeClass(value);

  lynx.setAttribute(el.__lynx_element, 'class', className);
  el.props.class = className;
}

/**
 * Normalize class value to a string.
 */
export function normalizeClass(
  value: string | Record<string, boolean> | Array<string | Record<string, boolean>> | null | undefined
): string {
  if (!value) return '';

  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeClass(item))
      .filter(Boolean)
      .join(' ');
  }

  if (typeof value === 'object') {
    return Object.entries(value)
      .filter(([, active]) => active)
      .map(([name]) => name)
      .join(' ');
  }

  return '';
}
