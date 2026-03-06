/**
 * Style Module
 *
 * Handles patching of style properties on Lynx elements.
 * Supports both inline style objects and style strings.
 */

import type { LynxElement } from '../types';
import { getLynx } from '../lynxAPI';

/**
 * CSS properties that should NOT have 'px' appended when set as numbers.
 */
const UNITLESS_PROPERTIES = new Set([
  'flex',
  'flexGrow',
  'flexShrink',
  'flexOrder',
  'opacity',
  'zIndex',
  'fontWeight',
  'lineClamp',
  'lines',
  'numberOfLines',
  'order',
  'flexPositive',
  'flexNegative',
]);

/**
 * Patch style on a Lynx element.
 */
export function patchStyle(
  el: LynxElement,
  prev: Record<string, any> | string | null | undefined,
  next: Record<string, any> | string | null | undefined
): void {
  const prevStyle = normalizeStyle(prev);
  const nextStyle = normalizeStyle(next);

  if (!el.__lynx_element) return;

  const lynx = getLynx();

  // Remove old styles that are not in the new style
  if (prevStyle) {
    for (const key in prevStyle) {
      if (!nextStyle || !(key in nextStyle)) {
        const cssKey = camelToKebab(key);
        lynx.removeStyleProperty(el.__lynx_element, cssKey);
      }
    }
  }

  // Set new/changed styles
  if (nextStyle) {
    for (const key in nextStyle) {
      const value = nextStyle[key];
      if (!prevStyle || prevStyle[key] !== value) {
        setStyleProperty(el, key, value);
      }
    }
  }
}

/**
 * Set a single style property on an element.
 */
function setStyleProperty(el: LynxElement, key: string, value: any): void {
  if (!el.__lynx_element) return;

  const lynx = getLynx();
  const cssKey = camelToKebab(key);

  // Handle null/undefined/false - remove the property
  if (value == null || value === false) {
    lynx.removeStyleProperty(el.__lynx_element, cssKey);
    return;
  }

  // Convert numeric values to px string (unless unitless)
  let cssValue: string;
  if (typeof value === 'number') {
    cssValue = UNITLESS_PROPERTIES.has(key) ? String(value) : `${value}px`;
  } else {
    cssValue = String(value);
  }

  lynx.setStyleProperty(el.__lynx_element, cssKey, cssValue);
}

/**
 * Normalize a style value to a flat object.
 * Supports:
 *  - Style objects: { color: 'red', fontSize: 14 }
 *  - Style strings: "color: red; font-size: 14px"
 *  - null/undefined
 */
function normalizeStyle(
  value: Record<string, any> | string | null | undefined
): Record<string, any> | null {
  if (!value) return null;

  if (typeof value === 'string') {
    return parseStyleString(value);
  }

  if (typeof value === 'object') {
    return value;
  }

  return null;
}

/**
 * Parse a CSS style string into an object.
 * "color: red; font-size: 14px" → { color: "red", fontSize: "14px" }
 */
export function parseStyleString(str: string): Record<string, any> {
  const result: Record<string, any> = {};

  str.split(';').forEach((declaration) => {
    const colonIndex = declaration.indexOf(':');
    if (colonIndex < 0) return;

    const key = declaration.slice(0, colonIndex).trim();
    const value = declaration.slice(colonIndex + 1).trim();

    if (key && value) {
      result[kebabToCamel(key)] = value;
    }
  });

  return result;
}

/**
 * Convert camelCase to kebab-case.
 * "fontSize" → "font-size"
 */
export function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

/**
 * Convert kebab-case to camelCase.
 * "font-size" → "fontSize"
 */
export function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}
