# 高级特性

本章节介绍Vue Lynx的高级特性和实用技巧，帮助你构建更复杂的应用。

## 自定义组件

除了使用内置组件，你还可以创建自己的Vue组件来封装业务逻辑。

### 组件封装

```vue
<!-- MyButton.vue -->
<script setup lang="ts">
import { View, Text } from 'vue-lynx'

defineProps<{
  title: string
  type?: 'primary' | 'default'
}>()

const emit = defineEmits<{
  click: [event: any]
}>()

function handleClick(event: any) {
  emit('click', event)
}
</script>

<template>
  <View :class="['my-button', `my-button--${type || 'default'}`]" @click="handleClick">
    <Text>{{ title }}</Text>
  </View>
</template>

<style>
.my-button {
  padding: 12px 24px;
  border-radius: 4px;
}

.my-button--primary {
  background-color: #42b983;
}

.my-button--default {
  background-color: #f0f0f0;
}
</style>
```

### 使用自定义组件

```vue
<script setup>
import MyButton from './MyButton.vue'

function handleBtnClick(event) {
  console.log('按钮被点击', event)
}
</script>

<template>
  <View>
    <MyButton title="确认" type="primary" @click="handleBtnClick" />
    <MyButton title="取消" @click="handleBtnClick" />
  </View>
</template>
```

## 插槽系统

Vue Lynx支持Vue的插槽功能，可以实现更灵活的组件复用。

### 默认插槽

```vue
<!-- Card.vue -->
<script setup>
import { View, Text } from 'vue-lynx'
</script>

<template>
  <View class="card">
    <View class="card-header">
      <Text><slot name="title">默认标题</slot></Text>
    </View>
    <View class="card-body">
      <slot>默认内容</slot>
    </View>
  </View>
</template>
```

```vue
<template>
  <Card>
    <template #title>我的卡片</template>
    这是卡片的内容
  </Card>
</template>
```

### 作用域插槽

```vue
<!-- List.vue -->
<script setup>
import { View, Text } from 'vue-lynx'

defineProps<{
  items: string[]
}>()
</script>

<template>
  <View>
    <View v-for="(item, index) in items" :key="index">
      <slot :item="item" :index="index" />
    </View>
  </View>
</template>
```

```vue
<template>
  <List :items="['苹果', '香蕉', '橙子']">
    <template #default="{ item, index }">
      <Text>{{ index + 1 }}. {{ item }}</Text>
    </template>
  </List>
</template>
```

## 异步组件

对于大型应用，可以使用异步组件来优化加载性能：

```vue
<script setup>
import { defineAsyncComponent } from 'vue'

const HeavyComponent = defineAsyncComponent(() => 
  import('./HeavyComponent.vue')
)
</script>

<template>
  <View>
    <HeavyComponent v-if="showHeavy" />
  </View>
</template>
```

## 依赖注入

使用provide和inject实现跨组件数据共享：

```vue
<!-- 父组件 -->
<script setup>
import { provide, ref } from 'vue'

const theme = ref('light')

provide('theme', theme)

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}
</script>

<template>
  <View @click="toggleTheme">
    <Text>当前主题: {{ theme }}</Text>
  </View>
</template>
```

```vue
<!-- 子组件 -->
<script setup>
import { inject, ref } from 'vue'

const theme = inject('theme')
</script>

<template>
  <View :class="theme">
    <Text>主题内容</Text>
  </View>
</template>
```

## 样式处理

### CSS Modules

```vue
<template>
  <View :class="$style.container">
    <Text :class="$style.title">标题</Text>
  </View>
</template>

<style module>
.container {
  padding: 16px;
}

.title {
  font-size: 20px;
  font-weight: bold;
}
</style>
```

### 动态样式

```vue
<script setup>
import { computed } from 'vue'

const props = defineProps<{
  status: 'success' | 'warning' | 'error'
}>()

const statusColor = computed(() => {
  const colors = {
    success: '#52c41a',
    warning: '#faad14',
    error: '#f5222d',
  }
  return { color: colors[props.status] }
})
</script>

<template>
  <Text :style="statusColor">状态文本</Text>
</template>
```

## 性能优化

### 使用shallowRef

对于大型对象，使用shallowRef可以避免深度响应式开销：

