<template>
  <header class="app-header">
    <div class="header-left">
      <div class="logo-icon">
        <AppstoreOutlined />
      </div>
      <div class="header-title">
        浩鲸数据工厂
        <span class="header-subtitle">OPERATOR EDITION</span>
      </div>
    </div>
    <div class="header-right">
      <div class="status-indicator">
        <span class="status-dot"></span>
        5G 核心网连接正常
      </div>
      <div class="header-actions">
        <!-- AI 副驾入口 -->
        <div
          class="action-icon-wrapper copilot-btn"
          :class="{ active: copilotStore.visible }"
          @click="copilotStore.togglePanel()"
          title="AI 副驾"
        >
          <RobotOutlined class="action-icon" />
          <span v-if="copilotStore.hasNewSuggestions && !copilotStore.visible" class="notification-badge">!</span>
        </div>

        <!-- 帮助中心入口 -->
        <div class="action-icon-wrapper" @click="openHelpCenter" title="帮助中心">
          <BellOutlined class="action-icon" />
          <span class="notification-badge">!</span>
        </div>

        <SettingOutlined class="action-icon" />
        <UserOutlined class="action-icon" />
      </div>
    </div>

    <!-- 帮助中心 Modal -->
    <a-modal
      v-model:open="helpModalVisible"
      title="帮助中心"
      :width="600"
      :footer="null"
      class="help-modal"
    >
      <a-tabs v-model:activeKey="activeHelpTab">
        <!-- 操作手册 -->
        <a-tab-pane key="manual" tab="操作手册">
          <div class="help-content">
            <a-steps direction="vertical" size="small" :current="4">
              <a-step title="数据采集" description="选择数据源，配置采集项和采集范围，支持结构化/非结构化数据" />
              <a-step title="实体提取" description="AI 自动识别数据中的实体类型和属性字段，可手动调整" />
              <a-step title="关联构建" description="基于已提取实体，AI 推断实体间的关联关系，支持画布和列表两种视图" />
              <a-step title="规则识别" description="配置派生关系、动态分类、事理传导等业务规则" />
              <a-step title="动作识别" description="分析用户行为模式，识别典型动作序列，完成本体构建" />
            </a-steps>
          </div>
        </a-tab-pane>

        <!-- 使用指南 -->
        <a-tab-pane key="guide" tab="使用指南">
          <div class="help-content">
            <ul class="help-list">
              <li>
                <span class="help-icon"><BulbOutlined /></span>
                本体构建分为 5 个步骤，建议按顺序逐步完成
              </li>
              <li>
                <span class="help-icon"><RobotOutlined /></span>
                右上角 AI 副驾可在每个步骤提供智能建议，点击「AI 智能推荐」或「AI 提取」触发
              </li>
              <li>
                <span class="help-icon"><CheckCircleOutlined /></span>
                每步完成后点击「下一步」，副驾会自动分析并给出下一步建议卡片
              </li>
              <li>
                <span class="help-icon"><SyncOutlined /></span>
                对 AI 建议卡片可选择「采纳」「重新识别」「忽略」，重新识别会触发左侧页面动效
              </li>
              <li>
                <span class="help-icon"><SaveOutlined /></span>
                每步均可点击「保存草稿」随时保存当前进度
              </li>
            </ul>
          </div>
        </a-tab-pane>

        <!-- 快捷键说明 -->
        <a-tab-pane key="shortcuts" tab="快捷键说明">
          <div class="help-content">
            <div class="shortcut-grid">
              <div class="shortcut-item">
                <span class="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>S</kbd></span>
                <span class="shortcut-desc">保存当前进度</span>
              </div>
              <div class="shortcut-item">
                <span class="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>N</kbd></span>
                <span class="shortcut-desc">新建本体项目</span>
              </div>
              <div class="shortcut-item">
                <span class="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>1~5</kbd></span>
                <span class="shortcut-desc">快速切换步骤</span>
              </div>
              <div class="shortcut-item">
                <span class="shortcut-keys"><kbd>Esc</kbd></span>
                <span class="shortcut-desc">关闭当前弹窗</span>
              </div>
              <div class="shortcut-item">
                <span class="shortcut-keys"><kbd>Enter</kbd></span>
                <span class="shortcut-desc">AI 副驾发送消息</span>
              </div>
              <div class="shortcut-item">
                <span class="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>/</kbd></span>
                <span class="shortcut-desc">打开/关闭 AI 副驾</span>
              </div>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>

      <div class="help-modal-footer">
        <a-button type="primary" @click="helpModalVisible = false">关闭</a-button>
      </div>
    </a-modal>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  AppstoreOutlined,
  SettingOutlined,
  UserOutlined,
  BellOutlined,
  RobotOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  SaveOutlined
} from '@ant-design/icons-vue'
import { useCopilotStore } from '@/stores'

const copilotStore = useCopilotStore()

const helpModalVisible = ref(false)
const activeHelpTab = ref('manual')

function openHelpCenter() {
  helpModalVisible.value = true
}
</script>

<style scoped>
.app-header {
  height: 56px;
  background-color: var(--bg-white);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  flex-shrink: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 28px;
  height: 28px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
}

.header-subtitle {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: normal;
  margin-left: 8px;
  border-left: 1px solid var(--border-color);
  padding-left: 8px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-regular);
}

.status-dot {
  width: 8px;
  height: 8px;
  background-color: var(--success-color);
  border-radius: 50%;
}

.header-actions {
  display: flex;
  gap: 16px;
  font-size: 18px;
  cursor: pointer;
}

.action-icon {
  color: var(--text-secondary);
  transition: color 0.2s;
}

.action-icon:hover {
  color: var(--primary-color);
}

.action-icon-wrapper {
  position: relative;
  cursor: pointer;
}

.copilot-btn .action-icon {
  transition: color 0.2s;
}

.copilot-btn.active .action-icon {
  color: var(--primary-color);
}

.copilot-btn.active {
  background: var(--primary-light, #f0f5ff);
  border-radius: 6px;
  padding: 2px 4px;
}

.notification-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 14px;
  height: 14px;
  background: #ff4d4f;
  color: #fff;
  font-size: 10px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

/* ---- Help Modal Content ---- */
.help-content {
  padding: 8px 0 16px;
  min-height: 260px;
}

.help-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.help-list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  color: #1f1f1f;
  line-height: 1.6;
}

.help-icon {
  color: #722ed1;
  font-size: 15px;
  flex-shrink: 0;
  margin-top: 1px;
}

.shortcut-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.shortcut-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.shortcut-keys {
  display: flex;
  align-items: center;
  gap: 4px;
}

kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 7px;
  font-size: 12px;
  font-family: monospace;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.12);
  color: #1f1f1f;
  white-space: nowrap;
}

.shortcut-desc {
  font-size: 12px;
  color: #595959;
}

.help-modal-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  margin-top: 4px;
}

/* Steps 样式微调 */
:deep(.ant-steps-item-description) {
  font-size: 12px !important;
  color: #8c8c8c !important;
}
</style>
