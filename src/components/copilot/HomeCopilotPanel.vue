<template>
  <div class="home-copilot-panel" :class="{ visible: true }">
    <!-- 头部 -->
    <div class="hcp-header">
      <div class="hcp-title">
        <div class="hcp-avatar">
          <RobotOutlined />
        </div>
        <div class="hcp-title-text">
          <span class="hcp-name">AI 副驾</span>
          <span class="hcp-desc">本体智能构建助手</span>
        </div>
      </div>
      <a-button type="text" size="small" class="hcp-close" @click="handleClose">
        <CloseOutlined />
      </a-button>
    </div>

    <!-- 消息区 -->
    <div class="hcp-messages" ref="messagesRef">
      <!-- 欢迎态 -->
      <div v-if="localMessages.length === 0" class="hcp-welcome">
        <div class="welcome-avatar">
          <RobotOutlined />
        </div>
        <div class="welcome-title">你好，我是 AI 副驾</div>
        <div class="welcome-sub">可以帮你快速创建本体构建任务，识别实体、构建关联、配置规则</div>
        <div class="quick-questions">
          <div class="quick-label">
            <BulbOutlined />
            快速开始
          </div>
          <div
            v-for="q in quickQuestions"
            :key="q"
            class="quick-chip"
            @click="handleQuickQuestion(q)"
          >
            {{ q }}
          </div>
        </div>
      </div>

      <!-- 对话消息列表 -->
      <div
        v-for="msg in localMessages"
        :key="msg.id"
        :class="['hcp-msg-item', msg.role]"
      >
        <template v-if="msg.type === 'thinking'">
          <div class="hcp-msg-avatar"><RobotOutlined /></div>
          <div class="hcp-bubble thinking">
            <span class="dot"></span><span class="dot"></span><span class="dot"></span>
          </div>
        </template>
        <template v-else>
          <div v-if="msg.role === 'assistant'" class="hcp-msg-avatar"><RobotOutlined /></div>
          <div class="hcp-bubble">{{ msg.content }}</div>
          <div v-if="msg.role === 'user'" class="hcp-msg-avatar user"><UserOutlined /></div>
        </template>
      </div>
    </div>

    <!-- 输入区 -->
    <div class="hcp-input">
      <a-input
        v-model:value="inputText"
        placeholder="描述你的需求，例如：帮我构建 CRM 本体..."
        :disabled="isProcessing"
        @pressEnter="handleSend"
      >
        <template #suffix>
          <a-button
            type="text"
            size="small"
            :disabled="isProcessing || !inputText.trim()"
            @click="handleSend"
          >
            <SendOutlined />
          </a-button>
        </template>
      </a-input>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  RobotOutlined,
  UserOutlined,
  CloseOutlined,
  SendOutlined,
  BulbOutlined
} from '@ant-design/icons-vue'
import { useCopilotStore } from '@/stores'

interface LocalMessage {
  id: string
  role: 'user' | 'assistant'
  type: 'text' | 'thinking'
  content: string
}

const router = useRouter()
const copilotStore = useCopilotStore()

const messagesRef = ref<HTMLElement>()
const inputText = ref('')
const isProcessing = ref(false)
const localMessages = ref<LocalMessage[]>([])

let msgCounter = 0
function genId() { return `home-${Date.now()}-${++msgCounter}` }

const quickQuestions = [
  '帮我构建 CRM 业务域的实体',
  '基于 t_user_main 表创建实体',
  '帮我创建用户与订单的关联关系',
  '根据附件内容识别实体',
  '创建一个本体自动构建任务'
]

// 关键词匹配：是否应跳转到任务创建流程
const TASK_KEYWORDS = ['创建', '构建', '本体', '任务', '识别', '实体', '关联', '提取', '分析', '采集']
function isTaskIntent(text: string): boolean {
  return TASK_KEYWORDS.some(kw => text.includes(kw))
}

async function scrollToBottom() {
  await nextTick()
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  }
}

watch(() => localMessages.value.length, scrollToBottom)

function handleClose() {
  copilotStore.closePanel()
}

function handleQuickQuestion(q: string) {
  inputText.value = q
  handleSend()
}

