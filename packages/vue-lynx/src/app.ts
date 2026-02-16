import { createApp as createVueApp } from 'vue'
import { createRenderer } from '@lynx-vue/runtime'

/**
 * 创建Lynx应用
 */
export function createApp(rootComponent: any, rootProps?: any) {
  const renderer = createRenderer()
  const app = createVueApp(rootComponent, rootProps)

  // 将渲染器挂载到全局属性
  app.config.globalProperties.$lynx = renderer

  return {
    ...app,
    mount(rootContainer: any) {
      // Lynx特定的挂载逻辑
      return app.mount(rootContainer)
    },
  }
}
