# Input

Input是Vue Lynx中用于处理用户文本输入的组件，类似于HTML中的input元素。Input组件支持多种输入类型和丰富的配置选项。

## 基本介绍

Input组件用于接收用户的文本输入，是构建表单和应用交互的基础组件。它支持单行文本输入、密码输入、数字输入等多种类型。

## 基础用法

```vue
<template>
  <View>
    <Input placeholder="请输入内容" />
  </View>
</template>
```

## Props

Input组件支持以下属性：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| value | string | - | 输入框的值 |
| type | string | 'text' | 输入类型：'text'（文本）、'password'（密码）、'number'（数字）、'idcard'（身份证）、'digit'（带小数点的数字） |
| password | boolean | false | 是否为密码输入框 |
| placeholder | string | - | 占位符文字 |
| placeholderStyle | string | - | 占位符样式 |
| placeholderClass | string | - | 占位符类名 |
| disabled | boolean | false | 是否禁用 |
| maxlength | number | 140 | 最大输入字符数 |
| cursor | number | - | 光标位置 |
| cursorSpacing | number | 140 | 光标与键盘的距离 |
| focus | boolean | false | 获取焦点 |
| confirmType | string | 'done' | 键盘右下角按钮文字：'send'（发送）、'search'（搜索）、'next'（下一个）、'go'（前往）、'done'（完成） |
| confirmHold | boolean | false | 点击键盘右下角按钮时是否保持键盘不收起 |
| cursorColor | string | - | 光标颜色 |
| selectionStart | number | - | 光标起始位置 |
| selectionEnd | number | - | 光标结束位置 |
| adjustPosition | boolean | true | 键盘弹起时是否自动上推页面 |
| holdKeyboard | boolean | false | 聚焦时是否保持键盘收起 |

## Events

Input组件支持以下事件：

| 事件名 | 参数类型 | 说明 |
|--------|----------|------|
| input | Event | 输入事件，当输入内容变化时触发 |
| focus | FocusEvent | 获得焦点时触发 |
| blur | FocusEvent | 失去焦点时触发 |
| confirm | Event | 点击完成按钮时触发 |
| change | Event | 内容变化结束且失去焦点时触发 |
| keyboardheightchange | Event | 键盘高度变化时触发 |

## 示例

### 基础文本输入

```vue
<script setup lang="ts">
import { ref } from 'vue'

const inputValue = ref('')

function handleInput(e: any) {
  console.log('输入内容:', e.detail.value)
}
</script>

<template>
  <View>
    <Input 
      :value="inputValue" 
      @input="handleInput" 
      placeholder="请输入用户名" 
    />
  </View>
</template>
```

### 使用v-model

```vue
<script setup lang="ts">
import { ref } from 'vue'

const username = ref('')
</script>

<template>
  <View>
    <Input v-model="username" placeholder="请输入用户名" />
    <Text>输入的内容: {{ username }}</Text>
  </View>
</template>
```

### 密码输入

```vue
<script setup lang="ts">
import { ref } from 'vue'

const password = ref('')
</script>

<template>
  <View>
    <Input 
      v-model="password" 
      type="password" 
      placeholder="请输入密码" 
    />
  </View>
</template>
```

### 数字输入

```vue
<script setup lang="ts">
import { ref } from 'vue'

const phone = ref('')
const price = ref('')
</script>

<template>
  <View>
    <Input 
      v-model="phone" 
      type="number" 
      placeholder="请输入手机号" 
      :maxlength="11"
    />
    <Input 
      v-model="price" 
      type="digit" 
      placeholder="请输入价格" 
    />
  </View>
</template>
```

### 禁用状态

```vue
<template>
  <View>
    <Input value="禁用的输入框" disabled />
  </View>
</template>
```

### 自定义占位符样式

```vue
<script setup lang="ts">
import { ref } from 'vue'

const searchText = ref('')
</script>

<template>
  <Input 
    v-model="searchText" 
    placeholder="搜索内容" 
    placeholder-class="custom-placeholder"
  />
</template>

<style>
.custom-placeholder {
  color: #999;
  font-size: 14px;
}
</style>
```

### 限制输入长度

```vue
<script setup lang="ts">
import { ref } from 'vue'

const bio = ref('')
</script>

<template>
  <View>
    <Input 
      v-model="bio" 
      :maxlength="100" 
      placeholder="请输入个人简介（最多100字）" 
    />
    <Text>{{ bio.length }} / 100</Text>
  </View>
</template>
```

### 获取焦点控制

