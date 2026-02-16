import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'LynxVueComponents',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      // 将 Vue 和 runtime 标记为外部依赖
      external: ['vue', '@pgg/runtime'],
      output: {
        globals: {
          vue: 'Vue',
          '@pgg/runtime': 'LynxVueRuntime',
        },
      },
    },
    sourcemap: true,
    minify: false,
  },
})
