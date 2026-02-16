<script setup lang="ts">
import { ref } from 'vue'
import { View, Text, Image } from '@pgg/vue-lynx'

// 计数器状态
const count = ref(0)

// 增加计数
function increment() {
  count.value++
}
</script>

<template>
  <Page>
    <View class="container">
      <Text class="title">Vue Lynx 基础示例</Text>

      <!-- 计数器演示 -->
      <View class="section">
        <Text>计数器: {{ count }}</Text>
        <View class="button" @click="increment">
          <Text>点击 +1</Text>
        </View>
      </View>

      <!-- 图片演示 -->
      <View class="section">
        <Image
          src="https://vuejs.org/logo.svg"
          style="width: 100px; height: 100px;"
        />
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

.section {
  margin-bottom: 20px;
}

.button {
  padding: 10px 20px;
  background-color: #42b983;
  border-radius: 4px;
  cursor: pointer;
}
</style>
