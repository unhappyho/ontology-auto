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
        <!-- type=thinking：流式思考 + 回复文字 + 卡片（同一气泡） -->
        <template v-if="msg.type === 'thinking'">
          <div class="msg-avatar"><RobotOutlined /></div>
          <div class="thinking-wrapper">
            <!-- 1. 思考状态头部 -->
            <div class="thinking-header">
              <div class="thinking-status">
                <span v-if="msg.thinkingStatus === 'streaming'" class="status-dot streaming"></span>
                <CheckCircleOutlined v-else class="status-dot completed" />
                <span class="status-text">
                  {{ msg.thinkingStatus === 'streaming' ? '深度思考中' : '思考完成' }}
                </span>
              </div>
              <!-- 折叠/展开按钮（仅在完成时显示） -->
              <button
                v-if="msg.thinkingStatus === 'completed'"
                class="collapse-toggle"
                @click="toggleThinking(msg.id)"
              >
                <span>{{ msg.thinkingCollapsed ? '展开' : '收起' }}</span>
                <DownOutlined :class="['toggle-icon', { collapsed: msg.thinkingCollapsed }]" />
              </button>
            </div>

            <!-- 2. 思考内容区域（可折叠） -->
            <transition name="thinking-collapse">
              <div
                v-show="!msg.thinkingCollapsed || msg.thinkingStatus === 'streaming'"
                class="thinking-content"
              >
                <div class="thinking-text">
                  {{ msg.thinkingContent }}
                  <span v-if="msg.thinkingStatus === 'streaming'" class="typing-cursor"></span>
                </div>
              </div>
            </transition>

            <!-- 折叠时的简要提示 -->
            <div
              v-if="msg.thinkingStatus === 'completed' && msg.thinkingCollapsed"
              class="thinking-summary"
            >
              点击展开查看详细思考过程
            </div>

            <!-- 3. 回复文字（思考完成后显示） -->
            <div
              v-if="msg.thinkingStatus === 'completed' && msg.content"
              class="msg-bubble response-text"
            >
              {{ msg.content }}
            </div>

            <!-- 4. 卡片（有卡片时显示） -->
            <template v-if="msg.thinkingStatus === 'completed' && msg.cards?.length">
              <div class="card-intro-text">以下是我的分析建议，请确认是否采纳：</div>
              <transition-group name="card-fade" tag="div" class="inline-cards">
                <CopilotCard
                  v-for="card in msg.cards.filter((c: SuggestionCard) => !c.dismissed)"
                  :key="card.id"
                  :card="card"
                  @accept="acceptCard(msg.id, card.id)"
                  @dismiss="dismissCard(msg.id, card.id)"
                  @reidentify="handleReidentify(card)"
                />
              </transition-group>
            </template>
          </div>
        </template>

        <!-- type=text：文字气泡 -->
        <template v-else-if="msg.type === 'text'">
          <div v-if="msg.role === 'assistant'" class="msg-avatar"><RobotOutlined /></div>
          <div class="text-wrapper">
            <!-- 如果有思考内容，显示折叠区域 -->
            <div v-if="msg.thinkingContent" class="thinking-header compact">
              <div class="thinking-status">
                <CheckCircleOutlined class="status-dot completed" />
                <span class="status-text">思考过程</span>
              </div>
              <button
                class="collapse-toggle"
                @click="toggleThinking(msg.id)"
              >
                <span>{{ msg.thinkingCollapsed ? '展开' : '收起' }}</span>
                <DownOutlined :class="['toggle-icon', { collapsed: msg.thinkingCollapsed }]" />
              </button>
            </div>
            <transition name="thinking-collapse">
              <div
                v-if="msg.thinkingContent && !msg.thinkingCollapsed"
                class="thinking-content compact"
              >
                <div class="thinking-text">{{ msg.thinkingContent }}</div>
              </div>
            </transition>
            <div class="msg-bubble">{{ msg.content }}</div>
          </div>
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
  CloseOutlined,
  CheckCircleOutlined,
  DownOutlined
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

