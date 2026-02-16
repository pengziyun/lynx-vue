# Vue Lynx

Vue 3 integration for Lynx cross-platform framework.

[![CI](https://github.com/your-org/lynx-vue/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/lynx-vue/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/vue-lynx.svg)](https://www.npmjs.com/package/vue-lynx)

## 特性

- 🚀 完整的Vue 3 Composition API支持
- ⚡️ 基于Lynx双线程架构的高性能渲染
- 📦 10+个内置组件
- 🔧 完整的TypeScript类型定义
- 📖 详细的文档和示例

## 安装

```bash
pnpm add vue-lynx vue
```

## 快速开始

```typescript
import { createApp } from 'vue-lynx'
import { View, Text } from 'vue-lynx'
import { ref } from 'vue'

const App = {
  setup() {
    const count = ref(0)
    return { count }
  },
  template: `
    <View>
      <Text>Count: {{ count }}</Text>
      <View @click="count++">
        <Text>Increment</Text>
      </View>
    </View>
  `
}

createApp(App).mount('#app')
```

## 文档

访问[完整文档](https://your-org.github.io/lynx-vue)了解更多。

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 测试
pnpm test

# 类型检查
pnpm typecheck
```

## 贡献

欢迎贡献!请查看[贡献指南](CONTRIBUTING.md)。

## 许可证

[MIT](LICENSE)
