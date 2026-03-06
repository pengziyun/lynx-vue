/**
 * Tests for Events Module
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolveEventName, isEventKey, normalizeEvent, patchEvent } from '../src/modules/events';
import { nodeOps, resetNodeIdCounter } from '../src/nodeOps';
import { createMockLynxAPI, setLynxAPI, resetLynxAPI } from '../src/lynxAPI';

describe('events module', () => {
  describe('isEventKey', () => {
    it('should return true for event keys', () => {
      expect(isEventKey('onTap')).toBe(true);
      expect(isEventKey('onClick')).toBe(true);
      expect(isEventKey('onScroll')).toBe(true);
      expect(isEventKey('onInput')).toBe(true);
    });

    it('should return false for non-event keys', () => {
      expect(isEventKey('style')).toBe(false);
      expect(isEventKey('class')).toBe(false);
      expect(isEventKey('src')).toBe(false);
      expect(isEventKey('on')).toBe(false);
      expect(isEventKey('once')).toBe(false);
    });
  });

  describe('resolveEventName', () => {
    it('should map onClick to tap', () => {
      expect(resolveEventName('onClick')).toBe('tap');
    });

    it('should map onTap to tap', () => {
      expect(resolveEventName('onTap')).toBe('tap');
    });

    it('should map onScroll to scroll', () => {
      expect(resolveEventName('onScroll')).toBe('scroll');
    });

    it('should map onInput to input', () => {
      expect(resolveEventName('onInput')).toBe('input');
    });

    it('should map onFocus to focus', () => {
      expect(resolveEventName('onFocus')).toBe('focus');
    });

    it('should handle unknown events by lowercasing', () => {
      expect(resolveEventName('onCustomEvent')).toBe('customEvent');
    });
  });

  describe('normalizeEvent', () => {
    it('should create normalized event from raw event', () => {
      const rawEvent = {
        target: { id: 'btn' },
        currentTarget: { id: 'btn' },
        detail: { x: 100, y: 200 },
        timeStamp: 1234567890,
      };

      const event = normalizeEvent(rawEvent, 'tap');

      expect(event.type).toBe('tap');
      expect(event.target).toBe(rawEvent.target);
      expect(event.currentTarget).toBe(rawEvent.currentTarget);
      expect(event.detail).toBe(rawEvent.detail);
      expect(event.timestamp).toBe(1234567890);
      expect(event._raw).toBe(rawEvent);
    });

    it('should handle null/undefined raw event', () => {
      const event = normalizeEvent(null, 'tap');

      expect(event.type).toBe('tap');
      expect(event.target).toBeNull();
      expect(event.detail).toEqual({});
    });

    it('should provide preventDefault and stopPropagation', () => {
      let preventDefaultCalled = false;
      let stopPropagationCalled = false;

      const rawEvent = {
        preventDefault: () => { preventDefaultCalled = true; },
        stopPropagation: () => { stopPropagationCalled = true; },
      };

      const event = normalizeEvent(rawEvent, 'tap');

      event.preventDefault();
      expect(preventDefaultCalled).toBe(true);

      event.stopPropagation();
      expect(stopPropagationCalled).toBe(true);
    });
  });

  // ── P0-002 Regression: Invoker pattern for event updates ──

  describe('patchEvent (invoker pattern)', () => {
    beforeEach(() => {
      resetNodeIdCounter();
      setLynxAPI(createMockLynxAPI());
    });

    afterEach(() => {
      resetLynxAPI();
    });

    it('[P0-002] should register event handler using invoker', () => {
      const el = nodeOps.createElement('view');
      const handler = () => {};

      patchEvent(el, 'onTap', null, handler);

      // Should have an invoker on _vei
      const invokers = (el as any)._vei;
      expect(invokers).toBeDefined();
      expect(invokers.tap).toBeDefined();
      expect(invokers.tap.value).toBe(handler);
    });

    it('[P0-002] should update handler by swapping invoker value without re-binding', () => {
      const el = nodeOps.createElement('view');
      const handler1 = () => 'first';
      const handler2 = () => 'second';

      // Add initial handler
      patchEvent(el, 'onTap', null, handler1);
      const invokers = (el as any)._vei;
      const originalInvoker = invokers.tap;

      // Update handler - should reuse same invoker
      patchEvent(el, 'onTap', handler1, handler2);

      expect(invokers.tap).toBe(originalInvoker); // Same invoker reference
      expect(invokers.tap.value).toBe(handler2); // But value swapped

      // Native event listener should NOT be removed and re-added
      const nativeEl = el.__lynx_element as any;
      expect(nativeEl.__events.tap).toBe(originalInvoker);
    });

    it('[P0-002] should remove event handler and clean up invoker', () => {
      const el = nodeOps.createElement('view');
      const handler = () => {};

      patchEvent(el, 'onTap', null, handler);
      expect((el as any)._vei.tap).toBeDefined();

      // Remove handler
      patchEvent(el, 'onTap', handler, null);
      expect((el as any)._vei.tap).toBeUndefined();

      // Native listener should be removed
      const nativeEl = el.__lynx_element as any;
      expect(nativeEl.__events.tap).toBeUndefined();
    });

    it('[P0-002] should handle rapid handler updates without losing events', () => {
      const el = nodeOps.createElement('view');
      const calls: string[] = [];

      // Simulate rapid handler updates (like in render loop)
      for (let i = 0; i < 10; i++) {
        const prev = i === 0 ? null : () => calls.push(`handler-${i - 1}`);
        const next = () => calls.push(`handler-${i}`);
        patchEvent(el, 'onTap', prev, next);
      }

      // The invoker should point to the last handler
      const invoker = (el as any)._vei.tap;
      expect(invoker).toBeDefined();

      // Simulate event firing
      invoker({});
      expect(calls).toEqual(['handler-9']);
    });

    it('[P0-002] should handle multiple different events on same element', () => {
      const el = nodeOps.createElement('view');
      const tapHandler = () => {};
      const scrollHandler = () => {};

      patchEvent(el, 'onTap', null, tapHandler);
      patchEvent(el, 'onScroll', null, scrollHandler);

      const invokers = (el as any)._vei;
      expect(invokers.tap).toBeDefined();
      expect(invokers.scroll).toBeDefined();
      expect(invokers.tap.value).toBe(tapHandler);
      expect(invokers.scroll.value).toBe(scrollHandler);
    });
  });
});
