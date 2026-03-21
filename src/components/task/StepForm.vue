<template>
  <div class="step-page-wrap">
    <div class="step-page-body">
      <div class="form-page-container">
        <div class="form-header">
          <div class="form-header-left">
            <div class="form-page-title">本体数据采集</div>
            <div class="form-page-desc">配置数据来源、采集方式及采集范围</div>
          </div>
          <div class="form-header-right">
            <a-button type="primary" ghost @click="handleAIRecommend">
              <RobotOutlined />
              AI 智能推荐
            </a-button>
          </div>
        </div>

        <!-- 基础规则配置 -->
        <div class="form-section-card">
          <div class="form-section-title">
            <span class="step-badge">1</span>
            基础规则配置
          </div>

          <div class="form-row">
            <div class="form-label">数据格式</div>
            <div class="form-control">
              <div class="segmented-control">
                <div
                  :class="['segment-btn', { active: dataType === 'struct' }]"
                  @click="updateDataType('struct')"
                >
                  结构化
                </div>
                <div
                  :class="['segment-btn', { active: dataType === 'unstruct' }]"
                  @click="updateDataType('unstruct')"
                >
                  非结构化
                </div>
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-label">采集项</div>
            <div class="form-control">
              <a-select
                v-model:value="collectItem"
                style="width: 100%; max-width: 400px;"
                @change="handleCollectItemChange"
              >
                <a-select-option value="physical">物理元数据</a-select-option>
                <a-select-option value="logical">逻辑模型</a-select-option>
                <a-select-option value="model">模型管理</a-select-option>
                <a-select-option value="script">自定义脚本</a-select-option>
                <a-select-option value="offline">离线开发</a-select-option>
              </a-select>
            </div>
          </div>

          <div v-if="collectItem !== 'script'" class="form-row">
            <div class="form-label">采集数据源</div>
            <div class="form-control">
              <a-select v-model:value="dataSource" style="width: 100%; max-width: 400px;">
                <a-select-option value="CRM 核心业务库 (MySQL 8.0) — 192.168.1.10:3306">
                  CRM 核心业务库 (MySQL 8.0) — 192.168.1.10:3306
                </a-select-option>
                <a-select-option value="ERP 供应链主数据库 (Oracle 19c) — 10.0.0.5:1521">
                  ERP 供应链主数据库 (Oracle 19c) — 10.0.0.5:1521
                </a-select-option>
                <a-select-option value="日志汇聚中心 (ClickHouse 22.8)">
                  日志汇聚中心 (ClickHouse 22.8)
                </a-select-option>
                <a-select-option value="运营商计费系统 (PostgreSQL 14) — 172.16.0.20:5432">
                  运营商计费系统 (PostgreSQL 14) — 172.16.0.20:5432
                </a-select-option>
                <a-select-option value="基站地理信息库 (MySQL 5.7)">
                  基站地理信息库 (MySQL 5.7)
                </a-select-option>
                <a-select-option value="工单管理系统 (SQL Server 2019)">
                  工单管理系统 (SQL Server 2019)
                </a-select-option>
              </a-select>
            </div>
          </div>

          <!-- 自定义脚本操作区 -->
          <div v-if="collectItem === 'script'" class="form-row">
            <div class="form-label">脚本编写</div>
            <div class="form-control">
              <div class="script-action-area">
                <CodeOutlined style="color: #722ED1; font-size: 18px;" />
                <div class="script-info">
                  <div class="script-hint">通过自定义脚本灵活定义采集逻辑，支持多数据源联合查询。</div>
                  <div class="script-status">
                    脚本状态：
                    <span :style="{ color: scriptConfigured ? 'var(--success-color)' : 'var(--warning-color)' }">
                      {{ scriptConfigured ? `已配置 (${scriptName})` : '未配置' }}
                    </span>
                  </div>
                </div>
                <a-button type="primary" size="small" style="margin-left: auto;" @click="openIdeModal">
                  <CodeOutlined />
                  编写脚本
                </a-button>
              </div>
            </div>
          </div>

          <!-- 离线开发操作区 -->
          <div v-if="collectItem === 'offline'" class="form-row">
            <div class="form-label">离线开发</div>
            <div class="form-control">
              <div class="script-action-area">
                <CloudServerOutlined style="color: #FA8C16; font-size: 18px;" />
                <div class="script-info">
                  <div class="script-hint">通过离线开发环境编写采集任务，支持调度执行。</div>
                  <div class="script-status">
                    任务状态：
                    <span :style="{ color: offlineTaskConfigured ? 'var(--success-color)' : 'var(--warning-color)' }">
                      {{ offlineTaskConfigured ? `已配置 (${offlineTaskName})` : '未配置' }}
                    </span>
                  </div>
                </div>
                <a-button type="primary" size="small" style="margin-left: auto;" @click="openIdeModal">
                  <CodeOutlined />
                  编写任务
                </a-button>
              </div>

              <!-- 离线开发任务卡片 -->
              <div v-if="offlineTaskConfigured" class="offline-task-section">
                <div class="offline-task-header">
                  <span class="offline-task-title">离线开发任务</span>
                </div>
                <div class="offline-task-card" @click="openIdeModal">
                  <div class="task-card-icon">
                    <CloudServerOutlined />
                  </div>
                  <div class="task-card-info">
                    <div class="task-card-name">{{ offlineTaskName }}</div>
                    <div class="task-card-status">
                      <span class="status-badge" :class="schedulerCompleted ? 'status-completed' : 'status-pending'">
                        {{ schedulerCompleted ? '已完成' : '待执行' }}
                      </span>
                    </div>
                  </div>
                  <EditOutlined class="task-card-edit" />
                </div>

                <!-- 调度任务状态 -->
                <div v-if="showSchedulerStatus" class="scheduler-status">
                  <div class="scheduler-header">
                    <span>调度任务状态</span>
                    <a-button type="link" size="small" @click="showSchedulerStatus = false">
                      <CloseOutlined />
                    </a-button>
                  </div>
                  <a-table
                    :columns="schedulerColumns"
                    :data-source="schedulerTasks"
                    :pagination="false"
                    size="small"
                  >
                    <template #bodyCell="{ column, record }">
                      <template v-if="column.key === 'status'">
                        <a-tag :color="record.status === '完成' ? 'green' : record.status === '运行中' ? 'blue' : 'orange'">
                          {{ record.status }}
                        </a-tag>
                      </template>
                    </template>
                  </a-table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 附件上传 -->
        <div class="form-section-card">
          <div class="form-section-title">
            <span class="step-badge">2</span>
            附件上传
            <span class="section-optional">可选</span>
          </div>
          <div class="attachment-desc">上传参考文档，AI 将在后续步骤中自动分析引用</div>

          <div class="attachment-columns">
            <!-- 加工脚本文件 -->
            <div class="attachment-col">
              <div class="attachment-col-header">
                <CodeOutlined class="attachment-col-icon" style="color: #722ED1;" />
                <span class="attachment-col-title">加工脚本文件</span>
                <span class="attachment-col-count">{{ scriptFiles.length }}/{{ MAX_FILES }}</span>
              </div>
              <div
                :class="['upload-zone', { 'upload-zone--disabled': scriptFiles.length >= MAX_FILES }]"
                @click="scriptFiles.length < MAX_FILES && triggerUpload('script')"
                @dragover.prevent
                @drop.prevent="handleDrop($event, 'script')"
              >
                <input
                  ref="scriptInputRef"
                  type="file"
                  multiple
                  accept=".py,.sql,.sh,.js,.ts"
                  style="display:none"
                  @change="handleFileChange($event, 'script')"
                />
                <CloudUploadOutlined class="upload-zone-icon" />
                <div class="upload-zone-text">点击上传或拖入文件</div>
                <div class="upload-zone-formats">.py .sql .sh .js .ts</div>
              </div>
              <div v-if="scriptFiles.length > 0" class="file-list">
                <div v-for="file in scriptFiles" :key="file.uid" class="file-item">
                  <FileOutlined class="file-item-icon" style="color: #722ED1;" />
                  <span class="file-item-name">{{ file.name }}</span>
                  <span class="file-item-size">{{ formatSize(file.size) }}</span>
                  <DeleteOutlined class="file-item-delete" @click="removeFile('script', file.uid)" />
                </div>
              </div>
            </div>

            <!-- 规则文档 -->
            <div class="attachment-col">
              <div class="attachment-col-header">
                <FileTextOutlined class="attachment-col-icon" style="color: #1677FF;" />
                <span class="attachment-col-title">规则文档</span>
                <span class="attachment-col-count">{{ ruleFiles.length }}/{{ MAX_FILES }}</span>
              </div>
              <div
                :class="['upload-zone', { 'upload-zone--disabled': ruleFiles.length >= MAX_FILES }]"
                @click="ruleFiles.length < MAX_FILES && triggerUpload('rule')"
                @dragover.prevent
                @drop.prevent="handleDrop($event, 'rule')"
              >
                <input
                  ref="ruleInputRef"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.xlsx,.xls"
                  style="display:none"
                  @change="handleFileChange($event, 'rule')"
                />
                <CloudUploadOutlined class="upload-zone-icon" />
                <div class="upload-zone-text">点击上传或拖入文件</div>
                <div class="upload-zone-formats">.pdf .doc .docx .xlsx</div>
              </div>
              <div v-if="ruleFiles.length > 0" class="file-list">
                <div v-for="file in ruleFiles" :key="file.uid" class="file-item">
                  <FileOutlined class="file-item-icon" style="color: #1677FF;" />
                  <span class="file-item-name">{{ file.name }}</span>
                  <span class="file-item-size">{{ formatSize(file.size) }}</span>
                  <DeleteOutlined class="file-item-delete" @click="removeFile('rule', file.uid)" />
                </div>
              </div>
            </div>

            <!-- 接口文档 -->
            <div class="attachment-col">
              <div class="attachment-col-header">
                <ApiOutlined class="attachment-col-icon" style="color: #13C2C2;" />
                <span class="attachment-col-title">接口文档</span>
                <span class="attachment-col-count">{{ apiFiles.length }}/{{ MAX_FILES }}</span>
              </div>
              <div
                :class="['upload-zone', { 'upload-zone--disabled': apiFiles.length >= MAX_FILES }]"
                @click="apiFiles.length < MAX_FILES && triggerUpload('api')"
                @dragover.prevent
                @drop.prevent="handleDrop($event, 'api')"
              >
                <input
                  ref="apiInputRef"
                  type="file"
                  multiple
                  accept=".yaml,.yml,.json,.md,.pdf"
                  style="display:none"
                  @change="handleFileChange($event, 'api')"
                />
                <CloudUploadOutlined class="upload-zone-icon" />
                <div class="upload-zone-text">点击上传或拖入文件</div>
                <div class="upload-zone-formats">.yaml .json .md .pdf</div>
              </div>
              <div v-if="apiFiles.length > 0" class="file-list">
                <div v-for="file in apiFiles" :key="file.uid" class="file-item">
                  <FileOutlined class="file-item-icon" style="color: #13C2C2;" />
                  <span class="file-item-name">{{ file.name }}</span>
                  <span class="file-item-size">{{ formatSize(file.size) }}</span>
                  <DeleteOutlined class="file-item-delete" @click="removeFile('api', file.uid)" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 采集范围选择 -->
        <div v-if="isTableLoading" class="ai-scan-banner">
          <div class="scan-bar"></div>
          <div class="scan-text">
            <LoadingOutlined spin />
            AI 正在智能分析表结构，推荐采集范围...
          </div>
        </div>
        <div v-if="(collectItem !== 'script' && collectItem !== 'offline') || scriptConfigured || (collectItem === 'offline' && offlineTaskConfigured && schedulerCompleted)" class="form-section-card">
          <div class="form-section-title">
            <span class="step-badge">3</span>
            采集范围选择
          </div>

          <div class="search-box-wrapper">
            <a-input-search
              v-model:value="searchKeyword"
              placeholder="输入库名或表名..."
              style="width: 280px;"
            />
            <span class="search-hint">已加载 CRM 核心业务库 所有表</span>
          </div>

          <a-table
            :columns="tableColumns"
            :data-source="filteredTables"
            :pagination="false"
            :loading="isTableLoading"
            size="small"
            row-key="name"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'checkbox'">
                <a-checkbox v-model:checked="record.selected" />
              </template>
              <template v-else-if="column.key === 'name'">
                <div class="tb-name">
                  <TableOutlined style="color: var(--text-secondary);" />
                  {{ record.name }}
                </div>
                <div class="tb-comment">{{ record.comment }}</div>
              </template>
              <template v-else-if="column.key === 'fields'">
                <div class="ellipsis-text">{{ record.fields }}</div>
              </template>
              <template v-else-if="column.key === 'actions'">
                <span class="action-link" @click="openSqlModal(record.name)">过滤</span>
                <EyeOutlined class="action-icon" @click="openFieldModal(record.name)" />
              </template>
            </template>
          </a-table>

          <div class="table-pagination">
            <span>共 {{ tableData.length }} 张数据表</span>
            <div class="pagination">
              <div class="page-item"><LeftOutlined /></div>
              <div class="page-item active">1</div>
              <div class="page-item"><RightOutlined /></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="step-page-footer">
      <div class="footer-left">
        <InfoCircleOutlined />
        步骤 1 / 4
      </div>
      <a-button @click="handleBack">
        <CloseOutlined />
        取消
      </a-button>
      <a-button>
        <SaveOutlined />
        保存草稿
      </a-button>
      <a-button type="primary" :disabled="!canProceed" @click="handleNext">
        下一步：实体数据提取
        <ArrowRightOutlined />
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  CodeOutlined,
  TableOutlined,
  EyeOutlined,
  LeftOutlined,
  RightOutlined,
  InfoCircleOutlined,
  CloseOutlined,
  SaveOutlined,
  ArrowRightOutlined,
  CloudServerOutlined,
  EditOutlined,
  RobotOutlined,
  LoadingOutlined,
  CloudUploadOutlined,
  FileTextOutlined,
  FileOutlined,
  DeleteOutlined,
  ApiOutlined
} from '@ant-design/icons-vue'
import { useTaskStore, useUIStore, useCopilotStore } from '@/stores'

