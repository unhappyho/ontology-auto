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
        <!-- 实体级别术语关联 -->
        <span class="entity-term-chip" @click.stop="handleEditEntityTerm" title="点击调整实体术语关联">
          <LinkOutlined />
          <span>{{ entity.termName || '—' }}</span>
        </span>
        <!-- 实体标识字段 -->
        <span class="entity-field-chip" @click.stop="handleEditEntityField" title="点击调整标识字段映射">
          <span class="chip-arrow">→</span>
          <span>{{ entityKeyFieldDisplay || '—' }}</span>
        </span>
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
        <a-button type="text" size="small" class="add-attr-btn" @click="handleShowAddRow">
          <PlusOutlined />
          新增
        </a-button>
      </div>

      <div class="source-section">
        <div class="source-header">
          <span class="source-title">涉及来源</span>
          <span v-if="hasTableJoins" class="graph-toggle-btn" @click.stop="showGraph = !showGraph">
            <ShareAltOutlined />
            {{ showGraph ? '收起关联' : '表关联关系' }}
          </span>
        </div>
        <div class="source-list">
          <span v-for="source in entitySources" :key="source.id" class="source-chip">
            {{ formatSourcePath(source) }}
          </span>
        </div>
      </div>

      <!-- 来源表关联关系（CSS 横排，按需展开） -->
      <div v-if="showGraph && hasTableJoins" class="table-graph-view">
        <template v-for="(node, idx) in tableGraph.nodes" :key="node.id">
          <div class="table-node">
            <div class="table-node-name">{{ node.source.table }}</div>
            <div class="table-node-db">{{ node.source.database }}</div>
          </div>
          <div v-if="idx < tableGraph.nodes.length - 1" class="join-connector">
            <div class="join-line"></div>
            <div class="join-label">{{ getEdgeLabel(idx) }}</div>
            <div class="join-arrow">▶</div>
          </div>
        </template>
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
                <template v-if="editingAttrEn === attr.en">
                  <div class="attr-edit-row">
                    <input
                      v-model="editingAttrForm.en"
                      class="attr-input"
                      placeholder="英文名"
                      @keydown.enter="saveEditAttr"
                      @keydown.esc="cancelEditAttr"
                    />
                    <input
                      v-model="editingAttrForm.cn"
                      class="attr-input"
                      placeholder="中文名"
                      @keydown.enter="saveEditAttr"
                      @keydown.esc="cancelEditAttr"
                    />
                  </div>
                </template>
                <template v-else>
                  <span class="attr-en">
                    {{ attr.en }}
                    <span v-if="!entity.isNew && attr.isNew" class="attr-new-badge">新</span>
                  </span>
                  <span class="attr-cn">/ {{ attr.cn }}</span>
                </template>
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
                <div class="attr-action-btns">
                  <a-button
                    type="text"
                    size="small"
                    class="attr-edit-btn"
                    @click="handleStartEditAttr(attr)"
                    v-if="editingAttrEn !== attr.en"
                  >
                    <EditOutlined />
                  </a-button>
                  <template v-if="editingAttrEn === attr.en">
                    <a-button type="text" size="small" class="attr-save-btn" @click="saveEditAttr">
                      <CheckOutlined />
                    </a-button>
                    <a-button type="text" size="small" @click="cancelEditAttr">
                      <CloseOutlined />
                    </a-button>
                  </template>
                  <a-button type="text" danger size="small" class="attr-delete-btn" @click="handleDeleteAttr(attr.en)" v-if="editingAttrEn !== attr.en">
                    <DeleteOutlined />
                  </a-button>
                </div>
              </td>
            </tr>
            <!-- 新增行 -->
            <tr v-if="showAddRow" class="attr-row add-row">
              <td class="col-checkbox"></td>
              <td class="col-term">
                <div class="attr-term add-row-chip" @click="handlePickAddTerm" title="选择关联术语">
                  <LinkOutlined />
                  <span>{{ addAttrForm.termName || '选择术语' }}</span>
                </div>
              </td>
              <td class="col-attr">
                <div class="attr-edit-row">
                  <input
                    v-model="addAttrForm.en"
                    class="attr-input"
                    placeholder="英文名"
                    ref="addEnInputRef"
                    @keydown.enter="saveAddAttr"
                    @keydown.esc="cancelAddAttr"
                  />
                  <input
                    v-model="addAttrForm.cn"
                    class="attr-input"
                    placeholder="中文名"
                    @keydown.enter="saveAddAttr"
                    @keydown.esc="cancelAddAttr"
                  />
                </div>
              </td>
              <td class="col-field">
                <div class="attr-field add-row-chip" @click="handlePickAddField" title="选择物理字段">
                  <span class="arrow">→</span>
                  <span class="field-name">{{ addAttrForm.mappedField?.name || '选择字段' }}</span>
                  <SettingOutlined class="edit-icon" />
                </div>
              </td>
              <td class="col-action">
                <div class="attr-action-btns">
                  <a-button type="text" size="small" class="attr-save-btn" @click="saveAddAttr">
                    <CheckOutlined />
                  </a-button>
                  <a-button type="text" size="small" @click="cancelAddAttr">
                    <CloseOutlined />
                  </a-button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
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
  LoadingOutlined,
  PlusOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  ShareAltOutlined
} from '@ant-design/icons-vue'
import { Popconfirm, message } from 'ant-design-vue'
import type { Entity, EntityAttr, MappingField } from '@/types'
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
const entityKeyFieldDisplay = computed(() => {
  if (!props.entity.keyField) return ''
  const src = props.entity.keyFieldSource
  if (src) {
    return `${props.entity.keyField} · ${src.database}.${src.table}`
  }
  return props.entity.keyField
})

