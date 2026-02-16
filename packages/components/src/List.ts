import { defineComponent, h } from 'vue'
import type { PropType, StyleValue } from 'vue'

/**
 * List组件属性
 */
export interface ListProps {
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
   * 列表数据
   */
  data?: any[]
  
  /**
   * 列表项高度（用于虚拟滚动计算）
   */
  itemHeight?: number
  
  /**
   * 列表项唯一标识的键名
   */
  itemKey?: string
  
  /**
   * 预渲染的列表项数量
   */
  preloadCount?: number
  
  /**
   * 是否显示滚动条
   */
  showScrollbar?: boolean
}

/**
 * List组件事件
 */
export interface ListEmits {
  /**
   * 滚动到底部时触发
   */
  (e: 'scrolltolower', event: any): void
  
  /**
   * 滚动到顶部时触发
   */
  (e: 'scrolltoupper', event: any): void
  
  /**
   * 滚动时触发
   */
  (e: 'scroll', event: any): void
}

/**
 * List - Lynx列表组件
 * 
 * 支持虚拟滚动的高性能列表组件
 * 
 * @example
 * ```vue
 * <List :data="items" :item-height="50">
 *   <template #item="{ item, index }">
 *     <View>{{ item.name }}</View>
 *   </template>
 * </List>
 * ```
 */
export const List = defineComponent({
  name: 'LynxList',
  props: {
    id: String,
    style: [String, Object, Array] as PropType<StyleValue>,
    class: [String, Array, Object] as PropType<string | string[] | Record<string, boolean>>,
    data: {
      type: Array as PropType<any[]>,
      default: () => [],
    },
    itemHeight: Number,
    itemKey: {
      type: String,
      default: 'id',
    },
    preloadCount: {
      type: Number,
      default: 5,
    },
    showScrollbar: Boolean,
  },
  emits: ['scrolltolower', 'scrolltoupper', 'scroll'],
  setup(props, { slots, attrs }) {
    return () => h(
      'list',
      {
        ...props,
        ...attrs,
      },
      // 渲染列表项
      props.data.map((item, index) => {
        return slots.item ? slots.item({ item, index }) : null
      })
    )
  },
})
