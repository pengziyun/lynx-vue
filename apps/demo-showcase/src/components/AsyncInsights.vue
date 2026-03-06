<script setup lang="ts">
await new Promise((resolve) => setTimeout(resolve, 20));

const highlights = [
  'Rspeedy native builds remain the source of truth for Explorer.',
  'Web preview adds hydration-safe event bridges for tap and confirm.',
  'The demo intentionally mixes Composition API, Options API, and template-driven UI.',
];
</script>

<template>
  <view class="async-card">
    <text class="async-title">Async Insights</text>
    <view v-for="item in highlights" :key="item" class="async-row">
      <text>{{ item }}</text>
    </view>
  </view>
</template>

<style scoped>
.async-card {
  background: #11212d;
  color: #fff;
  border-radius: 24px;
  padding: 20px;
}

.async-title {
  display: block;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
}

.async-row {
  margin-bottom: 10px;
}
</style>
