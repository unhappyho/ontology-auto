<template>
  <div class="task-list-card">
    <div class="section-header">
      <div class="section-title">本体构建任务列表</div>
      <div class="section-actions">
        <a-button size="small">
          <FilterOutlined />
          筛选
        </a-button>
        <a-button type="primary" size="small" @click="handleCreate">
          <PlusOutlined />
          新建构建任务
        </a-button>
      </div>
    </div>

    <div class="table-scroll">
      <a-table
        :columns="columns"
        :data-source="tasks"
        :pagination="false"
        size="small"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <span style="font-weight: 500;">{{ record.name }}</span>
          </template>
          <template v-else-if="column.key === 'dataSourceType'">
            <span class="data-source-type">
              <component :is="getIcon(record.dataSourceIcon)" :style="{ color: record.dataSourceColor }" />
              {{ record.dataSourceType }}
            </span>
          </template>
          <template v-else-if="column.key === 'collectMode'">
            <StatusBadge v-if="record.collectMode === '批量全量'" status="pending" :text="record.collectMode" />
            <span v-else>{{ record.collectMode }}</span>
          </template>
          <template v-else-if="column.key === 'status'">
            <StatusBadge :status="getStatusType(record.status)" :text="record.statusText" />
          </template>
          <template v-else-if="column.key === 'lastCollectTime'">
            <span style="color: var(--text-secondary); font-size: 12px;">{{ record.lastCollectTime }}</span>
          </template>
          <template v-else-if="column.key === 'actions'">
            <span class="action-link" @click="handleEdit(record)">编辑</span>
            <span class="action-link" style="color: var(--text-secondary);">日志</span>
            <span v-if="record.status === 'listening'" class="action-link danger">停止</span>
            <span v-if="record.status === 'pending'" class="action-link danger">删除</span>
            <span v-if="record.status === 'error'" class="action-link" @click="handleEdit(record)">重试</span>
          </template>
        </template>
      </a-table>
    </div>

    <div class="pagination-container">
      <span>共 {{ total }} 个构建任务，每页 {{ pageSize }} 条</span>
      <div class="pagination">
        <div class="page-item"><LeftOutlined /></div>
        <div class="page-item active">1</div>
        <div class="page-item">2</div>
        <div class="page-item"><RightOutlined /></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  FilterOutlined,
  PlusOutlined,
  LeftOutlined,
  RightOutlined,
  DatabaseOutlined,
  FilePdfOutlined,
  ThunderboltOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
  AppstoreAddOutlined,
  AccountBookOutlined,
  CustomerServiceOutlined,
  ApiOutlined
} from '@ant-design/icons-vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import type { Task } from '@/types'

interface Props {
  tasks: Task[]
  total?: number
  pageSize?: number
}

const _props = withDefaults(defineProps<Props>(), {
  total: 12,
  pageSize: 9
})
const props = _props
const tasks = computed(() => props.tasks)
const total = computed(() => props.total)
const pageSize = computed(() => props.pageSize)

const router = useRouter()

const columns = [
  { title: '任务名称', key: 'name', dataIndex: 'name' },
  { title: '数据源类型', key: 'dataSourceType', dataIndex: 'dataSourceType' },
  { title: '采集方式', key: 'collectMode', dataIndex: 'collectMode' },
  { title: '状态', key: 'status', dataIndex: 'status' },
  { title: '最后采集时间', key: 'lastCollectTime', dataIndex: 'lastCollectTime' },
  { title: '操作', key: 'actions', align: 'right' as const }
]

function getIcon(iconName: string) {
  const iconMap: Record<string, any> = {
    DatabaseOutlined,
    FilePdfOutlined,
    ThunderboltOutlined,
    EnvironmentOutlined,
    ExclamationCircleOutlined,
    AppstoreAddOutlined,
    AccountBookOutlined,
    CustomerServiceOutlined,
    ApiOutlined
  }
  return iconMap[iconName] || DatabaseOutlined
}

function getStatusType(status: string): 'success' | 'processing' | 'error' | 'pending' | 'listening' {
  const statusMap: Record<string, 'success' | 'processing' | 'error' | 'pending' | 'listening'> = {
    success: 'success',
    processing: 'processing',
    error: 'error',
    pending: 'pending',
    listening: 'listening'
  }
  return statusMap[status] || 'pending'
}

function handleCreate() {
  router.push('/task')
}

function handleEdit(task: Task) {
  router.push(`/task/${task.id}`)
}
</script>

<style scoped>
.task-list-card {
  background-color: var(--bg-white);
  border-radius: 8px;
  padding: 16px 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  border: 1px solid var(--border-color);
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.table-scroll {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.data-source-type {
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-link {
  color: var(--primary-color);
  cursor: pointer;
  margin-left: 16px;
  font-size: 13px;
  user-select: none;
}

.action-link:hover {
  opacity: 0.8;
  text-decoration: underline;
}

.action-link.danger {
  color: var(--danger-color);
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 12px;
  flex-shrink: 0;
}

.pagination {
  display: flex;
  gap: 6px;
}

.page-item {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  background: var(--bg-white);
  font-size: 12px;
}

.page-item.active {
  background-color: var(--primary-light);
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.page-item:hover:not(.active) {
  background-color: #f2f3f5;
}
</style>