const hasTableJoins = computed(() => tableGraph.value.edges.length > 0)
const showGraph = ref(false)

// 编辑属性状态
const editingAttrEn = ref<string | null>(null)
const editingAttrForm = ref({ en: '', cn: '' })

// 新增属性状态
const showAddRow = ref(false)
const addAttrForm = ref<{ en: string; cn: string; termId: string; termName: string; mappedField: MappingField | null }>({
  en: '', cn: '', termId: '', termName: '', mappedField: null
})
const addEnInputRef = ref<HTMLInputElement | null>(null)

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

function getEdgeLabel(nodeIdx: number): string {
  const edge = tableGraph.value.edges[nodeIdx]
  if (!edge) return ''
  const rel = edge.relationType || '1:N'
  return edge.joinKey ? `${rel} · ${edge.joinKey}` : rel
}

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

function handleEditEntityTerm() {
  uiStore.openTermLinkModal({ entityId: props.entity.id, attrName: '', isEntityLevel: true })
}

function handleEditEntityField() {
  uiStore.openFieldMappingModal({ entityId: props.entity.id, attrName: '', isEntityLevel: true })
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

// 编辑属性
function handleStartEditAttr(attr: EntityAttr) {
  editingAttrEn.value = attr.en
  editingAttrForm.value = { en: attr.en, cn: attr.cn }
}

function saveEditAttr() {
  const oldEn = editingAttrEn.value
  if (!oldEn) return
  const { en, cn } = editingAttrForm.value
  if (!en.trim()) {
    message.warning('属性英文名不能为空')
    return
  }
  ontologyStore.updateEntityAttr(props.entity.id, oldEn, en.trim(), cn.trim())
  editingAttrEn.value = null
}

function cancelEditAttr() {
  editingAttrEn.value = null
}

// 新增属性
function handleShowAddRow() {
  showAddRow.value = true
  addAttrForm.value = { en: '', cn: '', termId: '', termName: '', mappedField: null }
  nextTick(() => addEnInputRef.value?.focus())
}

function handlePickAddTerm() {
  uiStore.openTermLinkModal({
    entityId: props.entity.id,
    attrName: '__add_new__',
    onSelect: (termId: string, termName: string) => {
      addAttrForm.value.termId = termId
      addAttrForm.value.termName = termName
    }
  })
}

function handlePickAddField() {
  uiStore.openFieldMappingModal({
    entityId: props.entity.id,
    attrName: '__add_new__',
    onSelect: (field: MappingField) => {
      addAttrForm.value.mappedField = field
    }
  })
}

function saveAddAttr() {
  const { en, cn, termId, termName, mappedField } = addAttrForm.value
  if (!en.trim()) {
    message.warning('属性英文名不能为空')
    return
  }
  ontologyStore.addEntityAttr(props.entity.id, {
    en: en.trim(),
    cn: cn.trim(),
    termId: termId || undefined,
    termName: termName || undefined,
    mappedField: mappedField || undefined
  })
  message.success(`已新增属性: ${en.trim()}`)
  showAddRow.value = false
}

function cancelAddAttr() {
  showAddRow.value = false
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

.add-attr-btn {
  font-size: 11px;
  color: var(--primary-color);
  padding: 0 6px;
  height: 22px;
}

.source-section {
  margin-bottom: 10px;
}

.source-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.source-title {
  font-size: 11px;
  color: var(--text-secondary);
}

.graph-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  color: #722ed1;
  cursor: pointer;
  padding: 1px 6px;
  background: #f4eeff;
  border-radius: 3px;
  border: 1px solid #d3b4ff;
  transition: background 0.15s;
  user-select: none;
}

.graph-toggle-btn:hover {
  background: #e5dbff;
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

/* 来源表关联关系 CSS 横排图 */
.table-graph-view {
  display: flex;
  align-items: center;
  overflow-x: auto;
  padding: 12px 8px;
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  margin-bottom: 10px;
  gap: 0;
}

.table-node {
  flex-shrink: 0;
  background: #f0f5ff;
  border: 1px solid #adc6ff;
  border-radius: 6px;
  padding: 6px 12px;
  text-align: center;
  min-width: 80px;
}

.table-node-name {
  font-size: 12px;
  font-weight: 600;
  color: #1d39c4;
  white-space: nowrap;
}

.table-node-db {
  font-size: 10px;
  color: #8c8c8c;
  margin-top: 2px;
  white-space: nowrap;
}

.join-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  padding: 0 4px;
  min-width: 80px;
}

.join-line {
  width: 100%;
  height: 2px;
  background: #91d5ff;
  position: relative;
}

.join-label {
  font-size: 9px;
  color: #595959;
  white-space: nowrap;
  margin-top: 3px;
  text-align: center;
}

.join-arrow {
  font-size: 10px;
  color: #1677ff;
  margin-top: 2px;
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

.add-row {
  background: #fafff5;
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
  width: 40%;
}

.col-action {
  width: 70px;
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

.add-row-chip {
  opacity: 0.8;
  border-style: dashed;
}

.add-row-chip:hover {
  opacity: 1;
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

/* 属性操作按钮区 */
.attr-action-btns {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.attr-edit-btn,
.attr-delete-btn {
  opacity: 0;
  transition: opacity 0.2s;
}

.attr-row:hover .attr-edit-btn,
.attr-row:hover .attr-delete-btn {
  opacity: 1;
}

.attr-save-btn {
  color: var(--success-color);
}

/* 属性 inline 编辑输入 */
.attr-edit-row {
  display: flex;
  gap: 4px;
}

.attr-input {
  flex: 1;
  min-width: 0;
  font-size: 11px;
  padding: 2px 6px;
  border: 1px solid var(--primary-color);
  border-radius: 3px;
  outline: none;
  background: #fff;
  color: var(--text-main);
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

.entity-term-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  color: #722ed1;
  cursor: pointer;
  padding: 1px 6px;
  background: #f4eeff;
  border-radius: 3px;
  border: 1px solid #d3b4ff;
  flex-shrink: 0;
  white-space: nowrap;
  transition: background 0.15s;
}

.entity-term-chip:hover {
  background: #e5dbff;
}

.entity-field-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  color: var(--text-regular);
  cursor: pointer;
  padding: 1px 6px;
  background: #f0f0f0;
  border-radius: 3px;
  border: 1px solid var(--border-color);
  flex-shrink: 0;
  white-space: nowrap;
  transition: background 0.15s;
}

.entity-field-chip:hover {
  background: #e6e6e6;
}

.entity-field-chip .chip-arrow {
  color: var(--text-secondary);
}
</style>