// 思考内容变化时滚动（流式输出）
watch(
  () => messages.value.map(m => m.thinkingContent || '').join(''),
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

  // 使用流式输出
  const thinkingId = copilotStore.startThinkingMessage()
  const steps = GENERIC_THINKING_STEPS
  let stepIndex = 0
  let charIndex = 0

  const streamInterval = setInterval(() => {
    if (stepIndex >= steps.length) {
      clearInterval(streamInterval)
      copilotStore.completeThinking(thinkingId, '思考完成')
      isUserThinking.value = false
      setTimeout(() => {
        copilotStore.resolveThinkingToCards(
          thinkingId,
          '好的，我已收到你的问题。请稍等，让我来分析一下当前步骤的情况...',
          []
        )
      }, 300)
      return
    }

    const currentStep = steps[stepIndex]
    if (charIndex < currentStep.length) {
      copilotStore.appendThinkingContent(thinkingId, currentStep[charIndex])
      charIndex++
    } else {
      copilotStore.appendThinkingContent(thinkingId, '\n')
      stepIndex++
      charIndex = 0
    }
  }, 30)
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

// 切换思考折叠状态
function toggleThinking(msgId: string) {
  copilotStore.toggleThinkingCollapsed(msgId)
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
  justify-content: flex-start;
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
  min-width: 60px;
  max-width: 240px;
}

/* 深度思考包裹器 */
.thinking-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: calc(100% - 44px);
  min-width: 0;
}

/* 思考状态头部 */
.thinking-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: var(--copilot-msg-ai-bg);
  border: 1px solid var(--copilot-border);
  border-left: 3px solid var(--copilot-primary);
  border-radius: 0 10px 10px 10px;
}

.thinking-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.streaming {
  background: #722ed1;
  animation: pulse 1.2s infinite;
}

.status-dot.completed {
  color: #52c41a;
  font-size: 14px;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.8);
  }
}

.status-text {
  font-size: 12px;
  font-weight: 500;
  color: #722ed1;
}

/* 折叠/展开按钮 */
.collapse-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border: none;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 11px;
  color: #8c8c8c;
  cursor: pointer;
  transition: all 0.2s;
}

.collapse-toggle:hover {
  background: #e8e8e8;
  color: #595959;
}

.toggle-icon {
  font-size: 10px;
  transition: transform 0.2s;
}

.toggle-icon.collapsed {
  transform: rotate(-90deg);
}

/* 思考内容区域 */
.thinking-content {
  background: #f9f0ff;
  border: 1px solid #d3adf7;
  border-left: 3px solid #722ed1;
  border-radius: 0 8px 8px 8px;
  padding: 10px 12px;
  overflow: hidden;
}

.thinking-text {
  font-size: 12px;
  color: #531dab;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 打字光标动画 */
.typing-cursor {
  display: inline-block;
  width: 2px;
  height: 14px;
  background: #722ed1;
  margin-left: 2px;
  vertical-align: text-bottom;
  animation: blink 0.8s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* 折叠时简要提示 */
.thinking-summary {
  font-size: 11px;
  color: #8c8c8c;
  font-style: italic;
  padding: 4px 0;
}

/* 回复文字样式 */
.response-text {
  margin-top: 4px;
}

/* 卡片介绍文字 */
.card-intro-text {
  font-size: 12px;
  color: #595959;
  margin-top: 8px;
  padding: 0 4px;
}

/* 折叠过渡动画 */
.thinking-collapse-enter-active,
.thinking-collapse-leave-active {
  transition: all 0.25s ease;
  max-height: 500px;
  overflow: hidden;
}

.thinking-collapse-enter-from,
.thinking-collapse-leave-to {
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  opacity: 0;
}

/* text 消息中的思考内容紧凑样式 */
.text-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: calc(100% - 44px);
  min-width: 0;
}

.thinking-header.compact {
  padding: 6px 10px;
}

.thinking-content.compact {
  padding: 8px 10px;
}

/* text 消息中的思考内容紧凑样式 */
.text-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: calc(100% - 44px);
  min-width: 0;
}

.thinking-header.compact {
  padding: 6px 10px;
}

.thinking-content.compact {
  padding: 8px 10px;
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
