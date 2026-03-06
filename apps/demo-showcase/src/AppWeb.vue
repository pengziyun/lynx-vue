<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { vAutofocus } from './directives/autofocus';
import OptionsSummary from './components/OptionsSummary.vue';
import JsxStory from './components/JsxStory';
import { useShowcaseState } from './composables/useShowcaseState';

const AsyncInsights = defineAsyncComponent(() => import('./components/AsyncInsights.vue'));
const {
  query,
  onlyActive,
  showOverlay,
  filteredTasks,
  stats,
  toggleOnlyActive,
  toggleOverlay,
} = useShowcaseState();
</script>

<template>
  <page class="web-page">
    <view class="layout">
      <view class="hero">
        <text class="eyebrow">VueLynx Web Preview + SSR</text>
        <text class="headline">One demo combining template syntax, Options API, JSX, Suspense, directives, and Teleport.</text>
      </view>

      <view class="toolbar">
        <input
          v-model="query"
          v-autofocus
          class="search-input"
          placeholder="Search roadmap"
        />
        <view class="toolbar-actions">
          <button class="action-button" @click="toggleOnlyActive">
            {{ onlyActive ? 'Show all' : 'Only active' }}
          </button>
          <button class="action-button action-button--dark" @click="toggleOverlay">
            {{ showOverlay ? 'Close overlay' : 'Open overlay' }}
          </button>
        </view>
      </view>

      <view class="content-grid">
        <OptionsSummary
          :total="stats.total"
          :active="stats.active"
          :done="stats.done"
          :points="stats.points"
        />

        <Suspense>
          <template #default>
            <AsyncInsights />
          </template>
          <template #fallback>
            <view class="fallback-card">
              <text>Loading async insights…</text>
            </view>
          </template>
        </Suspense>
      </view>

      <JsxStory :items="filteredTasks" />

      <view class="list-shell">
        <view v-for="task in filteredTasks" :key="task.id" class="task-card">
          <text class="task-title">{{ task.title }}</text>
          <text class="task-meta">{{ task.owner }} · {{ task.status }} · {{ task.points }} pts</text>
        </view>
      </view>

      <Teleport to="#overlay">
        <Transition name="overlay-fade">
          <view v-if="showOverlay" class="overlay-backdrop" @tap="toggleOverlay">
            <view class="overlay-card" @tap.stop>
              <text class="overlay-title">Teleport + Transition</text>
              <text class="overlay-copy">
                This panel is mounted into the shared overlay root. It proves the web preview and SSR client both understand the Lynx-flavored app shell.
              </text>
            </view>
          </view>
        </Transition>
      </Teleport>
    </view>
  </page>
</template>

<style scoped>
.web-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f7f1e6 0%, #efe6d4 100%);
  color: #1f2937;
}

.layout {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 20px 80px;
}

.hero {
  margin-bottom: 24px;
}

.eyebrow {
  display: block;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: #9a3412;
  font-weight: 700;
  margin-bottom: 8px;
}

.headline {
  display: block;
  font-size: 36px;
  line-height: 1.2;
  font-weight: 800;
  max-width: 820px;
}

.toolbar {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(16px);
  border: 1px solid #d7d4ce;
  border-radius: 28px;
  padding: 18px;
  margin-bottom: 24px;
}

.search-input {
  width: 100%;
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid #cbd5e1;
  margin-bottom: 12px;
}

.toolbar-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-button {
  border: 0;
  border-radius: 999px;
  padding: 12px 16px;
  background: #fff;
  color: #1f2937;
}

.action-button--dark {
  background: #0f172a;
  color: #fff;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.fallback-card,
.jsx-card,
.task-card {
  background: #fff;
  border-radius: 24px;
  padding: 20px;
  border: 1px solid #d7d4ce;
}

.jsx-card {
  margin-bottom: 20px;
}

.jsx-title,
.task-title {
  display: block;
  font-weight: 700;
  margin-bottom: 6px;
}

.jsx-row + .jsx-row,
.task-card + .task-card {
  margin-top: 10px;
}

.task-meta {
  color: #6b7280;
}

.overlay-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.overlay-card {
  width: min(520px, 100%);
  background: #fff;
  border-radius: 28px;
  padding: 24px;
}

.overlay-title {
  display: block;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 10px;
}

.overlay-copy {
  color: #475569;
}

.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.2s ease;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}
</style>
