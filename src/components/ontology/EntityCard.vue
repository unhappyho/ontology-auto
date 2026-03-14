<template>
  <div :class="['entity-card', { expanded, 'reextract-anim': reextractAnimation }]">
    <div class="entity-card-header" @click="toggleExpand">
      <div class="entity-card-left">
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
            <DatabaseOutlined />
          </div>
          <div class="entity-op-btn" title="编辑" @click="handleEdit">
            <EditOutlined />
          </div>
          <div class="entity-op-btn del" title="移除" @click="handleDelete">
            <DeleteOutlined />
          </div>
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
      </div>
      <div class="attr-table-wrapper">
        <table class="attr-table">
          <thead>
            <tr>
              <th class="col-term">术语</th>
              <th class="col-attr">属性</th>
              <th class="col-field">物理字段</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="attr in entity.attrs" :key="attr.en" class="attr-row">
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
  EditOutlined,
  DeleteOutlined,
  DownOutlined,
  TagOutlined,
  LinkOutlined,
  DatabaseOutlined,
  TableOutlined,
  SettingOutlined
} from '@ant-design/icons-vue'
import type { Entity, EntityAttr } from '@/types'
import { useUIStore, useOntologyStore } from '@/stores'

interface Props {
  entity: Entity
  color: string
  domainLabel: string
  reextractAnimation?: boolean // 是否显示重新抽取动画
}

const props = defineProps<Props>()

const uiStore = useUIStore()
const ontologyStore = useOntologyStore()

const expanded = ref(false)

const mappingData = computed(() => ontologyStore.currentMapping)

function toggleExpand() {
  expanded.value = !expanded.value
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

function handleEdit() {
  // 编辑逻辑
}

function handleDelete() {
  // 删除逻辑
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
}

.entity-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 重新抽取动画效果 */
.entity-card.reextract-anim {
  animation: reextractPulse 2s ease-in-out;
}

@keyframes reextractPulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(114, 46, 209, 0.4);
    border-color: var(--border-color);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(114, 46, 209, 0);
    border-color: #722ED1;
    background: #F4EEFF;
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
}

.attr-table th {
  text-align: left;
  padding: 6px 10px;
  font-weight: 500;
  color: var(--text-secondary);
  font-size: 11px;
  background: #F5F5F5;
  border-bottom: 1px solid var(--border-color);
}

.attr-table td {
  padding: 8px 10px;
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
}

.attr-row:hover {
  background: #FAFAFA;
}

.col-term {
  width: 25%;
}

.col-attr {
  width: 40%;
}

.col-field {
  width: 35%;
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
  gap: 4px;
  font-size: 11px;
  color: var(--primary-color);
  cursor: pointer;
  padding: 3px 8px;
  background: #F4EEFF;
  border-radius: 4px;
  border: 1px solid #D3B4FF;
}

.attr-term:hover {
  background: #E5DBFF;
}

.attr-field {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--text-regular);
  cursor: pointer;
  padding: 3px 8px;
  background: #F0F0F0;
  border-radius: 4px;
  border: 1px solid var(--border-color);
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
</style>
