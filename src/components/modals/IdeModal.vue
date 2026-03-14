<template>
  <a-modal
    v-model:open="visible"
    :width="1100"
    :footer="null"
    :closable="false"
    :maskClosable="false"
    wrap-class-name="ide-modal"
  >
    <div class="ide-modal-content">
      <div class="ide-titlebar">
        <div class="ide-titlebar-left">
          <CodeOutlined v-if="ideMode === 'script'" style="color: #89B4FA;" />
          <CloudServerOutlined v-else style="color: #FA8C16;" />
          {{ ideMode === 'script' ? '自定义采集脚本编辑器' : '离线开发任务编辑器' }}
          <span class="ide-filename">{{ ideMode === 'script' ? 'script_collect_v1.sql' : 'offline_task_v1.py' }}</span>
        </div>
        <CloseOutlined class="ide-close" @click="handleClose" />
      </div>

      <div class="ide-body">
        <div class="ide-sidebar">
          <div class="ide-sidebar-header">
            <span>数据资源</span>
            <button class="ide-sidebar-btn" @click="showDsForm = !showDsForm">
              <PlusOutlined />
              数据源
            </button>
          </div>

          <div v-if="showDsForm" class="ide-ds-form">
            <a-select v-model:value="newDs.type" size="small">
              <a-select-option value="MySQL">MySQL</a-select-option>
              <a-select-option value="Oracle">Oracle</a-select-option>
              <a-select-option value="PostgreSQL">PostgreSQL</a-select-option>
              <a-select-option value="SQL Server">SQL Server</a-select-option>
              <a-select-option value="ClickHouse">ClickHouse</a-select-option>
            </a-select>
            <a-input v-model:value="newDs.host" size="small" placeholder="主机地址 (host:port)" />
            <a-input v-model:value="newDs.database" size="small" placeholder="数据库名" />
            <a-input v-model:value="newDs.username" size="small" placeholder="用户名" />
            <a-input-password v-model:value="newDs.password" size="small" placeholder="密码" />
            <div class="ide-ds-form-actions">
              <button class="ide-sidebar-btn" @click="handleAddDs">
                <ApiOutlined />
                连接
              </button>
              <button class="ide-sidebar-btn" @click="showDsForm = false">取消</button>
            </div>
          </div>

          <div class="ide-tree">
            <div v-for="ds in dataSources" :key="ds.id" class="ide-tree-ds">
              <div class="ide-tree-ds-header" @click="toggleDs(ds.id)">
                <RightOutlined :class="['ide-chevron', { rotated: ds.expanded }]" />
                <DatabaseOutlined class="ide-tree-ds-icon" />
                <span>{{ ds.name }}</span>
              </div>
              <div v-if="ds.expanded" class="ide-tables">
                <div
                  v-for="table in ds.tables"
                  :key="table"
                  class="ide-tree-table"
                  @click="insertTableName(table)"
                >
                  <TableOutlined class="ide-tree-table-icon" />
                  {{ table }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="ide-editor-area">
          <div class="ide-tabs">
            <div
              v-for="tab in tabs"
              :key="tab.id"
              :class="['ide-tab', { active: tab.id === activeTabId }]"
              @click="activeTabId = tab.id"
            >
              <CodeOutlined style="color: #89B4FA;" />
              {{ tab.name }}
            </div>
            <div class="ide-tab" @click="addNewTab">
              <PlusOutlined style="font-size: 10px;" />
            </div>
          </div>

          <div class="ide-code-area">
            <textarea
              v-model="sqlCode"
              class="ide-code-editor"
              spellcheck="false"
            ></textarea>
          </div>

          <div class="ide-statusbar">
            <span>
              <CheckCircleFilled style="color: #A6E3A1; font-size: 7px;" />
              SQL
            </span>
            <span>行: 1, 列: 1</span>
            <span>UTF-8</span>
            <span style="margin-left: auto; color: #A6E3A1;">
              <CheckCircleFilled />
              语法检查通过
            </span>
          </div>
        </div>
      </div>

      <div class="ide-footer">
        <div class="ide-footer-left">
          <InfoCircleOutlined />
          {{ ideMode === 'script' ? '编写完成后点击"提交脚本"' : '编写完成后点击"保存任务"' }}
        </div>
        <div class="ide-footer-right">
          <button class="ide-btn ide-btn-cancel" @click="handleClose">取消</button>
          <button v-if="ideMode === 'offline'" class="ide-btn ide-btn-run" @click="handlePublish">
            <SendOutlined />
            发布并调度
          </button>
          <button class="ide-btn ide-btn-submit" @click="handleSubmit">
            <SendOutlined />
            {{ ideMode === 'script' ? '提交脚本' : '保存任务' }}
          </button>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  CodeOutlined,
  CloseOutlined,
  PlusOutlined,
  RightOutlined,
  DatabaseOutlined,
  TableOutlined,
  CheckCircleFilled,
  InfoCircleOutlined,
  SendOutlined,
  ApiOutlined,
  CloudServerOutlined
} from '@ant-design/icons-vue'
import { useUIStore, useTaskStore } from '@/stores'

