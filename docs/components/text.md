# Text

Text是Vue Lynx中用于显示文本内容的组件，类似于HTML中的span元素。Text组件只能包含文本内容，不能包含其他组件。

## 基本介绍

Text组件是展示文本的基础组件，所有的文本内容都应该使用Text组件来显示。在Lynx中，Text是一个非常重要的组件，它负责文本的渲染和显示。

## 基础用法

```vue
<template>
  <View>
    <Text>这是一段文本</Text>
  </View>
</template>
```

## Props

Text组件支持以下属性：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| value | string | - | 文本内容，等同于默认插槽 |
| selectable | boolean | false | 是否可选中 |
| userSelect | boolean | false | 用户是否可以选中 |
| space | string | - | 文本空格展示方式：'ensp'（半个中文字符宽度）、'emsp'（一个中文字符宽度）、'nbsp'（根据字体设置） |
| decode | boolean | false | 是否解码HTML实体 |
| numberOfLines | number | - | 最多显示的行数，超出部分显示省略号 |
| ellipsis | boolean | false | 是否显示省略号 |
| disabled | boolean | false | 是否禁用 |

## Events

Text组件支持以下事件：

| 事件名 | 参数类型 | 说明 |
|--------|----------|------|
| click | Event | 点击事件 |
| longpress | LongpressEvent | 长按事件 |

## 示例

### 基础文本显示

```vue
<template>
  <View>
    <Text>Hello Lynx!</Text>
    <Text>这是一段中文文本</Text>
  </View>
</template>
```

### 使用value属性

```vue
<script setup lang="ts">
import { ref } from 'vue'

const message = ref('通过value属性设置文本')
</script>

<template>
  <View>
    <Text value="直接设置文本" />
    <Text :value="message" />
  </View>
</template>
```

### 文本选中

```vue
<template>
  <View>
    <Text selectable>这段文本可以被选中复制</Text>
    <Text>这段文本不能被选中</Text>
  </View>
</template>
```

### 文本空格处理

```vue
<template>
  <View>
    <!-- 显示半个中文宽度的空格 -->
    <Text space="ensp">前    后</Text>
    
    <!-- 显示一个中文宽度的空格 -->
    <Text space="emps">前　　后</Text>
    
    <!-- 显示nbsp空格 -->
    <Text space="nbsp">前    后</Text>
  </View>
</template>
```

### 多行文本与省略号

```vue
<script setup lang="ts">
import { ref } from 'vue'

const longText = ref('这是一段很长的文本，当内容超过指定行数时会自动显示省略号。这对于列表项标题或摘要展示非常有用。')
</script>

<template>
  <View>
    <!-- 单行省略 -->
    <Text :value="longText" :numberOfLines="1" ellipsis />
    
    <!-- 两行省略 -->
    <Text :value="longText" :numberOfLines="2" />
    
    <!-- 三行省略 -->
    <Text :value="longText" :numberOfLines="3" />
  </View>
</template>
```

### 响应式文本

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const count = ref(10)
const status = ref('pending')

const statusText = computed(() => {
  const map: Record<string, string> = {
    pending: '处理中',
    success: '成功',
    error: '失败',
  }
  return map[status.value] || '未知'
})

function increment() {
  count.value++
}
</script>

<template>
  <View>
    <Text>当前计数: {{ count }}</Text>
    <Text>状态: {{ statusText }}</Text>
    <View @click="increment">
      <Text>增加计数</Text>
    </View>
  </View>
</template>
```

### 文本样式

```vue
<template>
  <View>
    <Text class="title">大标题</Text>
    <Text class="subtitle">副标题</Text>
    <Text class="body">正文内容</Text>
    <Text class="caption"> caption">辅助说明文字</Text>
    <Text class="link">链接文字</Text>
  </View>
</template>

<style>
.title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 18px;
  font-weight: 600;
  color: #666;
  margin-bottom: 6px;
}

.body {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  margin-bottom: 4px;
}

.caption {
  font-size: 12px;
  color: #999;
}

.link {
  color: #42b983;
  text-decoration: underline;
}
</style>
```

### 文本对齐

```vue
<template>
  <View class="container">
    <Text class="left">左对齐文本</Text>
    <Text class="center">居中对齐文本</Text>
    <Text class="right">右对齐文本</Text>
  </View>
</template>

<style>
.container {
  width: 300px;
}

.left {
  text-align: left;
  display: block;
}

.center {
  text-align: center;
  display: block;
}

.right {
  text-align: right;
  display: block;
}
</style>
```

### 文本与点击事件

```vue
<script setup lang="ts">
import { ref } from 'vue'

const clicks = ref(0)

function handleClick() {
  clicks.value++
  console.log('文本被点击')
}

function handleLongPress() {
  console.log('文本被长按')
}
</script>

<template>
  <View>
    <Text @click="handleClick" @longpress="handleLongPress">
      点击次数: {{ clicks }}
    </Text>
    <Text selectable @click="handleClick">
      可点击的文本
    </Text>
  </View>
</template>
```

### 动态文本内容

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const firstName = ref('张')
const lastName = ref('三')

const fullName = computed(() => {
  return `${lastName.value}${firstName.value}`
})

const items = ref([
  { id: 1, name: '苹果' },
  { id: 2, name: '香蕉' },
  { id: 3, name: '橙子' },
])
</script>

<template>
  <View>
    <Text>姓名: {{ fullName }}</Text>
    
    <View v-for="item in items" :key="item.id">
      <Text>{{ item.name }}</Text>
    </View>
  </View>
</template>
```

## 注意事项

1. **Text组件不能嵌套**：Text组件内部不能包含其他组件，只能包含纯文本
2. **文本换行**：Text组件默认会自动换行，如果需要强制不换行可以设置`white-space: nowrap`
3. **空文本处理**：如果文本为空，Text组件仍会占据一定的空间
4. **性能考虑**：大量的Text组件可能会影响渲染性能，建议使用List组件进行列表渲染
5. **HTML实体**：默认情况下Text不会解析HTML标签，如果需要解析可以设置`decode`属性为true

## 最佳实践

1. **使用Text包裹所有文本**：Lynx中所有文本内容都应使用Text组件
2. **合理使用numberOfLines**：需要限制行数时使用，配合ellipsis显示省略号
3. **样式集中管理**：将文本样式放入CSS类中，保持模板简洁
4. **避免过长文本直接显示**：对用户输入的过长文本进行截断处理
5. **使用computed处理复杂文本逻辑**：将文本拼接、格式化等逻辑放在computed中