```vue
<script setup>
import { shallowRef, triggerRef } from 'vue'

const largeData = shallowRef({
  items: [],
  metadata: {},
})

function updateData() {
  // 修改不会触发响应式更新
  largeData.value.items.push({ id: 1 })
  
  // 需要手动触发
  triggerRef(largeData)
}
</script>
```

### v-memo优化列表

使用v-memo减少不必要的列表重渲染：

```vue
<template>
  <List :data-source="items">
    <template #renderItem="{ item }">
      <View v-memo="[item.selected]">
        <Text>{{ item.content }}</Text>
      </View>
    </template>
  </List>
</template>
```

### 避免不必要的响应式

对于不需要响应式的数据，使用普通变量：

```vue
<script setup>
// 静态配置，不需要响应式
const CONFIG = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
}

function fetchData() {
  fetch(CONFIG.apiUrl)
}
</script>
```

## 错误处理

### 错误边界

```vue
<script setup>
import { onErrorCaptured, ref } from 'vue'

const error = ref(null)

onErrorCaptured((err) => {
  error.value = err
  console.error('捕获到错误:', err)
  return false // 阻止错误继续传播
})
</script>

<template>
  <View v-if="error">
    <Text>发生错误: {{ error.message }}</Text>
  </View>
  <View v-else>
    <slot />
  </View>
</template>
```

### 全局错误处理

```typescript
import { createApp } from 'vue-lynx'
import App from './App.vue'

const app = createApp(App)

app.config.errorHandler = (err, instance, info) => {
  console.error('全局错误:', err)
  console.error('组件:', instance)
  console.error('信息:', info)
}

app.mount('#app')
```

## TypeScript高级类型

### 组件Props类型

```typescript
import type { PropType } from 'vue'

interface User {
  id: number
  name: string
  email: string
}

const props = defineProps({
  user: {
    type: Object as PropType<User>,
    required: true,
  },
  onUpdate: {
    type: Function as PropType<(user: User) => void>,
  },
})
```

### 事件类型

```typescript
const emit = defineEmits<{
  change: [value: string]
  update: [payload: { id: number; value: string }]
  delete: [id: number]
}>()

// 使用
emit('change', 'new value')
emit('update', { id: 1, value: 'updated' })
```

## 路由集成

Vue Lynx可以与Vue Router配合使用：

```typescript
// router/index.ts
import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('../views/Home.vue'),
  },
  {
    path: '/detail/:id',
    component: () => import('../views/Detail.vue'),
  },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})
```

```typescript
// main.ts
import { createApp } from 'vue-lynx'
import { router } from './router'
import App from './App.vue'

const app = createApp(App)
app.use(router)
app.mount('#app')
```

```vue
<!-- App.vue -->
<script setup>
import { View } from 'vue-lynx'
import { RouterView, RouterLink } from 'vue-router'
</script>

<template>
  <View>
    <RouterLink to="/">首页</RouterLink>
    <RouterLink to="/detail/1">详情</RouterLink>
    <RouterView />
  </View>
</template>
```

## 状态管理

对于复杂应用，可以使用Pinia进行状态管理：

```typescript
// stores/counter.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  
  const doubled = computed(() => count.value * 2)
  
  function increment() {
    count.value++
  }
  
  function decrement() {
    count.value--
  }
  
  return { count, doubled, increment, decrement }
})
```

```vue
<script setup>
import { useCounterStore } from './stores/counter'

const store = useCounterStore()
</script>

<template>
  <View>
    <Text>{{ store.count }}</Text>
    <Text>{{ store.doubled }}</Text>
    <View @click="store.increment"><Text>+</Text></View>
  </View>
</template>
```

## 调试技巧

### 开发者工具

使用Lynx提供的开发者工具进行调试：

1. 启动应用后，打开DevTools
2. 查看组件树结构
3. 检查组件属性和状态
4. 监控性能指标

### 日志输出

```vue
<script setup>
import { ref, watch } from 'vue'

const data = ref({})

watch(data, (newVal) => {
  console.log('数据变化:', JSON.stringify(newVal))
}, { deep: true })

function updateData() {
  data.value = { name: 'Lynx', version: '1.0' }
}
</script>
```

### 热更新

Vue Lynx支持热更新（HMR），修改代码后无需刷新整个应用即可看到变化。
