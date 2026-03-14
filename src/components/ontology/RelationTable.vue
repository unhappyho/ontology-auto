<template>
  <div class="relation-table">
    <div class="table-toolbar">
      <a-button type="primary" size="small" @click="handleAddRelation">
        <PlusOutlined />
        添加关联
      </a-button>
    </div>

    <a-table
      :dataSource="relations"
      :columns="columns"
      :pagination="false"
      :rowKey="(record: EntityRelation) => record.id"
      size="small"
      class="relation-a-table"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'source'">
          <span class="entity-tag">{{ record.sourceEntityName }}</span>
        </template>
        <template v-else-if="column.key === 'relation'">
          <span class="relation-name">
            {{ record.relationNameCn }}
            <span class="relation-en">({{ record.relationName }})</span>
          </span>
          <span v-if="record.relationType" class="relation-type-badge">
            {{ getRelationTypeLabel(record.relationType) }}
          </span>
          <span v-if="record.isRequired" class="required-badge">必填</span>
        </template>
        <template v-else-if="column.key === 'target'">
          <span class="entity-tag">{{ record.targetEntityName }}</span>
        </template>
        <template v-else-if="column.key === 'confidence'">
          <span v-if="record.confidence" :class="['confidence-tag', record.confidence]">
            {{ getConfidenceLabel(record.confidence) }}
          </span>
          <span v-else class="text-muted">-</span>
        </template>
        <template v-else-if="column.key === 'action'">
          <div class="action-buttons">
            <a-button type="link" size="small" @click="handleEdit(record)">
              <EditOutlined />
            </a-button>
            <a-button type="link" size="small" danger @click="handleDelete(record.id)">
              <DeleteOutlined />
            </a-button>
          </div>
        </template>
      </template>

      <template #expandedRowRender="{ record }">
        <div class="expanded-content">
          <div class="detail-row">
            <span class="detail-label">关系分类：</span>
            <span class="detail-value">{{ record.relationCategory === 'entity' ? '实体类型关系' : '事件类型关系' }}</span>
          </div>
          <div class="detail-row" v-if="record.termName">
            <span class="detail-label">术语：</span>
            <span class="detail-value term-value">
              <LinkOutlined />
              {{ record.termName }}
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">新发现：</span>
            <span :class="['detail-value', record.isNew ? 'text-success' : 'text-muted']">
              {{ record.isNew ? '是' : '否' }}
            </span>
          </div>
        </div>
      </template>
    </a-table>

    <div v-if="relations.length === 0" class="table-empty">
      <InboxOutlined style="font-size: 36px; color: #ccc;" />
      <div>暂无关联关系</div>
      <a-button type="primary" size="small" @click="handleAddRelation">
        <PlusOutlined />
        添加第一个关联
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { PlusOutlined, EditOutlined, DeleteOutlined, LinkOutlined, InboxOutlined } from '@ant-design/icons-vue'
import { useOntologyStore, useUIStore } from '@/stores'
import type { EntityRelation, ConfidenceLevel, RelationType } from '@/types'

const ontologyStore = useOntologyStore()
const uiStore = useUIStore()

const relations = computed(() => ontologyStore.currentRelations)

const columns = [
  { title: '源实体', key: 'source', width: '20%' },
  { title: '关系', key: 'relation', width: '30%' },
  { title: '目标实体', key: 'target', width: '20%' },
  { title: '置信度', key: 'confidence', width: '15%' },
  { title: '操作', key: 'action', width: '15%' }
]

function getRelationTypeLabel(type: RelationType): string {
  const labels: Record<RelationType, string> = {
    '1:1': '1:1',
    '1:N': '1:N',
    'N:N': 'N:N'
  }
  return labels[type] || ''
}

function getConfidenceLabel(confidence: ConfidenceLevel): string {
  const labels: Record<ConfidenceLevel, string> = {
    high: '高',
    mid: '中',
    low: '低'
  }
  return labels[confidence] || ''
}

function handleAddRelation() {
  const ents = ontologyStore.currentEntities
  if (ents.length >= 2) {
    uiStore.openRelationModal({
      mode: 'add',
      sourceEntityId: ents[0].id,
      sourceEntityName: ents[0].nameCn || ents[0].name,
      targetEntityId: ents[1].id,
      targetEntityName: ents[1].nameCn || ents[1].name,
      relationName: '',
      relationNameCn: ''
    })
  }
}

function handleEdit(record: EntityRelation) {
  uiStore.openRelationModal({
    id: record.id,
    mode: 'edit',
    sourceEntityId: record.sourceEntityId,
    sourceEntityName: record.sourceEntityName,
    targetEntityId: record.targetEntityId,
    targetEntityName: record.targetEntityName,
    relationName: record.relationName,
    relationNameCn: record.relationNameCn,
    termId: record.termId,
    termName: record.termName
  })
}

function handleDelete(id: string) {
  ontologyStore.deleteRelation(id)
}
</script>

<style scoped>
.relation-table {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.table-toolbar {
  display: flex;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border-color);
}

.relation-a-table {
  flex: 1;
  overflow: auto;
}

.entity-tag {
  display: inline-block;
  padding: 2px 8px;
  background: #F5F5F5;
  border-radius: 4px;
  font-size: 12px;
}

.relation-name {
  font-size: 12px;
  font-weight: 500;
}

.relation-en {
  font-weight: normal;
  color: var(--text-secondary);
  font-size: 11px;
}

.relation-type-badge {
  display: inline-block;
  margin-left: 6px;
  padding: 1px 5px;
  font-size: 10px;
  background: #E6F7FF;
  color: var(--primary-color);
  border-radius: 3px;
}

.required-badge {
  display: inline-block;
  margin-left: 4px;
  padding: 1px 5px;
  font-size: 10px;
  background: #FFF1F0;
  color: var(--danger-color);
  border-radius: 3px;
}

.confidence-tag {
  display: inline-block;
  padding: 2px 6px;
  font-size: 11px;
  border-radius: 3px;
}

.confidence-tag.high {
  background: #E8FFEA;
  color: var(--success-color);
}

.confidence-tag.mid {
  background: #FFF7E6;
  color: #FA8C16;
}

.confidence-tag.low {
  background: #FFF1F0;
  color: var(--danger-color);
}

.action-buttons {
  display: flex;
  gap: 4px;
}

.text-muted {
  color: var(--text-secondary);
}

.text-success {
  color: var(--success-color);
}

.expanded-content {
  padding: 8px 12px;
  background: #FAFAFA;
  display: flex;
  gap: 20px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.detail-label {
  font-size: 11px;
  color: var(--text-secondary);
}

.detail-value {
  font-size: 12px;
  color: var(--text-main);
}

.term-value {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--primary-color);
}

.table-empty {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--text-secondary);
  font-size: 13px;
}
</style>
