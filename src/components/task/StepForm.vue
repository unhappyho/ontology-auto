<template>
  <div class="step-page-wrap">
    <div class="step-page-body">
      <div class="form-page-container">
        <div class="form-header">
          <div class="form-page-title">本体数据采集</div>
          <div class="form-page-desc">配置数据来源、采集方式及采集范围</div>
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

          <div class="form-row">
            <div class="form-label">采集方式</div>
            <div class="form-control">
              <a-radio-group v-model:value="collectMode">
                <a-radio value="full">全量</a-radio>
                <a-radio value="incremental">增量</a-radio>
              </a-radio-group>
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

        <!-- 采集范围选择 -->
        <div v-if="(collectItem !== 'script' && collectItem !== 'offline') || scriptConfigured || (collectItem === 'offline' && offlineTaskConfigured && schedulerCompleted)" class="form-section-card">
          <div class="form-section-title">
            <span class="step-badge">2</span>
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
import { ref, computed } from 'vue'
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
  EditOutlined
} from '@ant-design/icons-vue'
import { useTaskStore, useUIStore } from '@/stores'

const router = useRouter()
const taskStore = useTaskStore()
const uiStore = useUIStore()

const dataType = computed({
  get: () => taskStore.dataType,
  set: (v) => taskStore.updateDataType(v)
})

const collectItem = computed({
  get: () => taskStore.collectItem,
  set: (v) => taskStore.updateCollectItem(v)
})

const collectMode = computed({
  get: () => taskStore.collectMode,
  set: () => {}
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

function handleNext() {
  // 如果选择了离线开发，需要等待调度任务完成才能进入下一步
  if (collectItem.value === 'offline' && !schedulerCompleted.value) {
    return
  }
  taskStore.switchStep(2)
}

// 判断下一步按钮是否可用
const canProceed = computed(() => {
  if (collectItem.value === 'offline') {
    return schedulerCompleted.value
  }
  return true
})
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
</style>
