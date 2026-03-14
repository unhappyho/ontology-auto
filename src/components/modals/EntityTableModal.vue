<template>
  <a-modal
    v-model:open="visible"
    title="调整实体库表"
    :width="480"
    @ok="handleConfirm"
    @cancel="handleCancel"
  >
    <div class="table-select-content">
      <div class="table-search">
        <a-input
          v-model:value="searchText"
          placeholder="搜索库表名称..."
          allow-clear
        >
          <template #prefix>
            <SearchOutlined />
          </template>
        </a-input>
      </div>
      <div class="table-list">
        <div
          v-for="table in filteredTables"
          :key="table"
          :class="['table-item', { selected: selectedTable === table }]"
          @click="selectedTable = table"
        >
          <TableOutlined />
          <span class="table-name">{{ table }}</span>
        </div>
        <a-empty v-if="filteredTables.length === 0 && searchText" description="未找到匹配的库表" />
      </div>
      <div class="custom-input">
        <a-input
          v-model:value="customTable"
          placeholder="或输入新的库表名"
          @focus="selectedTable = ''"
        >
          <template #prefix>
            <PlusOutlined />
          </template>
        </a-input>
      </div>
    </div>
    <template #footer>
      <a-button @click="handleCancel">取消</a-button>
      <a-button type="primary" @click="handleConfirm">
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
  TableOutlined,
  PlusOutlined,
  CheckOutlined
} from '@ant-design/icons-vue'
import { useUIStore, useOntologyStore } from '@/stores'

const uiStore = useUIStore()
const ontologyStore = useOntologyStore()

const visible = computed({
  get: () => uiStore.entityTableModalVisible,
  set: (val) => {
    if (!val) uiStore.closeEntityTableModal()
  }
})

const modalData = computed(() => uiStore.entityTableModalData)

const searchText = ref('')
const selectedTable = ref('')
const customTable = ref('')

// 模拟库表列表（实际应该从后端获取）
const availableTables = ref([
  't_user',
  't_user_profile',
  't_user_auth',
  't_user_contact',
  't_user_address',
  't_user_account',
  't_order',
  't_order_item',
  't_payment',
  't_product',
  't_product_spec',
  't_bill',
  't_bill_detail'
])

const filteredTables = computed(() => {
  if (!searchText.value) return availableTables.value
  return availableTables.value.filter(t =>
    t.toLowerCase().includes(searchText.value.toLowerCase())
  )
})

function handleCancel() {
  searchText.value = ''
  selectedTable.value = ''
  customTable.value = ''
  uiStore.closeEntityTableModal()
}

function handleConfirm() {
  const tableName = customTable.value || selectedTable.value
  if (!tableName) return

  // 更新实体的库表名
  if (modalData.value?.entityId) {
    ontologyStore.updateEntityTableName(modalData.value.entityId, tableName)
  }

  handleCancel()
}
</script>

<style scoped>
.table-select-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.table-search {
  flex-shrink: 0;
}

.table-list {
  max-height: 240px;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  border-radius: 6px;
}

.table-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.15s;
  border-bottom: 1px solid var(--border-color);
}

.table-item:last-child {
  border-bottom: none;
}

.table-item:hover {
  background: var(--primary-light);
}

.table-item.selected {
  background: var(--primary-light);
  color: var(--primary-color);
}

.table-item .table-name {
  font-size: 13px;
}

.custom-input {
  flex-shrink: 0;
}
</style>
