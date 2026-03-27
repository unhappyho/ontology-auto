<template>
  <div :class="['entity-card', { expanded, 'reextract-anim': reextractAnimation }]">
    <div v-if="isLoading" class="entity-loading-mask">
      <LoadingOutlined spin style="font-size: 18px; color: #722ed1;" />
      <span class="entity-loading-text">重新识别中...</span>
    </div>

    <div class="entity-card-header" @click="toggleExpand">
      <div class="entity-card-left">
        <a-checkbox :checked="isSelected" @change="handleSelect" @click.stop />
        <div class="entity-type-dot" :style="{ background: color }"></div>
        <span class="entity-name">{{ entity.name }}</span>
        <span class="entity-name-cn">{{ entity.nameCn }}</span>
        <span
          v-if="entity.entity_concept_type"
          :class="['tag-concept-type', entity.entity_concept_type === '活动实体' ? 'tag-activity' : 'tag-business']"
        >{{ entity.entity_sub_class }}</span>
        <span v-if="entity.entity_concept_type === '活动实体' && entity.domain_view" class="tag-domain-view">{{ entity.domain_view }}</span>

        <div class="entity-field-chips" v-if="entityFieldChips.length > 0" @click.stop>
          <span v-for="chip in entityFieldChips" :key="chip.key" class="entity-field-chip" :title="chip.tooltip">
            <span class="chip-field">{{ chip.fieldName }}</span>
            <span class="chip-sep">·</span>
            <span class="chip-table">{{ chip.table }}</span>
          </span>
        </div>
      </div>

      <div class="entity-card-right">
        <span v-if="entity.isNew" class="tag-new"><StarFilled /> 新发现</span>
        <span v-else class="tag-existing"><CheckCircleOutlined /> 已入库</span>
        <span class="attr-count">{{ entity.attrs.length }}属性</span>
        <div class="entity-ops" @click.stop>
          <div class="entity-op-btn" title="调整所属域" @click="handleMoveDomain"><SwapOutlined /></div>
          <div class="entity-op-btn" title="调整来源表" @click="handleEditTable">
            <LoadingOutlined v-if="isLoading" spin />
            <DatabaseOutlined v-else />
          </div>
          <Popconfirm
            title="确认删除"
            :description="`确定要删除实体「${entity.nameCn || entity.name}」吗？`"
            ok-text="确定"
            cancel-text="取消"
            @confirm="handleDelete"
          >
            <div class="entity-op-btn del" title="移除"><DeleteOutlined /></div>
          </Popconfirm>
        </div>
        <DownOutlined class="entity-expand-icon" />
      </div>
    </div>

    <div class="entity-card-body" v-if="expanded">
      <div class="attr-header">
        <TagOutlined />
        属性列表（{{ entity.attrs.length }} 个）
        <div class="attr-actions" v-if="entity.attrs.length > 0">
          <a-checkbox v-model:checked="selectAllAttrs" @change="handleSelectAllAttrs">全选</a-checkbox>
          <a-button v-if="selectedAttrs.length > 0" type="text" danger size="small" @click="handleBatchDeleteAttrs">
            <DeleteOutlined />
            删除选中 ({{ selectedAttrs.length }})
          </a-button>
        </div>
      </div>

      <div class="source-section">
        <div class="source-title">涉及来源</div>
        <div class="source-list">
          <span v-for="source in entitySources" :key="source.id" class="source-chip">
            {{ formatSourcePath(source) }}
          </span>
        </div>
      </div>

      <div class="graph-section" v-if="graphNodesWithPos.length > 0">
        <div class="source-title">来源表关联关系</div>
        <div class="graph-wrap">
          <svg :viewBox="`0 0 ${graphWidth} 140`" preserveAspectRatio="xMidYMid meet" class="graph-svg">
            <line
              v-for="edge in graphEdgesWithPos"
              :key="edge.id"
              :x1="edge.x1"
              :y1="edge.y1"
              :x2="edge.x2"
              :y2="edge.y2"
              class="graph-edge"
            />
            <text
              v-for="edge in graphEdgesWithPos"
              :key="`label-${edge.id}`"
              :x="edge.mx"
              :y="edge.my"
              text-anchor="middle"
              class="graph-edge-label"
            >{{ edge.label }}</text>
            <g v-for="node in graphNodesWithPos" :key="node.id">
              <circle :cx="node.x" :cy="node.y" r="9" class="graph-node-dot" />
              <text :x="node.x" :y="node.y + 24" text-anchor="middle" class="graph-node-label">{{ node.source.table }}</text>
            </g>
          </svg>
        </div>
      </div>

      <div class="attr-table-wrapper">
        <table class="attr-table">
          <thead>
            <tr>
              <th class="col-checkbox"></th>
              <th class="col-term">术语</th>
              <th class="col-attr">属性</th>
              <th class="col-field">物理字段（含来源）</th>
              <th class="col-action">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="attr in entity.attrs" :key="attr.en" class="attr-row">
              <td class="col-checkbox">
                <a-checkbox :checked="selectedAttrs.includes(attr.en)" @change="(e: any) => handleSelectAttr(attr.en, e.target.checked)" />
              </td>
              <td class="col-term">
                <div class="attr-term" @click="handleEditTerm(attr)" title="点击调整术语关联">
                  <LinkOutlined />
                  <span>{{ attr.termName || '关联术语' }}</span>
                </div>
              </td>
              <td class="col-attr">
                <span class="attr-en">
                  {{ attr.en }}
                  <span v-if="!entity.isNew && attr.isNew" class="attr-new-badge">新</span>
                </span>
                <span class="attr-cn">/ {{ attr.cn }}</span>
              </td>
              <td class="col-field">
                <div class="attr-field" @click="handleEditField(attr)" title="点击调整物理字段映射">
                  <span class="arrow">→</span>
                  <span class="field-name">{{ getMappedFieldName(attr.en) }}</span>
                  <span class="field-source">{{ getMappedFieldSource(attr.en) }}</span>
                  <SettingOutlined class="edit-icon" />
                </div>
              </td>
              <td class="col-action">
                <a-button type="text" danger size="small" class="attr-delete-btn" @click="handleDeleteAttr(attr.en)">
                  <DeleteOutlined />
                </a-button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  StarFilled,
  CheckCircleOutlined,
  SwapOutlined,
  DeleteOutlined,
  DownOutlined,
  TagOutlined,
  LinkOutlined,
  DatabaseOutlined,
  SettingOutlined,
  LoadingOutlined
} from '@ant-design/icons-vue'
import { Popconfirm, message } from 'ant-design-vue'
import type { Entity, EntityAttr } from '@/types'
import { useUIStore, useOntologyStore } from '@/stores'

