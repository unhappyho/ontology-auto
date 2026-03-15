<template>
  <Teleport to="body">
    <div
      class="floating-ball"
      :class="{ dragging }"
      :style="ballStyle"
      @mousedown="startDrag"
      @click="handleClick"
    >
      <!-- 悬浮球主体 -->
      <div class="ball-main">
        <div class="ball-icon">
          <RobotOutlined />
        </div>
        <div class="ball-pulse" v-if="hasNewNotification"></div>
      </div>

      <!-- 提示文字 -->
      <div class="ball-tooltip" v-if="!dragging">
        <span>AI 助手</span>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RobotOutlined } from '@ant-design/icons-vue'
import { useCopilotStore } from '@/stores'

const copilotStore = useCopilotStore()

// 悬浮球位置
const position = ref({ x: 20, y: 20 })
const dragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })

// 是否有新通知
const hasNewNotification = computed(() => copilotStore.hasNewSuggestions)

// 计算悬浮球样式
const ballStyle = computed(() => ({
  right: `${position.value.x}px`,
  bottom: `${position.value.y}px`
}))

// 点击悬浮球 - 切换面板显示
function handleClick() {
  if (dragging.value) return

  if (copilotStore.visible) {
    copilotStore.minimizePanel()
  } else {
    copilotStore.openPanel()
  }
}

// 开始拖拽
function startDrag(e: MouseEvent) {
  if (e.button !== 0) return

  dragging.value = true
  const ball = (e.target as HTMLElement).closest('.floating-ball')
  if (ball) {
    const rect = ball.getBoundingClientRect()
    dragOffset.value = {
      x: e.clientX - rect.right,
      y: e.clientY - rect.bottom
    }
  }

  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

// 拖拽中
function onDrag(e: MouseEvent) {
  if (!dragging.value) return

  const newX = window.innerWidth - e.clientX - dragOffset.value.x
  const newY = window.innerHeight - e.clientY - dragOffset.value.y

  position.value = {
    x: Math.max(0, Math.min(newX, window.innerWidth - 60)),
    y: Math.max(0, Math.min(newY, window.innerHeight - 60))
  }
}

// 停止拖拽
function stopDrag() {
  dragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

onMounted(() => {
  position.value = { x: 20, y: 20 }
})
</script>

<style scoped>
.floating-ball {
  position: fixed;
  z-index: 9999;
  cursor: pointer;
  user-select: none;
  transition: transform 0.1s;
}

.floating-ball:hover {
  transform: scale(1.05);
}

.floating-ball.dragging {
  cursor: grabbing;
  transform: scale(1.1);
}

.ball-main {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
  position: relative;
}

.ball-icon {
  font-size: 24px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ball-icon :deep(.anticon) {
  font-size: 26px;
}

/* 脉冲动画 */
.ball-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(102, 126, 234, 0.4);
  animation: pulse 2s ease-out infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

/* 提示文字 */
.ball-tooltip {
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-right: 12px;
  background: #fff;
  padding: 6px 12px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  font-size: 12px;
  color: #667eea;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s;
}

.ball-tooltip::after {
  content: '';
  position: absolute;
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  border: 6px solid transparent;
  border-left-color: #fff;
}

.floating-ball:hover .ball-tooltip {
  opacity: 1;
  visibility: visible;
}
</style>
