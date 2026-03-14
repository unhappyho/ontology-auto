<template>
  <div class="editor-topbar">
    <div class="editor-title-area">
      <ArrowLeftOutlined class="back-btn" @click="handleBack" />
      <span class="task-name">{{ taskName }}</span>
      <div class="view-mode-switch">
        <div :class="['mode-btn', 'left', { active: viewMode === 'form' }]" @click="switchMode('form')" title="表格视图">
          <UnorderedListOutlined />
        </div>
        <div class="mode-divider"></div>
        <div :class="['mode-btn', 'right', { active: viewMode === 'canvas' }]" @click="switchMode('canvas')" title="图形化视图">
          <ApartmentOutlined />
        </div>
      </div>
    </div>
    <StepNav />
    <div class="topbar-actions">
      <a-button v-if="viewMode === 'canvas'" size="small" @click="handleClearCanvas">
        <DeleteOutlined />
        清除草稿
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeftOutlined,
  UnorderedListOutlined,
  ApartmentOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import StepNav from './StepNav.vue'
import { useTaskStore, useUIStore, useCanvasStore } from '@/stores'

const router = useRouter()
const taskStore = useTaskStore()
const uiStore = useUIStore()
const canvasStore = useCanvasStore()

const taskName = computed(() => taskStore.taskName)
const viewMode = computed(() => uiStore.viewMode)

function handleBack() {
  router.push('/')
}

function switchMode(mode: 'form' | 'canvas') {
  uiStore.switchViewMode(mode)
}

function handleClearCanvas() {
  canvasStore.clearCanvas()
}
</script>

<style scoped>
.editor-topbar {
  height: 56px;
  background: var(--bg-white);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 10;
  flex-shrink: 0;
}

.editor-title-area {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 15px;
  font-weight: 600;
}

.back-btn {
  cursor: pointer;
  color: var(--text-secondary);
  transition: color 0.2s;
  font-size: 17px;
}

.back-btn:hover {
  color: var(--primary-color);
}

.task-name {
  font-weight: 600;
}

.view-mode-switch {
  display: flex;
  background: #F2F3F5;
  border-radius: 6px;
  padding: 2px;
  margin-left: 20px;
}

.mode-btn {
  padding: 5px 12px;
  font-size: 13px;
  color: var(--text-regular);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mode-btn.left {
  border-radius: 4px 0 0 4px;
}

.mode-btn.right {
  border-radius: 0 4px 4px 0;
}

.mode-btn.active {
  background: var(--bg-white);
  color: var(--primary-color);
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.mode-divider {
  width: 1px;
  background: var(--border-color);
  margin: 0 2px;
}

.topbar-actions {
  display: flex;
  gap: 10px;
}
</style>
