import { defineComponent, h } from 'vue'
import type { PropType, StyleValue } from 'vue'

/**
 * Textarea组件属性
 */
export interface TextareaProps {
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
   * 输入框的值
   */
  modelValue?: string
  
  /**
   * 提示文本
   */
  placeholder?: string
  
  /**
   * 提示文本样式
   */
  placeholderStyle?: string
  
  /**
   * 是否禁用
   */
  disabled?: boolean
  
  /**
   * 最大输入长度
   */
  maxlength?: number
  
  /**
   * 自动聚焦
   */
  focus?: boolean
  
  /**
   * 是否自动增高
   */
  autoHeight?: boolean
  
  /**
   * 指定光标与键盘的距离
   */
  cursorSpacing?: number
}

/**
 * Textarea组件事件
 */
export interface TextareaEmits {
  /**
   * 绑定值更新
   */
  (e: 'update:modelValue', value: string): void
  
  /**
   * 输入时触发
   */
  (e: 'input', event: any): void
  
  /**
   * 聚焦时触发
   */
  (e: 'focus', event: any): void
  
  /**
   * 失焦时触发
   */
  (e: 'blur', event: any): void
  
  /**
   * 点击完成按钮时触发
   */
  (e: 'confirm', event: any): void
  
  /**
   * 输入框行数变化时触发
   */
  (e: 'linechange', event: any): void
}

/**
 * Textarea - Lynx多行输入组件
 * 
 * 支持v-model双向绑定的多行输入组件
 * 
 * @example
 * ```vue
 * <Textarea v-model="content" placeholder="请输入多行内容" auto-height />
 * ```
 */
export const Textarea = defineComponent({
  name: 'LynxTextarea',
  props: {
    id: String,
    style: [String, Object, Array] as PropType<StyleValue>,
    class: [String, Array, Object] as PropType<string | string[] | Record<string, boolean>>,
    modelValue: String,
    placeholder: String,
    placeholderStyle: String,
    disabled: Boolean,
    maxlength: {
      type: Number,
      default: 140,
    },
    focus: Boolean,
    autoHeight: Boolean,
    cursorSpacing: {
      type: Number,
      default: 0,
    },
  },
  emits: ['update:modelValue', 'input', 'focus', 'blur', 'confirm', 'linechange'],
  setup(props, { emit, attrs }) {
    const onInput = (event: any) => {
      const value = event.detail?.value ?? event.target?.value ?? ''
      emit('update:modelValue', value)
      emit('input', event)
    }

    return () => h(
      'textarea',
      {
        ...props,
        ...attrs,
        value: props.modelValue,
        onInput,
      }
    )
  },
})