function handleSend() {
  const text = inputText.value.trim()
  if (!text || isProcessing.value) return
  inputText.value = ''
  isProcessing.value = true

  // 添加用户消息
  localMessages.value.push({ id: genId(), role: 'user', type: 'text', content: text })

  // 添加 thinking
  const thinkingId = genId()
  localMessages.value.push({ id: thinkingId, role: 'assistant', type: 'thinking', content: '' })

  setTimeout(() => {
    // 移除 thinking
    const idx = localMessages.value.findIndex(m => m.id === thinkingId)
    if (idx !== -1) localMessages.value.splice(idx, 1)

    if (isTaskIntent(text)) {
      // 任务意图：回复 + 跳转
      localMessages.value.push({
        id: genId(),
        role: 'assistant',
        type: 'text',
        content: '好的，为你创建本体构建任务，正在自动配置数据源，AI 将帮你完成数据采集范围推荐...'
      })
      isProcessing.value = false

      // 短暂延迟后跳转，让用户看到回复
      setTimeout(() => {
        copilotStore.clearStepContext()
        router.push('/task').then(() => {
          setTimeout(() => {
            copilotStore.triggerAIAnalysis(1)
          }, 300)
        })
      }, 1000)
    } else {
      localMessages.value.push({
        id: genId(),
        role: 'assistant',
        type: 'text',
        content: '我可以帮你构建知识本体，包括数据采集、实体识别、关联构建和规则配置。你可以直接告诉我具体的业务场景或数据表，我来为你自动推荐最合适的方案。'
      })
      isProcessing.value = false
    }
  }, 1200)
}
</script>

<style scoped>
.home-copilot-panel {
  position: fixed;
  right: 16px;
  bottom: 84px;
  width: 360px;
  height: 520px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.18), 0 2px 12px rgba(114, 46, 209, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 9998;
  animation: panel-enter 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes panel-enter {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ---- Header ---- */
.hcp-header {
  padding: 14px 16px 12px;
  background: linear-gradient(135deg, #722ed1 0%, #531dab 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.hcp-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.hcp-avatar {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  flex-shrink: 0;
}

.hcp-title-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.hcp-name {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.hcp-desc {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.75);
}

.hcp-close {
  color: rgba(255, 255, 255, 0.8);
  border-color: transparent !important;
}

.hcp-close:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.15) !important;
}

/* ---- Messages ---- */
.hcp-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #f8f5ff;
  min-height: 0;
}

/* 欢迎态 */
.hcp-welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 8px 4px;
}

.welcome-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #722ed1 0%, #531dab 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
  box-shadow: 0 4px 16px rgba(114, 46, 209, 0.3);
}

.welcome-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f1f1f;
}

.welcome-sub {
  font-size: 12px;
  color: #8c8c8c;
  text-align: center;
  line-height: 1.6;
}

.quick-questions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-top: 4px;
}

.quick-label {
  font-size: 12px;
  color: #8c8c8c;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 2px;
}

.quick-chip {
  padding: 8px 12px;
  background: #fff;
  border: 1px solid #e8d5ff;
  border-radius: 8px;
  font-size: 12px;
  color: #722ed1;
  cursor: pointer;
  transition: all 0.18s;
  line-height: 1.4;
}

.quick-chip:hover {
  background: #f0e6ff;
  border-color: #b37feb;
  transform: translateX(2px);
}

/* 消息气泡 */
.hcp-msg-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.hcp-msg-item.user {
  flex-direction: row-reverse;
}

.hcp-msg-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #722ed1 0%, #531dab 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  flex-shrink: 0;
}

.hcp-msg-avatar.user {
  background: #e6f4ff;
  color: #1677ff;
}

.hcp-bubble {
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.65;
  white-space: pre-wrap;
  max-width: calc(100% - 44px);
}

.hcp-msg-item.assistant .hcp-bubble {
  background: #fff;
  color: #1f1f1f;
  border: 1px solid #e8e8e8;
  border-left: 3px solid #722ed1;
  border-radius: 0 10px 10px 10px;
}

.hcp-msg-item.user .hcp-bubble {
  background: #f0e6ff;
  color: #1f1f1f;
  border-radius: 10px 0 10px 10px;
}

.hcp-bubble.thinking {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-left: 3px solid #722ed1;
  border-radius: 0 10px 10px 10px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #bfbfbf;
  animation: bounce 1.2s infinite;
}

.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-5px); }
}

/* ---- Input ---- */
.hcp-input {
  padding: 10px 14px 12px;
  border-top: 1px solid #e8e8e8;
  background: #fff;
  flex-shrink: 0;
}

.hcp-input :deep(.ant-input) {
  border-radius: 8px;
  font-size: 13px;
}
</style>
