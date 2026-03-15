<template>
  <div class="app-container">
    <!-- 顶栏 -->
    <AppHeader />

    <!-- 主内容区 -->
    <div class="main-content">
      <router-view />
    </div>

    <!-- AI 副驾悬浮球 -->
    <FloatingBall />

    <!-- 首页 AI 副驾浮层（非任务页面时渲染） -->
    <HomeCopilotPanel v-if="copilotStore.visible && !isTaskPage" />
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import FloatingBall from '@/components/copilot/FloatingBall.vue'
import HomeCopilotPanel from '@/components/copilot/HomeCopilotPanel.vue'
import { useCopilotStore } from '@/stores'

const route = useRoute()
const copilotStore = useCopilotStore()

const isTaskPage = computed(() => route.path === '/task' || route.path.startsWith('/task/'))

// 监听路由变化，离开任务页面时清除上下文
watch(
  () => route.path,
  (newPath) => {
    if (newPath !== '/task') {
      copilotStore.clearStepContext()
    }
  }
)
</script>

<style scoped>
.app-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  overflow: hidden;
  display: flex;
}
</style>
