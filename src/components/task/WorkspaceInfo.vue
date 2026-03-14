<template>
  <div class="workspace-card">
    <div class="workspace-card-header">
      <div class="workspace-title">
        <CloudServerOutlined />
        空间配置
      </div>
      <a-button type="primary" size="small">编辑配置</a-button>
    </div>
    <div class="workspace-grid">
      <div class="info-item">
        <div class="info-dot"></div>
        <span class="info-label">当前空间</span>
        <span class="info-value">{{ config.name }}</span>
      </div>
      <div class="info-item">
        <div class="info-dot"></div>
        <span class="info-label">大模型</span>
        <span class="info-value">{{ config.model }}</span>
      </div>
      <div class="info-item">
        <div class="info-dot"></div>
        <span class="info-label">向量库</span>
        <span class="info-value">{{ config.vectorDb }}</span>
      </div>
      <div class="info-item">
        <div class="info-dot" style="background: #722ED1;"></div>
        <span class="info-label">图数据库</span>
        <span class="info-value">{{ config.graphDb }}</span>
        <span class="info-badge" v-if="config.connected">
          <span class="badge-dot"></span>
          已连接
        </span>
      </div>
      <div class="info-item">
        <div class="info-dot"></div>
        <span class="info-label">成员</span>
        <span class="info-value">{{ config.members }}</span>
      </div>
      <div class="info-item">
        <div class="info-dot" style="background: #FA8C16;"></div>
        <span class="info-label">图存储</span>
        <span class="info-value">{{ config.graphStorage }}</span>
      </div>
      <div class="info-item">
        <div class="info-dot" style="background: #14C9C9;"></div>
        <span class="info-label">实体总数</span>
        <span class="info-value entity-count">{{ config.entityCount.toLocaleString() }}</span>
      </div>
      <div class="info-item">
        <div class="info-dot" style="background: #00B42A;"></div>
        <span class="info-label">关系总数</span>
        <span class="info-value relation-count">{{ config.relationCount.toLocaleString() }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CloudServerOutlined } from '@ant-design/icons-vue'
import type { WorkspaceConfig } from '@/types'

interface Props {
  config: WorkspaceConfig
}

defineProps<Props>()
</script>

<style scoped>
.workspace-card {
  background-color: var(--bg-white);
  border-radius: 8px;
  padding: 14px 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  border: 1px solid var(--border-color);
  flex-shrink: 0;
}

.workspace-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.workspace-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  gap: 8px;
}

.workspace-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  background: #FAFAFA;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 8px 12px;
}

.info-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--primary-color);
  flex-shrink: 0;
}

.info-label {
  font-size: 12px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.info-value {
  font-size: 13px;
  color: var(--text-main);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.info-badge {
  font-size: 11px;
  background: #E8FFEA;
  color: var(--success-color);
  padding: 1px 6px;
  border-radius: 3px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.badge-dot {
  width: 6px;
  height: 6px;
  background: var(--success-color);
  border-radius: 50%;
}

.entity-count {
  color: #722ED1;
  font-weight: 700;
}

.relation-count {
  color: var(--success-color);
  font-weight: 700;
}
</style>
