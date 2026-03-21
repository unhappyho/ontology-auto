<template>
  <a-modal
    v-model:open="visible"
    title="调整实体来源表"
    :width="760"
    @ok="handleConfirm"
    @cancel="handleCancel"
  >
    <div class="table-select-content">
      <div class="table-search">
        <a-input v-model:value="searchText" placeholder="搜索数据源/库/表..." allow-clear>
          <template #prefix><SearchOutlined /></template>
        </a-input>
      </div>

      <div class="table-list">
        <div
          v-for="table in filteredTables"
          :key="table.key"
          class="table-item"
          @click="toggleSelection(table.key)"
        >
          <a-checkbox :checked="selectedKeys.includes(table.key)" @change.stop="toggleSelection(table.key)" />
          <TableOutlined />
          <span class="table-code">{{ table.table }}</span>
          <span class="table-path">{{ table.dataSource }}.{{ table.database }}</span>
        </div>
        <a-empty v-if="filteredTables.length === 0 && searchText" description="未找到匹配表" />
      </div>

      <div class="custom-input-grid">
        <a-input v-model:value="customDataSource" placeholder="数据源" />
        <a-input v-model:value="customDatabase" placeholder="数据库" />
        <a-input v-model:value="customTable" placeholder="数据表" />
        <a-button type="dashed" @click="addCustomSource">
          <PlusOutlined /> 添加来源
        </a-button>
      </div>

      <div class="edge-editor" v-if="selectedSourceOptions.length > 1">
        <div class="edge-title">来源表关联边</div>
        <div v-for="(edge, idx) in edgeRows" :key="idx" class="edge-row">
          <a-select v-model:value="edge.sourceNodeId" class="edge-select" placeholder="起点表">
            <a-select-option v-for="option in selectedSourceOptions" :key="option.key" :value="option.key">{{ option.table }}</a-select-option>
          </a-select>
          <span class="edge-arrow">→</span>
          <a-select v-model:value="edge.targetNodeId" class="edge-select" placeholder="终点表">
            <a-select-option v-for="option in selectedSourceOptions" :key="option.key" :value="option.key">{{ option.table }}</a-select-option>
          </a-select>
          <a-select v-model:value="edge.relationType" class="edge-rel" placeholder="关系类型">
            <a-select-option value="1:1">1:1</a-select-option>
            <a-select-option value="1:N">1:N</a-select-option>
            <a-select-option value="N:N">N:N</a-select-option>
          </a-select>
          <a-input v-model:value="edge.joinKey" class="edge-key" placeholder="关联键(如 user_id)" />
          <a-button danger type="text" @click="removeEdgeRow(idx)"><DeleteOutlined /></a-button>
        </div>
        <a-button size="small" @click="addEdgeRow">
          <PlusOutlined /> 新增关联边
        </a-button>
      </div>
    </div>

    <template #footer>
      <a-button @click="handleCancel">取消</a-button>
      <a-button type="primary" @click="handleConfirm">保存</a-button>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  SearchOutlined,
  TableOutlined,
  PlusOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import type { DataSourceBinding, EntityTableGraph, RelationType } from '@/types'
import { useUIStore, useOntologyStore } from '@/stores'

interface TableOption {
  key: string
  dataSource: string
  database: string
  table: string
}

interface EdgeRow {
  sourceNodeId: string
  targetNodeId: string
  relationType: RelationType
  joinKey: string
}

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
const selectedKeys = ref<string[]>([])
const edgeRows = ref<EdgeRow[]>([])

const customDataSource = ref('')
const customDatabase = ref('')
const customTable = ref('')

const availableTables = ref<TableOption[]>([
  { key: 'crm_api|crm_db|t_user', dataSource: 'crm_api', database: 'crm_db', table: 't_user' },
  { key: 'crm_api|crm_db|t_user_profile', dataSource: 'crm_api', database: 'crm_db', table: 't_user_profile' },
  { key: 'crm_api|crm_db|t_user_auth', dataSource: 'crm_api', database: 'crm_db', table: 't_user_auth' },
  { key: 'crm_api|order_db|t_order', dataSource: 'crm_api', database: 'order_db', table: 't_order' },
  { key: 'crm_api|order_db|t_order_item', dataSource: 'crm_api', database: 'order_db', table: 't_order_item' },
  { key: 'billing_dw|billing_db|t_bill', dataSource: 'billing_dw', database: 'billing_db', table: 't_bill' },
  { key: 'billing_dw|billing_db|t_payment', dataSource: 'billing_dw', database: 'billing_db', table: 't_payment' },
  { key: 'log_ods|log_db|t_user_login_log', dataSource: 'log_ods', database: 'log_db', table: 't_user_login_log' }
])

const selectedSourceOptions = computed(() => {
  const keySet = new Set(selectedKeys.value)
  return availableTables.value.filter(table => keySet.has(table.key))
})

