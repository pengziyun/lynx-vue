import { createApp as createVueApp } from 'vue'
import { createLynxRenderer } from '@lynx-vue/runtime'

export function createApp(rootComponent: any, rootProps?: any) {
  const renderer = createLynxRenderer()
  const app = createVueApp(rootComponent, rootProps)

  app.config.globalProperties.$lynx = renderer

  return {
    ...app,
    mount(rootContainer: any) {
      return app.mount(rootContainer)
    },
  }
}
