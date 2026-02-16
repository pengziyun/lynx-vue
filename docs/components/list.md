# List

List是Vue Lynx中用于高效渲染大量数据的组件，类似于移动端的RecyclerView。它通过虚拟列表技术实现高性能的列表渲染，即使面对成千上万条数据也能保持流畅。

## 基本介绍

List组件是Vue Lynx中最重要的组件之一，专门用于处理大量数据的列表渲染。它采用虚拟滚动技术，只渲染当前可视区域内的列表项，大幅减少DOM节点数量，提升渲染性能。

## 重要特性

- **虚拟滚动**：只渲染可见区域的内容，大幅提升性能
- **灵活的数据源**：支持数组作为数据源
- **插槽支持**：提供丰富的插槽用于自定义列表项
- **下拉刷新**：支持下拉刷新功能
- **上拉加载**：支持上拉加载更多
- **性能优化**：自动计算列表项高度，支持不规则高度的列表

## Props

List组件支持以下属性：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| dataSource | any[] | [] | 列表数据源 |
| keyName | string | - | 数据中作为key的字段名 |
| renderItem | Function | - | 渲染函数，优先级高于插槽 |
| itemSize | number | - | 列表项高度（固定高度模式） |
| itemSizeGetter | Function | - | 获取列表项高度的函数（不规则高度模式） |
| estimatedItemSize | number | - | 估算的列表项高度 |
| initialScrollOffset | number | - | 初始滚动位置 |
| infinite | boolean | false | 是否启用无限滚动 |
| infiniteLoading | boolean | false | 是否正在加载更多 |
| infiniteThreshold | number | 3 | 距离底部多少项触发加载更多 |
| onScroll | Function | - | 滚动事件回调 |
| scrollOffset | number | - | 当前滚动位置 |

## Events

List组件支持以下事件：

| 事件名 | 参数类型 | 说明 |
|--------|----------|------|
| scroll | ScrollEvent | 滚动时触发 |
| scrolltolower | Event | 滚动到底部时触发 |
| scrolltoupper | Event | 滚动到顶部时触发 |
| pullrefresh | Event | 下拉刷新时触发 |
| loadmore | Event | 加载更多时触发 |

## 示例

### 基础列表

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { List, View, Text } from 'vue-lynx'

const items = ref(
  Array.from({ length: 100 }, (_, i) => ({ id: i, title: `项目 ${i + 1}` }))
)
</script>

<template>
  <List :data-source="items">
    <template #renderItem="{ item }">
      <View class="list-item">
        <Text>{{ item.title }}</Text>
      </View>
    </template>
  </List>
</template>

<style>
.list-item {
  padding: 16px;
  border-bottom: 1px solid #eee;
}
</style>
```

### 使用keyName

```vue
<script setup lang="ts">
import { ref } from 'vue'

const users = ref([
  { userId: 1, name: '张三', age: 25 },
  { userId: 2, name: '李四', age: 30 },
  { userId: 3, name: '王五', age: 28 },
])
</script>

<template>
  <List :data-source="users" keyName="userId">
    <template #renderItem="{ item }">
      <View class="user-item">
        <Text>{{ item.name }} - {{ item.age }}岁</Text>
      </View>
    </template>
  </List>
</template>
```

### 固定高度列表

```vue
<script setup lang="ts">
import { ref } from 'vue'

const listData = ref(
  Array.from({ length: 50 }, (_, i) => ({
    id: i,
    content: `这是第 ${i + 1} 条内容`
  }))
)
</script>

<template>
  <List 
    :data-source="listData" 
    :itemSize="60"
    keyName="id"
  >
    <template #renderItem="{ item, index }">
      <View class="fixed-item">
        <Text>索引: {{ index }}</Text>
        <Text>{{ item.content }}</Text>
      </View>
    </template>
  </List>
</template>

<style>
.fixed-item {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid #f0f0f0;
}
</style>
```

### 不规则高度列表

```vue
<script setup lang="ts">
import { ref } from 'vue'

const articles = ref([
  { id: 1, title: '标题1', content: '这是一段较短的内容' },
  { id: 2, title: '标题2', content: '这是一段较长的内容，需要换行显示。\n这里有换行符。\n还有更多内容。' },
  { id: 3, title: '标题3', content: '这是第三篇文章的内容' },
])
</script>

<template>
  <List 
    :data-source="articles" 
    keyName="id"
    :itemSizeGetter="(item) => item.id === 2 ? 150 : 80"
  >
    <template #renderItem="{ item }">
      <View class="article-item">
        <Text class="title">{{ item.title }}</Text>
        <Text class="content">{{ item.content }}</Text>
      </View>
    </template>
  </List>
</template>

<style>
.article-item {
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
}

.content {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}
</style>
```

### 无限滚动加载

```vue
<script setup lang="ts">
import { ref } from 'vue'

interface Item {
  id: number
  title: string
}

const items = ref<Item[]>(
  Array.from({ length: 20 }, (_, i) => ({ id: i, title: `项目 ${i + 1}` }))
)

const loading = ref(false)

function loadMore() {
  if (loading.value) return
  
  loading.value = true
  
  // 模拟异步加载
  setTimeout(() => {
    const newItems = Array.from(
      { length: 20 },
      (_, i) => ({
        id: items.value.length + i,
        title: `新项目 ${items.value.length + i + 1}`
      })
    )
    items.value = [...items.value, ...newItems]
    loading.value = false
  }, 1000)
}
</script>

