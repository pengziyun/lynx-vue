<script setup lang="ts">
import { ref } from 'vue'
import { View, Text } from 'vue-lynx'
import { runOnBackground, runOnMainThread } from 'vue-lynx'

// 任务结果
const result = ref('')

// 运行后台任务
async function runBackgroundTask() {
  result.value = '后台任务执行中...'

  // 在后台线程执行耗时操作
  await runOnBackground(async () => {
    // 模拟耗时计算
    await new Promise(resolve => setTimeout(resolve, 2000))
    return '后台任务完成'
  }).then(res => {
    result.value = res
  })
}
</script>

<template>
  <Page>
    <View class="container">
      <Text class="title">线程交互示例</Text>

      <!-- 触发后台任务 -->
      <View class="button" @click="runBackgroundTask">
        <Text>运行后台任务</Text>
      </View>

      <!-- 显示结果 -->
      <View class="result">
        <Text>{{ result }}</Text>
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

.button {
  padding: 10px 20px;
  background-color: #42b983;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 20px;
}

.result {
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 4px;
}
</style>