interface Props {
  entity: Entity
  color: string
  domainLabel: string
  reextractAnimation?: boolean
  defaultExpanded?: boolean
  isSelected?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:isSelected', value: boolean): void
  (e: 'select', entityId: string, value: boolean): void
}>()

const uiStore = useUIStore()
const ontologyStore = useOntologyStore()

const expanded = ref(props.defaultExpanded ?? false)
const selectedAttrs = ref<string[]>([])
const isLoading = computed(() => ontologyStore.reextractingEntityId === props.entity.id)
const entitySources = computed(() => ontologyStore.getEntitySources(props.entity.id))
const tableGraph = computed(() => ontologyStore.getEntityTableGraph(props.entity.id))

// 头部物理字段信息 chips（最多3个，去重）
const entityFieldChips = computed(() => {
  const seen = new Set<string>()
  const chips: Array<{ key: string; fieldName: string; table: string; tooltip: string }> = []
  for (const attr of props.entity.attrs) {
    if (chips.length >= 3) break
    const field = ontologyStore.getMappedFieldForAttr(props.entity.id, attr.en)
    if (!field || !field.name) continue
    const tableName = field.table || ''
    const key = `${field.name}|${tableName}`
    if (seen.has(key)) continue
    seen.add(key)
    chips.push({
      key,
      fieldName: field.name,
      table: tableName,
      tooltip: `${attr.cn}（${attr.en}）→ ${field.name}${tableName ? ' · ' + tableName : ''}`
    })
  }
  return chips
})