<template>
  <List 
    :data-source="items" 
    keyName="id"
    infinite
    :infiniteLoading="loading"
    @loadmore="loadMore"
  >
    <template #renderItem="{ item }">
      <View class="list-item">
        <Text>{{ item.title }}</Text>
      </View>
    </template>
  </List>
</template>

<style>
.list-item {
  padding: 16px;
  border-bottom: 1px solid #eee;
}
</style>
```

### 滚动事件监听

```vue
<script setup lang="ts">
import { ref } from 'vue'

const items = ref(
  Array.from({ length: 50 }, (_, i) => ({ id: i, title: `项目 ${i + 1}` }))
)

const scrollInfo = ref({
  scrollTop: 0,
  scrollHeight: 0,
  clientHeight: 0,
})

function handleScroll(e: any) {
  scrollInfo.value = {
    scrollTop: e.detail.scrollTop,
    scrollHeight: e.detail.scrollHeight,
    clientHeight: e.detail.clientHeight,
  }
}
</script>

<template>
  <View>
    <View class="scroll-info">
      <Text>滚动位置: {{ scrollInfo.scrollTop }}</Text>
      <Text>内容高度: {{ scrollInfo.scrollHeight }}</Text>
      <Text>视口高度: {{ scrollInfo.clientHeight }}</Text>
    </View>
    
    <List 
      :data-source="items" 
      keyName="id"
      @scroll="handleScroll"
    >
      <template #renderItem="{ item }">
        <View class="list-item">
          <Text>{{ item.title }}</Text>
        </View>
      </template>
    </List>
  </View>
</template>

<style>
.scroll-info {
  padding: 12px;
  background-color: #f5f5f5;
  position: sticky;
  top: 0;
  z-index: 10;
}

.list-item {
  padding: 16px;
  border-bottom: 1px solid #eee;
}
</style>
```

### 分组列表

```vue
<script setup lang="ts">
import { ref } from 'vue'

interface GroupItem {
  title: string
  children: { id: number; name: string }[]
}

const groups = ref<GroupItem[]>([
  {
    title: '水果',
    children: [
      { id: 1, name: '苹果' },
      { id: 2, name: '香蕉' },
      { id: 3, name: '橙子' },
    ]
  },
  {
    title: '蔬菜',
    children: [
      { id: 4, name: '白菜' },
      { id: 5, name: '萝卜' },
    ]
  },
  {
    title: '饮料',
    children: [
      { id: 6, name: '可乐' },
      { id: 7, name: '雪碧' },
      { id: 8, name: '橙汁' },
    ]
  },
])
</script>

<template>
  <List :data-source="groups" keyName="title">
    <template #renderItem="{ item: group }">
      <View class="group-header">
        <Text>{{ group.title }}</Text>
      </View>
      <View 
        v-for="child in group.children" 
        :key="child.id" 
        class="group-item"
      >
        <Text>{{ child.name }}</Text>
      </View>
    </template>
  </List>
</template>

<style>
.group-header {
  padding: 12px 16px;
  background-color: #f0f0f0;
  font-weight: bold;
}

.group-item {
  padding: 14px 16px;
  border-bottom: 1px solid #eee;
}
</style>
```

### 带图片的列表

```vue
<script setup lang="ts">
import { ref } from 'vue'

interface Product {
  id: number
  name: string
  price: number
  image: string
}

const products = ref<Product[]>([
  { id: 1, name: 'iPhone 15', price: 5999, image: 'https://example.com/iphone.png' },
  { id: 2, name: 'MacBook Pro', price: 12999, image: 'https://example.com/macbook.png' },
  { id: 3, name: 'iPad Pro', price: 4999, image: 'https://example.com/ipad.png' },
])
</script>

<template>
  <List :data-source="products" keyName="id">
    <template #renderItem="{ item }">
      <View class="product-item">
        <Image :src="item.image" class="product-image" />
        <View class="product-info">
          <Text class="product-name">{{ item.name }}</Text>
          <Text class="product-price">¥{{ item.price }}</Text>
        </View>
      </View>
    </template>
  </List>
</template>

<style>
.product-item {
  display: flex;
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  margin-right: 12px;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.product-name {
  font-size: 16px;
  margin-bottom: 8px;
}

.product-price {
  font-size: 18px;
  color: #ff6b6b;
  font-weight: bold;
}
</style>
```

## 注意事项

1. **keyName必须设置**：为了正确识别列表项，必须设置keyName属性
2. **高度计算**：对于不规则高度的列表，需要正确实现itemSizeGetter函数
3. **滚动容器**：List组件本身是一个可滚动容器，不需要再包裹Scroller
4. **性能考虑**：虽然List已经做了优化，但仍然要注意不要在列表项中渲染过多复杂的内容
5. **数据更新**：修改dataSource后，List会自动重新渲染
6. **内存占用**：大量数据时，即使只渲染可见区域，仍然会占用较多内存

## 最佳实践

1. **合理设置itemSize**：如果列表项高度固定，务必设置itemSize以获得最佳性能
2. **实现itemSizeGetter**：列表项高度不同时，需要实现这个函数来准确计算高度
3. **使用keyName**：始终指定唯一标识符字段作为key
4. **处理加载状态**：无限滚动时给用户明确的加载反馈
5. **避免过度渲染**：不要在列表项中使用过于复杂的组件结构
6. **滚动位置恢复**：使用initialScrollOffset可以恢复之前的滚动位置
7. **分页加载**：对于大量数据，建议实现分页加载而不是一次性加载全部数据
