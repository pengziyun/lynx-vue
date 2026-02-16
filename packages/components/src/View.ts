import { defineComponent, h } from 'vue'
import type { PropType, StyleValue } from 'vue'

/**
 * View组件属性
 */
export interface ViewProps {
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
   * 是否可点击
   */
  clickable?: boolean
  
  /**
   * 是否启用hover效果
   */
  hoverClass?: string
}

/**
 * View组件事件
 */
export interface ViewEmits {
  /**
   * 点击事件
   */
  (e: 'click', event: Event): void
  
  /**
   * 长按事件
   */
  (e: 'longpress', event: Event): void
  
  /**
   * 触摸开始
   */
  (e: 'touchstart', event: TouchEvent): void
  
  /**
   * 触摸移动
   */
  (e: 'touchmove', event: TouchEvent): void
  
  /**
   * 触摸结束
   */
  (e: 'touchend', event: TouchEvent): void
}

/**
 * View - Lynx容器组件
 * 
 * 基础容器组件，类似HTML的div
 * 
 * @example
 * ```vue
 * <View class="container" @click="handleClick">
 *   <Text>Hello Lynx</Text>
 * </View>
 * ```
 */
export const View = defineComponent({
  name: 'LynxView',
  props: {
    id: String,
    style: [String, Object, Array] as PropType<StyleValue>,
    class: [String, Array, Object] as PropType<string | string[] | Record<string, boolean>>,
    clickable: Boolean,
    hoverClass: String,
  },
  emits: ['click', 'longpress', 'touchstart', 'touchmove', 'touchend'],
  setup(props, { slots, attrs }) {
    return () => h(
      'view',  // Lynx原生标签
      {
        ...props,
        ...attrs,
      },
      slots.default?.()
    )
  },
})