const graphWidth = computed(() => Math.max(300, tableGraph.value.nodes.length * 150))

const graphNodesWithPos = computed(() => {
  const nodes = tableGraph.value.nodes
  if (!nodes.length) return []
  const gap = graphWidth.value / (nodes.length + 1)
  return nodes.map((node, idx) => ({
    ...node,
    x: Math.round((idx + 1) * gap),
    y: 50
  }))
})

const graphEdgesWithPos = computed(() => {
  const nodeMap = new Map(graphNodesWithPos.value.map(node => [node.id, node]))
  return tableGraph.value.edges
    .map(edge => {
      const source = nodeMap.get(edge.sourceNodeId)
      const target = nodeMap.get(edge.targetNodeId)
      if (!source || !target) return null
      const mx = Math.round((source.x + target.x) / 2)
      const my = Math.round((source.y + target.y) / 2) - 8
      const rel = edge.relationType || '1:N'
      const label = edge.joinKey ? `${rel} · ${edge.joinKey}` : rel
      return {
        id: edge.id,
        x1: source.x,
        y1: source.y,
        x2: target.x,
        y2: target.y,
        mx,
        my,
        label
      }
    })
    .filter(Boolean) as Array<{ id: string; x1: number; y1: number; x2: number; y2: number; mx: number; my: number; label: string }>
})

const selectAllAttrs = computed({
  get: () => selectedAttrs.value.length === props.entity.attrs.length && props.entity.attrs.length > 0,
  set: (val: boolean) => {
    if (val) {
      selectedAttrs.value = props.entity.attrs.map(a => a.en)
    } else {
      selectedAttrs.value = []
    }
  }
})

function formatSourcePath(source: any): string {
  return ontologyStore.formatSourcePath(source)
}

function getMappedField(attrName: string) {
  return ontologyStore.getMappedFieldForAttr(props.entity.id, attrName)
}

function getMappedFieldName(attrName: string): string {
  return getMappedField(attrName)?.name || '选择字段'
}

function getMappedFieldSource(attrName: string): string {
  const mapped = getMappedField(attrName)
  if (!mapped) return '-'
  return ontologyStore.formatSourcePath(mapped)
}

function toggleExpand() {
  expanded.value = !expanded.value
}

function handleSelect(e: any) {
  const checked = e.target.checked
  emit('update:isSelected', checked)
  emit('select', props.entity.id, checked)
}

function handleMoveDomain() {
  uiStore.openMoveDomainModal({
    id: props.entity.id,
    name: props.entity.name,
    nameCn: props.entity.nameCn,
    domain: props.domainLabel
  })
}

function handleEditTable() {
  uiStore.openEntityTableModal({
    entityId: props.entity.id,
    entityName: props.entity.name
  })
}

function handleEditTerm(attr: EntityAttr) {
  uiStore.openTermLinkModal({
    entityId: props.entity.id,
    attrName: attr.en
  })
}

function handleEditField(attr: EntityAttr) {
  uiStore.openFieldMappingModal({
    entityId: props.entity.id,
    attrName: attr.en
  })
}

function handleSelectAttr(attrEn: string, checked: boolean) {
  if (checked) {
    if (!selectedAttrs.value.includes(attrEn)) {
      selectedAttrs.value.push(attrEn)
    }
  } else {
    const index = selectedAttrs.value.indexOf(attrEn)
    if (index > -1) {
      selectedAttrs.value.splice(index, 1)
    }
  }
}

