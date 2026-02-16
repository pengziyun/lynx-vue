<script setup lang="ts">
import { ref } from 'vue'
import { View, Text, Input, Textarea } from '@pgg/vue-lynx'

// 表单数据
const username = ref('')
const bio = ref('')

// 提交表单
function handleSubmit() {
  console.log('提交表单:', { username: username.value, bio: bio.value })
}
</script>

<template>
  <Page>
    <View class="container">
      <Text class="title">表单示例</Text>

      <!-- 表单区域 -->
      <View class="form">
        <View class="form-item">
          <Text>用户名:</Text>
          <Input v-model="username" placeholder="请输入用户名" />
        </View>

        <View class="form-item">
          <Text>个人简介:</Text>
          <Textarea v-model="bio" placeholder="请输入个人简介" />
        </View>

        <View class="button" @click="handleSubmit">
          <Text>提交</Text>
        </View>
      </View>

      <!-- 显示结果 -->
      <View class="result">
        <Text>用户名: {{ username }}</Text>
        <Text>简介: {{ bio }}</Text>
      </View>
    </View>
  </Page>
</template>

<style scoped>
.container {
  padding: 20px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.form {
  margin-bottom: 20px;
}

.form-item {
  margin-bottom: 15px;
}

.button {
  padding: 10px 20px;
  background-color: #42b983;
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
}

.result {
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 4px;
}
</style>
