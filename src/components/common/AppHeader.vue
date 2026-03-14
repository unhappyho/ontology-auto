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
        <SettingOutlined class="action-icon" />
        <UserOutlined class="action-icon" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { AppstoreOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons-vue'
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
</style>