function handleSelectAllAttrs(e: any) {
  const checked = e.target.checked
  if (checked) {
    selectedAttrs.value = props.entity.attrs.map(a => a.en)
  } else {
    selectedAttrs.value = []
  }
}

function handleDeleteAttr(attrEn: string) {
  ontologyStore.deleteEntityAttr(props.entity.id, attrEn)
  message.success(`已删除属性: ${attrEn}`)
}

function handleBatchDeleteAttrs() {
  const count = selectedAttrs.value.length
  ontologyStore.batchDeleteEntityAttrs(props.entity.id, selectedAttrs.value)
  message.success(`已删除 ${count} 个属性`)
  selectedAttrs.value = []
}

function handleDelete() {
  ontologyStore.deleteEntity(props.entity.id)
  message.success(`已删除实体: ${props.entity.nameCn || props.entity.name}`)
}
</script>

<style scoped>
.entity-card {
  background: var(--bg-white);
  border: 1px solid var(--border-color);
  border-radius: 7px;
  margin-bottom: 8px;
  overflow: hidden;
  transition: box-shadow 0.2s;
  position: relative;
}

.entity-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.entity-card.reextract-anim {
  animation: reextractPulse 0.8s ease-in-out 3;
  position: relative;
}

.entity-card.reextract-anim::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 3px;
  border-radius: 7px 7px 0 0;
  background: linear-gradient(90deg, transparent, #722ed1, transparent);
  animation: scanLine 0.8s ease-in-out 3;
  z-index: 1;
}

@keyframes scanLine {
  0% { width: 0; left: 0; }
  50% { width: 60%; left: 20%; }
  100% { width: 0; left: 100%; }
}

@keyframes reextractPulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(114, 46, 209, 0.5);
    border-color: var(--border-color);
    background: #fff;
  }
  50% {
    box-shadow: 0 0 0 16px rgba(114, 46, 209, 0.15);
    border-color: #722ed1;
    border-width: 2px;
    background: #edd5ff;
  }
}

