import { defineComponent, h } from 'vue'
import type { PropType, StyleValue } from 'vue'

/**
 * Overlay组件属性
 */
export interface OverlayProps {
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
   * 是否显示
   */
  visible?: boolean
  
  /**
   * 层级
   */
  zIndex?: number
}

/**
 * Overlay组件事件
 */
export interface OverlayEmits {
  /**
   * 点击遮罩层时触发
   */
  (e: 'click', event: Event): void
  
  /**
   * 遮罩层显示/隐藏状态变化时触发
   */
  (e: 'visible-change', visible: boolean): void
}

/**
 * Overlay - Lynx遮罩层组件
 * 
 * 用于在页面上方显示遮罩层
 * 
 * @example
 * ```vue
 * <Overlay :visible="show" @click="show = false">
 *   <View class="modal">Modal Content</View>
 * </Overlay>
 * ```
 */
export const Overlay = defineComponent({
  name: 'LynxOverlay',
  props: {
    id: String,
    style: [String, Object, Array] as PropType<StyleValue>,
    class: [String, Array, Object] as PropType<string | string[] | Record<string, boolean>>,
    visible: Boolean,
    zIndex: {
      type: Number,
      default: 1000,
    },
  },
  emits: ['click', 'visible-change'],
  setup(props, { slots, attrs }) {
    return () => h(
      'overlay',
      {
        ...props,
        ...attrs,
      },
      slots.default?.()
    )
  },
})