const uiStore = useUIStore()
const taskStore = useTaskStore()

const visible = computed(() => uiStore.ideModalVisible)
const ideMode = computed(() => uiStore.ideModalMode)

const showDsForm = ref(false)
const newDs = ref({
  type: 'MySQL',
  host: '',
  database: '',
  username: '',
  password: ''
})

const dataSources = ref([
  {
    id: 'crm',
    name: 'CRM 业务库',
    expanded: false,
    tables: ['t_user_main', 't_order_flow', 't_product_catalog']
  },
  {
    id: 'billing',
    name: '计费系统',
    expanded: false,
    tables: ['t_billing_detail', 't_pay_record']
  }
])

const tabs = ref([
  { id: 1, name: 'script_collect_v1.sql' }
])
const activeTabId = ref(1)
const tabCounter = ref(1)

const sqlCode = ref(`-- 自定义采集脚本
-- 点击左侧表名可快速插入

SELECT
    u.user_id,
    u.user_name,
    u.phone_number,
    u.status,
    u.create_time,
    o.order_id,
    o.amount       AS order_amount,
    o.pay_status
FROM crm_db.t_user_main u
LEFT JOIN crm_db.t_order_flow o
    ON u.user_id = o.user_id
WHERE u.status = 1
ORDER BY u.create_time DESC
LIMIT 10000;`)

function handleClose() {
  uiStore.closeIdeModal()
}

function handleAddDs() {
  tabCounter.value++
  const newId = `ds_${tabCounter.value}`
  dataSources.value.push({
    id: newId,
    name: `${newDs.value.type} 数据源 ${tabCounter.value}`,
    expanded: false,
    tables: []
  })
  showDsForm.value = false
  newDs.value = {
    type: 'MySQL',
    host: '',
    database: '',
    username: '',
    password: ''
  }
}

function toggleDs(id: string) {
  const ds = dataSources.value.find(d => d.id === id)
  if (ds) {
    ds.expanded = !ds.expanded
  }
}

function insertTableName(tableName: string) {
  sqlCode.value += tableName
}

function addNewTab() {
  tabCounter.value++
  tabs.value.push({
    id: tabCounter.value,
    name: `query_${tabCounter.value}.sql`
  })
  activeTabId.value = tabCounter.value
}

function handleSubmit() {
  if (ideMode.value === 'script') {
    taskStore.setScriptConfigured(true, 'script_collect_v1.sql')
  } else {
    taskStore.setOfflineTaskConfigured(true, 'offline_task_v1.py')
  }
  handleClose()
}

function handlePublish() {
  // 保存任务并标记为已完成调度
  taskStore.setOfflineTaskConfigured(true, 'offline_task_v1.py')
  taskStore.setOfflineSchedulerCompleted(true)
  handleClose()
}
</script>

<style scoped>
.ide-modal-content {
  width: 100%;
  height: 82vh;
  display: flex;
  flex-direction: column;
}

