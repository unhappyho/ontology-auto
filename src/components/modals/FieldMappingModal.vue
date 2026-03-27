<template>
  <a-modal
    v-model:open="visible"
    title="物理字段映射"
    :width="640"
    @ok="handleConfirm"
    @cancel="handleCancel"
  >
    <div class="field-select-content">
      <div class="field-info">
        {{ modalData?.isEntityLevel ? '实体标识字段映射' : `当前映射属性: ${modalData?.attrName}` }}
      </div>
      <div class="field-search">
        <a-input v-model:value="searchText" placeholder="搜索字段名/来源..." allow-clear>
          <template #prefix><SearchOutlined /></template>
        </a-input>
      </div>
      <div class="field-list">
        <div
          v-for="field in filteredFields"
          :key="fieldKey(field)"
          :class="['field-item', { selected: selectedFieldKey === fieldKey(field) }]"
          @click="selectedFieldKey = fieldKey(field)"
        >
          <DatabaseOutlined class="field-icon" />
          <div class="field-main">
            <div class="field-top">
              <span class="field-name">{{ field.name }}</span>
              <span class="field-type">{{ field.type }}</span>
            </div>
            <div class="field-source">{{ ontologyStore.formatSourcePath(field) }}</div>
          </div>
          <CheckOutlined v-if="selectedFieldKey === fieldKey(field)" class="check-icon" />
        </div>
        <a-empty v-if="filteredFields.length === 0" description="未找到匹配字段" />
      </div>
    </div>
    <template #footer>
      <a-button @click="handleCancel">取消</a-button>
      <a-button type="primary" @click="handleConfirm" :disabled="!selectedFieldKey">确认</a-button>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { SearchOutlined, DatabaseOutlined, CheckOutlined } from '@ant-design/icons-vue'
import type { MappingField } from '@/types'
import { useUIStore, useOntologyStore } from '@/stores'

const uiStore = useUIStore()
const ontologyStore = useOntologyStore()

const visible = computed({
  get: () => uiStore.fieldMappingModalVisible,
  set: (val) => {
    if (!val) uiStore.closeFieldMappingModal()
  }
})

const modalData = computed(() => uiStore.fieldMappingModalData)

const searchText = ref('')
const selectedFieldKey = ref('')

const fields = computed<MappingField[]>(() => ontologyStore.currentMapping?.fields || [])

const filteredFields = computed(() => {
  const keyword = searchText.value.trim().toLowerCase()
  if (!keyword) return fields.value
  return fields.value.filter(field => {
    const sourcePath = ontologyStore.formatSourcePath(field).toLowerCase()
    return field.name.toLowerCase().includes(keyword) || sourcePath.includes(keyword)
  })
})

watch(
  () => visible.value,
  (isOpen) => {
    if (!isOpen) return
    searchText.value = ''
    selectedFieldKey.value = ''

    const entityId = modalData.value?.entityId
    if (!entityId) return

    if (modalData.value?.isEntityLevel) {
      const keyField = ontologyStore.getEntityKeyField(entityId)
      if (keyField) selectedFieldKey.value = fieldKey(keyField)
    } else {
      const attrName = modalData.value?.attrName
      if (!attrName) return
      const currentField = ontologyStore.getMappedFieldForAttr(entityId, attrName)
      if (currentField) selectedFieldKey.value = fieldKey(currentField)
    }
  },
  { immediate: true }
)

function fieldKey(field: MappingField): string {
  return `${field.name}|${field.type}|${ontologyStore.formatSourcePath(field)}`
}

function findSelectedField(): MappingField | null {
  return fields.value.find(field => fieldKey(field) === selectedFieldKey.value) || null
}

function handleCancel() {
  searchText.value = ''
  selectedFieldKey.value = ''
  uiStore.closeFieldMappingModal()
}

function handleConfirm() {
  const entityId = modalData.value?.entityId
  const selectedField = findSelectedField()
  if (!entityId || !selectedField) return

  if (modalData.value?.onSelect) {
    modalData.value.onSelect(selectedField)
  } else if (modalData.value?.isEntityLevel) {
    ontologyStore.updateEntityKeyField(entityId, selectedField)
  } else {
    const attrName = modalData.value?.attrName
    if (!attrName) return
    ontologyStore.updateEntityAttrMappedField(entityId, attrName, selectedField)
  }
  handleCancel()
}
</script>

<style scoped>
.field-select-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field-info {
  font-size: 13px;
  color: var(--text-secondary);
}

.field-info strong {
  color: var(--text-main);
}

.field-list {
  max-height: 360px;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  border-radius: 6px;
}

.field-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  cursor: pointer;
  transition: all 0.15s;
  border-bottom: 1px solid var(--border-color);
}

.field-item:last-child {
  border-bottom: none;
}

.field-item:hover,
.field-item.selected {
  background: var(--primary-light);
}

.field-icon {
  font-size: 14px;
  color: var(--primary-color);
}

.field-main {
  flex: 1;
  min-width: 0;
}

.field-top {
  display: flex;
  align-items: center;
  gap: 8px;
}

.field-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-main);
}

.field-type {
  font-size: 11px;
  color: var(--text-secondary);
  padding: 2px 6px;
  background: #f2f3f5;
  border-radius: 3px;
}

.field-source {
  margin-top: 3px;
  font-size: 11px;
  color: #8c8c8c;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.check-icon {
  color: var(--primary-color);
  font-size: 14px;
}
</style>
