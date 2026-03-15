<template>
  <div class="copilot-panel">
    <!-- 面板头部 -->
    <div class="copilot-header">
      <div class="copilot-title">
        <div class="copilot-avatar">
          <RobotOutlined />
        </div>
        <div class="title-info">
          <span class="title-text">AI 副驾</span>
          <span v-if="currentStepName" class="step-badge">{{ currentStepName }}</span>
        </div>
      </div>
      <a-button type="text" size="small" class="close-btn" @click="handleClose" title="关闭">
        <CloseOutlined />
      </a-button>
    </div>

    <!-- 面板主体：统一会话流 -->
    <div class="messages-area" ref="messagesRef">
      <!-- 空状态提示 -->
      <div v-if="messages.length === 0" class="empty-state">
        <div class="empty-icon">
          <RobotOutlined />
        </div>
        <div class="empty-text">
          {{ currentStepName ? `正在协助「${currentStepName}」步骤` : '有什么可以帮你的？' }}
        </div>
        <div class="empty-hint">你可以直接提问，或点击左侧操作触发 AI 分析</div>
      </div>

      <!-- 消息列表 -->
      <div
        v-for="msg in messages"
        :key="msg.id"
        :class="['message-item', msg.role]"
      >
        <!-- type=thinking：三点跳动 + 深度思考步骤 -->
        <template v-if="msg.type === 'thinking'">
          <div class="msg-avatar"><RobotOutlined /></div>
          <div class="thinking-wrapper">
            <div class="msg-bubble thinking">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="thinking-label">深度思考中</span>
            </div>
            <div v-if="msg.thinkingSteps?.length" class="thinking-steps">
              <div
                v-for="(step, i) in msg.thinkingSteps"
                :key="i"
                class="thinking-step"
                :style="{ animationDelay: `${i * 0.35}s` }"
              >
                <span class="step-dot"></span>{{ step }}
              </div>
            </div>
          </div>
        </template>

        <!-- type=text：文字气泡 -->
        <template v-else-if="msg.type === 'text'">
          <div v-if="msg.role === 'assistant'" class="msg-avatar"><RobotOutlined /></div>
          <div class="msg-bubble">{{ msg.content }}</div>
          <div v-if="msg.role === 'user'" class="msg-avatar user-avatar"><UserOutlined /></div>
        </template>

        <!-- type=card-group：卡片组嵌入会话流 -->
        <template v-else-if="msg.type === 'card-group'">
          <div class="msg-avatar"><RobotOutlined /></div>
          <div class="card-group-wrapper">
            <div class="msg-bubble card-intro">{{ msg.content }}</div>
            <transition-group name="card-fade" tag="div" class="inline-cards">
              <CopilotCard
                v-for="card in msg.cards"
                :key="card.id"
                :card="card"
                @accept="acceptCard(msg.id, card.id)"
                @dismiss="dismissCard(msg.id, card.id)"
                @reidentify="handleReidentify(card)"
              />
            </transition-group>
          </div>
        </template>
      </div>
    </div>

    <!-- 输入区 -->
    <div class="copilot-input">
      <a-input
        v-model:value="inputMessage"
        placeholder="输入消息，回车发送..."
        :disabled="isUserThinking"
        @pressEnter="handleSend"
      >
        <template #suffix>
          <a-button
            type="text"
            size="small"
            :disabled="isUserThinking || !inputMessage.trim()"
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
import { ref, computed, watch, nextTick } from 'vue'
import {
  RobotOutlined,
  UserOutlined,
  SendOutlined,
  CloseOutlined
} from '@ant-design/icons-vue'
import { useCopilotStore } from '@/stores'
import CopilotCard from './CopilotCard.vue'
import type { SuggestionCard } from '@/stores/useCopilotStore'
import { GENERIC_THINKING_STEPS } from '@/stores/useCopilotStore'

const STEP_NAMES: Record<number, string> = {
  1: '数据采集',
  2: '实体提取',
  3: '关联构建',
  4: '规则识别',
  5: '动作识别'
}

const copilotStore = useCopilotStore()
const messagesRef = ref<HTMLElement>()
const inputMessage = ref('')
const isUserThinking = ref(false)

const messages = computed(() => copilotStore.messages)
const currentStepName = computed(() => STEP_NAMES[copilotStore.currentStepId] || '')

// 消息增加时滚动到底部
watch(
  () => messages.value.length,
  async () => {
    await nextTick()
    scrollToBottom()
  }
)

// 消息内容变化时也滚动（thinking 升级为 text 不改变 length）
watch(
  () => messages.value.map(m => m.type).join(','),
  async () => {
    await nextTick()
    scrollToBottom()
  }
)

function scrollToBottom() {
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  }
}

function handleSend() {
  const text = inputMessage.value.trim()
  if (!text || isUserThinking.value) return

  copilotStore.addMessage('user', text)
  inputMessage.value = ''
  isUserThinking.value = true

  // 模拟 AI 回复
  const thinkingId = copilotStore.addThinkingMessage(GENERIC_THINKING_STEPS)
  setTimeout(() => {
    isUserThinking.value = false
    copilotStore.resolveThinkingToCards(
      thinkingId,
      '好的，我已收到你的问题。请稍等，让我来分析一下当前步骤的情况...',
      []
    )
  }, 1200)
}

