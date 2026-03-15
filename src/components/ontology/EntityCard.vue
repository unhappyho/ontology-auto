<template>
  <div :class="['entity-card', { expanded, 'reextract-anim': reextractAnimation }]">
    <!-- 单卡片重识别遮罩 -->
    <div v-if="isLoading" class="entity-loading-mask">
      <LoadingOutlined spin style="font-size: 18px; color: #722ed1;" />
      <span class="entity-loading-text">重新识别中...</span>
    </div>
    <div class="entity-card-header" @click="toggleExpand">
      <div class="entity-card-left">
        <a-checkbox
          :checked="isSelected"
          @change="handleSelect"
          @click.stop
        />
        <div class="entity-type-dot" :style="{ background: color }"></div>
        <span class="entity-name">{{ entity.name }}</span>
        <span class="entity-name-cn">{{ entity.nameCn }}</span>
      </div>
      <div class="entity-card-right">
        <span v-if="entity.isNew" class="tag-new">
          <StarFilled />
          新发现
        </span>
        <span v-else class="tag-existing">
          <CheckCircleOutlined />
          已入库
        </span>
        <span class="attr-count">{{ entity.attrs.length }}属性</span>
        <div class="entity-ops" @click.stop>
          <div class="entity-op-btn" title="调整所属域" @click="handleMoveDomain">
            <SwapOutlined />
          </div>
          <div class="entity-op-btn" title="调整库表" @click="handleEditTable">
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
            <div class="entity-op-btn del" title="移除">
              <DeleteOutlined />
            </div>
          </Popconfirm>
        </div>
        <DownOutlined class="entity-expand-icon" />
      </div>
    </div>
    <div class="entity-card-body" v-if="expanded">
      <div class="attr-header">
        <TagOutlined />
        属性列表（{{ entity.attrs.length }} 个）
        <span v-if="entity.tableName" class="table-name">
          <TableOutlined />
          {{ entity.tableName }}
        </span>
        <div class="attr-actions" v-if="entity.attrs.length > 0">
          <a-checkbox v-model:checked="selectAllAttrs" @change="handleSelectAllAttrs">全选</a-checkbox>
          <a-button
            v-if="selectedAttrs.length > 0"
            type="text"
            danger
            size="small"
            @click="handleBatchDeleteAttrs"
          >
            <DeleteOutlined />
            删除选中 ({{ selectedAttrs.length }})
          </a-button>
        </div>
      </div>
      <div class="attr-table-wrapper">
        <table class="attr-table">
          <thead>
            <tr>
              <th class="col-checkbox"></th>
              <th class="col-term">术语</th>
              <th class="col-attr">属性</th>
              <th class="col-field">物理字段</th>
              <th class="col-action">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="attr in entity.attrs" :key="attr.en" class="attr-row">
              <td class="col-checkbox">
                <a-checkbox
                  :checked="selectedAttrs.includes(attr.en)"
                  @change="(e: any) => handleSelectAttr(attr.en, e.target.checked)"
                />
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
                  <span>{{ getMappedField(attr.en) || '选择字段' }}</span>
                  <SettingOutlined class="edit-icon" />
                </div>
              </td>
              <td class="col-action">
                <a-button
                  type="text"
                  danger
                  size="small"
                  class="attr-delete-btn"
                  @click="handleDeleteAttr(attr.en)"
                >
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
  TableOutlined,
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
  reextractAnimation?: boolean // 是否显示重新抽取动画
  defaultExpanded?: boolean // 是否默认展开
  isSelected?: boolean // 是否被选中
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:isSelected', value: boolean): void
  (e: 'select', entityId: string, value: boolean): void
}>()

const uiStore = useUIStore()
const ontologyStore = useOntologyStore()

const expanded = ref(props.defaultExpanded ?? false)

// 属性选择状态
const selectedAttrs = ref<string[]>([])
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

// 当前实体是否正在刷新（通过计算属性监听 store 状态）
const isLoading = computed(() => ontologyStore.reextractingEntityId === props.entity.id)

const mappingData = computed(() => ontologyStore.currentMapping)

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
  // 打开库表编辑弹窗
  // loading 动效会在弹窗确认后由 store 触发
  uiStore.openEntityTableModal({
    entityId: props.entity.id,
    entityName: props.entity.name
  })
}

function handleEditTerm(attr: EntityAttr) {
  // 打开术语选择弹窗
  uiStore.openTermLinkModal({
    entityId: props.entity.id,
    attrName: attr.en
  })
}

function handleEditField(attr: EntityAttr) {
  // 打开物理字段选择弹窗
  uiStore.openFieldMappingModal({
    entityId: props.entity.id,
    attrName: attr.en
  })
}

function getMappedField(attrName: string): string | null {
  if (!mappingData.value) return (props.entity.attrs.find(a => a.en === attrName) as any)?.mappedField || null

  const links = mappingData.value.links
  const attrs = mappingData.value.attrs
  const fields = mappingData.value.fields

  for (const link of links) {
    const mappingAttr = attrs[link.attrIndex]
    if (mappingAttr && mappingAttr.name === attrName) {
      const field = fields[link.fieldIndex]
      return field ? field.name : null
    }
  }
  return (props.entity.attrs.find(a => a.en === attrName) as any)?.mappedField || null
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

/* 重新抽取动画效果 */
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
    border-color: #722ED1;
    border-width: 2px;
    background: #EDD5FF;
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

.entity-card-right {
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
  font-size: 11px;
  background: #F4EEFF;
  color: #722ED1;
  border: 1px solid #D3B4FF;
}

.tag-existing {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 7px;
  border-radius: 10px;
  font-size: 11px;
  background: #E8FFEA;
  color: var(--success-color);
  border: 1px solid #B7EB8F;
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
  background: #F2F3F5;
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
  background: #FAFAFA;
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

.attr-delete-btn {
  opacity: 0;
  transition: opacity 0.2s;
}

.attr-row:hover .attr-delete-btn {
  opacity: 1;
}

.table-name {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  background: #E6F7FF;
  border: 1px solid #91D5FF;
  border-radius: 4px;
  font-size: 10px;
  color: var(--primary-color);
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
  background: #F5F5F5;
  border-bottom: 1px solid var(--border-color);
}

.attr-table td {
  padding: 6px 8px;
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
}

.attr-row:hover {
  background: #FAFAFA;
}

.col-checkbox {
  width: 32px;
  text-align: center;
}

.col-term {
  width: 25%;
}

.col-attr {
  width: 35%;
}

.col-field {
  width: 30%;
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
  color: #722ED1;
  background: #F4EEFF;
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
  background: #F4EEFF;
  border-radius: 3px;
  border: 1px solid #D3B4FF;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.attr-term:hover {
  background: #E5DBFF;
}

.attr-field {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  color: var(--text-regular);
  cursor: pointer;
  padding: 2px 6px;
  background: #F0F0F0;
  border-radius: 3px;
  border: 1px solid var(--border-color);
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.attr-field:hover {
  background: #E6E6E6;
}

.attr-field .arrow {
  color: var(--text-secondary);
}

.attr-field .edit-icon {
  margin-left: 4px;
  font-size: 10px;
  color: var(--text-secondary);
}

/* ---- 单卡片重识别遮罩 ---- */
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
</style>
