# 快速开始

本指南将帮助你快速上手Vue Lynx，了解如何安装和创建第一个应用。

## 环境要求

在开始之前，请确保你的开发环境满足以下要求：

- Node.js 18.0.0 或更高版本
- pnpm 8.0.0 或更高版本
- Vue 3.4.0 或更高版本

## 安装

使用pnpm安装Vue Lynx：

```bash
pnpm add vue-lynx vue
```

你也可以使用npm或yarn：

```bash
# npm
npm install vue-lynx vue

# yarn
yarn add vue-lynx vue
```

## 创建应用

安装完成后，你可以使用`createApp`方法创建Vue Lynx应用：

```typescript
import { createApp } from 'vue-lynx'
import App from './App.vue'

const app = createApp(App)
app.mount('#app')
```

这与标准的Vue应用创建方式非常相似，唯一的区别是使用`vue-lynx`包中的`createApp`而不是`vue`包中的。

## 编写组件

Vue Lynx组件就是普通的Vue组件，你可以使用所有熟悉的Vue语法：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { View, Text } from 'vue-lynx'

const count = ref(0)
</script>

<template>
  <View>
    <Text>Count: {{ count }}</Text>
    <View @click="count++">
      <Text>Increment</Text>
    </View>
  </View>
</template>
```

### 使用组件

Vue Lynx提供了丰富的内置组件，包括：

- `View` - 基础容器组件
- `Text` - 文本显示组件
- `Input` - 输入框组件
- `List` - 列表组件
- `Image` - 图片组件
- `Scroller` - 滚动容器
- 等等...

导入组件的方式与标准Vue组件相同：

```typescript
import { View, Text, Input, Image } from 'vue-lynx'
```

## 事件处理

Vue Lynx支持标准的事件绑定语法，事件会自动映射到Lynx原生事件：

```vue
<template>
  <View @click="handleClick">
    <Text>点击我</Text>
  </View>
</template>

<script setup>
function handleClick() {
  console.log('按钮被点击了')
}
</template>
```

支持的事件包括：

- `click` - 点击事件
- `longpress` - 长按事件
- `touchstart` - 触摸开始
- `touchmove` - 触摸移动
- `touchend` - 触摸结束
- `input` - 输入事件
- `change` - 变化事件

## 样式绑定

Vue Lynx支持Vue的标准样式绑定方式：

```vue
<template>
  <View :class="{ active: isActive }" :style="customStyle">
    <Text>内容</Text>
  </View>
</template>

<script setup>
import { ref } from 'vue'

const isActive = ref(true)
const customStyle = {
  backgroundColor: '#42b983',
  padding: '16px',
}
</template>
```

## 下一步

现在你已经了解了Vue Lynx的基础用法，接下来可以：

- 学习[核心概念](/guide/core-concepts)，深入了解Vue Lynx的工作原理
- 查看[组件文档](/components/view)，了解所有可用组件
- 阅读[高级特性](/guide/advanced)，掌握更多实用技巧
