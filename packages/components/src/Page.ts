import { defineComponent, h } from 'vue'
import type { PropType, StyleValue } from 'vue'

/**
 * Page组件属性
 */
export interface PageProps {
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
   * 页面背景色
   */
  backgroundColor?: string
  
  /**
   * 是否启用下拉刷新
   */
  enablePullToRefresh?: boolean
}

/**
 * Page组件事件
 */
export interface PageEmits {
  /**
   * 页面显示时触发
   */
  (e: 'show'): void
  
  /**
   * 页面隐藏时触发
   */
  (e: 'hide'): void
  
  /**
   * 下拉刷新时触发
   */
  (e: 'pullDownRefresh'): void
}

/**
 * Page - Lynx页面容器组件
 * 
 * 根容器组件，代表一个完整的页面
 * 
 * @example
 * ```vue
 * <Page @show="onPageShow">
 *   <View>Page Content</View>
 * </Page>
 * ```
 */
export const Page = defineComponent({
  name: 'LynxPage',
  props: {
    id: String,
    style: [String, Object, Array] as PropType<StyleValue>,
    class: [String, Array, Object] as PropType<string | string[] | Record<string, boolean>>,
    backgroundColor: String,
    enablePullToRefresh: Boolean,
  },
  emits: ['show', 'hide', 'pullDownRefresh'],
  setup(props, { slots, attrs }) {
    return () => h(
      'page',
      {
        ...props,
        ...attrs,
      },
      slots.default?.()
    )
  },
})
