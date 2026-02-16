# 核心概念

深入了解Vue Lynx的设计理念和核心技术，帮助你更好地使用这个框架。

## 自定义渲染器

Vue Lynx基于Vue 3的自定义渲染器（Custom Renderer）API实现。Vue 3提供了一个强大的渲染器抽象，允许开发者自定义如何将Vue组件渲染到不同的目标平台。

### 工作原理

传统的Vue应用将组件渲染为DOM元素，而Vue Lynx将组件渲染为Lynx原生组件。这一过程包括：

1. **创建VNode** - Vue组件被编译为虚拟节点（VNode）
2. **处理VNode** - 自定义渲染器处理VNode，将其转换为Lynx可识别的结构
3. **生成Native Element** - 最终生成Lynx的原生组件描述
4. **更新同步** - 通过Lynx的更新机制将变化同步到原生视图

### 优势

使用自定义渲染器带来了许多优势：

- **完整的Vue体验** - 可以使用所有Vue特性，包括响应式系统、Composition API等
- **无缝迁移** - 从Web应用迁移到Lynx只需最小的代码改动
- **一致性** - 开发体验与开发Web应用几乎完全相同

## 双线程模型

Lynx采用了创新的双线程架构，这是它高性能的关键所在。

### 线程分工

Lynx的两个线程各司其职：

| 线程 | 名称 | 职责 |
|------|------|------|
| 主线程 | Main Thread | 处理UI渲染、用户交互、动画 |
| 后台线程 | Background Thread | 执行业务逻辑、数据处理、状态更新 |

### 数据流动

```
用户操作 → 主线程捕获事件 → 发送到后台线程 → 后台线程处理逻辑 → 
更新状态 → 发送更新指令到主线程 → 主线程更新UI
```

### Vue Lynx的线程管理

Vue Lynx会自动处理线程间的通信和调度：

```typescript
import { ref, computed } from 'vue'

// 响应式数据会自动同步
const count = ref(0)

// 计算属性会在后台线程计算
const doubled = computed(() => count.value * 2)

// 方法会在适当的线程执行
function increment() {
  count.value++
}
```

开发者无需关心底层线程调度，Vue Lynx会自动为你处理。

## 组件系统

Vue Lynx提供了完整的组件封装，这些组件对应Lynx的原生组件。

### 内置组件

Vue Lynx内置了以下核心组件：

- **View** - 基础容器组件，用于布局和嵌套
- **Text** - 文本组件，用于显示文字
- **Input** - 输入框组件，用于用户输入
- **List** - 列表组件，用于渲染大量数据
- **Image** - 图片组件，用于显示图片
- **Scroller** - 滚动容器，支持垂直和水平滚动
- **Swiper** - 轮播组件
- **Video** - 视频播放组件
- **Navigator** - 页面导航组件

### 组件特性

所有Vue Lynx组件都支持Vue的标准特性：

#### 响应式数据绑定

```vue
<template>
  <View>
    <Text>{{ message }}</Text>
  </View>
</template>

<script setup>
import { ref } from 'vue'

const message = ref('Hello Lynx')
</script>
```

#### 事件处理

```vue
<template>
  <View @click="handleClick">
    <Text>点击</Text>
  </View>
</template>

<script setup>
function handleClick(event) {
  console.log('clicked', event)
}
</script>
```

#### 样式绑定

```vue
<template>
  <View :class="containerClass" :style="containerStyle">
    <Text>内容</Text>
  </View>
</template>

<script setup>
import { ref } from 'vue'

const containerClass = ref('container')
const containerStyle = ref({
  backgroundColor: '#ffffff',
  padding: '20px',
})
</script>
```

#### v-model双向绑定

```vue
<template>
  <View>
    <Input v-model="inputValue" />
    <Text>{{ inputValue }}</Text>
  </View>
</template>

<script setup>
import { ref } fromconst inputValue = 'vue'

 ref('')
</script>
```

### v-if与v-for

Vue Lynx支持条件渲染和列表渲染：

