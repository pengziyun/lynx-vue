/**
 * Node Operations for the Vue-Lynx Custom Renderer
 *
 * Implements the RendererOptions interface (minus patchProp) required by
 * Vue 3's createRenderer API. These operations map to Lynx's native
 * element manipulation API.
 */

import type { RendererOptions } from '@vue/runtime-core';
import type { LynxNode, LynxElement, LynxTextNode, LynxCommentNode, LynxNativeElement } from './types';
import { getLynx } from './lynxAPI';

let nodeIdCounter = 0;

/**
 * Generate a unique node ID.
 */
function nextNodeId(): number {
  return ++nodeIdCounter;
}

/**
 * Reset the node ID counter (for testing).
 */
export function resetNodeIdCounter(): void {
  nodeIdCounter = 0;
}

/**
 * Create a base LynxNode structure.
 */
function createBaseNode(type: string): LynxNode {
  return {
    id: nextNodeId(),
    type,
    parentNode: null,
    children: [],
    props: {},
    eventListeners: new Map(),
  };
}

/**
 * Find the next sibling node that has a native Lynx element.
 * Used when inserting before a comment node (which has no native counterpart).
 * We traverse forward from the anchor's position to find a real native element
 * to use as the insertBefore anchor in the native tree.
 */
function findNextNativeElement(parent: LynxNode, startNode: LynxNode): LynxNativeElement | null {
  const startIndex = parent.children.indexOf(startNode);
  if (startIndex < 0) return null;

  for (let i = startIndex; i < parent.children.length; i++) {
    if (parent.children[i].__lynx_element) {
      return parent.children[i].__lynx_element!;
    }
  }
  return null;
}

/**
 * Node operations implementation.
 * These are passed to Vue's createRenderer along with patchProp.
 */
export const nodeOps: Omit<
  RendererOptions<LynxNode, LynxElement>,
  'patchProp'
