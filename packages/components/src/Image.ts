import { defineComponent, h } from 'vue'
import type { PropType, StyleValue } from 'vue'

/**
 * Image组件属性
 */
export interface ImageProps {
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
   * 图片资源地址
   */
  src?: string
  
  /**
   * 图片裁剪、缩放的模式
   */
  mode?: 'scaleToFill' | 'aspectFit' | 'aspectFill' | 'widthFix' | 'heightFix' | 'top' | 'bottom' | 'center' | 'left' | 'right' | 'top left' | 'top right' | 'bottom left' | 'bottom right'
  
  /**
   * 默认图片地址
   */
  placeholder?: string
  
  /**
   * 是否启用懒加载
   */
  lazyLoad?: boolean
}

/**
 * Image组件事件
 */
export interface ImageEmits {
  /**
   * 图片加载成功时触发
   */
  (e: 'load', event: Event): void
  
  /**
   * 图片加载发生错误时触发
   */
  (e: 'error', event: Event): void
  
  /**
   * 点击事件
   */
  (e: 'click', event: Event): void
}

/**
 * Image - Lynx图片组件
 * 
 * 用于显示图片的组件
 * 
 * @example
 * ```vue
 * <Image src="https://example.com/logo.png" mode="aspectFit" />
 * ```
 */
export const Image = defineComponent({
  name: 'LynxImage',
  props: {
    id: String,
    style: [String, Object, Array] as PropType<StyleValue>,
    class: [String, Array, Object] as PropType<string | string[] | Record<string, boolean>>,
    src: String,
    mode: String as PropType<ImageProps['mode']>,
    placeholder: String,
    lazyLoad: Boolean,
  },
  emits: ['load', 'error', 'click'],
  setup(props, { attrs }) {
    return () => h(
      'image',
      {
        ...props,
        ...attrs,
      }
    )
  },
})