const router = useRouter()
const taskStore = useTaskStore()
const uiStore = useUIStore()
const copilotStore = useCopilotStore()

const dataType = computed({
  get: () => taskStore.dataType,
  set: (v) => taskStore.updateDataType(v)
})

const collectItem = computed({
  get: () => taskStore.collectItem,
  set: (v) => taskStore.updateCollectItem(v)
})

const dataSource = computed({
  get: () => taskStore.dataSource,
  set: () => {}
})

const scriptConfigured = computed(() => taskStore.scriptConfigured)
const scriptName = computed(() => taskStore.scriptName)

// 离线开发相关状态
const offlineTaskConfigured = computed(() => taskStore.offlineTaskConfigured)
const offlineTaskName = computed(() => taskStore.offlineTaskName)
const schedulerCompleted = computed(() => taskStore.offlineSchedulerCompleted)

// 调度任务状态
const showSchedulerStatus = ref(false)
const schedulerColumns = [
  { title: '任务名', dataIndex: 'name', key: 'name' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '运行时间', dataIndex: 'runtime', key: 'runtime' }
]
const schedulerTasks = ref([
  { key: '1', name: '离线采集任务_001', status: '完成', runtime: '2024-10-25 10:30:00' },
  { key: '2', name: '离线采集任务_002', status: '完成', runtime: '2024-10-25 14:15:00' },
  { key: '3', name: '离线采集任务_003', status: '运行中', runtime: '2024-10-25 16:00:00' }
])