> = {
  /**
   * Create an element node.
   * Maps to Lynx's createElement for native elements.
   */
  createElement(type: string): LynxElement {
    const lynx = getLynx();
    const node: LynxElement = {
      ...createBaseNode(type),
      tagName: type,
    };

    // Create the corresponding native Lynx element
    node.__lynx_element = lynx.createElement(type);

    return node;
  },

  /**
   * Create a text node.
   * In Lynx, text content is typically set on <text> elements rather than
   * as standalone text nodes. We create a proxy text node here.
   */
  createText(text: string): LynxTextNode {
    const lynx = getLynx();
    const node: LynxTextNode = {
      ...createBaseNode('__text__'),
      type: '__text__',
      text,
    };

    node.__lynx_element = lynx.createTextNode(text);

    return node;
  },

  /**
   * Create a comment node.
   * Lynx does not have comment nodes, so we create a lightweight placeholder
   * that exists only in the virtual tree.
   */
  createComment(text: string): LynxCommentNode {
    const node: LynxCommentNode = {
      ...createBaseNode('__comment__'),
      type: '__comment__',
      text,
    };
    // No native element for comments - they're virtual only
    return node;
  },

  /**
   * Insert a child node into a parent, optionally before an anchor node.
   *
   * [P0-001 FIX] When anchor is a comment node (no native element),
   * we find the next sibling with a native element to use as the
   * insertBefore anchor in the native tree, instead of falling back
   * to appendChild which would place the element at the wrong position.
   */
  insert(child: LynxNode, parent: LynxElement, anchor?: LynxNode | null): void {
    // Remove from previous parent if already inserted
    if (child.parentNode) {
      nodeOps.remove(child);
    }

    child.parentNode = parent;

    if (anchor) {
      // Insert before anchor in virtual tree
      const index = parent.children.indexOf(anchor);
      if (index > -1) {
        parent.children.splice(index, 0, child);
      } else {
        parent.children.push(child);
      }

      // Perform native insertion
      if (child.__lynx_element && parent.__lynx_element) {
        const lynx = getLynx();
        if (anchor.__lynx_element) {
          // Anchor has a native element - use it directly
          lynx.insertBefore(parent.__lynx_element, child.__lynx_element, anchor.__lynx_element);
        } else {
          // Anchor is a comment node (no native element).
          // Find the next sibling with a native element to insert before.
          const nativeAnchor = findNextNativeElement(parent, anchor);
          if (nativeAnchor) {
            lynx.insertBefore(parent.__lynx_element, child.__lynx_element, nativeAnchor);
          } else {
            // No native sibling found after anchor - append to end
            lynx.appendChild(parent.__lynx_element, child.__lynx_element);
          }
        }
      }
    } else {
      // Append to end
      parent.children.push(child);

      if (child.__lynx_element && parent.__lynx_element) {
        const lynx = getLynx();
        lynx.appendChild(parent.__lynx_element, child.__lynx_element);
      }
    }
  },

  /**
   * Remove a child node from its parent.
   */
  remove(child: LynxNode): void {
    const parent = child.parentNode;
    if (!parent) return;

    const index = parent.children.indexOf(child);
    if (index > -1) {
      parent.children.splice(index, 1);
    }

    child.parentNode = null;

    // Remove from native tree
    if (child.__lynx_element && parent.__lynx_element) {
      const lynx = getLynx();
      lynx.removeChild(parent.__lynx_element, child.__lynx_element);
    }
  },

  /**
   * Set the text content of an element node.
   * Used when an element's children are replaced with a text string.
   *
   * [P0-003 FIX] Now properly removes all existing children from the
   * native tree before clearing the virtual children array, preventing
   * memory leaks and visual artifacts from orphaned native elements.
   */
  setElementText(node: LynxElement, text: string): void {
    const lynx = getLynx();

    // Remove all existing children from native tree first
    for (const child of node.children) {
      child.parentNode = null;
      if (child.__lynx_element && node.__lynx_element) {
        lynx.removeChild(node.__lynx_element, child.__lynx_element);
      }
    }

    // Clear virtual children
    node.children = [];

    // Set text content on native element
    if (node.__lynx_element) {
      lynx.setTextContent(node.__lynx_element, text);
    }
  },

  /**
   * Set the content of a text node.
   */
  setText(node: LynxNode, text: string): void {
    if (node.type === '__text__') {
      (node as LynxTextNode).text = text;

      if (node.__lynx_element) {
        const lynx = getLynx();
        lynx.setTextContent(node.__lynx_element, text);
      }
    }
  },

  /**
   * Get the parent node of a node.
   *
   * Note: Vue's RendererOptions expects HostElement (LynxElement) return type.
   * In our tree, parentNode is always a LynxElement (elements are the only
   * container type). We cast here to satisfy the type constraint.
   */
  parentNode(node: LynxNode): LynxElement | null {
    return node.parentNode as LynxElement | null;
  },

  /**
   * Get the next sibling of a node.
   */
  nextSibling(node: LynxNode): LynxNode | null {
    const parent = node.parentNode;
    if (!parent) return null;

    const index = parent.children.indexOf(node);
    if (index < 0 || index >= parent.children.length - 1) {
      return null;
    }

    return parent.children[index + 1];
  },

  /**
   * Query selector - limited support in Lynx.
   * Returns null as Lynx doesn't have a DOM query mechanism.
   */
  querySelector(_selector: string): LynxElement | null {
    if (__DEV__) {
      console.warn(
        '[vue-lynx] querySelector is not supported in Lynx. ' +
          'Use ref() to get element references.'
      );
    }
    return null;
  },

  /**
   * Set scope ID for scoped CSS.
   */
  setScopeId(el: LynxElement, id: string): void {
    if (el.__lynx_element) {
      const lynx = getLynx();
      lynx.setAttribute(el.__lynx_element, id, '');
    }
  },
};

// Define __DEV__ for tree-shaking
declare const __DEV__: boolean;