function acceptCard(msgId: string, cardId: string) {
  copilotStore.acceptCardInMessage(msgId, cardId)
}

function dismissCard(msgId: string, cardId: string) {
  copilotStore.dismissCardInMessage(msgId, cardId)
}

function handleReidentify(card: SuggestionCard) {
  if (card.reidentifyAction) {
    copilotStore.triggerReidentify(card.reidentifyAction)
    copilotStore.triggerAIAnalysis(copilotStore.currentStepId)
  }
}

function handleClose() {
  copilotStore.closePanel()
}
</script>

<style scoped>
/* CSS 变量定义 */
.copilot-panel {
  --copilot-primary: #722ed1;
  --copilot-primary-light: #f0e6ff;
  --copilot-border: #e8e8e8;
  --copilot-text: #1f1f1f;
  --copilot-text-secondary: #8c8c8c;
  --copilot-bg: #f5f5f5;
  --copilot-header-bg: #fff;
  --copilot-msg-ai-bg: #fff;
  --copilot-msg-user-bg: #f0e6ff;
}

.copilot-panel {
  width: 380px;
  height: 100%;
  background: #fafafa;
  border-left: 1px solid var(--copilot-border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
}

/* ---- Header ---- */
.copilot-header {
  padding: 12px 14px;
  background: var(--copilot-header-bg);
  border-bottom: 1px solid var(--copilot-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.copilot-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.copilot-avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #722ed1 0%, #531dab 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  flex-shrink: 0;
}

.title-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--copilot-text);
}

.step-badge {
  font-size: 11px;
  font-weight: 500;
  color: var(--copilot-primary);
  background: var(--copilot-primary-light);
  padding: 2px 8px;
  border-radius: 10px;
}

.close-btn {
  color: var(--copilot-text-secondary);
}

.close-btn:hover {
  color: var(--copilot-text);
}

/* ---- Messages ---- */
.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--copilot-text-secondary);
  flex: 1;
  padding: 40px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 32px;
  color: #d3adf7;
  margin-bottom: 4px;
}

.empty-text {
  font-size: 13px;
  color: #595959;
  font-weight: 500;
}

.empty-hint {
  font-size: 12px;
  color: var(--copilot-text-secondary);
}

/* 消息条目 */
.message-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  max-width: 100%;
}

.message-item.user {
  flex-direction: row-reverse;
}

.msg-avatar {
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

.user-avatar {
  background: #e6f4ff;
  color: #1677ff;
}

.msg-bubble {
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.65;
  white-space: pre-wrap;
  max-width: calc(100% - 44px);
}

/* AI 消息 */
.message-item.assistant .msg-bubble {
  background: var(--copilot-msg-ai-bg);
  color: var(--copilot-text);
  border: 1px solid var(--copilot-border);
  border-left: 3px solid var(--copilot-primary);
  border-radius: 0 10px 10px 10px;
}

/* 用户消息 */
.message-item.user .msg-bubble {
  background: var(--copilot-msg-user-bg);
  color: var(--copilot-text);
  border-radius: 10px 0 10px 10px;
}

/* AI 思考动画 */
.msg-bubble.thinking {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #bfbfbf;
  animation: bounce 1.2s infinite;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-5px);
  }
}

/* 深度思考包裹器 */
.thinking-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: calc(100% - 44px);
}

.thinking-label {
  font-size: 11px;
  color: #9b59b6;
  margin-left: 6px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* 深度思考步骤列表 */
.thinking-steps {
  background: #f9f0ff;
  border: 1px solid #d3adf7;
  border-left: 3px solid #722ed1;
  border-radius: 0 8px 8px 8px;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.thinking-step {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #531dab;
  font-style: italic;
  opacity: 0;
  animation: step-appear 0.4s ease forwards;
}

.step-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #722ed1;
  flex-shrink: 0;
}

@keyframes step-appear {
  from { opacity: 0; transform: translateX(-6px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* card-group 布局 */
.card-group-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: calc(100% - 44px);
  min-width: 0;
}

.msg-bubble.card-intro {
  background: var(--copilot-msg-ai-bg);
  color: var(--copilot-text);
  border: 1px solid var(--copilot-border);
  border-left: 3px solid var(--copilot-primary);
  border-radius: 0 10px 10px 10px;
}

.inline-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 卡片消失动画 */
.card-fade-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.card-fade-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-bottom: 0;
}

/* ---- Input ---- */
.copilot-input {
  padding: 10px 14px 12px;
  border-top: 1px solid var(--copilot-border);
  background: #fff;
  flex-shrink: 0;
}

.copilot-input :deep(.ant-input) {
  border-radius: 8px;
  font-size: 13px;
}

.copilot-input :deep(.ant-input-suffix) {
  margin-left: 6px;
}
</style>
