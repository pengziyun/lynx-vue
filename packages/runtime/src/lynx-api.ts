import type { HostElement, HostText, LynxElementTag } from './types'

/**
 * Lynx全局API适配
 * 注意：这是模拟层，实际运行时会由Lynx引擎提供
 */
export const lynxApi = {
  /**
   * 创建元素
   */
  createElement(tag: LynxElementTag): HostElement {
    return {
      nodeType: 'element',
      tag,
      props: {},
      children: [],
      parentNode: null,
      nextSibling: null,
      __lynxId: `lynx_${Math.random().toString(36).slice(2)}`,
    }
  },

  /**
   * 创建文本节点
   */
  createTextNode(text: string): HostText {
    return {
      nodeType: 'text',
      text,
      parentNode: null,
      nextSibling: null,
    }
  },

  /**
   * 插入子节点
   */
  insertBefore(
    parent: HostElement,
    child: HostElement | HostText,
    anchor: HostElement | HostText | null
  ): void {
    child.parentNode = parent

    if (anchor) {
      const index = parent.children.indexOf(anchor)
      parent.children.splice(index, 0, child)
    } else {
      parent.children.push(child)
    }
  },

  /**
   * 移除子节点
   */
  removeChild(parent: HostElement, child: HostElement | HostText): void {
    const index = parent.children.indexOf(child)
    if (index > -1) {
      parent.children.splice(index, 1)
    }
    child.parentNode = null
  },

  /**
   * 设置属性
   */
  setAttribute(element: HostElement, key: string, value: any): void {
    element.props[key] = value
  },

  /**
   * 移除属性
   */
  removeAttribute(element: HostElement, key: string): void {
    delete element.props[key]
  },

  /**
   * 设置文本内容
   */
  setTextContent(node: HostText, text: string): void {
    node.text = text
  },
}
