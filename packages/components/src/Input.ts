import { defineComponent, h } from 'vue'
import type { PropType, StyleValue } from 'vue'

/**
 * Input组件属性
 */
export interface InputProps {
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
   * 输入框类型
   */
  type?: 'text' | 'number' | 'idcard' | 'digit' | 'tel'
  
  /**
   * 是否是密码类型
   */
  password?: boolean
  
  /**
   * 自动聚焦
   */
  focus?: boolean
  
  /**
   * 确认按钮文字
   */
  confirmType?: 'send' | 'search' | 'next' | 'go' | 'done'
}

/**
 * Input组件事件
 */
export interface InputEmits {
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
}

/**
 * Input - Lynx输入框组件
 * 
 * 支持v-model双向绑定的输入框组件
 * 
 * @example
 * ```vue
 * <Input v-model="text" placeholder="请输入内容" />
 * ```
 */
export const Input = defineComponent({
  name: 'LynxInput',
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
    type: {
      type: String as PropType<InputProps['type']>,
      default: 'text',
    },
    password: Boolean,
    focus: Boolean,
    confirmType: {
      type: String as PropType<InputProps['confirmType']>,
      default: 'done',
    },
  },
  emits: ['update:modelValue', 'input', 'focus', 'blur', 'confirm'],
  setup(props, { emit, attrs }) {
    const onInput = (event: any) => {
      const value = event.detail?.value ?? event.target?.value ?? ''
      emit('update:modelValue', value)
      emit('input', event)
    }

    return () => h(
      'input',
      {
        ...props,
        ...attrs,
        value: props.modelValue,
        onInput,
      }
    )
  },
})
