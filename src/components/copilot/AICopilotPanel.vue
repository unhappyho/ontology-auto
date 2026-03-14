<template>
  <Teleport to="body">
    <Transition name="slide">
      <div v-if="visible" class="copilot-panel">
        <div class="copilot-header">
          <div class="copilot-title">
            <RobotOutlined />
            <span>AI 助手</span>
            <a-tag v-if="copilotStore.currentStepId > 0" color="purple" size="small">
              步骤{{ copilotStore.currentStepId }}
            </a-tag>
          </div>
          <div class="copilot-actions">
            <a-button type="text" size="small" @click="handleMinimize">
              <MinusOutlined />
            </a-button>
            <a-button type="text" size="small" @click="handleClose">
              <CloseOutlined />
            </a-button>
          </div>
        </div>

        <div class="copilot-body" ref="bodyRef">
          <!-- 欢迎消息 -->
          <div v-if="messages.length === 0" class="welcome-message">
            <div class="ai-avatar">
              <RobotOutlined />
            </div>
            <div class="ai-content">
              <div class="ai-greeting">你好！我是本体构建助手</div>
              <div class="ai-desc">我可以帮助你：</div>
              <ul class="ai-features">
                <li>快速创建本体项目</li>
                <li>智能识别实体和属性</li>
                <li>自动推断关联关系</li>
                <li>优化本体结构</li>
              </ul>
              <div class="quick-actions">
                <a-button type="primary" size="small" @click="handleQuickAction('create')">
                  <PlusOutlined />
                  创建新本体
                </a-button>
                <a-button size="small" @click="handleQuickAction('help')">
                  <QuestionCircleOutlined />
                  获取帮助
                </a-button>
              </div>
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

                <div v-if="!suggestion.accepted" class="suggestion-actions">
                  <a-button
                    type="primary"
                    size="small"
                    @click="handleAcceptSuggestion(suggestion.id)"
                  >
                    {{ suggestion.actionLabel || '采纳' }}
                  </a-button>
                  <a-button size="small" @click="handleDismissSuggestion(suggestion.id)">
                    忽略
                  </a-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="copilot-input">
          <a-input
            v-model:value="inputValue"
            placeholder="输入你想做的事情..."
            @pressEnter="handleSend"
          >
            <template #suffix>
              <a-button type="text" size="small" @click="handleSend">
                <SendOutlined />
              </a-button>
            </template>
          </a-input>
        </div>
      </div>
    </Transition>

    <!-- 悬浮按钮 -->
    <Transition name="fade">
      <div v-if="!visible && showFloatBtn" class="copilot-float-btn" @click="handleOpen">
        <div class="float-btn-icon">
          <RobotOutlined />
        </div>
        <div v-if="copilotStore.hasNewSuggestions" class="float-btn-badge"></div>
        <div class="float-btn-text">AI 助手</div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  RobotOutlined,
  CloseOutlined,
  MinusOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  UserOutlined,
  SendOutlined,
  BulbOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  ApartmentOutlined,
  DatabaseOutlined
} from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { useCopilotStore } from '@/stores'

const router = useRouter()
const copilotStore = useCopilotStore()

const showFloatBtn = ref(true)
const inputValue = ref('')
const bodyRef = ref<HTMLElement>()

// 使用 store 的状态
const visible = computed(() => copilotStore.visible)
const messages = computed(() => copilotStore.messages)

// 检查是否全部采纳
const allAccepted = computed(() => {
  return copilotStore.suggestions.length > 0 &&
    copilotStore.suggestions.every(s => s.accepted)
})

// 监听步骤变化
watch(
  () => copilotStore.currentStepId,
  (newStep) => {
    if (newStep > 0) {
      copilotStore.openPanel()
    }
  }
)

function handleOpen() {
  copilotStore.openPanel()
}

function handleClose() {
  copilotStore.closePanel()
  showFloatBtn.value = true
}

function handleMinimize() {
  copilotStore.minimizePanel()
  showFloatBtn.value = true
}

