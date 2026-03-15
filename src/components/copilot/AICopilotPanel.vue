<template>
  <div class="copilot-panel" :class="{ 'is-fullscreen': isFullscreen }">
    <div class="copilot-header">
      <div class="copilot-title">
        <RobotOutlined />
        <span>AI 助手</span>
        <a-tag v-if="copilotStore.currentStepId > 0" color="purple" size="small">
          步骤{{ copilotStore.currentStepId }}
        </a-tag>
      </div>
      <div class="copilot-actions">
        <a-button type="text" size="small" @click="toggleFullscreen" :title="isFullscreen ? '还原' : '全屏'">
          <FullscreenOutlined v-if="!isFullscreen" />
          <FullscreenExitOutlined v-else />
        </a-button>
        <a-button type="text" size="small" @click="handleClose">
          <CloseOutlined />
        </a-button>
      </div>
    </div>

    <div class="copilot-body" ref="bodyRef">
      <!-- 欢迎消息 -->
      <div v-if="messages.length === 0" class="welcome-section">
        <div class="welcome-header">
          <div class="ai-avatar-large">
            <RobotOutlined />
          </div>
          <div class="welcome-text">
            <h3>你好！我是本体构建助手</h3>
            <p>我可以帮助你完成以下任务</p>
          </div>
        </div>

        <div class="feature-cards">
          <div class="feature-card" @click="handleQuickAction('create')">
            <div class="card-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <PlusOutlined />
            </div>
            <div class="card-content">
              <div class="card-title">创建本体</div>
              <div class="card-desc">快速创建新的本体项目</div>
            </div>
          </div>

          <div class="feature-card" @click="handleQuickAction('extract')">
            <div class="card-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
              <AppstoreOutlined />
            </div>
            <div class="card-content">
              <div class="card-title">智能提取</div>
              <div class="card-desc">AI 自动识别实体和属性</div>
            </div>
          </div>

          <div class="feature-card" @click="handleQuickAction('relation')">
            <div class="card-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
              <ApartmentOutlined />
            </div>
            <div class="card-content">
              <div class="card-title">关联推断</div>
              <div class="card-desc">智能推断实体间关联关系</div>
            </div>
          </div>

          <div class="feature-card" @click="handleQuickAction('help')">
            <div class="card-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
              <QuestionCircleOutlined />
            </div>
            <div class="card-content">
              <div class="card-title">获取帮助</div>
              <div class="card-desc">解答使用过程中的疑问</div>
            </div>
          </div>
        </div>

        <div class="quick-input">
          <a-input-search
            v-model:value="quickInput"
            placeholder="问我一些问题..."
            enter-button="发送"
            size="large"
            @search="handleQuickSearch"
          />
        </div>
      </div>

      <!-- 消息列表 -->
      <div v-else class="message-list">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['message-item', msg.role]"
        >
          <div class="message-avatar">
            <RobotOutlined v-if="msg.role === 'assistant'" />
            <UserOutlined v-else />
          </div>
          <div class="message-content">
            {{ msg.content }}
          </div>
        </div>
      </div>

      <!-- 建议卡片区域 -->
      <div v-if="copilotStore.suggestions.length > 0" class="suggestions-section">
        <div class="suggestions-header">
          <BulbOutlined />
          <span>智能建议</span>
          <a-button
            v-if="!allAccepted"
            type="link"
            size="small"
            @click="handleAcceptAll"
          >
            采纳全部
          </a-button>
        </div>
        <div class="suggestions-list">
          <div
            v-for="suggestion in copilotStore.suggestions"
            :key="suggestion.id"
            :class="['suggestion-card', { accepted: suggestion.accepted }]"
          >
            <div class="suggestion-card-header">
              <div class="suggestion-title">
                <FileTextOutlined v-if="suggestion.type === 'table'" />
                <AppstoreOutlined v-else-if="suggestion.type === 'entity'" />
                <ApartmentOutlined v-else-if="suggestion.type === 'relation'" />
                <DatabaseOutlined v-else />
                <span>{{ suggestion.title }}</span>
              </div>
              <a-tag v-if="suggestion.accepted" color="green" size="small">已采纳</a-tag>
            </div>
            <div class="suggestion-desc">{{ suggestion.description }}</div>
            <div class="suggestion-content">{{ suggestion.content }}</div>

            <!-- 统计信息 -->
            <div v-if="suggestion.stats" class="suggestion-stats">
              <div
                v-for="(value, key) in suggestion.stats"
                :key="key"
                class="stat-item"
              >
                <span class="stat-label">{{ key }}</span>
                <span class="stat-value">{{ value }}</span>
              </div>
            </div>

            <div class="suggestion-actions">
              <a-button
                v-if="suggestion.actionLabel && !suggestion.accepted"
                type="primary"
                size="small"
                @click="handleAcceptSuggestion(suggestion.id)"
              >
                {{ suggestion.actionLabel }}
              </a-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入框 -->
    <div class="copilot-input">
      <a-input
        v-model:value="inputMessage"
        placeholder="输入消息..."
        @pressEnter="handleSend"
      >
        <template #suffix>
          <a-button type="text" @click="handleSend">
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
  BulbOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  ApartmentOutlined,
  DatabaseOutlined,
  CloseOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined
} from '@ant-design/icons-vue'
import { useCopilotStore } from '@/stores'

const copilotStore = useCopilotStore()
const bodyRef = ref<HTMLElement>()
const inputMessage = ref('')
const quickInput = ref('')
const isFullscreen = ref(false)

