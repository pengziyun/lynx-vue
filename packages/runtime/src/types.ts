/**
 * Lynx节点类型
 */
export type LynxNodeType = 'element' | 'text' | 'comment'

/**
 * Lynx元素标签名
 */
export type LynxElementTag =
  | 'view'
  | 'text'
  | 'image'
  | 'scroll-view'
  | 'list'
  | 'input'
  | 'textarea'
  | 'page'
  | 'frame'
  | 'overlay'

/**
 * Lynx节点基类
 */
export interface HostNode {
  nodeType: LynxNodeType
  parentNode: HostElement | null
  nextSibling: HostNode | null
}

/**
 * Lynx元素节点
 */
export interface HostElement extends HostNode {
  nodeType: 'element'
  tag: LynxElementTag
  props: Record<string, any>
  children: HostNode[]
  // Lynx特有属性
  __lynxId?: string
  __lynxInstance?: any
}

/**
 * Lynx文本节点
 */
export interface HostText extends HostNode {
  nodeType: 'text'
  text: string
}

/**
 * 事件负载
 */
export interface EventPayload {
  type: string
  target: HostElement
  currentTarget: HostElement
  detail?: any
  timestamp: number
}

/**
 * 样式值类型
 */
export type StyleValue = string | number | Record<string, string | number>

/**
 * 线程桥接接口
 */
export interface ThreadBridge {
  /**
   * 在后台线程执行
   */
  runOnBackground<T>(fn: () => T): Promise<T>

  /**
   * 在主线程执行
   */
  runOnMainThread<T>(fn: () => T): Promise<T>

  /**
   * 批量刷新更新
   */
  flushUpdates(): void
}