function handleSend() {
  if (!inputValue.value.trim()) return

  copilotStore.addMessage('user', inputValue.value)

  const userInput = inputValue.value
  inputValue.value = ''

  // 模拟AI回复
  setTimeout(() => {
    let reply = ''
    if (userInput.includes('创建') || userInput.includes('新')) {
      reply = '好的，我来帮你创建新的本体项目。请告诉我你想构建什么领域的本体？比如：电商CRM、供应链管理、医疗档案等。'
    } else if (userInput.includes('帮助') || userInput.includes('怎么')) {
      reply = '我可以帮你完成以下任务：\n1. 创建新的本体项目\n2. 识别数据表中的实体和属性\n3. 构建实体间的关联关系\n4. 优化本体结构\n\n请告诉我你需要什么帮助？'
    } else if (userInput.includes('步骤') || userInput.includes('进行')) {
      const currentStep = copilotStore.currentStepId
      if (currentStep > 0) {
        const stepNames = ['', '数据源配置', '实体识别', '关联构建', '知识入库']
        reply = `当前正在第${currentStep}步：${stepNames[currentStep]}。我可以帮你提供该步骤的智能建议。`
      } else {
        reply = '请先进入任务配置流程，我会在各个步骤为你提供智能建议。'
      }
    } else {
      reply = '明白了！让我来分析一下。你可以先创建一个本体项目，然后：\n1. 配置数据源\n2. 让AI自动识别实体\n3. 构建关联关系\n4. 融合入库\n\n需要我帮你创建项目吗？'
    }

    copilotStore.addMessage('assistant', reply)

    setTimeout(() => {
      if (bodyRef.value) {
        bodyRef.value.scrollTop = bodyRef.value.scrollHeight
      }
    }, 50)
  }, 500)
}

function handleQuickAction(action: string) {
  if (action === 'create') {
    router.push('/task')
  } else if (action === 'help') {
    copilotStore.addMessage('assistant', '有什么可以帮助你的？请告诉我你遇到的问题或想完成的任务。')
  }
}

function handleAcceptSuggestion(id: string) {
  copilotStore.acceptSuggestion(id)
}

function handleAcceptAll() {
  copilotStore.acceptAllSuggestions()
}

function handleDismissSuggestion(id: string) {
  copilotStore.dismissSuggestion(id)
}
</script>

<style scoped>
.copilot-panel {
  position: fixed;
  right: 0;
  top: 0;
  width: 360px;
  height: 100vh;
  background: var(--bg-white);
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.copilot-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  flex-shrink: 0;
}

.copilot-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.copilot-actions {
  display: flex;
  gap: 4px;
}

.copilot-actions :deep(.ant-btn) {
  color: rgba(255, 255, 255, 0.8);
}

.copilot-actions :deep(.ant-btn:hover) {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.copilot-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.welcome-message {
  display: flex;
  gap: 12px;
}

.ai-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  flex-shrink: 0;
}

.ai-content {
  flex: 1;
}

.ai-greeting {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-main);
}

.ai-desc {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.ai-features {
  margin: 0;
  padding-left: 18px;
  font-size: 12px;
  color: var(--text-regular);
  margin-bottom: 12px;
}

.ai-features li {
  margin-bottom: 4px;
}

.quick-actions {
  display: flex;
  gap: 8px;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-item {
  display: flex;
  gap: 10px;
}

.message-item.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #F0F0F0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.message-item.assistant .message-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.message-item.user .message-avatar {
  background: var(--primary-color);
  color: white;
}

.message-content {
  max-width: 240px;
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.5;
  background: #F5F5F5;
  white-space: pre-wrap;
}

.message-item.user .message-content {
  background: var(--primary-color);
  color: white;
}

/* 建议卡片样式 */
.suggestions-section {
  border-top: 1px solid var(--border-color);
  padding-top: 12px;
}

.suggestions-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-main);
  margin-bottom: 12px;
}

.suggestions-header :deep(.anticon) {
  color: #faad14;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.suggestion-card {
  background: #fafafa;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px;
  transition: all 0.3s;
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
  color: var(--primary-color);
}

.suggestion-desc {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.suggestion-content {
  font-size: 12px;
  color: var(--text-regular);
  background: white;
  padding: 8px;
  border-radius: 4px;
  white-space: pre-wrap;
  line-height: 1.6;
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
  flex-direction: column;
  align-items: center;
  background: white;
  padding: 6px 10px;
  border-radius: 4px;
  min-width: 60px;
}

.stat-label {
  font-size: 10px;
  color: var(--text-secondary);
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-color);
}

.suggestion-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.copilot-input {
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
}

.copilot-float-btn {
  position: fixed;
  right: 20px;
  bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px;
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transition: all 0.3s;
  z-index: 999;
}

.copilot-float-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
}

.float-btn-icon {
  font-size: 20px;
  position: relative;
}

.float-btn-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 10px;
  height: 10px;
  background: #ff4d4f;
  border-radius: 50%;
  border: 2px solid white;
}

.float-btn-text {
  font-size: 14px;
  font-weight: 500;
}

/* Transition */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
