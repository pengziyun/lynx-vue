<script setup lang="ts">
import { ref } from 'vue'
import { View, Text, List, ScrollView } from 'vue-lynx'

// 生成1000条数据用于演示虚拟滚动
const items = ref(
  Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
  }))
)
</script>

<template>
  <Page>
    <View class="container">
      <Text class="title">列表示例</Text>

      <!-- 虚拟滚动列表 -->
      <List :data="items" :item-height="50">
        <template #item="{ item }">
          <View class="list-item">
            <Text>{{ item.name }}</Text>
          </View>
        </template>
      </List>
    </View>
  </Page>
</template>

<style scoped>
.container {
  padding: 20px;
  height: 100vh;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.list-item {
  padding: 15px;
  border-bottom: 1px solid #eee;
}
</style>
