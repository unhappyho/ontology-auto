<template>
  <div class="list-view">
    <SideMenu />
    <main class="list-content-area">
      <WorkspaceInfo :config="workspaceConfig" />
      <TaskList :tasks="tasks" :total="12" :page-size="9" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SideMenu from '@/components/task/SideMenu.vue'
import WorkspaceInfo from '@/components/task/WorkspaceInfo.vue'
import TaskList from '@/components/task/TaskList.vue'
import { useTaskStore } from '@/stores'

const taskStore = useTaskStore()

const tasks = computed(() => taskStore.tasks)
const workspaceConfig = computed(() => taskStore.workspaceConfig)
</script>

<style scoped>
.list-view {
  display: flex;
  width: 100%;
  height: 100%;
}

.list-content-area {
  flex: 1;
  padding: 16px 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}
</style>
