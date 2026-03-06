/**
 * Tests for Node Operations
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { nodeOps, resetNodeIdCounter } from '../src/nodeOps';
import { createMockLynxAPI, setLynxAPI, resetLynxAPI } from '../src/lynxAPI';

describe('nodeOps', () => {
  beforeEach(() => {
    resetNodeIdCounter();
    setLynxAPI(createMockLynxAPI());
  });

  afterEach(() => {
    resetLynxAPI();
  });

  describe('createElement', () => {
    it('should create a view element', () => {
      const el = nodeOps.createElement('view');
      expect(el.type).toBe('view');
      expect(el.tagName).toBe('view');
      expect(el.id).toBe(1);
      expect(el.parentNode).toBeNull();
      expect(el.children).toEqual([]);
      expect(el.__lynx_element).toBeDefined();
    });

    it('should create elements with unique IDs', () => {
      const el1 = nodeOps.createElement('view');
      const el2 = nodeOps.createElement('text');
      expect(el1.id).not.toBe(el2.id);
    });

    it('should create different element types', () => {
      const view = nodeOps.createElement('view');
      const text = nodeOps.createElement('text');
      const image = nodeOps.createElement('image');

      expect(view.tagName).toBe('view');
      expect(text.tagName).toBe('text');
      expect(image.tagName).toBe('image');
    });
  });

  describe('createText', () => {
    it('should create a text node', () => {
      const text = nodeOps.createText('Hello');
      expect(text.type).toBe('__text__');
      expect((text as any).text).toBe('Hello');
      expect(text.__lynx_element).toBeDefined();
    });
  });

  describe('createComment', () => {
    it('should create a comment placeholder', () => {
      const comment = nodeOps.createComment('test comment');
      expect(comment.type).toBe('__comment__');
      expect((comment as any).text).toBe('test comment');
      // Comment nodes don't have native Lynx elements
      expect(comment.__lynx_element).toBeUndefined();
    });
  });

  describe('insert', () => {
    it('should append child to parent', () => {
      const parent = nodeOps.createElement('view');
      const child = nodeOps.createElement('text');

      nodeOps.insert(child, parent);

      expect(parent.children).toContain(child);
      expect(child.parentNode).toBe(parent);
    });

    it('should insert before anchor', () => {
      const parent = nodeOps.createElement('view');
      const child1 = nodeOps.createElement('text');
      const child2 = nodeOps.createElement('text');
      const newChild = nodeOps.createElement('image');

      nodeOps.insert(child1, parent);
      nodeOps.insert(child2, parent);
      nodeOps.insert(newChild, parent, child2);

      expect(parent.children.indexOf(newChild)).toBe(1);
      expect(parent.children.indexOf(child2)).toBe(2);
    });

    it('should remove from old parent before inserting', () => {
      const parent1 = nodeOps.createElement('view');
      const parent2 = nodeOps.createElement('view');
      const child = nodeOps.createElement('text');

      nodeOps.insert(child, parent1);
      expect(parent1.children.length).toBe(1);

      nodeOps.insert(child, parent2);
      expect(parent1.children.length).toBe(0);
      expect(parent2.children.length).toBe(1);
      expect(child.parentNode).toBe(parent2);
    });

    // ── P0-001 Regression: Comment node anchor insertion ──

    it('[P0-001] should correctly insert before a comment anchor', () => {
      const parent = nodeOps.createElement('view');
      const child1 = nodeOps.createElement('text');
      const comment = nodeOps.createComment('v-if anchor');
      const child2 = nodeOps.createElement('text');

      // Build tree: [child1, comment, child2]
      nodeOps.insert(child1, parent);
      nodeOps.insert(comment, parent);
      nodeOps.insert(child2, parent);

      // Insert new element before the comment anchor
      const newChild = nodeOps.createElement('image');
      nodeOps.insert(newChild, parent, comment);

      // Virtual tree: [child1, newChild, comment, child2]
      expect(parent.children[0]).toBe(child1);
      expect(parent.children[1]).toBe(newChild);
      expect(parent.children[2]).toBe(comment);
      expect(parent.children[3]).toBe(child2);
    });

    it('[P0-001] should insert before comment anchor and use next native sibling for native tree', () => {
      const parent = nodeOps.createElement('view');
      const beforeEl = nodeOps.createElement('text');
      const comment = nodeOps.createComment('v-if');
      const afterEl = nodeOps.createElement('view');

      nodeOps.insert(beforeEl, parent);
      nodeOps.insert(comment, parent);
      nodeOps.insert(afterEl, parent);

      // Insert element before comment - should use afterEl as native anchor
      const newEl = nodeOps.createElement('image');
      nodeOps.insert(newEl, parent, comment);

      // Verify native tree: check native element's children order
      const nativeParent = parent.__lynx_element as any;
      const nativeChildren = nativeParent.__children;

      // Native tree should have: [beforeEl, newEl, afterEl]
      // (comment has no native element)
      expect(nativeChildren.length).toBe(3);
      expect(nativeChildren[0]).toBe(beforeEl.__lynx_element);
      expect(nativeChildren[1]).toBe(newEl.__lynx_element);
      expect(nativeChildren[2]).toBe(afterEl.__lynx_element);
    });

    it('[P0-001] should append when comment anchor has no native sibling after it', () => {
      const parent = nodeOps.createElement('view');
      const beforeEl = nodeOps.createElement('text');
      const comment = nodeOps.createComment('v-if');

      nodeOps.insert(beforeEl, parent);
      nodeOps.insert(comment, parent);

      // Insert before comment, but comment is last - should append to native tree
      const newEl = nodeOps.createElement('image');
      nodeOps.insert(newEl, parent, comment);

      const nativeParent = parent.__lynx_element as any;
      expect(nativeParent.__children.length).toBe(2);
      expect(nativeParent.__children[0]).toBe(beforeEl.__lynx_element);
      expect(nativeParent.__children[1]).toBe(newEl.__lynx_element);
    });

    it('[P0-001] should handle multiple consecutive comment nodes', () => {
      const parent = nodeOps.createElement('view');
      const el1 = nodeOps.createElement('text');
      const comment1 = nodeOps.createComment('v-if');
      const comment2 = nodeOps.createComment('v-else');
      const el2 = nodeOps.createElement('view');

      nodeOps.insert(el1, parent);
      nodeOps.insert(comment1, parent);
      nodeOps.insert(comment2, parent);
      nodeOps.insert(el2, parent);

      // Insert before comment1 - should find el2 as native anchor (skipping comment2)
      const newEl = nodeOps.createElement('image');
      nodeOps.insert(newEl, parent, comment1);

      const nativeParent = parent.__lynx_element as any;
      expect(nativeParent.__children.length).toBe(3);
      expect(nativeParent.__children[0]).toBe(el1.__lynx_element);
      expect(nativeParent.__children[1]).toBe(newEl.__lynx_element);
      expect(nativeParent.__children[2]).toBe(el2.__lynx_element);
    });
  });

  describe('remove', () => {
    it('should remove child from parent', () => {
      const parent = nodeOps.createElement('view');
      const child = nodeOps.createElement('text');

      nodeOps.insert(child, parent);
      nodeOps.remove(child);

      expect(parent.children).not.toContain(child);
      expect(child.parentNode).toBeNull();
    });

    it('should handle removing a node with no parent', () => {
      const node = nodeOps.createElement('view');
      // Should not throw
      nodeOps.remove(node);
      expect(node.parentNode).toBeNull();
    });

    it('should remove from native tree', () => {
      const parent = nodeOps.createElement('view');
      const child = nodeOps.createElement('text');

      nodeOps.insert(child, parent);
      const nativeParent = parent.__lynx_element as any;
      expect(nativeParent.__children.length).toBe(1);

      nodeOps.remove(child);
      expect(nativeParent.__children.length).toBe(0);
    });
  });

  describe('setText', () => {
    it('should set text content on text nodes', () => {
      const text = nodeOps.createText('Hello');
      nodeOps.setText(text, 'World');
      expect((text as any).text).toBe('World');
    });

    it('should update native text content', () => {
      const text = nodeOps.createText('Hello');
      nodeOps.setText(text, 'World');
      const nativeEl = text.__lynx_element as any;
      expect(nativeEl.__text).toBe('World');
    });
  });

  describe('setElementText', () => {
    it('should set text content on element', () => {
      const el = nodeOps.createElement('text');
      nodeOps.setElementText(el, 'Hello');
      // Children should be cleared
      expect(el.children).toEqual([]);
    });

    // ── P0-003 Regression: setElementText native child cleanup ──

    it('[P0-003] should remove native children when setting text', () => {
      const parent = nodeOps.createElement('view');
      const child1 = nodeOps.createElement('text');
      const child2 = nodeOps.createElement('image');

      nodeOps.insert(child1, parent);
      nodeOps.insert(child2, parent);

      const nativeParent = parent.__lynx_element as any;
      expect(nativeParent.__children.length).toBe(2);

      // Set text should remove native children
      nodeOps.setElementText(parent, 'Hello');

      expect(parent.children.length).toBe(0);
      expect(nativeParent.__children.length).toBe(0);
      expect(child1.parentNode).toBeNull();
      expect(child2.parentNode).toBeNull();
    });

    it('[P0-003] should set native text content after clearing children', () => {
      const el = nodeOps.createElement('text');
      const child = nodeOps.createElement('view');
      nodeOps.insert(child, el);

      nodeOps.setElementText(el, 'New text');

      expect(el.children.length).toBe(0);
      const nativeEl = el.__lynx_element as any;
      expect(nativeEl.__text).toBe('New text');
      expect(nativeEl.__children.length).toBe(0);
    });

    it('[P0-003] should handle setElementText on element with no children', () => {
      const el = nodeOps.createElement('text');
      // Should not throw
      nodeOps.setElementText(el, 'Hello');
      expect(el.children.length).toBe(0);
    });
  });

  describe('parentNode', () => {
    it('should return parent node', () => {
      const parent = nodeOps.createElement('view');
      const child = nodeOps.createElement('text');

      nodeOps.insert(child, parent);
      expect(nodeOps.parentNode(child)).toBe(parent);
    });

    it('should return null for root node', () => {
      const node = nodeOps.createElement('view');
      expect(nodeOps.parentNode(node)).toBeNull();
    });
  });

  describe('nextSibling', () => {
    it('should return next sibling', () => {
      const parent = nodeOps.createElement('view');
      const child1 = nodeOps.createElement('text');
      const child2 = nodeOps.createElement('text');

      nodeOps.insert(child1, parent);
      nodeOps.insert(child2, parent);

      expect(nodeOps.nextSibling(child1)).toBe(child2);
    });

    it('should return null for last child', () => {
      const parent = nodeOps.createElement('view');
      const child = nodeOps.createElement('text');

      nodeOps.insert(child, parent);
      expect(nodeOps.nextSibling(child)).toBeNull();
    });

    it('should return null for node without parent', () => {
      const node = nodeOps.createElement('view');
      expect(nodeOps.nextSibling(node)).toBeNull();
    });
  });
});