.entity-card-header {
  padding: 9px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.entity-card-left {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}

.entity-type-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.entity-name {
  font-size: 13px;
  font-weight: 500;
}

.entity-name-cn {
  font-size: 11px;
  color: var(--text-secondary);
}

.tag-concept-type {
  display: inline-flex;
  align-items: center;
  padding: 0 5px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 500;
  flex-shrink: 0;
}

.tag-business {
  background: #e6f4ff;
  color: #1677ff;
  border: 1px solid #91caff;
}

.tag-activity {
  background: #f4eeff;
  color: #722ed1;
  border: 1px solid #d3b4ff;
}

.tag-domain-view {
  display: inline-flex;
  align-items: center;
  padding: 0 5px;
  border-radius: 3px;
  font-size: 10px;
  color: #52c41a;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  flex-shrink: 0;
}

.entity-card-right {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
}

.tag-new,
.tag-existing {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 7px;
  border-radius: 10px;
  font-size: 11px;
}

.tag-new {
  background: #f4eeff;
  color: #722ed1;
  border: 1px solid #d3b4ff;
}

.tag-existing {
  background: #e8ffea;
  color: var(--success-color);
  border: 1px solid #b7eb8f;
}

.attr-count {
  font-size: 10px;
  color: var(--text-secondary);
}

.entity-ops {
  display: flex;
  align-items: center;
  gap: 2px;
}

.entity-op-btn {
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

.entity-op-btn:hover {
  background: #f2f3f5;
  color: var(--primary-color);
}

.entity-op-btn.del:hover {
  color: var(--danger-color);
}

.entity-expand-icon {
  font-size: 10px;
  color: var(--text-secondary);
  transition: transform 0.2s;
}

.entity-card.expanded .entity-expand-icon {
  transform: rotate(180deg);
}

.entity-card-body {
  border-top: 1px solid var(--border-color);
  padding: 10px 12px;
  background: #fafafa;
}

.attr-header {
  font-size: 10px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.attr-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.source-section,
.graph-section {
  margin-bottom: 10px;
}

.source-title {
  font-size: 11px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.source-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.source-chip {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  background: #f0f5ff;
  border: 1px solid #adc6ff;
  color: #1d39c4;
}

.graph-wrap {
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: #fff;
  overflow-x: auto;
}

.graph-svg {
  width: 100%;
  min-width: 280px;
  height: 140px;
}

.graph-edge {
  stroke: #91d5ff;
  stroke-width: 2;
}

.graph-edge-label {
  font-size: 10px;
  fill: #595959;
}

.graph-node-dot {
  fill: #1677ff;
}

.graph-node-label {
  font-size: 11px;
  fill: #595959;
}

.attr-delete-btn {
  opacity: 0;
  transition: opacity 0.2s;
}

.attr-row:hover .attr-delete-btn {
  opacity: 1;
}

.attr-table-wrapper {
  overflow-x: auto;
}

.attr-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  table-layout: fixed;
}

.attr-table th {
  text-align: left;
  padding: 5px 8px;
  font-weight: 500;
  color: var(--text-secondary);
  font-size: 11px;
  background: #f5f5f5;
  border-bottom: 1px solid var(--border-color);
}

.attr-table td {
  padding: 6px 8px;
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
}

.attr-row:hover {
  background: #fafafa;
}

.col-checkbox {
  width: 32px;
  text-align: center;
}

.col-term {
  width: 20%;
}

.col-attr {
  width: 25%;
}

.col-field {
  width: 45%;
}

.col-action {
  width: 50px;
  text-align: center;
}

.attr-en {
  font-size: 12px;
  color: var(--text-main);
  font-weight: 500;
}

.attr-new-badge {
  display: inline-block;
  padding: 0 4px;
  margin-left: 4px;
  font-size: 9px;
  font-weight: 500;
  color: #722ed1;
  background: #f4eeff;
  border-radius: 3px;
}

.attr-cn {
  font-size: 11px;
  color: var(--text-secondary);
  margin-left: 2px;
}

.attr-term {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  color: var(--primary-color);
  cursor: pointer;
  padding: 2px 6px;
  background: #f4eeff;
  border-radius: 3px;
  border: 1px solid #d3b4ff;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.attr-term:hover {
  background: #e5dbff;
}

.attr-field {
  display: grid;
  grid-template-columns: auto auto 1fr auto;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: var(--text-regular);
  cursor: pointer;
  padding: 4px 6px;
  background: #f0f0f0;
  border-radius: 3px;
  border: 1px solid var(--border-color);
}

.field-name {
  font-weight: 600;
  color: #262626;
}

.field-source {
  color: #8c8c8c;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.attr-field:hover {
  background: #e6e6e6;
}

.attr-field .arrow {
  color: var(--text-secondary);
}

.attr-field .edit-icon {
  margin-left: 4px;
  font-size: 10px;
  color: var(--text-secondary);
}

.entity-loading-mask {
  position: absolute;
  inset: 0;
  background: rgba(249, 240, 255, 0.88);
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  z-index: 10;
  animation: mask-fadein 0.2s ease;
}

@keyframes mask-fadein {
  from { opacity: 0; }
  to { opacity: 1; }
}

.entity-loading-text {
  font-size: 12px;
  color: #595959;
}

/* 头部物理字段 chips */
.entity-field-chips {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 4px;
  flex-shrink: 1;
  min-width: 0;
  overflow: hidden;
}

.entity-field-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 7px;
  border-radius: 3px;
  font-size: 10px;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  color: #595959;
  white-space: nowrap;
  flex-shrink: 0;
  cursor: default;
}

.chip-field {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 10px;
  color: #262626;
  font-weight: 500;
}

.chip-sep {
  color: #bfbfbf;
}

.chip-table {
  font-size: 10px;
  color: #8c8c8c;
}
</style>
