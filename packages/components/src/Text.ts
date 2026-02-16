import { defineComponent, h } from 'vue'
import type { PropType, StyleValue } from 'vue'

/**
 * Text组件属性
 */
export interface TextProps {
  /**
   * 组件ID
   */
  id?: string
  
  /**
   * 样式
   */
  style?: StyleValue
  
  /**
   * CSS类名
   */
  class?: string | string[] | Record<string, boolean>
  
  /**
   * 文本是否可选
   */
  selectable?: boolean
  
  /**
   * 文本显示行数限制
   */
  numberOfLines?: number
}

/**
 * Text组件事件
 */
export interface TextEmits {
  /**
   * 点击事件
   */
  (e: 'click', event: Event): void
  
  /**
   * 长按事件
   */
  (e: 'longpress', event: Event): void
}

/**
 * Text - Lynx文本组件
 * 
 * 用于显示文本的容器组件
 * 
 * @example
 * ```vue
 * <Text :numberOfLines="1">这是一段很长的文本...</Text>
 * ```
 */
export const Text = defineComponent({
  name: 'LynxText',
  props: {
    id: String,
    style: [String, Object, Array] as PropType<StyleValue>,
    class: [String, Array, Object] as PropType<string | string[] | Record<string, boolean>>,
    selectable: Boolean,
    numberOfLines: Number,
  },
  emits: ['click', 'longpress'],
  setup(props, { slots, attrs }) {
    return () => h(
      'text',
      {
        ...props,
        ...attrs,
      },
      slots.default?.()
    )
  },
})