```vue
<template>
  <View>
    <View v-if="showContent">
      <Text>内容显示</Text>
    </View>
    
    <List :data-source="items">
      <template #renderItem="{ item }">
        <View>
          <Text>{{ item.title }}</Text>
        </View>
      </template>
    </List>
  </View>
</template>

<script setup>
import { ref } from 'vue'

const showContent = ref(true)
const items = ref([
  { id: 1, title: '项目1' },
  { id: 2, title: '项目2' },
])
</script>
```

## 事件系统

Vue Lynx的事件系统会将Vue事件自动映射到Lynx原生事件。

### 事件映射

| Vue事件 | Lynx事件 | 说明 |
|---------|----------|------|
| `@click` | `bind:tap` | 点击事件 |
| `@longpress` | `bind:longpress` | 长按事件 |
| `@touchstart` | `bind:touchstart` | 触摸开始 |
| `@touchmove` | `bind:touchmove` | 触摸移动 |
| `@touchend` | `bind:touchend` | 触摸结束 |
| `@input` | `bind:input` | 输入事件 |
| `@change` | `bind:change` | 变化事件 |

### 事件修饰符

Vue Lynx支持部分事件修饰符：

#### .capture - 捕获阶段处理

```vue
<template>
  <View @click.capture="handleCapture">
    <Text>内容</Text>
  </View>
</template>
```

对应Lynx的`capture-bind:tap`。

#### .stop - 阻止冒泡

```vue
<template>
  <View @click.stop="handleStop">
    <Text>内容</Text>
  </View>
</template>
```

对应Lynx的`catch:tap`，可以阻止事件向上冒泡。

### 事件参数

事件处理函数可以接收事件对象：

```typescript
function handleClick(event: LynxTapEvent) {
  // event包含点击位置、时间等信息
  console.log(event.pageX, event.pageY)
}
```

## 响应式系统

Vue Lynx使用Vue 3的响应式系统，所有响应式API都可以正常使用。

### 可用API

```typescript
import { 
  ref,           // 基础类型响应式
  reactive,      // 对象响应式
  computed,      // 计算属性
  watch,         // 监听器
  watchEffect,   // 立即执行的监听器
  toRefs,        // 转换为ref
  toRef,         // 单个转换为ref
} from 'vue'
```

### 使用示例

```vue
<script setup>
import { ref, reactive, computed, watch } from 'vue'

// 基础类型
const count = ref(0)

// 对象
const state = reactive({
  name: 'Lynx',
  version: '1.0',
})

// 计算属性
const doubled = computed(() => count.value * 2)

// 监听器
watch(count, (newVal, oldVal) => {
  console.log(`从 ${oldVal} 变为 ${newVal}`)
})

function increment() {
  count.value++
}
</script>

<template>
  <View>
    <Text>{{ count }} x 2 = {{ doubled }}</Text>
    <Text>{{ state.name }} - {{ state.version }}</Text>
    <View @click="increment">
      <Text>增加</Text>
    </View>
  </View>
</template>
```

## 生命周期

Vue Lynx组件支持标准Vue生命周期钩子：

| 钩子 | 时机 |
|------|------|
| `onMounted` | 组件挂载完成后 |
| `onUpdated` | 组件更新完成后 |
| `onUnmounted` | 组件卸载后 |
| `onBeforeMount` | 挂载之前 |
| `onBeforeUpdate` | 更新之前 |
| `onBeforeUnmount` | 卸载之前 |

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  console.log('组件已挂载')
  
  // 可以在这里初始化一些数据
})

onUnmounted(() => {
  console.log('组件已卸载')
  
  // 清理工作
})
</script>
```

## 组合式函数

你可以创建可复用的组合式函数（Composables）来组织代码：

```typescript
// useCounter.ts
import { ref, computed } from 'vue'

export function useCounter() {
  const count = ref(0)
  
  const doubled = computed(() => count.value * 2)
  
  function increment() {
    count.value++
  }
  
  function decrement() {
    count.value--
  }
  
  return {
    count,
    doubled,
    increment,
    decrement,
  }
}
```

```vue
<script setup>
import { useCounter } from './useCounter'

const { count, doubled, increment, decrement } = useCounter()
</script>

<template>
  <View>
    <Text>Count: {{ count }}</Text>
    <Text>Doubled: {{ doubled }}</Text>
    <View @click="increment"><Text>+</Text></View>
    <View @click="decrement"><Text>-</Text></View>
  </View>
</template>
```