const filteredTables = computed(() => {
  if (!searchText.value) return availableTables.value
  const kw = searchText.value.toLowerCase()
  return availableTables.value.filter(t =>
    t.dataSource.toLowerCase().includes(kw) ||
    t.database.toLowerCase().includes(kw) ||
    t.table.toLowerCase().includes(kw)
  )
})

watch(
  () => visible.value,
  (isOpen) => {
    if (!isOpen) return
    const entityId = modalData.value?.entityId
    if (!entityId) return

    const sources = ontologyStore.getEntitySources(entityId)
    selectedKeys.value = sources.map(s => ontologyStore.buildBindingKey(s))

    const graph = ontologyStore.getEntityTableGraph(entityId)
    edgeRows.value = graph.edges.map(edge => ({
      sourceNodeId: ontologyStore.buildBindingKey(graph.nodes.find(n => n.id === edge.sourceNodeId)?.source || {}),
      targetNodeId: ontologyStore.buildBindingKey(graph.nodes.find(n => n.id === edge.targetNodeId)?.source || {}),
      relationType: edge.relationType || '1:N',
      joinKey: edge.joinKey || ''
    }))

    searchText.value = ''
  },
  { immediate: true }
)

function parseOptionKey(key: string): DataSourceBinding {
  return ontologyStore.parseBindingKey(key)
}

function toggleSelection(key: string) {
  const idx = selectedKeys.value.indexOf(key)
  if (idx >= 0) {
    selectedKeys.value.splice(idx, 1)
  } else {
    selectedKeys.value.push(key)
  }
}

function addCustomSource() {
  if (!customTable.value.trim()) return
  const source = customDataSource.value.trim() || 'custom_source'
  const database = customDatabase.value.trim() || 'custom_db'
  const table = customTable.value.trim()
  const key = `${source}|${database}|${table}`

  if (!availableTables.value.find(item => item.key === key)) {
    availableTables.value.unshift({ key, dataSource: source, database, table })
  }
  if (!selectedKeys.value.includes(key)) {
    selectedKeys.value.push(key)
  }

  customDataSource.value = ''
  customDatabase.value = ''
  customTable.value = ''
}

function addEdgeRow() {
  edgeRows.value.push({ sourceNodeId: '', targetNodeId: '', relationType: '1:N', joinKey: '' })
}

function removeEdgeRow(index: number) {
  edgeRows.value.splice(index, 1)
}

function handleCancel() {
  searchText.value = ''
  selectedKeys.value = []
  edgeRows.value = []
  customDataSource.value = ''
  customDatabase.value = ''
  customTable.value = ''
  uiStore.closeEntityTableModal()
}

function handleConfirm() {
  const entityId = modalData.value?.entityId
  if (!entityId) return

  const sources = selectedKeys.value.map(parseOptionKey)
  if (sources.length === 0) return

  ontologyStore.updateEntitySources(entityId, sources)

  const graphNodes: EntityTableGraph['nodes'] = sources.map(source => ({
    id: ontologyStore.buildBindingKey(source),
    source
  }))

  const graphEdges: EntityTableGraph['edges'] = edgeRows.value
    .filter(edge => edge.sourceNodeId && edge.targetNodeId && edge.sourceNodeId !== edge.targetNodeId)
    .map((edge, index) => ({
      id: `e-${index}-${edge.sourceNodeId}-${edge.targetNodeId}`,
      sourceNodeId: edge.sourceNodeId,
      targetNodeId: edge.targetNodeId,
      relationType: edge.relationType,
      joinKey: edge.joinKey || undefined
    }))

  const fallbackEdges = graphEdges.length === 0 && graphNodes.length > 1
    ? graphNodes.slice(0, -1).map((node, idx) => ({
      id: `e-auto-${idx}`,
      sourceNodeId: node.id,
      targetNodeId: graphNodes[idx + 1].id,
      relationType: '1:N' as RelationType,
      note: 'auto'
    }))
    : []

  ontologyStore.updateEntityTableGraph(entityId, {
    nodes: graphNodes,
    edges: graphEdges.length > 0 ? graphEdges : fallbackEdges
  })

  ontologyStore.triggerEntityReextract(entityId)
  handleCancel()
}
</script>

<style scoped>
.table-select-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.table-list {
  max-height: 260px;
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
  border-bottom: 1px solid var(--border-color);
}

.table-item:last-child {
  border-bottom: none;
}

.table-item:hover {
  background: var(--primary-light);
}

.table-code {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 13px;
  color: var(--text-main);
}

.table-path {
  margin-left: auto;
  font-size: 12px;
  color: var(--text-secondary);
}

.custom-input-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 8px;
}

.edge-editor {
  border-top: 1px dashed var(--border-color);
  padding-top: 10px;
}

.edge-title {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.edge-row {
  display: grid;
  grid-template-columns: 1fr 26px 1fr 110px 1fr auto;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.edge-select,
.edge-rel,
.edge-key {
  width: 100%;
}

.edge-arrow {
  text-align: center;
  color: var(--text-secondary);
}
</style>
