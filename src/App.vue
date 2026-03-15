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
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import FloatingBall from '@/components/copilot/FloatingBall.vue'
import { useTaskStore, useCopilotStore } from '@/stores'

const route = useRoute()
const taskStore = useTaskStore()
const copilotStore = useCopilotStore()

// 监听任务步骤变化，同步到副驾Store
watch(
  () => taskStore.currentStepId,
  (newStep) => {
    if (newStep > 0) {
      // 在任务配置页面时，设置步骤上下文
      if (route.path === '/task') {
        copilotStore.setStepContext(newStep)
      }
    } else {
      copilotStore.clearStepContext()
    }
  }
)

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
