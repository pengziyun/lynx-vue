# View

View是Vue Lynx中最基础的容器组件，类似于HTML中的div元素。它用于组织和布局其他组件，是构建用户界面的核心元素。

## 基本介绍

View组件是一个灵活的容器，可以包含任意数量的子组件。它支持多种布局方式，可以实现水平、垂直、网格等复杂布局。

## 基础用法

最简单的用法是将内容包裹在View组件中：

```vue
<template>
  <View class="container">
    <Text>Hello Lynx</Text>
  </View>
</template>
```

## Props

View组件支持以下属性：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| id | string | - | 组件的唯一标识符 |
| style | StyleValue | - | 内联样式对象 |
| class | string \| string[] \| Record<string, boolean> | - | CSS类名，支持字符串、数组或对象语法 |
| clickable | boolean | false | 是否响应点击事件，设置为true会添加点击态 |
| hoverClass | string | - | 点击时的CSS类名 |
| hoverStartTime | number | - | 触发hover态的最小按压时间（毫秒） |
| hoverStayTime | number | - | 点击态持续时间（毫秒） |
| disabled | boolean | false | 是否禁用，禁用后不响应事件 |
| animation | string | - | 动画名称 |

## Events

View组件支持丰富的事件：

| 事件名 | 参数类型 | 说明 |
|--------|----------|------|
| click | Event | 点击事件 |
| longpress | Event | 长按事件（按压超过350毫秒） |
| touchstart | TouchEvent | 手指触摸开始 |
| touchmove | TouchEvent | 手指触摸移动 |
| touchend | TouchEvent | 手指触摸结束 |
| touchcancel | TouchEvent | 触摸被中断 |

## 示例

### 基础点击事件

```vue
<script setup lang="ts">
function handleClick() {
  console.log('View被点击了')
}
</script>

<template>
  <View @click="handleClick">
    <Text>点击我</Text>
  </View>
</template>
```

### 长按事件

```vue
<script setup lang="ts">
function handleLongPress() {
  console.log('长按触发')
}
</script>

<template>
  <View @longpress="handleLongPress">
    <Text>长按我</Text>
  </View>
</template>
```

### 触摸事件

```vue
<script setup lang="ts">
function handleTouchStart(e: any) {
  console.log('触摸开始', e.touches)
}

function handleTouchMove(e: any) {
  console.log('触摸移动', e.touches)
}

function handleTouchEnd(e: any) {
  console.log('触摸结束', e.changedTouches)
}
</script>

<template>
  <View 
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <Text>触摸区域</Text>
  </View>
</template>
```

### 动态类名绑定

```vue
<script setup lang="ts">
import { ref } from 'vue'

const isActive = ref(false)
const isHighlight = ref(true)
</script>

<template>
  <!-- 字符串类名 -->
  <View class="container">
    <Text>基础容器</Text>
  </View>
  
  <!-- 数组类名 -->
  <View class="['container', 'rounded']">
    <Text>数组类名</Text>
  </View>
  
  <!-- 对象类名 -->
  <View :class="{ active: isActive, highlight: isHighlight }">
    <Text>对象类名</Text>
  </View>
</template>

<style>
.container {
  padding: 16px;
  background-color: #f5f5f5;
}

.rounded {
  border-radius: 8px;
}

.active {
  background-color: #42b983;
  color: white;
}

.highlight {
  border: 2px solid #42b983;
}
</style>
```

### 动态样式绑定

```vue
<script setup lang="ts">
import { ref } from 'vue'

const containerStyle = ref({
  backgroundColor: '#ffffff',
  padding: '20px',
  margin: '10px',
})

const isLarge = ref(false)

function toggleSize() {
  isLarge.value = !isLarge.value
  containerStyle.value = {
    ...containerStyle.value,
    padding: isLarge.value ? '40px' : '20px',
  }
}
</script>

<template>
  <View :style="containerStyle">
    <Text>动态样式内容</Text>
    <View @click="toggleSize">
      <Text>切换大小</Text>
    </View>
  </View>
</template>
```

### 可点击态效果

```vue
<template>
  <View class="button" hover-class="button-hover">
    <Text>点击我</Text>
  </View>
</template>

<style>
.button {
  padding: 12px 24px;
  background-color: #42b983;
  border-radius: 4px;
}

.button-hover {
  opacity: 0.8;
  transform: scale(0.98);
}
</style>
```

### 布局示例

#### 水平布局

```vue
<template>
  <View class="row">
    <View class="item"><Text>A</Text></View>
    <View class="item"><Text>B</Text></View>
    <View class="item"><Text>C</Text></View>
  </View>
</template>

<style>
.row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.item {
  padding: 10px;
  background-color: #f0f0f0;
}
</style>
```

#### 垂直布局

```vue
<template>
  <View class="column">
    <View class="item"><Text>顶部</Text></View>
    <View class="item"><Text>中部</Text></View>
    <View class="item"><Text>底部</Text></View>
  </View>
</template>

<style>
.column {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item {
  padding: 20px;
  background-color: #f0f0f0;
}
</style>
```

#### 网格布局

```vue
<template>
  <View class="grid">
    <View class="grid-item" v-for="i in 9" :key="i">
      <Text>{{ i }}</Text>
    </View>
  </View>
</template>

<style>
.grid {
  display: flex;
  flex-wrap: wrap;
  width: 300px;
}

.grid-item {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e0e0e0;
  border: 1px solid #fff;
  box-sizing: border-box;
}
</style>
```

## 注意事项

1. View组件默认是块级元素，会占据父容器的全部宽度（高度由内容决定）
2. 设置`clickable`属性后，组件会添加一个透明的点击层，用于捕获点击事件
3. 长按事件需要按压350毫秒以上才会触发
4. 触摸事件中获取触摸点信息需要通过事件对象的`touches`或`changedTouches`属性
5. 使用`hoverClass`实现点击态效果时，需要同时设置`clickable`属性为true

## 最佳实践

1. **合理使用clickable**：只有需要响应点击事件时才设置clickable为true
2. **避免过度嵌套**：过多的View嵌套会影响渲染性能
3. **使用flex布局**：Vue Lynx推荐使用flex布局进行页面排版
4. **样式分离**：将复杂样式放在style块中，保持模板简洁
