import { defineComponent, h } from 'vue'
import type { PropType, StyleValue } from 'vue'

/**
 * Frame组件属性
 */
export interface FrameProps {
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
}

/**
 * Frame组件事件
 */
export interface FrameEmits {
  /**
   * 点击事件
   */
  (e: 'click', event: Event): void
}

/**
 * Frame - Lynx框架容器组件
 * 
 * 用于布局的框架容器组件
 * 
 * @example
 * ```vue
 * <Frame class="layout-frame">
 *   <View>Content</View>
 * </Frame>
 * ```
 */
export const Frame = defineComponent({
  name: 'LynxFrame',
  props: {
    id: String,
    style: [String, Object, Array] as PropType<StyleValue>,
    class: [String, Array, Object] as PropType<string | string[] | Record<string, boolean>>,
  },
  emits: ['click'],
  setup(props, { slots, attrs }) {
    return () => h(
      'frame',
      {
        ...props,
        ...attrs,
      },
      slots.default?.()
    )
  },
})