const searchKeyword = ref('')
const isTableLoading = ref(false)

function triggerTableLoading() {
  isTableLoading.value = true
  setTimeout(() => {
    isTableLoading.value = false
  }, 2000)
}

const tableColumns = [
  { key: 'checkbox', width: 36 },
  { title: '表名', key: 'name', width: '20%' },
  { title: '所属库', dataIndex: 'database', width: '13%' },
  { title: '字段预览', key: 'fields', width: '35%' },
  { title: '操作', key: 'actions' }
]

const tableData = ref([
  { name: 't_user_main', comment: '用户主表', database: 'crm_db', fields: 'user_id, user_name, phone_number, status, create_time...', selected: true },
  { name: 't_order_flow', comment: '订单流水表', database: 'crm_db', fields: 'order_id, user_id, amount, pay_status, finish_time...', selected: true },
  { name: 't_product_catalog', comment: '产品目录表', database: 'crm_db', fields: 'product_id, product_name, category, price, stock_qty...', selected: true },
  { name: 't_contract_info', comment: '合同信息表', database: 'crm_db', fields: 'contract_id, user_id, product_id, start_date, expire_date...', selected: true },
  { name: 't_complaint_record', comment: '投诉工单记录', database: 'crm_db', fields: 'complaint_id, user_id, type_code, content, handle_status...', selected: true },
  { name: 't_api_logs', comment: '接口调用日志', database: 'log_db', fields: 'log_id, api_path, request_ip, response_time, error_code...', selected: false },
  { name: 't_base_station', comment: '基站信息主表', database: 'geo_db', fields: 'station_id, station_name, longitude, latitude, coverage_radius...', selected: false },
  { name: 't_billing_detail', comment: '计费明细表', database: 'billing_db', fields: 'bill_id, user_id, cycle, total_fee, discount_fee, pay_channel...', selected: false }
])