```vue
<script setup lang="ts">
import { ref } from 'vue'

const isFocus = ref(false)
const inputValue = ref('')

function focusInput() {
  isFocus.value = true
}

function blurInput() {
  isFocus.value = false
}
</script>

<template>
  <View>
    <Input 
      v-model="inputValue" 
      :focus="isFocus" 
      placeholder="点击按钮获取焦点" 
    />
    <View @click="focusInput">
      <Text>获取焦点</Text>
    </View>
    <View @click="blurInput">
      <Text>失去焦点</Text>
    </View>
  </View>
</template>
```

### 确认按钮

```vue
<script setup lang="ts">
import { ref } from 'vue'

const searchText = ref('')

function handleSearch() {
  console.log('搜索:', searchText.value)
}
</script>

<template>
  <View>
    <Input 
      v-model="searchText" 
      confirmType="search" 
      @confirm="handleSearch"
      placeholder="输入搜索内容" 
    />
  </View>
</template>
```

### 监听焦点事件

```vue
<script setup lang="ts">
import { ref } from 'vue'

const isFocused = ref(false)
const inputValue = ref('')

function handleFocus(e: any) {
  isFocused.value = true
  console.log('获得焦点')
}

function handleBlur(e: any) {
  isFocused.value = false
  console.log('失去焦点')
}
</script>

<template>
  <View>
    <Input 
      v-model="inputValue" 
      @focus="handleFocus" 
      @blur="handleBlur" 
      placeholder="焦点状态变化" 
    />
    <Text>焦点状态: {{ isFocused ? '已聚焦' : '未聚焦' }}</Text>
  </View>
</template>
```

### 输入内容变化

```vue
<script setup lang="ts">
import { ref } from 'vue'

const inputValue = ref('')

function handleInput(e: any) {
  // 实时处理输入内容
  console.log('当前输入:', e.detail.value)
}

function handleChange(e: any) {
  // 输入结束后触发
  console.log('输入完成:', e.detail.value)
}
</script>

<template>
  <View>
    <Input 
      v-model="inputValue" 
      @input="handleInput" 
      @change="handleChange" 
      placeholder="输入内容" 
    />
  </View>
</template>
```

### 登录表单示例

```vue
<script setup lang="ts">
import { ref } from 'vue'

const form = ref({
  phone: '',
  code: '',
  password: '',
})

function handleLogin() {
  console.log('登录参数:', form.value)
}

function sendCode() {
  console.log('发送验证码')
}
</script>

<template>
  <View class="login-form">
    <View class="form-item">
      <Input 
        v-model="form.phone" 
        type="number" 
        :maxlength="11" 
        placeholder="请输入手机号" 
      />
    </View>
    
    <View class="form-item">
      <Input 
        v-model="form.code" 
        type="number" 
        :maxlength="6" 
        placeholder="请输入验证码" 
      />
      <View @click="sendCode" class="send-btn">
        <Text>发送验证码</Text>
      </View>
    </View>
    
    <View class="form-item">
      <Input 
        v-model="form.password" 
        type="password" 
        placeholder="请输入密码" 
      />
    </View>
    
    <View class="submit-btn" @click="handleLogin">
      <Text>登录</Text>
    </View>
  </View>
</template>

<style>
.login-form {
  padding: 20px;
}

.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  border-bottom: 1px solid #eee;
  padding-bottom: 12px;
}

.send-btn {
  padding: 8px 16px;
  background-color: #42b983;
  border-radius: 4px;
}

.submit-btn {
  margin-top: 24px;
  padding: 14px;
  background-color: #42b983;
  border-radius: 8px;
  text-align: center;
}
</style>
```

## 注意事项

1. **Input必须包裹在View中**：Input组件不能直接作为根元素
2. **v-model语法**：Vue Lynx的Input支持v-model，但事件名是input而不是update:modelValue
3. **键盘类型**：type属性会影响弹出键盘的类型，但这不是绝对的，系统可能会根据内容自动调整
4. **输入限制**：maxlength可以限制输入字符数，但某些系统可能不完全支持
5. **密码框**：type="password"和password属性效果相同，只需设置一个
6. **confirmType**：键盘右下角按钮的文字，不同平台显示效果可能有所不同

## 最佳实践

1. **使用v-model简化绑定**：推荐使用v-model处理输入值，减少手动事件处理
2. **设置合适的maxlength**：根据业务需求设置最大输入长度，避免用户输入过多内容
3. **提供清晰的placeholder**：帮助用户理解应该输入什么内容
4. **处理confirm事件**：在用户点击键盘完成按钮时自动提交表单
5. **适当使用disabled**：禁用状态下应给用户明确的视觉反馈
6. **考虑无障碍**：为Input添加关联的Label或placeholder说明