.ide-titlebar {
  background: #1E1E2E;
  color: #CDD6F4;
  padding: 10px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.ide-titlebar-left {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 600;
}

.ide-filename {
  font-size: 11px;
  color: #6C7086;
  font-weight: normal;
  margin-left: 6px;
}

.ide-close {
  cursor: pointer;
  color: #6C7086;
  font-size: 15px;
}

.ide-close:hover {
  color: #F38BA8;
}

.ide-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.ide-sidebar {
  width: 220px;
  background: #181825;
  color: #CDD6F4;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  border-right: 1px solid #313244;
}

.ide-sidebar-header {
  padding: 9px 12px;
  font-size: 11px;
  font-weight: 600;
  color: #6C7086;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #313244;
}

.ide-sidebar-btn {
  background: none;
  border: 1px solid #45475A;
  color: #CDD6F4;
  border-radius: 4px;
  padding: 3px 8px;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.ide-sidebar-btn:hover {
  background: #313244;
}

.ide-ds-form {
  background: #313244;
  border-radius: 6px;
  padding: 12px;
  margin: 6px 8px;
}

.ide-ds-form-actions {
  display: flex;
  gap: 5px;
}

.ide-ds-form-actions .ide-sidebar-btn {
  flex: 1;
  justify-content: center;
}

.ide-tree {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}

.ide-tree-ds {
  margin-bottom: 2px;
}

.ide-tree-ds-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 12px;
  color: #CDD6F4;
}

.ide-tree-ds-header:hover {
  background: #313244;
}

.ide-tree-ds-icon {
  color: #89B4FA;
  font-size: 11px;
}

.ide-chevron {
  font-size: 9px;
  transition: transform 0.2s;
}

.ide-chevron.rotated {
  transform: rotate(90deg);
}

.ide-tables {
  padding-left: 0;
}

.ide-tree-table {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px 4px 28px;
  cursor: pointer;
  font-size: 12px;
  color: #A6ADC8;
}

.ide-tree-table:hover {
  background: #313244;
  color: #CDD6F4;
}

.ide-tree-table-icon {
  color: #A6E3A1;
  font-size: 10px;
}

.ide-editor-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #1E1E2E;
  overflow: hidden;
}

.ide-tabs {
  display: flex;
  align-items: center;
  background: #181825;
  border-bottom: 1px solid #313244;
  flex-shrink: 0;
}

.ide-tab {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 14px;
  font-size: 12px;
  color: #6C7086;
  cursor: pointer;
  border-right: 1px solid #313244;
  white-space: nowrap;
}

.ide-tab.active {
  background: #1E1E2E;
  color: #CDD6F4;
  border-bottom: 2px solid #89B4FA;
}

.ide-tab:hover:not(.active) {
  background: #313244;
  color: #CDD6F4;
}

.ide-code-area {
  flex: 1;
  overflow: hidden;
}

.ide-code-editor {
  width: 100%;
  height: 100%;
  background: #1E1E2E;
  color: #CDD6F4;
  border: none;
  resize: none;
  outline: none;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  padding: 14px;
}

.ide-statusbar {
  background: #181825;
  color: #6C7086;
  padding: 3px 12px;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 14px;
  border-top: 1px solid #313244;
  flex-shrink: 0;
}

.ide-footer {
  background: #181825;
  padding: 9px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #313244;
  flex-shrink: 0;
}

.ide-footer-left {
  font-size: 12px;
  color: #6C7086;
  display: flex;
  align-items: center;
  gap: 6px;
}

.ide-footer-right {
  display: flex;
  gap: 8px;
}

.ide-btn {
  padding: 6px 14px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.ide-btn-run {
  background: #A6E3A1;
  color: #1E1E2E;
}

.ide-btn-run:hover {
  background: #7EC67A;
}

.ide-btn-submit {
  background: #89B4FA;
  color: #1E1E2E;
}

.ide-btn-submit:hover {
  background: #6EA3F0;
}

.ide-btn-cancel {
  background: #313244;
  color: #CDD6F4;
}

.ide-btn-cancel:hover {
  background: #45475A;
}
</style>