const filteredTables = computed(() => {
  if (!searchKeyword.value) return tableData.value
  return tableData.value.filter(t =>
    t.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

function updateDataType(type: 'struct' | 'unstruct') {
  taskStore.updateDataType(type)
}

function handleCollectItemChange(value: string) {
  taskStore.updateCollectItem(value as 'physical' | 'logical' | 'model' | 'script' | 'offline')
}

function openIdeModal() {
  // 根据当前采集项类型选择IDE模式
  const mode = collectItem.value === 'offline' ? 'offline' : 'script'
  uiStore.openIdeModal(mode)
}

function openSqlModal(tableName: string) {
  uiStore.openSqlModal(tableName)
}

function openFieldModal(tableName: string) {
  uiStore.openFieldModal(tableName)
}

function handleBack() {
  router.push('/')
}

// AI 智能推荐
function handleAIRecommend() {
  copilotStore.triggerAIAnalysis(1)
  triggerTableLoading()
}

// 监听重新识别动作
watch(
  () => copilotStore.reidentifyAction,
  (action) => {
    if (action === 'reextract-tables') {
      triggerTableLoading()
    }
  }
)

function handleNext() {
  // 如果选择了离线开发，需要等待调度任务完成才能进入下一步
  if (collectItem.value === 'offline' && !schedulerCompleted.value) {
    return
  }
  taskStore.switchStep(2)
  copilotStore.triggerAIAnalysis(2)
}

// 判断下一步按钮是否可用
const canProceed = computed(() => {
  if (collectItem.value === 'offline') {
    return schedulerCompleted.value
  }
  return true
})

// ---- 附件上传 ----
interface UploadedFile {
  uid: string
  name: string
  size: number
}

const MAX_FILES = 5

const scriptFiles = ref<UploadedFile[]>([])
const ruleFiles = ref<UploadedFile[]>([])
const apiFiles = ref<UploadedFile[]>([])

const scriptInputRef = ref<HTMLInputElement | null>(null)
const ruleInputRef = ref<HTMLInputElement | null>(null)
const apiInputRef = ref<HTMLInputElement | null>(null)

function triggerUpload(type: 'script' | 'rule' | 'api') {
  const map = { script: scriptInputRef, rule: ruleInputRef, api: apiInputRef }
  map[type].value?.click()
}

function handleFileChange(event: Event, type: 'script' | 'rule' | 'api') {
  const input = event.target as HTMLInputElement
  if (!input.files) return
  addFiles(Array.from(input.files), type)
  input.value = ''
}

function handleDrop(event: DragEvent, type: 'script' | 'rule' | 'api') {
  const files = event.dataTransfer?.files
  if (!files) return
  addFiles(Array.from(files), type)
}

function addFiles(files: File[], type: 'script' | 'rule' | 'api') {
  const targetRef = type === 'script' ? scriptFiles : type === 'rule' ? ruleFiles : apiFiles
  const remaining = MAX_FILES - targetRef.value.length
  files.slice(0, remaining).forEach(file => {
    targetRef.value.push({
      uid: `${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size
    })
  })
}

function removeFile(type: 'script' | 'rule' | 'api', uid: string) {
  const targetRef = type === 'script' ? scriptFiles : type === 'rule' ? ruleFiles : apiFiles
  targetRef.value = targetRef.value.filter(f => f.uid !== uid)
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>

<style scoped>
.step-page-wrap {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.step-page-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 0;
}

.step-page-footer {
  flex-shrink: 0;
  background: var(--bg-white);
  border-top: 1px solid var(--border-color);
  padding: 12px 24px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
}

.footer-left {
  margin-right: auto;
  font-size: 13px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-page-container {
  width: 100%;
  max-width: 960px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 8px;
}

.form-header {
  margin-bottom: 4px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.form-header-left {
  flex: 1;
}

.form-header-right {
  flex-shrink: 0;
}

.form-page-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 4px;
}

.form-page-desc {
  font-size: 13px;
  color: var(--text-secondary);
}

.form-section-card {
  background: var(--bg-white);
  border-radius: 8px;
  padding: 20px 28px;
  border: 1px solid var(--border-color);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.form-section-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-badge {
  width: 20px;
  height: 20px;
  background: var(--primary-light);
  color: var(--primary-color);
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
}

.form-row {
  display: flex;
  margin-bottom: 20px;
  align-items: flex-start;
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-label {
  width: 110px;
  font-size: 13px;
  color: var(--text-regular);
  padding-top: 8px;
  flex-shrink: 0;
}

.form-control {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.segmented-control {
  display: inline-flex;
  background: #F2F3F5;
  border-radius: 6px;
  padding: 3px;
  width: fit-content;
}

.segment-btn {
  padding: 5px 18px;
  font-size: 13px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-regular);
}

.segment-btn.active {
  background: var(--bg-white);
  color: var(--primary-color);
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.script-action-area {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: #F7F8FA;
  border: 1px dashed var(--border-color);
  border-radius: 6px;
}

.script-info {
  flex: 1;
}

.script-hint {
  font-size: 13px;
  color: var(--text-secondary);
}

.script-status {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 3px;
}

/* 离线开发任务卡片 */
.offline-task-section {
  margin-top: 16px;
}

.offline-task-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.offline-task-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
}

.offline-task-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #FFF7E6;
  border: 1px dashed #FA8C16;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.offline-task-card:hover {
  background: #FFF3E0;
  border-color: #FA8C16;
}

.task-card-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #FA8C16;
  border-radius: 8px;
  color: white;
  font-size: 18px;
}

.task-card-info {
  flex: 1;
}

.task-card-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-main);
}

.task-card-status {
  margin-top: 4px;
}

.status-badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}

.status-badge.status-completed {
  background: #F6FFED;
  color: #52C41A;
  border: 1px solid #B7EB8F;
}

.status-badge.status-pending {
  background: #FFF7E6;
  color: #FA8C16;
  border: 1px solid #FFD591;
}

.task-card-edit {
  color: var(--text-secondary);
  font-size: 14px;
}

/* 调度任务状态 */
.scheduler-status {
  margin-top: 16px;
  padding: 12px;
  background: var(--bg-white);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.scheduler-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-main);
}

.search-box-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.search-hint {
  font-size: 12px;
  color: var(--text-secondary);
}

.tb-name {
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tb-comment {
  font-size: 11px;
  color: var(--text-secondary);
}

.ellipsis-text {
  max-width: 220px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-secondary);
  font-size: 12px;
}

.action-link {
  color: var(--primary-color);
  cursor: pointer;
  margin-right: 16px;
  font-size: 13px;
  user-select: none;
}

.action-icon {
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 13px;
}

.action-icon:hover {
  color: var(--primary-color);
}

.table-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  font-size: 12px;
  color: var(--text-secondary);
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

/* ---- AI 扫描 Banner ---- */
.ai-scan-banner {
  position: relative;
  overflow: hidden;
  background: #f9f0ff;
  border-left: 4px solid #722ed1;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 12px;
}

.scan-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 4px;
  width: 30%;
  background: linear-gradient(90deg, transparent, #722ed1, transparent);
  animation: scan-sweep 1.2s linear infinite;
}

@keyframes scan-sweep {
  0% { left: -30%; }
  100% { left: 110%; }
}

/* ---- 附件上传 ---- */
.attachment-desc {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 16px;
  margin-top: -8px;
}

.section-optional {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 400;
  background: #F2F3F5;
  padding: 1px 7px;
  border-radius: 10px;
  margin-left: 4px;
}

.attachment-columns {
  display: flex;
  gap: 16px;
}

.attachment-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.attachment-col-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-main);
}

.attachment-col-icon {
  font-size: 15px;
}

.attachment-col-title {
  flex: 1;
}

.attachment-col-count {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 400;
}

.upload-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 20px 12px;
  background: #FAFAFA;
  border: 1px dashed var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  text-align: center;
}

.upload-zone:hover:not(.upload-zone--disabled) {
  border-color: var(--primary-color);
  background: var(--primary-light);
}

.upload-zone--disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.upload-zone-icon {
  font-size: 22px;
  color: var(--text-secondary);
}

.upload-zone-text {
  font-size: 12px;
  color: var(--text-regular);
}

.upload-zone-formats {
  font-size: 11px;
  color: var(--text-secondary);
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background: var(--bg-white);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 12px;
}

.file-item-icon {
  font-size: 13px;
  flex-shrink: 0;
}

.file-item-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-regular);
}

.file-item-size {
  flex-shrink: 0;
  color: var(--text-secondary);
}

.file-item-delete {
  flex-shrink: 0;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 13px;
  transition: color 0.2s;
}

.file-item-delete:hover {
  color: #FF4D4F;
}
</style>
