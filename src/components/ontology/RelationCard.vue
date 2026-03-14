<template>
  <div :class="['relation-card', { expanded }]">
    <div class="relation-card-header" @click="toggleExpand">
      <div class="relation-card-left">
        <div class="relation-source">
          <span class="entity-name">{{ relation.sourceEntityName }}</span>
        </div>
        <div class="relation-arrow">
          <RightOutlined />
          <span class="relation-name">{{ relation.relationNameCn }}</span>
          <RightOutlined />
        </div>
        <div class="relation-target">
          <span class="entity-name">{{ relation.targetEntityName }}</span>
        </div>
      </div>
      <div class="relation-card-right">
        <span v-if="relation.isNew" class="tag-new">
          <StarFilled />
          新发现
        </span>
        <span v-else-if="relation.confidence" :class="['tag-confidence', `confidence-${relation.confidence}`]">
          {{ getConfidenceLabel(relation.confidence) }}
        </span>
        <span v-if="relation.termName" class="tag-term">
          <LinkOutlined />
          {{ relation.termName }}
        </span>
        <div class="relation-ops" @click.stop>
          <div class="relation-op-btn" title="编辑" @click="handleEdit">
            <EditOutlined />
          </div>
          <div class="relation-op-btn del" title="删除" @click="handleDelete">
            <DeleteOutlined />
          </div>
        </div>
        <DownOutlined class="relation-expand-icon" />
      </div>
    </div>
    <div class="relation-card-body" v-if="expanded">
      <div class="relation-detail">
        <div class="detail-item">
          <span class="detail-label">源实体</span>
          <span class="detail-value">{{ relation.sourceEntityName }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">目标实体</span>
          <span class="detail-value">{{ relation.targetEntityName }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">关系名称</span>
          <span class="detail-value">{{ relation.relationName }} / {{ relation.relationNameCn }}</span>
        </div>
        <div class="detail-item" v-if="relation.termName">
          <span class="detail-label">术语</span>
          <span class="detail-value term-value">
            <LinkOutlined />
            {{ relation.termName }}
          </span>
        </div>
        <div class="detail-item" v-if="relation.confidence">
          <span class="detail-label">置信度</span>
          <span :class="['detail-value', `confidence-${relation.confidence}`]">
            {{ getConfidenceLabel(relation.confidence) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  StarFilled,
  LinkOutlined,
  EditOutlined,
  DeleteOutlined,
  DownOutlined,
  RightOutlined
} from '@ant-design/icons-vue'
import type { EntityRelation, ConfidenceLevel } from '@/types'
import { useUIStore } from '@/stores'

interface Props {
  relation: EntityRelation
}

const props = defineProps<Props>()

const uiStore = useUIStore()

const expanded = ref(false)

function toggleExpand() {
  expanded.value = !expanded.value
}

function handleEdit() {
  // 打开编辑弹窗
  uiStore.openRelationModal({
    id: props.relation.id,
    mode: 'edit',
    sourceEntityId: props.relation.sourceEntityId,
    sourceEntityName: props.relation.sourceEntityName,
    targetEntityId: props.relation.targetEntityId,
    targetEntityName: props.relation.targetEntityName,
    relationName: props.relation.relationName,
    relationNameCn: props.relation.relationNameCn,
    termId: props.relation.termId,
    termName: props.relation.termName
  })
}

function handleDelete() {
  // 删除逻辑
}

function getConfidenceLabel(confidence: ConfidenceLevel): string {
  const labels: Record<ConfidenceLevel, string> = {
    high: '高置信',
    mid: '中置信',
    low: '低置信'
  }
  return labels[confidence] || ''
}
</script>

<style scoped>
.relation-card {
  background: var(--bg-white);
  border: 1px solid var(--border-color);
  border-radius: 7px;
  margin-bottom: 8px;
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.relation-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.relation-card-header {
  padding: 9px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.relation-card-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.relation-source,
.relation-target {
  display: flex;
  align-items: center;
}

.entity-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-main);
  padding: 3px 8px;
  background: #F5F5F5;
  border-radius: 4px;
  white-space: nowrap;
}

.relation-arrow {
  display: flex;
  align-items: center;
  gap: 2px;
  color: var(--primary-color);
  font-size: 11px;
  flex-shrink: 0;
}

.relation-name {
  padding: 0 6px;
  font-weight: 500;
  white-space: nowrap;
}

.relation-card-right {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
}

.tag-new {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 7px;
  border-radius: 10px;
  font-size: 10px;
  background: #F4EEFF;
  color: #722ED1;
  border: 1px solid #D3B4FF;
}

.tag-confidence {
  display: inline-flex;
  align-items: center;
  padding: 1px 7px;
  border-radius: 10px;
  font-size: 10px;
  border: 1px solid;
}

.confidence-high {
  background: #E8FFEA;
  color: var(--success-color);
  border-color: #B7EB8F;
}

.confidence-mid {
  background: #FFF7E6;
  color: #FA8C16;
  border-color: #FFD591;
}

.confidence-low {
  background: #FFF1F0;
  color: var(--danger-color);
  border-color: #FFCCC7;
}

.tag-term {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 7px;
  border-radius: 10px;
  font-size: 10px;
  background: #F4EEFF;
  color: var(--primary-color);
  border: 1px solid #D3B4FF;
}

.relation-ops {
  display: flex;
  align-items: center;
  gap: 2px;
}

.relation-op-btn {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 11px;
  color: var(--text-secondary);
  transition: all 0.15s;
}

.relation-op-btn:hover {
  background: #F2F3F5;
  color: var(--primary-color);
}

.relation-op-btn.del:hover {
  color: var(--danger-color);
}

.relation-expand-icon {
  font-size: 10px;
  color: var(--text-secondary);
  transition: transform 0.2s;
}

.relation-card.expanded .relation-expand-icon {
  transform: rotate(180deg);
}

.relation-card-body {
  border-top: 1px solid var(--border-color);
  padding: 10px 12px;
  background: #FAFAFA;
}

.relation-detail {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-label {
  font-size: 10px;
  color: var(--text-secondary);
}

.detail-value {
  font-size: 12px;
  color: var(--text-main);
  font-weight: 500;
}

.term-value {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--primary-color);
}

.detail-value.confidence-high {
  color: var(--success-color);
}

.detail-value.confidence-mid {
  color: #FA8C16;
}

.detail-value.confidence-low {
  color: var(--danger-color);
}
</style>
