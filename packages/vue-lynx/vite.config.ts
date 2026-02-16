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
      external: ['vue', '@pgg/runtime', '@pgg/components'],
      output: {
        globals: {
          vue: 'Vue',
          '@pgg/runtime': 'LynxVueRuntime',
          '@pgg/components': 'LynxVueComponents',
        },
      },
    },
    sourcemap: true,
    minify: false,
  },
})