const messages = computed(() => copilotStore.messages)

const allAccepted = computed(() => {
  return copilotStore.suggestions.every(s => s.accepted)
})

// 监听消息变化，自动滚动到底部
watch(messages, async () => {
  await nextTick()
  if (bodyRef.value) {
    bodyRef.value.scrollTop = bodyRef.value.scrollHeight
  }
}, { deep: true })

function handleSend() {
  if (!inputMessage.value.trim()) return

  copilotStore.addMessage('user', inputMessage.value)
  inputMessage.value = ''

  // 模拟 AI 回复
  setTimeout(() => {
    copilotStore.addMessage('assistant', '收到你的消息了！请告诉我你需要什么帮助。')
  }, 1000)
}

function handleQuickSearch() {
  if (!quickInput.value.trim()) return
  copilotStore.addMessage('user', quickInput.value)
  quickInput.value = ''

  setTimeout(() => {
    copilotStore.addMessage('assistant', '收到你的问题了！让我来分析一下...')
  }, 1000)
}

function handleQuickAction(action: string) {
  switch (action) {
    case 'create':
      copilotStore.addMessage('assistant', '好的，让我们开始创建新的本体项目。请告诉我你想构建什么类型的本体？')
      break
    case 'extract':
      copilotStore.addMessage('assistant', '好的，我将帮你智能提取实体和属性。请先选择需要分析的数据源。')
      break
    case 'relation':
      copilotStore.addMessage('assistant', '让我帮你分析实体间的关联关系。首先需要确认已经完成实体识别。')
      break
    case 'help':
      copilotStore.addMessage('assistant', '你好！我是本体构建助手，可以帮助你：\n\n1. 快速创建本体项目\n2. 智能识别实体和属性\n3. 自动推断关联关系\n4. 优化本体结构\n\n请问有什么可以帮助你的？')
      break
  }
}

function handleAcceptSuggestion(id: string) {
  copilotStore.acceptSuggestion(id)
}

function handleAcceptAll() {
  copilotStore.acceptAllSuggestions()
}

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
}

function handleClose() {
  copilotStore.closePanel()
}
</script>

<style scoped>
.copilot-panel {
  width: 380px;
  height: 100%;
  background: #fff;
  border-left: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.copilot-panel.is-fullscreen {
  position: fixed;
  right: 0;
  top: 0;
  height: 100vh;
  width: 100%;
  max-width: 600px;
  z-index: 1000;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
}

.copilot-header {
  padding: 14px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.copilot-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-weight: 500;
  font-size: 15px;
}

.copilot-title :deep(.anticon) {
  font-size: 18px;
}

.copilot-actions {
  display: flex;
  gap: 4px;
}

.copilot-actions :deep(.ant-btn) {
  color: rgba(255, 255, 255, 0.85);
}

.copilot-actions :deep(.ant-btn:hover) {
  color: #fff;
  background: rgba(255, 255, 255, 0.15);
}

.copilot-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.copilot-input {
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
}

.copilot-input :deep(.ant-input) {
  border-radius: 20px;
  padding: 8px 12px;
}

.copilot-input :deep(.ant-input-suffix) {
  margin-left: 8px;
}

/* 欢迎区域 */
.welcome-section {
  padding: 20px 0;
}

.welcome-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.ai-avatar-large {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #fff;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.welcome-text h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-main);
}

.welcome-text p {
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary);
}

/* 功能卡片 */
.feature-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.feature-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: #fafafa;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.feature-card:hover {
  background: #fff;
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
  transform: translateY(-2px);
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #fff;
  flex-shrink: 0;
}

.card-content {
  min-width: 0;
}

.card-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-main);
  margin-bottom: 2px;
}

.card-desc {
  font-size: 11px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 快捷输入 */
.quick-input {
  margin-top: 16px;
}

.quick-input :deep(.ant-input-search-button) {
  border-radius: 20px;
}

/* 消息列表 */
.message-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-item {
  display: flex;
  gap: 10px;
  max-width: 90%;
}

.message-item.user {
  flex-direction: row-reverse;
  align-self: flex-end;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 14px;
}

.message-item.assistant .message-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.message-item.user .message-avatar {
  background: #e6f7ff;
  color: #1890ff;
}

.message-content {
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.message-item.assistant .message-content {
  background: #f5f5f5;
  color: var(--text-main);
  border-bottom-left-radius: 4px;
}

.message-item.user .message-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-bottom-right-radius: 4px;
}

/* 建议卡片 */
.suggestions-section {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.suggestions-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-main);
}

.suggestions-header :deep(.anticon) {
  color: #faad14;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.suggestion-card {
  padding: 14px;
  background: #fafafa;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  transition: all 0.2s;
}

.suggestion-card.accepted {
  background: #f6ffed;
  border-color: #b7eb8f;
}

.suggestion-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.suggestion-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-main);
}

.suggestion-title :deep(.anticon) {
  color: #667eea;
}

.suggestion-desc {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.suggestion-content {
  font-size: 12px;
  color: var(--text-main);
  background: #fff;
  padding: 10px;
  border-radius: 6px;
  white-space: pre-wrap;
  line-height: 1.5;
}

.suggestion-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed var(--border-color);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  padding: 3px 8px;
  background: #fff;
  border-radius: 4px;
}

.stat-label {
  color: var(--text-secondary);
}

.stat-value {
  font-weight: 500;
  color: var(--text-main);
}

.suggestion-actions {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}
</style>
