<script setup lang="ts">
import { vAutofocus } from './directives/autofocus';
import OptionsSummary from './components/OptionsSummary.vue';
import { useShowcaseState } from './composables/useShowcaseState';

const {
  query,
  onlyActive,
  filteredTasks,
  stats,
  toggleOnlyActive,
} = useShowcaseState();
</script>

<template>
  <page class="native-page">
    <view class="hero">
      <text class="eyebrow">VueLynx Native Demo11</text>
      <text class="headline">SFC template + Options API on the Lynx runtime</text>
    </view>

    <view class="search-card">
      <input
        v-model="query"
        v-autofocus
        class="search-input"
        placeholder="Filter by title or owner"
      />
      <view class="toggle-row" @tap="toggleOnlyActive">
        <text>Only active items</text>
        <text>{{ onlyActive ? 'ON' : 'OFF' }}</text>
      </view>
    </view>

    <OptionsSummary
      :total="stats.total"
      :active="stats.active"
      :done="stats.done"
      :points="stats.points"
    />

    <scroll-view class="task-list">
      <view v-for="task in filteredTasks" :key="task.id" class="task-card">
        <text class="task-title">{{ task.title }}</text>
        <text class="task-meta">{{ task.owner }} · {{ task.status }} · {{ task.points }} pts</text>
      </view>
    </scroll-view>
  </page>
</template>

<style scoped>
.native-page {
  min-height: 100vh;
  background: #f4efe6;
  padding: 24px;
}

.hero {
  margin-bottom: 18px;
}

.eyebrow {
  display: block;
  color: #7c2d12;
  font-weight: 700;
  margin-bottom: 8px;
}

.headline {
  display: block;
  font-size: 28px;
  font-weight: 700;
}

.search-card {
  background: #fff;
  border-radius: 24px;
  padding: 18px;
  margin-bottom: 16px;
  border: 1px solid #ddd6c7;
}

.search-input {
  width: 100%;
  padding: 12px;
  border-radius: 16px;
  border: 1px solid #cbd5e1;
  margin-bottom: 12px;
}

.toggle-row {
  display: flex;
  justify-content: space-between;
}

.task-list {
  margin-top: 16px;
}

.task-card {
  background: #fffdf8;
  padding: 16px;
  border-radius: 20px;
  margin-bottom: 12px;
  border: 1px solid #ddd6c7;
}

.task-title {
  display: block;
  font-weight: 700;
  margin-bottom: 6px;
}

.task-meta {
  color: #6b7280;
}
</style>
