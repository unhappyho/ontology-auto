<template>
  <Teleport to="body">
    <div
      v-if="!isTaskPage"
      class="floating-ball"
      :class="{ dragging, 'panel-open': copilotStore.visible }"
      :style="ballStyle"
      @mousedown="startDrag"
      @click="handleClick"
    >
      <!-- 悬浮球主体 -->
      <div class="ball-main">
        <div class="ball-icon">
          <RobotOutlined />
        </div>
        <!-- 新建议角标 -->
        <div v-if="badgeCount > 0 && !copilotStore.visible" class="ball-badge">
          {{ badgeCount > 9 ? '9+' : badgeCount }}
        </div>
      </div>

      <!-- 提示文字 -->
      <div class="ball-tooltip" v-if="!dragging">
        <span>{{ copilotStore.visible ? '关闭助手' : 'AI 副驾' }}</span>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { RobotOutlined } from '@ant-design/icons-vue'
import { useCopilotStore } from '@/stores'

const BALL_SIZE = 56

const route = useRoute()
const copilotStore = useCopilotStore()

// 任务页面通过 Header 按钮控制，悬浮球不显示
const isTaskPage = computed(() => route.path === '/task')

// 悬浮球位置（right/bottom 值）
const position = ref({ x: 20, y: 20 })
const dragging = ref(false)
// 拖拽时鼠标相对于球左上角的偏移
const dragOffset = ref({ x: 0, y: 0 })

// 新建议角标数量（统计消息流中未采纳的卡片）
const badgeCount = computed(() => {
  if (!copilotStore.hasNewSuggestions) return 0
  let count = 0
  for (const msg of copilotStore.messages) {
    if (msg.type === 'card-group' && msg.cards) {
      count += msg.cards.filter(c => !c.accepted && !c.dismissed).length
    }
  }
  return count
})

// 计算悬浮球样式
const ballStyle = computed(() => ({
  right: `${position.value.x}px`,
  bottom: `${position.value.y}px`
}))

// 点击悬浮球 - 切换面板显示
function handleClick() {
  if (dragging.value) return
  copilotStore.togglePanel()
}

// 开始拖拽
function startDrag(e: MouseEvent) {
  if (e.button !== 0) return

  const ball = (e.target as HTMLElement).closest('.floating-ball') as HTMLElement
  if (!ball) return

  const rect = ball.getBoundingClientRect()
  // 记录鼠标相对于球左上角的偏移
  dragOffset.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }

  dragging.value = true
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  e.preventDefault()
}

// 拖拽中 - 根据 right/bottom 定位方式换算
function onDrag(e: MouseEvent) {
  if (!dragging.value) return

  // 球的左上角位置
  const ballLeft = e.clientX - dragOffset.value.x
  const ballTop = e.clientY - dragOffset.value.y

  // 转换为 right/bottom 值
  const newRight = window.innerWidth - ballLeft - BALL_SIZE
  const newBottom = window.innerHeight - ballTop - BALL_SIZE

  position.value = {
    x: Math.max(0, Math.min(newRight, window.innerWidth - BALL_SIZE)),
    y: Math.max(0, Math.min(newBottom, window.innerHeight - BALL_SIZE))
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

onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
})
</script>

<style scoped>
.floating-ball {
  position: fixed;
  z-index: 9999;
  cursor: pointer;
  user-select: none;
  transition: transform 0.15s;
}

.floating-ball:hover:not(.dragging) {
  transform: scale(1.08);
}

.floating-ball.dragging {
  cursor: grabbing;
  transform: scale(1.1);
  transition: none;
}

.ball-main {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #722ed1 0%, #531dab 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(114, 46, 209, 0.45);
  position: relative;
}

.floating-ball.panel-open .ball-main {
  background: linear-gradient(135deg, #531dab 0%, #391085 100%);
  box-shadow: 0 4px 16px rgba(114, 46, 209, 0.6);
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

/* 角标 */
.ball-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  background: #ff4d4f;
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 2px solid #fff;
}

/* 提示文字 */
.ball-tooltip {
  position: absolute;
  right: calc(100% + 10px);
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
  pointer-events: none;
}

.ball-tooltip::after {
  content: '';
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  border: 5px solid transparent;
  border-left-color: rgba(0, 0, 0, 0.75);
}

.floating-ball:hover .ball-tooltip {
  opacity: 1;
  visibility: visible;
}
</style>
