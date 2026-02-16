import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VueLynx',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      // 将 Vue、runtime 和 components 标记为外部依赖
      external: ['vue', '@lynx-vue/runtime', '@lynx-vue/components'],
      output: {
        globals: {
          vue: 'Vue',
          '@lynx-vue/runtime': 'LynxVueRuntime',
          '@lynx-vue/components': 'LynxVueComponents',
        },
      },
    },
    sourcemap: true,
    minify: false,
  },
})
