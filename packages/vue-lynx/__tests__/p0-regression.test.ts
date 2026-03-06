/**
 * Regression Tests for P0 Bug Fixes
 *
 * CR-001: nodeOps.insert() — comment node anchor handling
 * CR-002: events — invoker pattern
 * CR-003: nodeOps.setElementText() — native child cleanup
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { nodeOps, resetNodeIdCounter } from '../src/nodeOps';
import { patchEvent, resolveEventName } from '../src/modules/events';
import { createMockLynxAPI, setLynxAPI, resetLynxAPI } from '../src/lynxAPI';
import type { LynxElement } from '../src/types';

describe('P0 Regression Tests', () => {
  let mockAPI: ReturnType<typeof createMockLynxAPI>;

  beforeEach(() => {
    resetNodeIdCounter();
    mockAPI = createMockLynxAPI();
    setLynxAPI(mockAPI);
  });

  afterEach(() => {
    resetLynxAPI();
  });

  // ======================================================
  // CR-001: Comment node anchor — findNextNativeElement
  // ======================================================
  describe('CR-001: insert with comment node anchor', () => {
    it('should insert before next native sibling when anchor is a comment node', () => {
      const parent = nodeOps.createElement('view');
      const existingChild = nodeOps.createElement('text');
      const comment = nodeOps.createComment('v-if anchor');
      const anotherChild = nodeOps.createElement('text');

      // Build: [existingChild, comment, anotherChild]
      nodeOps.insert(existingChild, parent);
      nodeOps.insert(comment, parent);
      nodeOps.insert(anotherChild, parent);

      // Insert newChild before comment anchor
      const newChild = nodeOps.createElement('image');
      nodeOps.insert(newChild, parent, comment);

      // Virtual tree: newChild should be before comment
      const commentIndex = parent.children.indexOf(comment);
      const newChildIndex = parent.children.indexOf(newChild);
      expect(newChildIndex).toBeLessThan(commentIndex);

      // Native tree: newChild should be inserted before anotherChild
      // (the next sibling with a native element after the comment)
      const nativeParent = parent.__lynx_element as any;
      const nativeNewChild = newChild.__lynx_element as any;
      const nativeAnotherChild = anotherChild.__lynx_element as any;

      const nativeNewChildIndex = nativeParent.__children.indexOf(nativeNewChild);
      const nativeAnotherChildIndex = nativeParent.__children.indexOf(nativeAnotherChild);

      expect(nativeNewChildIndex).toBeGreaterThanOrEqual(0);
      expect(nativeNewChildIndex).toBeLessThan(nativeAnotherChildIndex);
    });

    it('should append when comment anchor has no following native siblings', () => {
      const parent = nodeOps.createElement('view');
      const existingChild = nodeOps.createElement('text');
      const comment = nodeOps.createComment('v-if end');

      // Build: [existingChild, comment]
      nodeOps.insert(existingChild, parent);
      nodeOps.insert(comment, parent);

      // Insert newChild before comment (comment is last, no native sibling after it)
      const newChild = nodeOps.createElement('image');
      nodeOps.insert(newChild, parent, comment);

      // Virtual tree: newChild before comment
      expect(parent.children.indexOf(newChild)).toBeLessThan(
        parent.children.indexOf(comment)
      );

      // Native tree: newChild should be appended (since no native anchor found)
      const nativeParent = parent.__lynx_element as any;
      const nativeNewChild = newChild.__lynx_element as any;
      expect(nativeParent.__children).toContain(nativeNewChild);
    });

    it('should handle multiple consecutive comment nodes', () => {
      const parent = nodeOps.createElement('view');
      const comment1 = nodeOps.createComment('v-if');
      const comment2 = nodeOps.createComment('v-else');
      const realChild = nodeOps.createElement('text');

      // Build: [comment1, comment2, realChild]
      nodeOps.insert(comment1, parent);
      nodeOps.insert(comment2, parent);
      nodeOps.insert(realChild, parent);

      // Insert before comment1 — should find realChild as native anchor
      const newChild = nodeOps.createElement('view');
      nodeOps.insert(newChild, parent, comment1);

      const nativeParent = parent.__lynx_element as any;
      const nativeNewChild = newChild.__lynx_element as any;
      const nativeRealChild = realChild.__lynx_element as any;

      const newIdx = nativeParent.__children.indexOf(nativeNewChild);
      const realIdx = nativeParent.__children.indexOf(nativeRealChild);

      expect(newIdx).toBeGreaterThanOrEqual(0);
      expect(newIdx).toBeLessThan(realIdx);
    });

    it('should work correctly with v-if/v-else pattern', () => {
      // Simulates: <view> <text v-if>A</text> <!-- anchor --> <text>B</text> </view>
      const parent = nodeOps.createElement('view');
      const ifContent = nodeOps.createElement('text');   // v-if content
      const anchor = nodeOps.createComment('v-if');       // v-if anchor
      const staticChild = nodeOps.createElement('text');  // static sibling

      nodeOps.insert(ifContent, parent);
      nodeOps.insert(anchor, parent);
      nodeOps.insert(staticChild, parent);

      // Now toggle v-if: remove ifContent, insert elseContent before anchor
      nodeOps.remove(ifContent);
      const elseContent = nodeOps.createElement('text');
      nodeOps.insert(elseContent, parent, anchor);

      // elseContent should be before anchor in virtual tree
      expect(parent.children.indexOf(elseContent)).toBeLessThan(
        parent.children.indexOf(anchor)
      );

      // In native tree, elseContent should be before staticChild
      const nativeParent = parent.__lynx_element as any;
      const nativeElse = elseContent.__lynx_element as any;
      const nativeStatic = staticChild.__lynx_element as any;

      const elseIdx = nativeParent.__children.indexOf(nativeElse);
      const staticIdx = nativeParent.__children.indexOf(nativeStatic);

      expect(elseIdx).toBeGreaterThanOrEqual(0);
      expect(elseIdx).toBeLessThan(staticIdx);
    });
  });

  // ======================================================
  // CR-002: Event invoker pattern
  // ======================================================
  describe('CR-002: event invoker pattern', () => {
    function createTestElement(): LynxElement {
      return nodeOps.createElement('view');
    }

    it('should add event handler via invoker', () => {
      const el = createTestElement();
      const handler = vi.fn();

      patchEvent(el, 'onTap', null, handler);

      // Invoker should be stored
      expect((el as any)._vei).toBeDefined();
      expect((el as any)._vei['tap']).toBeDefined();
      expect(el.eventListeners.has('tap')).toBe(true);

      // Native should have the event
      const nativeEl = el.__lynx_element as any;
      expect(nativeEl.__events['tap']).toBeDefined();
    });

    it('should update handler without removing/re-adding listener', () => {
      const el = createTestElement();
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      // Add initial handler
      patchEvent(el, 'onTap', null, handler1);
      const invokerAfterAdd = (el as any)._vei['tap'];

      // Spy on native API
      const nativeEl = el.__lynx_element as any;
      const originalEvent = nativeEl.__events['tap'];

      // Update handler
      patchEvent(el, 'onTap', handler1, handler2);
      const invokerAfterUpdate = (el as any)._vei['tap'];

      // Same invoker function reference should be reused
      expect(invokerAfterUpdate).toBe(invokerAfterAdd);

      // The native listener reference should not change
      expect(nativeEl.__events['tap']).toBe(originalEvent);

      // But the value inside should point to handler2
      expect(invokerAfterUpdate.value).toBe(handler2);
    });

    it('should call the latest handler after update', () => {
      const el = createTestElement();
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      patchEvent(el, 'onTap', null, handler1);
      patchEvent(el, 'onTap', handler1, handler2);

      // Simulate event trigger
      const invoker = (el as any)._vei['tap'];
      invoker({ type: 'tap', target: null });

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledOnce();
    });

    it('should properly remove handler and clean up invoker', () => {
      const el = createTestElement();
      const handler = vi.fn();

      patchEvent(el, 'onTap', null, handler);
      expect((el as any)._vei['tap']).toBeDefined();

      // Remove
      patchEvent(el, 'onTap', handler, null);

      expect((el as any)._vei['tap']).toBeUndefined();
      expect(el.eventListeners.has('tap')).toBe(false);

      const nativeEl = el.__lynx_element as any;
      expect(nativeEl.__events['tap']).toBeUndefined();
    });

    it('should handle rapid updates without losing events', () => {
      const el = createTestElement();
      const handlers = Array.from({ length: 100 }, (_, i) => vi.fn().mockName(`handler${i}`));

      // Rapidly update 100 times
      let prevHandler: Function | null = null;
      for (const handler of handlers) {
        patchEvent(el, 'onTap', prevHandler, handler);
        prevHandler = handler;
      }

      // Should still have exactly one listener
      const nativeEl = el.__lynx_element as any;
      expect(nativeEl.__events['tap']).toBeDefined();

      // Trigger event — only the last handler should fire
      const invoker = (el as any)._vei['tap'];
      invoker({ type: 'tap' });

      // Only last handler called
      for (let i = 0; i < 99; i++) {
        expect(handlers[i]).not.toHaveBeenCalled();
      }
      expect(handlers[99]).toHaveBeenCalledOnce();
    });

    it('should handle multiple different events independently', () => {
      const el = createTestElement();
      const tapHandler = vi.fn();
      const scrollHandler = vi.fn();

      patchEvent(el, 'onTap', null, tapHandler);
      patchEvent(el, 'onScroll', null, scrollHandler);

      expect((el as any)._vei['tap']).toBeDefined();
      expect((el as any)._vei['scroll']).toBeDefined();

      // Remove only tap
      patchEvent(el, 'onTap', tapHandler, null);

      expect((el as any)._vei['tap']).toBeUndefined();
      expect((el as any)._vei['scroll']).toBeDefined();
    });
  });

  // ======================================================
  // CR-002 bonus: Event name resolution with both camelCase variants
  // ======================================================
  describe('CR-011: event name resolution with camelCase variants', () => {
    it('should resolve onTouchStart (camelCase) to touchstart', () => {
      expect(resolveEventName('onTouchStart')).toBe('touchstart');
    });

    it('should resolve onTouchstart (lowercase) to touchstart', () => {
      expect(resolveEventName('onTouchstart')).toBe('touchstart');
    });

    it('should resolve onAnimationEnd to animationend', () => {
      expect(resolveEventName('onAnimationEnd')).toBe('animationend');
    });

    it('should resolve onScrollToLower to scrolltolower', () => {
      expect(resolveEventName('onScrollToLower')).toBe('scrolltolower');
    });
  });

  // ======================================================
  // CR-003: setElementText native child cleanup
  // ======================================================
  describe('CR-003: setElementText native child cleanup', () => {
    it('should remove native children when setting text', () => {
      const parent = nodeOps.createElement('view');
      const child1 = nodeOps.createElement('text');
      const child2 = nodeOps.createElement('image');

      nodeOps.insert(child1, parent);
      nodeOps.insert(child2, parent);

      const nativeParent = parent.__lynx_element as any;
      expect(nativeParent.__children.length).toBe(2);

      // Set text — should clear all native children
      nodeOps.setElementText(parent, 'Hello');

      expect(parent.children.length).toBe(0);
      expect(nativeParent.__children.length).toBe(0);
    });

    it('should set parentNode to null for removed children', () => {
      const parent = nodeOps.createElement('view');
      const child1 = nodeOps.createElement('text');
      const child2 = nodeOps.createElement('image');

      nodeOps.insert(child1, parent);
      nodeOps.insert(child2, parent);

      expect(child1.parentNode).toBe(parent);
      expect(child2.parentNode).toBe(parent);

      nodeOps.setElementText(parent, 'Hello');

      expect(child1.parentNode).toBeNull();
      expect(child2.parentNode).toBeNull();
    });

    it('should set native text content after cleanup', () => {
      const parent = nodeOps.createElement('text');
      const child = nodeOps.createElement('text');
      nodeOps.insert(child, parent);

      nodeOps.setElementText(parent, 'New text');

      const nativeParent = parent.__lynx_element as any;
      expect(nativeParent.__text).toBe('New text');
      expect(nativeParent.__children.length).toBe(0);
    });

    it('should work correctly when element has no children', () => {
      const parent = nodeOps.createElement('text');

      // Should not throw
      nodeOps.setElementText(parent, 'Hello');

      expect(parent.children.length).toBe(0);
      const nativeParent = parent.__lynx_element as any;
      expect(nativeParent.__text).toBe('Hello');
    });

    it('should handle deeply nested children cleanup', () => {
      const parent = nodeOps.createElement('view');
      const child = nodeOps.createElement('view');
      const grandchild = nodeOps.createElement('text');

      nodeOps.insert(grandchild, child);
      nodeOps.insert(child, parent);

      const nativeParent = parent.__lynx_element as any;
      expect(nativeParent.__children.length).toBe(1);

      nodeOps.setElementText(parent, 'Replaced');

      // Direct children removed from native tree
      expect(nativeParent.__children.length).toBe(0);
      expect(parent.children.length).toBe(0);
      expect(child.parentNode).toBeNull();
    });
  });
});
