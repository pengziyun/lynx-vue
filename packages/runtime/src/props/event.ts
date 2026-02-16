import type { HostElement } from '../types'

/**
 * Vue事件名到Lynx事件名的映射表
 * 根据ADR文档，Lynx事件格式为：bind/catch/capture-bind/capture-catch/global-bind
 */
const eventNameMap: Record<string, string> = {
  // 点击事件
  click: 'tap',
  // 触摸事件
  touchstart: 'touchstart',
  touchmove: 'touchmove',
  touchend: 'touchend',
  touchcancel: 'touchcancel',
  // 输入事件
  input: 'input',
  change: 'change',
  focus: 'focus',
  blur: 'blur',
  // 滚动事件
  scroll: 'scroll',
  // 长按事件
  longpress: 'longpress',
}

/**
 * 解析Vue事件名，转换为Lynx事件格式
 * @param vueEventName - Vue事件名（如：onClick, onClickCapture, onTouchstart）
 * @returns Lynx事件名（如：bind:tap, capture-bind:tap, bind:touchstart）
 */
export function parseEventName(vueEventName: string): string | null {
  // 移除 'on' 前缀
  if (!vueEventName.startsWith('on')) {
    return null
  }

  let eventName = vueEventName.slice(2)
  
  // 检查是否是 Capture 事件
  const isCapture = eventName.endsWith('Capture')
  if (isCapture) {
    eventName = eventName.slice(0, -7) // 移除 'Capture' 后缀
  }

  // 转换为小写
  const lowerEventName = eventName.toLowerCase()

  // 查找映射
  const lynxEventName = eventNameMap[lowerEventName] || lowerEventName

  // 构建完整的Lynx事件名
  // 默认使用 bind: 前缀（冒泡）
  // Capture 使用 capture-bind: 前缀
  const prefix = isCapture ? 'capture-bind' : 'bind'
  
  return `${prefix}:${lynxEventName}`
}

/**
 * 解析事件名，支持catch前缀（阻止冒泡）
 * @param vueEventName - Vue事件名
 * @param stopPropagation - 是否阻止冒泡
 * @returns Lynx事件名
 */
export function parseEventNameWithOptions(
  vueEventName: string,
  stopPropagation = false
): string | null {
  if (!vueEventName.startsWith('on')) {
    return null
  }

  let eventName = vueEventName.slice(2)
  
  // 检查是否是 Capture 事件
  const isCapture = eventName.endsWith('Capture')
  if (isCapture) {
    eventName = eventName.slice(0, -7)
  }

  // 转换为小写
  const lowerEventName = eventName.toLowerCase()

  // 查找映射
  const lynxEventName = eventNameMap[lowerEventName] || lowerEventName

  // 构建前缀
  let prefix: string
  if (stopPropagation) {
    // 使用 catch 阻止冒泡
    prefix = isCapture ? 'capture-catch' : 'catch'
  } else {
    // 使用 bind 允许冒泡
    prefix = isCapture ? 'capture-bind' : 'bind'
  }
  
  return `${prefix}:${lynxEventName}`
}

/**
 * 包装事件处理器，添加主线程标记（如果需要）
 * @param handler - 原始事件处理器
 * @param mainThread - 是否在主线程执行
 * @returns 包装后的处理器
 */
export function wrapEventHandler(
  handler: Function,
  mainThread = false
): Function {
  if (!mainThread) {
    return handler
  }

  // 标记为主线程事件
  // 实际实现中，这里可能需要与线程桥接配合
  return function mainThreadHandler(this: any, ...args: any[]) {
    // TODO: 与 thread-bridge 集成，确保在主线程执行
    return handler.apply(this, args)
  }
}

/**
 * 为元素添加事件监听器
 * @param el - 目标元素
 * @param vueEventName - Vue事件名
 * @param handler - 事件处理器
 * @param options - 事件选项
 */
export function addEventListener(
  el: HostElement,
  vueEventName: string,
  handler: Function,
  options?: {
    capture?: boolean
    stopPropagation?: boolean
    mainThread?: boolean
  }
): void {
  const lynxEventName = parseEventNameWithOptions(
    vueEventName,
    options?.stopPropagation
  )

  if (!lynxEventName) {
    console.warn(`[Vue-Lynx] 无法解析事件名: ${vueEventName}`)
    return
  }

  // 包装处理器
  const wrappedHandler = wrapEventHandler(handler, options?.mainThread)

  // 存储到元素的props中
  // Lynx会在原生层处理这些事件绑定
  el.props[lynxEventName] = wrappedHandler
}

/**
 * 移除元素的事件监听器
 * @param el - 目标元素
 * @param vueEventName - Vue事件名
 */
export function removeEventListener(
  el: HostElement,
  vueEventName: string
): void {
  const lynxEventName = parseEventName(vueEventName)

  if (!lynxEventName) {
    return
  }

  // 从元素props中删除
  delete el.props[lynxEventName]
  
  // 同时尝试删除可能的catch版本
  const catchEventName = lynxEventName.replace('bind:', 'catch:')
  delete el.props[catchEventName]
}

/**
 * 更新事件监听器
 * @param el - 目标元素
 * @param vueEventName - Vue事件名
 * @param prevHandler - 旧的事件处理器
 * @param nextHandler - 新的事件处理器
 */
export function patchEvent(
  el: HostElement,
  vueEventName: string,
  _prevHandler: Function | null,
  nextHandler: Function | null
): void {
  if (nextHandler) {
    addEventListener(el, vueEventName, nextHandler)
  } else {
    removeEventListener(el, vueEventName)
  }
}
