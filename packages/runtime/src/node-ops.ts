import type { RendererOptions } from 'vue'
import type { HostElement, HostText, HostNode, LynxElementTag } from './types'
import { lynxApi } from './lynx-api'

export const nodeOps: Omit<RendererOptions<HostNode, HostElement>, 'patchProp'> = {
  createElement(tag: string): HostElement {
    return lynxApi.createElement(tag as LynxElementTag)
  },

  createText(text: string): HostText {
    return lynxApi.createTextNode(text)
  },

  createComment(): HostText {
    return lynxApi.createTextNode('')
  },

  setText(node: HostNode, text: string): void {
    if (node.nodeType === 'text') {
      lynxApi.setTextContent(node as HostText, text)
    }
  },

  setElementText(el: HostElement, text: string): void {
    el.children = [lynxApi.createTextNode(text)]
  },

  parentNode(node: HostNode): HostElement | null {
    return node.parentNode
  },

  nextSibling(node: HostNode): HostNode | null {
    return node.nextSibling
  },

  insert(
    child: HostNode,
    parent: HostElement,
    anchor: HostNode | null = null
  ): void {
    lynxApi.insertBefore(parent, child as HostElement | HostText, anchor as HostElement | HostText | null)
  },

  remove(child: HostNode): void {
    const parent = child.parentNode
    if (parent) {
      lynxApi.removeChild(parent, child as HostElement | HostText)
    }
  },
}
