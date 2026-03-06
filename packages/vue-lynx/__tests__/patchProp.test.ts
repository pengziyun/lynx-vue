/**
 * Tests for Patch Prop
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { nodeOps, resetNodeIdCounter } from '../src/nodeOps';
import { patchProp } from '../src/patchProp';
import { createMockLynxAPI, setLynxAPI, resetLynxAPI } from '../src/lynxAPI';

describe('patchProp', () => {
  beforeEach(() => {
    resetNodeIdCounter();
    setLynxAPI(createMockLynxAPI());
  });

  afterEach(() => {
    resetLynxAPI();
  });

  describe('style', () => {
    it('should patch inline style object', () => {
      const el = nodeOps.createElement('view');
      patchProp(el, 'style', null, { backgroundColor: 'red', fontSize: 16 });

      const nativeEl = el.__lynx_element as any;
      expect(nativeEl.__styles['background-color']).toBe('red');
      expect(nativeEl.__styles['font-size']).toBe('16px');
    });

    it('should remove old style properties', () => {
      const el = nodeOps.createElement('view');
      patchProp(el, 'style', null, { color: 'red', fontSize: 14 });
      patchProp(el, 'style', { color: 'red', fontSize: 14 }, { color: 'blue' });

      const nativeEl = el.__lynx_element as any;
      expect(nativeEl.__styles['color']).toBe('blue');
      // font-size should be removed
    });

    it('should handle unitless properties', () => {
      const el = nodeOps.createElement('view');
      patchProp(el, 'style', null, { opacity: 0.5, flex: 1, zIndex: 10 });

      const nativeEl = el.__lynx_element as any;
      expect(nativeEl.__styles['opacity']).toBe('0.5');
      expect(nativeEl.__styles['flex']).toBe('1');
      expect(nativeEl.__styles['z-index']).toBe('10');
    });
  });

  describe('class', () => {
    it('should set class string', () => {
      const el = nodeOps.createElement('view');
      patchProp(el, 'class', null, 'container active');

      const nativeEl = el.__lynx_element as any;
      expect(nativeEl.__props['class']).toBe('container active');
    });

    it('should handle class object', () => {
      const el = nodeOps.createElement('view');
      patchProp(el, 'class', null, { active: true, disabled: false });

      const nativeEl = el.__lynx_element as any;
      expect(nativeEl.__props['class']).toBe('active');
    });

    it('should handle class array', () => {
      const el = nodeOps.createElement('view');
      patchProp(el, 'class', null, ['base', { active: true }]);

      const nativeEl = el.__lynx_element as any;
      expect(nativeEl.__props['class']).toBe('base active');
    });
  });

  describe('events', () => {
    it('should add event listener', () => {
      const el = nodeOps.createElement('view');
      const handler = () => {};

      patchProp(el, 'onTap', null, handler);

      expect(el.eventListeners.has('tap')).toBe(true);
      const nativeEl = el.__lynx_element as any;
      expect(nativeEl.__events['tap']).toBeDefined();
    });

    it('should map onClick to tap', () => {
      const el = nodeOps.createElement('view');
      const handler = () => {};

      patchProp(el, 'onClick', null, handler);

      expect(el.eventListeners.has('tap')).toBe(true);
    });

    it('should remove old event listener when updating', () => {
      const el = nodeOps.createElement('view');
      const handler1 = () => {};
      const handler2 = () => {};

      patchProp(el, 'onTap', null, handler1);
      patchProp(el, 'onTap', handler1, handler2);

      // Should have the new handler
      expect(el.eventListeners.has('tap')).toBe(true);
    });

    it('should remove event listener when value is null', () => {
      const el = nodeOps.createElement('view');
      const handler = () => {};

      patchProp(el, 'onTap', null, handler);
      patchProp(el, 'onTap', handler, null);

      expect(el.eventListeners.has('tap')).toBe(false);
    });

    it('should keep model listeners off the native event bridge', () => {
      const el = nodeOps.createElement('input');
      const handler = () => {};

      patchProp(el, 'onUpdate:modelValue', null, handler);

      expect(el.props['onUpdate:modelValue']).toBe(handler);
      expect(el.eventListeners.size).toBe(0);
      const nativeEl = el.__lynx_element as any;
      expect(nativeEl.__events['update:modelValue']).toBeUndefined();
    });
  });

  describe('attributes', () => {
    it('should set generic attribute', () => {
      const el = nodeOps.createElement('image');
      patchProp(el, 'src', null, 'https://example.com/img.png');

      const nativeEl = el.__lynx_element as any;
      expect(nativeEl.__props['src']).toBe('https://example.com/img.png');
    });

    it('should remove attribute when value is null', () => {
      const el = nodeOps.createElement('input');
      patchProp(el, 'placeholder', null, 'Enter text');
      patchProp(el, 'placeholder', 'Enter text', null);

      // Attribute should be removed
      expect(el.props['placeholder']).toBeUndefined();
    });

    it('should skip key and ref props', () => {
      const el = nodeOps.createElement('view');
      patchProp(el, 'key', null, 'my-key');
      patchProp(el, 'ref', null, 'my-ref');

      const nativeEl = el.__lynx_element as any;
      expect(nativeEl.__props['key']).toBeUndefined();
      expect(nativeEl.__props['ref']).toBeUndefined();
    });
  });
});
