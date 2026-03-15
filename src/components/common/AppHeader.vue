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
        <!-- 通知入口 -->
        <a-dropdown :trigger="['click']">
          <div class="action-icon-wrapper">
            <BellOutlined class="action-icon" />
            <span class="notification-badge">!</span>
          </div>
          <template #overlay>
            <a-menu class="notification-menu">
              <div class="menu-header">
                <span>通知中心</span>
              </div>
              <a-menu-item key="1" @click="openDoc('manual')">
                <FileTextOutlined />
                <span>操作手册</span>
              </a-menu-item>
              <a-menu-item key="2" @click="openDoc('guide')">
                <QuestionCircleOutlined />
                <span>使用指南</span>
              </a-menu-item>
              <a-menu-divider />
              <a-menu-item key="3" @click="openDoc('shortcuts')">
                <ThunderboltOutlined />
                <span>快捷键说明</span>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
        <SettingOutlined class="action-icon" />
        <UserOutlined class="action-icon" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import {
  AppstoreOutlined,
  SettingOutlined,
  UserOutlined,
  BellOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  ThunderboltOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

function openDoc(type: string) {
  const docs: Record<string, string> = {
    manual: '操作手册：\n\n1. 创建本体：点击"新建本体"，填写基本信息\n2. 数据采集：选择数据源，配置采集规则\n3. 实体提取：AI自动识别实体，可手动调整\n4. 关联构建：定义实体间关系\n5. 规则识别：配置业务规则\n6. 动作识别：分析用户行为模式',
    guide: '使用指南：\n\n• 本页面用于构建知识本体\n• 5个步骤依次完成：数据采集→实体提取→关联构建→规则识别→动作识别\n• 右上角AI助手可提供智能帮助\n• 建议按顺序逐步完成每个步骤',
    shortcuts: '快捷键说明：\n\n• Ctrl+S：保存当前进度\n• Ctrl+N：新建本体项目\n• Ctrl+1-5：快速切换步骤\n• Esc：关闭弹窗'
  }

  message.info(docs[type] || '功能开发中')
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

.notification-menu {
  width: 220px;
}

.menu-header {
  padding: 10px 16px;
  font-weight: 500;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-main);
}

.notification-menu :deep(.ant-menu-item) {
  display: flex;
  align-items: center;
  gap: 10px;
}

.notification-menu :deep(.ant-menu-item .anticon) {
  font-size: 14px;
}
</style>
