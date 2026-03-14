<template>
  <a-modal
    v-model:open="visible"
    title="物理字段映射"
    :width="520"
    @ok="handleConfirm"
    @cancel="handleCancel"
  >
    <div class="field-select-content">
      <div class="field-info">
        当前映射属性: <strong>{{ modalData?.attrName }}</strong>
      </div>
      <div class="field-search">
        <a-input
          v-model:value="searchText"
          placeholder="搜索物理字段..."
          allow-clear
        >
          <template #prefix>
            <SearchOutlined />
          </template>
        </a-input>
      </div>
      <div class="field-list">
        <div
          v-for="field in filteredFields"
          :key="field.name"
          :class="['field-item', { selected: selectedField === field.name }]"
          @click="selectedField = field.name"
        >
          <DatabaseOutlined class="field-icon" />
          <div class="field-info">
            <span class="field-name">{{ field.name }}</span>
            <span class="field-type">{{ field.type }}</span>
          </div>
          <CheckOutlined v-if="selectedField === field.name" class="check-icon" />
        </div>
        <a-empty v-if="filteredFields.length === 0 && searchText" description="未找到匹配的字段" />
      </div>
    </div>
    <template #footer>
      <a-button @click="handleCancel">取消</a-button>
      <a-button type="primary" @click="handleConfirm" :disabled="!selectedField">
        <CheckOutlined />
        确认
      </a-button>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  SearchOutlined,
  DatabaseOutlined,
  CheckOutlined
} from '@ant-design/icons-vue'
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
const selectedField = ref('')

// 从 ontologyStore 获取当前映射的物理字段
const fields = computed(() => {
  const mapping = ontologyStore.currentMapping
  if (!mapping) return []
  return mapping.fields
})

const filteredFields = computed(() => {
  if (!searchText.value) return fields.value
  const search = searchText.value.toLowerCase()
  return fields.value.filter(f =>
    f.name.toLowerCase().includes(search)
  )
})

function handleCancel() {
  searchText.value = ''
  selectedField.value = ''
  uiStore.closeFieldMappingModal()
}

function handleConfirm() {
  if (!selectedField.value) return

  // 更新属性的物理字段映射
  if (modalData.value?.attrName) {
    // 这里需要更新映射
    console.log('Selected field:', selectedField.value, 'for attr:', modalData.value.attrName)
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

.field-search {
  flex-shrink: 0;
}

.field-list {
  max-height: 320px;
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

.field-item:hover {
  background: var(--primary-light);
}

.field-item.selected {
  background: var(--primary-light);
}

.field-icon {
  font-size: 14px;
  color: var(--primary-color);
}

.field-info {
  flex: 1;
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
  background: #F2F3F5;
  border-radius: 3px;
}

.check-icon {
  color: var(--primary-color);
  font-size: 14px;
}
</style>
