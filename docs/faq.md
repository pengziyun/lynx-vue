# 常见问题

本文档收集了使用Vue Lynx时常见的问题和解答。

## 基础问题

### Vue Lynx是什么？

Vue Lynx是一个为字节跳动Lynx跨端框架提供Vue 3支持的库。它允许开发者使用Vue 3的Composition API来开发Lynx应用，享受与开发Vue Web应用几乎相同的开发体验，同时能够编译为高性能的原生移动应用。

### 与ReactLynx的区别？

Vue Lynx和ReactLynx都是Lynx框架的前端绑定层，主要区别在于使用的编程范式：

| 特性 | Vue Lynx | ReactLynx |
|------|----------|-----------|
| 框架基础 | Vue 3 Composition API | React Hooks |
| 语法风格 | 模板语法 | JSX |
| 状态管理 | ref/reactive | useState |
| 计算属性 | computed | useMemo |
| 生命周期 | onMounted等 | useEffect |

两者底层都基于Lynx引擎，性能相当。选择哪个框架取决于团队的熟悉度和偏好。

### 支持哪些Vue特性？

Vue Lynx支持Vue 3的大部分核心特性：

**完全支持**
- Composition API
- 响应式系统（ref、reactive、computed等）
- 模板语法
- v-model双向绑定
- v-if/v-show条件渲染
- v-for列表渲染
- 插槽系统
- 自定义指令
- 过滤器

**部分支持**
- Teleport（Lynx不支持）
- Suspense（计划支持）

**不支持**
- Transition/TransitionGroup（Lynx不支持原生CSS动画）
- keep-alive（Lynx有自己的缓存机制）

### 需要安装哪些依赖？

Vue Lynx的最小依赖：

```json
{
  "vue": "^3.4.0",
  "@pgg/vue-lynx": "latest"
}
```

开发环境还需要：
```json
{
  "typescript": "^5.0.0",
  "vite": "^5.0.0"
}
```

## 开发问题

### 如何调试Vue Lynx应用？

1. **使用Lynx DevTools**
   - 启动Lynx应用
   - 打开DevTools面板
   - 查看组件树结构
   - 检查组件属性和状态
   - 监控性能指标

2. **日志输出**
   ```typescript
   console.log('调试信息')
   ```

3. **Vue开发者工具**
   - 安装Vue DevTools扩展
   - 可以查看组件树、props、响应式数据等

### 如何处理双线程通信？

Vue Lynx会自动处理线程间的通信，开发者无需关心底层细节。但你可以通过以下方式优化：

```typescript
// 响应式数据会自动同步
const data = ref({})

// 大型数据考虑使用shallowRef
import { shallowRef, triggerRef } from 'vue'

const largeData = shallowRef({ items: [] })

// 修改后需要手动触发
largeData.value.items.push(newItem)
triggerRef(largeData)
```

### 组件样式不生效？

确保以下几点：

1. **样式作用域**
   ```vue
   <style scoped>
   .container { }
   </style>
   ```

2. **正确导入组件**
   ```typescript
   import { View, Text } from '@pgg/vue-lynx'
   ```

3. **Lynx支持的CSS属性**
   Lynx只支持部分CSS属性，不支持的属性会被忽略。详情请参考Lynx官方文档。

### 如何处理用户交互事件？

Vue Lynx使用标准的事件绑定语法：

```vue
<template>
  <View @click="handleClick">
    <Text>点击</Text>
  </View>
</template>

<script setup>
function handleClick(e) {
  console.log('点击事件', e)
}
</script>
```

事件会自动映射到Lynx原生事件：
- `@click` → `bind:tap`
- `@longpress` → `bind:longpress`
- `@touchstart` → `bind:touchstart`

### 列表渲染性能问题？

对于大量数据的列表渲染，强烈建议使用List组件：

```vue
<template>
  <List :data-source="items" keyName="id">
    <template #renderItem="{ item }">
      <View>{{ item.title }}</View>
    </template>
  </List>
</template>
```

不要使用v-for直接渲染大量数据，这样会导致严重的性能问题。

## 性能问题

### 性能优化建议

1. **使用List组件渲染列表**
   List组件使用虚拟滚动，只渲染可见区域的列表项。

2. **减少不必要的响应式**
   ```typescript
   // 不需要响应式的用普通变量
   const CONFIG = { apiUrl: '...' }
   
   // 需要响应式的用ref
   const count = ref(0)
   ```

3. **使用shallowRef处理大型对象**
   ```typescript
   import { shallowRef, triggerRef } from 'vue'
   
   const largeData = shallowRef({})
   ```

4. **合理使用computed**
   ```typescript
   const doubled = computed(() => count.value * 2)
   ```

5. **避免频繁更新父组件**
   使用v-memo减少不必要的重渲染：
   ```vue
   <View v-memo="[item.selected]">
     <Text>{{ item.content }}</Text>
   </View>
   ```

6. **使用Fragment减少嵌套**
   ```vue
   <template #default>
     <Text>A</Text>
     <Text>B</Text>
   </template>
   ```

### 内存占用高？

1. **及时清理定时器和事件监听**
   ```typescript
   onUnmounted(() => {
     clearInterval(timer)
     removeEventListener('resize', handler)
   })
   ```

2. **使用v-if销毁不需要的组件**
   ```vue
   <HeavyComponent v-if="show" />
   ```

3. **分页加载大量数据**
   不要一次性加载所有数据，使用分页加载。

## 部署问题

### 如何构建生产版本？

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建生产版本
pnpm build
```

### 构建产物是什么？

Vue Lynx构建后会生成Lynx应用所需的资源文件，包括：
- `.js` 文件：编译后的JavaScript代码
- `.json` 文件：页面配置和路由信息
- `.bin` 文件：编译后的模板（可选）

## 贡献问题

### 如何贡献代码？

欢迎为Vue Lynx贡献代码：

1. Fork项目仓库
2. 创建功能分支：`git checkout -b feature/your-feature`
3. 进行开发并提交更改
4. 提交Pull Request
5. 等待代码审查

### 报告Bug

报告Bug时请包含：
- 复现步骤
- 期望行为
- 实际行为
- 环境信息（Node版本、系统等）
- 相关代码片段

### 需要帮助怎么办？

- 查看文档
- 搜索已有Issue
- 创建新的Issue寻求帮助
- 参与社区讨论
