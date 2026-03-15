<template>
  <div
    v-if="!card.dismissed"
    :class="['copilot-card', { accepted: card.accepted }]"
  >
    <div class="card-header">
      <div class="card-title">
        <span class="type-icon">
          <TableOutlined v-if="card.type === 'table'" />
          <AppstoreOutlined v-else-if="card.type === 'entity'" />
          <ApartmentOutlined v-else-if="card.type === 'relation'" />
          <DatabaseOutlined v-else />
        </span>
        <span>{{ card.title }}</span>
      </div>
      <CheckCircleFilled v-if="card.accepted" class="accepted-icon" />
    </div>

    <div class="card-desc">{{ card.description }}</div>
    <div class="card-content">{{ card.content }}</div>

    <div v-if="card.stats" class="card-stats">
      <div
        v-for="(value, key) in card.stats"
        :key="key"
        class="stat-item"
      >
        <span class="stat-label">{{ key }}</span>
        <span class="stat-value">{{ value }}</span>
      </div>
    </div>

    <div v-if="!card.accepted" class="card-actions">
      <a-button size="small" @click="emit('dismiss')">忽略</a-button>
      <a-button v-if="card.reidentifyAction" size="small" @click="emit('reidentify')">
        <SyncOutlined />
        重新识别
      </a-button>
      <a-button type="primary" size="small" @click="emit('accept')">采纳</a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  TableOutlined,
  AppstoreOutlined,
  ApartmentOutlined,
  DatabaseOutlined,
  CheckCircleFilled,
  SyncOutlined
} from '@ant-design/icons-vue'
import type { SuggestionCard } from '@/stores/useCopilotStore'

defineProps<{ card: SuggestionCard }>()
const emit = defineEmits<{
  accept: []
  dismiss: []
  reidentify: []
}>()
</script>

<style scoped>
.copilot-card {
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  transition: border-color 0.2s, background 0.2s;
}

.copilot-card:hover {
  border-color: #d3adf7;
}

.copilot-card.accepted {
  background: #f6ffed;
  border-color: #95de64;
  opacity: 0.85;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #1f1f1f;
}

.type-icon {
  color: #722ed1;
  font-size: 13px;
}

.accepted-icon {
  color: #52c41a;
  font-size: 14px;
}

.card-desc {
  font-size: 11px;
  color: #8c8c8c;
  margin-bottom: 8px;
  line-height: 1.5;
}

.card-content {
  font-size: 12px;
  color: #1f1f1f;
  background: #fff;
  padding: 8px 10px;
  border-radius: 6px;
  white-space: pre-wrap;
  line-height: 1.6;
  border: 1px solid #f0f0f0;
}

.card-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  padding: 2px 8px;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
}

.stat-label {
  color: #8c8c8c;
}

.stat-value {
  font-weight: 600;
  color: #1f1f1f;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 10px;
}
</style>
