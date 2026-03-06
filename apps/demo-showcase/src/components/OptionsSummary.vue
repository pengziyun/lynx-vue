<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'OptionsSummary',
  props: {
    total: { type: Number, required: true },
    active: { type: Number, required: true },
    done: { type: Number, required: true },
    points: { type: Number, required: true },
  },
  computed: {
    healthLabel(): string {
      if (this.done >= this.active) {
        return 'Stable rollout';
      }
      return 'Needs focus';
    },
  },
});
</script>

<template>
  <view class="summary-card">
    <text class="summary-title">Options API Snapshot</text>
    <text class="summary-line">Total scope: {{ total }}</text>
    <text class="summary-line">Active work: {{ active }}</text>
    <text class="summary-line">Completed: {{ done }}</text>
    <text class="summary-line">Story points: {{ points }}</text>
    <text class="summary-emphasis">{{ healthLabel }}</text>
  </view>
</template>

<style scoped>
.summary-card {
  background: #fff;
  border-radius: 24px;
  padding: 20px;
  border: 1px solid #d7d4ce;
}

.summary-title {
  display: block;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
}

.summary-line {
  display: block;
  color: #4b5563;
  margin-bottom: 4px;
}

.summary-emphasis {
  display: block;
  margin-top: 10px;
  color: #0f766e;
  font-weight: 700;
}
</style>
