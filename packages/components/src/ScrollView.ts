import { defineComponent, h } from 'vue'
import type { PropType, StyleValue } from 'vue'

/**
 * ScrollView组件属性
 */
export interface ScrollViewProps {
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
   * 允许横向滚动
   */
  scrollX?: boolean
  
  /**
   * 允许纵向滚动
   */
  scrollY?: boolean
  
  /**
   * 距顶部/左边多远时，触发 scrolltoupper 事件
   */
  upperThreshold?: number
  
  /**
   * 距底部/右边多远时，触发 scrolltolower 事件
   */
  lowerThreshold?: number
  
  /**
   * 设置竖向滚动条位置
   */
  scrollTop?: number
  
  /**
   * 设置横向滚动条位置
   */
  scrollLeft?: number
  
  /**
   * 值应为某子元素id（id不能以数字开头）。设置哪个方向可滚动，则在哪个方向滚动到该元素
   */
  scrollIntoView?: string
  
  /**
   * 在设置滚动条位置时使用动画过渡
   */
  scrollWithAnimation?: boolean
  
  /**
   * 是否启用回弹效果
   */
  bounces?: boolean
}

/**
 * ScrollView组件事件
 */
export interface ScrollViewEmits {
  /**
   * 滚动到顶部/左边时触发
   */
  (e: 'scrolltoupper', event: any): void
  
  /**
   * 滚动到底部/右边时触发
   */
  (e: 'scrolltolower', event: any): void
  
  /**
   * 滚动时触发
   */
  (e: 'scroll', event: any): void
}

/**
 * ScrollView - Lynx滚动容器组件
 * 
 * 可滚动的视图区域
 * 
 * @example
 * ```vue
 * <ScrollView scroll-y style="height: 200px;">
 *   <View v-for="i in 100" :key="i">Item {{ i }}</View>
 * </ScrollView>
 * ```
 */
export const ScrollView = defineComponent({
  name: 'LynxScrollView',
  props: {
    id: String,
    style: [String, Object, Array] as PropType<StyleValue>,
    class: [String, Array, Object] as PropType<string | string[] | Record<string, boolean>>,
    scrollX: Boolean,
    scrollY: Boolean,
    upperThreshold: Number,
    lowerThreshold: Number,
    scrollTop: Number,
    scrollLeft: Number,
    scrollIntoView: String,
    scrollWithAnimation: Boolean,
    bounces: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['scrolltoupper', 'scrolltolower', 'scroll'],
  setup(props, { slots, attrs }) {
    return () => h(
      'scroll-view',
      {
        ...props,
        ...attrs,
      },
      slots.default?.()
    )
  },
})
