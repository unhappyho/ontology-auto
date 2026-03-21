<template>
  <div class="entity-logic">
    <!-- 顶部 Tab 切换 -->
    <div class="tab-bar">
      <div
        class="tab-item"
        :class="{ active: activeTab === 'function' }"
        @click="activeTab = 'function'"
      >
        <CodeOutlined />
        <span>函数</span>
        <span class="tab-count">{{ functions.length }}</span>
      </div>
      <div
        class="tab-item"
        :class="{ active: activeTab === 'action' }"
        @click="activeTab = 'action'"
      >
        <ThunderboltOutlined />
        <span>动作</span>
        <span class="tab-count">{{ actions.length }}</span>
      </div>
    </div>

    <!-- 内容区 -->
    <div class="tab-content">
      <!-- 函数 Tab -->
      <div v-if="activeTab === 'function'" class="function-panel">
        <!-- 左侧：工件列表 -->
        <div class="artifact-panel">
          <div class="artifact-header">
            <div class="artifact-title">
              <FolderOutlined />
              <span>工件列表</span>
            </div>
            <a-tag color="blue">来自步骤1附件</a-tag>
          </div>

          <div class="artifact-list">
            <div
              v-for="fn in functions"
              :key="fn.id"
              class="artifact-item"
              :class="{ selected: selectedFunctionId === fn.id }"
              @click="selectedFunctionId = fn.id"
            >
              <div class="artifact-icon" :style="{ background: getTypeColor(fn.type).bg, color: getTypeColor(fn.type).text }">
                <CodeOutlined v-if="fn.type === 'script'" />
                <ApiOutlined v-else-if="fn.type === 'interface'" />
                <FileTextOutlined v-else />
              </div>
              <div class="artifact-info">
                <div class="artifact-name">{{ fn.name }}</div>
                <div class="artifact-meta">
                  <a-tag :color="getTypeColor(fn.type).tag" size="small">{{ getTypeLabel(fn.type) }}</a-tag>
                  <span class="artifact-time">{{ fn.uploadTime }}</span>
                </div>
              </div>
              <div class="artifact-status">
                <CheckCircleOutlined v-if="fn.confirmed" class="confirmed-icon" />
                <span v-else class="unconfirmed-dot"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：AI 推荐连线 -->
        <div class="recommend-panel">
          <div class="panel-header">
            <div class="header-left">
              <RobotOutlined class="ai-icon" />
              <span>AI 推荐连线</span>
            </div>
            <a-button type="primary" :loading="isAnalyzing" @click="handleAIAnalyze">
              <BulbOutlined v-if="!isAnalyzing" />
              {{ isAnalyzing ? 'AI分析中...' : '重新分析' }}
            </a-button>
          </div>

          <!-- Loading -->
          <div v-if="isAnalyzing" class="ai-loading">
            <a-spin size="large" />
            <div class="loading-text">AI正在分析工件与实体的关联关系...</div>
            <a-progress :percent="analyzeProgress" status="active" />
          </div>

          <!-- 推荐卡片 -->
          <div v-else class="recommendations-wrap">
            <div
              v-for="(rec, index) in fnRecommendations"
              :key="index"
              class="fn-rec-card"
              :class="{ confirmed: rec.confirmed, dismissed: rec.dismissed }"
            >
              <div class="fn-rec-body">
                <!-- 函数端 -->
                <div class="fn-node">
                  <div class="fn-node-icon script">
                    <CodeOutlined />
                  </div>
                  <div class="fn-node-info">
                    <div class="fn-node-name">{{ rec.functionName }}</div>
                    <a-tag :color="getTypeColor(rec.functionType).tag" size="small">{{ getTypeLabel(rec.functionType) }}</a-tag>
                  </div>
                </div>

                <!-- 连线箭头 -->
                <div class="fn-arrow">
                  <div class="arrow-line"></div>
                  <a-tag color="orange" class="confidence-tag">{{ rec.confidence }}</a-tag>
                  <ArrowRightOutlined class="arrow-icon" />
                </div>

                <!-- 实体端 -->
                <div class="fn-node">
                  <div class="fn-node-icon entity">
                    <AppstoreOutlined />
                  </div>
                  <div class="fn-node-info">
                    <div class="fn-node-name">{{ rec.entityName }}</div>
                    <a-tag color="blue" size="small">{{ rec.entityCn }}</a-tag>
                  </div>
                </div>
              </div>

              <div class="fn-rec-footer">
                <span class="rec-desc">{{ rec.desc }}</span>
                <div class="rec-btns" v-if="!rec.dismissed">
                  <a-button
                    v-if="!rec.confirmed"
                    type="primary"
                    size="small"
                    @click="confirmRec(rec)"
                  >
                    <CheckOutlined />
                    确认
                  </a-button>
                  <a-button
                    v-else
                    size="small"
                    @click="rec.confirmed = false"
                  >
                    撤销
                  </a-button>
                  <a-button size="small" @click="rec.dismissed = true">驳回</a-button>
                </div>
                <a-tag v-else color="default">已驳回</a-tag>
              </div>
            </div>

            <!-- 底部统计 -->
            <div class="panel-footer">
              <div class="footer-info">
                已确认 <span class="confirmed-count">{{ confirmedFnCount }}</span> / {{ fnRecommendations.filter(r => !r.dismissed).length }} 条关联
              </div>
              <a-button type="primary" :disabled="confirmedFnCount === 0" @click="confirmAllFn">
                确认全部
              </a-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 动作 Tab -->
      <div v-if="activeTab === 'action'" class="action-panel">
        <div class="action-panel-header">
          <div class="header-left">
            <ThunderboltOutlined class="action-icon" />
            <span>动作定义</span>
            <span class="action-subtitle">将多个函数编排为一个执行包</span>
          </div>
          <div class="header-right">
            <a-button type="primary" @click="showNewActionModal = true">
              <PlusOutlined />
              新建动作
            </a-button>
            <a-button :loading="isAnalyzing" @click="handleAIRecommendAction">
              <RobotOutlined v-if="!isAnalyzing" />
              {{ isAnalyzing ? 'AI分析中...' : 'AI推荐组合' }}
            </a-button>
          </div>
        </div>

        <!-- 动作卡片网格 -->
        <div class="action-grid">
          <div v-for="action in actions" :key="action.id" class="action-card">
            <div class="action-card-header">
              <div class="action-name-wrap">
                <ThunderboltOutlined class="action-card-icon" />
                <div>
                  <div class="action-name">{{ action.nameCn }}</div>
                  <div class="action-name-en">{{ action.name }}</div>
                </div>
              </div>
              <div class="action-card-btns">
                <a-button type="link" size="small" @click="editAction(action)">
                  <EditOutlined />
                </a-button>
                <a-button type="link" size="small" danger @click="deleteAction(action.id)">
                  <DeleteOutlined />
                </a-button>
              </div>
            </div>

            <div class="action-functions">
              <div class="functions-label">包含函数：</div>
              <div class="functions-chips">
                <a-tag
                  v-for="fnId in action.functions"
                  :key="fnId"
                  :color="getFunctionTag(fnId).color"
                  class="fn-chip"
                >
                  <CodeOutlined />
                  {{ getFunctionTag(fnId).name }}
                </a-tag>
              </div>
            </div>

            <div class="action-card-footer">
              <a-tag v-if="action.isNew" color="green">新建</a-tag>
              <a-tag v-else color="blue">已有</a-tag>
              <span class="action-fn-count">{{ action.functions.length }} 个函数</span>
            </div>
          </div>

          <!-- 新建动作占位卡 -->
          <div class="action-card action-card--add" @click="showNewActionModal = true">
            <PlusOutlined class="add-icon" />
            <span>新建动作</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 新建/编辑动作弹窗 -->
    <a-modal
      v-model:open="showNewActionModal"
      :title="editingAction ? '编辑动作' : '新建动作'"
      @ok="handleSaveAction"
      @cancel="closeActionModal"
    >
      <a-form layout="vertical">
        <a-form-item label="动作名称（英文）">
          <a-input v-model:value="actionForm.name" placeholder="如：processUserOrder" />
        </a-form-item>
        <a-form-item label="动作名称（中文）">
          <a-input v-model:value="actionForm.nameCn" placeholder="如：处理用户订单" />
        </a-form-item>
        <a-form-item label="包含函数">
          <a-select
            v-model:value="actionForm.functions"
            mode="multiple"
            placeholder="选择要编排的函数"
            :options="functionOptions"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  CodeOutlined,
  ThunderboltOutlined,
  FolderOutlined,
  RobotOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  AppstoreOutlined,
  ApiOutlined,
  FileTextOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined
} from '@ant-design/icons-vue'
import { useCopilotStore } from '@/stores'

const copilotStore = useCopilotStore()

const activeTab = ref<'function' | 'action'>('function')
const isAnalyzing = ref(false)
const analyzeProgress = ref(0)
const selectedFunctionId = ref<string | null>(null)
const showNewActionModal = ref(false)
const editingAction = ref<ActionItem | null>(null)

// ---- 数据类型 ----
interface FunctionItem {
  id: string
  name: string
  type: 'script' | 'interface' | 'document'
  linkedEntity?: string
  uploadTime: string
  confirmed: boolean
}

interface ActionItem {
  id: string
  name: string
  nameCn: string
  functions: string[]
  isNew: boolean
}

interface FnRecommendation {
  functionName: string
  functionType: 'script' | 'interface' | 'document'
  entityName: string
  entityCn: string
  confidence: string
  desc: string
  confirmed: boolean
  dismissed: boolean
}

// ---- Mock 数据（模拟步骤1上传的工件） ----
const functions = ref<FunctionItem[]>([
  { id: 'f1', name: 'extract_user_info.py', type: 'script', uploadTime: '2024-03-15', confirmed: true },
  { id: 'f2', name: 'user_order_api.yaml', type: 'interface', uploadTime: '2024-03-15', confirmed: true },
  { id: 'f3', name: 'risk_calc.py', type: 'script', uploadTime: '2024-03-16', confirmed: false },
  { id: 'f4', name: 'crm_sync_api.json', type: 'interface', uploadTime: '2024-03-16', confirmed: false },
  { id: 'f5', name: '业务规则说明.pdf', type: 'document', uploadTime: '2024-03-17', confirmed: false },
  { id: 'f6', name: 'billing_calc.sql', type: 'script', uploadTime: '2024-03-17', confirmed: false },
])

const actions = ref<ActionItem[]>([
  {
    id: 'a1',
    name: 'processUserRisk',
    nameCn: '用户风险处理',
    functions: ['f1', 'f3'],
    isNew: true
  },
  {
    id: 'a2',
    name: 'syncOrderData',
    nameCn: '订单数据同步',
    functions: ['f2', 'f4'],
    isNew: true
  },
  {
    id: 'a3',
    name: 'calcBilling',
    nameCn: '计费结算',
    functions: ['f6'],
    isNew: false
  }
])

const fnRecommendations = ref<FnRecommendation[]>([
  {
    functionName: 'extract_user_info.py',
    functionType: 'script',
    entityName: 'User',
    entityCn: '用户',
    confidence: '高',
    desc: '脚本功能与用户实体的属性提取高度匹配',
    confirmed: true,
    dismissed: false
  },
  {
    functionName: 'user_order_api.yaml',
    functionType: 'interface',
    entityName: 'Order',
    entityCn: '订单',
    confidence: '高',
    desc: '接口文档描述了订单数据的创建与查询逻辑',
    confirmed: true,
    dismissed: false
  },
  {
    functionName: 'risk_calc.py',
    functionType: 'script',
    entityName: 'RiskLevel',
    entityCn: '风险等级',
    confidence: '中',
    desc: '脚本中包含风险等级计算相关字段引用',
    confirmed: false,
    dismissed: false
  },
  {
    functionName: 'billing_calc.sql',
    functionType: 'script',
    entityName: 'BillingRecord',
    entityCn: '计费记录',
    confidence: '中',
    desc: 'SQL脚本对计费明细表进行聚合计算',
    confirmed: false,
    dismissed: false
  },
  {
    functionName: 'crm_sync_api.json',
    functionType: 'interface',
    entityName: 'UserContact',
    entityCn: '用户联系方式',
    confidence: '低',
    desc: '接口涉及用户联系信息字段，置信度较低',
    confirmed: false,
    dismissed: false
  }
])

// ---- 新建/编辑动作表单 ----
const actionForm = ref({
  name: '',
  nameCn: '',
  functions: [] as string[]
})

const functionOptions = computed(() =>
  functions.value.map(f => ({
    label: f.name,
    value: f.id
  }))
)

// ---- 统计 ----
const confirmedFnCount = computed(() =>
  fnRecommendations.value.filter(r => r.confirmed && !r.dismissed).length
)

// ---- 工具函数 ----
function getTypeColor(type: string) {
  const map: Record<string, { bg: string; text: string; tag: string }> = {
    script: { bg: '#f9f0ff', text: '#722ed1', tag: 'purple' },
    interface: { bg: '#e6fffb', text: '#13c2c2', tag: 'cyan' },
    document: { bg: '#e6f7ff', text: '#1677ff', tag: 'blue' }
  }
  return map[type] || map.script
}

function getTypeLabel(type: string) {
  const map: Record<string, string> = {
    script: '脚本',
    interface: '接口',
    document: '文档'
  }
  return map[type] || type
}

function getFunctionTag(fnId: string) {
  const fn = functions.value.find(f => f.id === fnId)
  return fn
    ? { name: fn.name, color: getTypeColor(fn.type).tag }
    : { name: fnId, color: 'default' }
}

// ---- 操作方法 ----
function handleAIAnalyze() {
  copilotStore.triggerAIAnalysis(4)
  isAnalyzing.value = true
  analyzeProgress.value = 0
  const interval = setInterval(() => {
    analyzeProgress.value += 10
    if (analyzeProgress.value >= 100) {
      clearInterval(interval)
      isAnalyzing.value = false
    }
  }, 200)
}

function handleAIRecommendAction() {
  isAnalyzing.value = true
  setTimeout(() => {
    isAnalyzing.value = false
  }, 2000)
}

function confirmRec(rec: FnRecommendation) {
  rec.confirmed = true
  // 同步更新工件列表中的确认状态
  const fn = functions.value.find(f => f.name === rec.functionName)
  if (fn) fn.confirmed = true
}

function confirmAllFn() {
  fnRecommendations.value.forEach(r => {
    if (!r.dismissed) r.confirmed = true
  })
  functions.value.forEach(f => {
    f.confirmed = true
  })
}

function editAction(action: ActionItem) {
  editingAction.value = action
  actionForm.value = {
    name: action.name,
    nameCn: action.nameCn,
    functions: [...action.functions]
  }
  showNewActionModal.value = true
}

function deleteAction(id: string) {
  const idx = actions.value.findIndex(a => a.id === id)
  if (idx !== -1) actions.value.splice(idx, 1)
}

function handleSaveAction() {
  if (editingAction.value) {
    editingAction.value.name = actionForm.value.name
    editingAction.value.nameCn = actionForm.value.nameCn
    editingAction.value.functions = [...actionForm.value.functions]
  } else {
    actions.value.push({
      id: `a${Date.now()}`,
      name: actionForm.value.name,
      nameCn: actionForm.value.nameCn,
      functions: [...actionForm.value.functions],
      isNew: true
    })
  }
  closeActionModal()
}

function closeActionModal() {
  showNewActionModal.value = false
  editingAction.value = null
  actionForm.value = { name: '', nameCn: '', functions: [] }
}

// 监听副驾重新识别
watch(
  () => copilotStore.reidentifyAction,
  (action) => {
    if (action === 'reextract-functions') {
      handleAIAnalyze()
    }
  }
)
</script>

<style scoped>
.entity-logic {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-body);
  overflow: hidden;
}

/* Tab 栏 */
.tab-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 20px 0;
  background: var(--bg-white);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  cursor: pointer;
  border-radius: 8px 8px 0 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-item:hover {
  color: var(--primary-color);
  background: var(--primary-light);
}

.tab-item.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
  background: var(--primary-light);
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 18px;
  padding: 0 5px;
  background: var(--primary-light);
  color: var(--primary-color);
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}

.tab-item.active .tab-count {
  background: var(--primary-color);
  color: #fff;
}

/* 内容区 */
.tab-content {
  flex: 1;
  overflow: hidden;
}

/* ---- 函数面板 ---- */
.function-panel {
  display: flex;
  height: 100%;
}

/* 工件列表 */
.artifact-panel {
  width: 300px;
  background: var(--bg-white);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.artifact-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.artifact-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
}

.artifact-title :deep(.anticon) {
  color: var(--primary-color);
}

.artifact-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.artifact-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  margin-bottom: 4px;
}

.artifact-item:hover {
  background: var(--primary-light);
  border-color: var(--primary-color);
}

.artifact-item.selected {
  background: var(--primary-light);
  border-color: var(--primary-color);
}

.artifact-icon {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 16px;
  flex-shrink: 0;
}

.artifact-info {
  flex: 1;
  min-width: 0;
}

.artifact-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-main);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.artifact-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 3px;
}

.artifact-time {
  font-size: 11px;
  color: var(--text-secondary);
}

.artifact-status {
  flex-shrink: 0;
}

.confirmed-icon {
  color: #52c41a;
  font-size: 16px;
}

.unconfirmed-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #d9d9d9;
}

/* AI 推荐面板 */
.recommend-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: var(--bg-white);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-main);
}

.ai-icon {
  font-size: 20px;
  color: #722ed1;
}

.ai-loading {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 40px;
}

.loading-text {
  color: var(--text-secondary);
}

.recommendations-wrap {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 函数推荐卡片 */
.fn-rec-card {
  background: var(--bg-white);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 14px 16px;
  transition: border-color 0.2s;
}

.fn-rec-card.confirmed {
  border-color: #52c41a;
  background: #f6ffed;
}

.fn-rec-card.dismissed {
  opacity: 0.5;
}

.fn-rec-body {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.fn-node {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.fn-node-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 18px;
  flex-shrink: 0;
}

.fn-node-icon.script {
  background: #f9f0ff;
  color: #722ed1;
}

.fn-node-icon.entity {
  background: #e6f7ff;
  color: #1677ff;
}

.fn-node-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-main);
}

.fn-arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.arrow-line {
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, #d9d9d9 0%, var(--primary-color) 100%);
}

.confidence-tag {
  font-size: 11px;
}

.arrow-icon {
  color: var(--primary-color);
  font-size: 14px;
}

.fn-rec-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px dashed var(--border-color);
}

.rec-desc {
  font-size: 12px;
  color: var(--text-secondary);
  flex: 1;
}

.rec-btns {
  display: flex;
  gap: 8px;
}

/* 底部 */
.panel-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: var(--bg-white);
  border-top: 1px solid var(--border-color);
  margin-top: auto;
  flex-shrink: 0;
}

.footer-info {
  font-size: 13px;
  color: var(--text-secondary);
}

.confirmed-count {
  font-weight: 600;
  color: var(--primary-color);
}

/* ---- 动作面板 ---- */
.action-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.action-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: var(--bg-white);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.action-icon {
  font-size: 18px;
  color: #fa8c16;
}

.action-subtitle {
  font-size: 12px;
  color: var(--text-secondary);
  margin-left: 8px;
}

.header-right {
  display: flex;
  gap: 10px;
}

.action-grid {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  align-content: start;
}

.action-card {
  background: var(--bg-white);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: box-shadow 0.2s;
}

.action-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.action-card--add {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 2px dashed var(--border-color);
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 14px;
  min-height: 120px;
  transition: all 0.2s;
}

.action-card--add:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: var(--primary-light);
}

.add-icon {
  font-size: 24px;
}

.action-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.action-name-wrap {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.action-card-icon {
  font-size: 20px;
  color: #fa8c16;
  margin-top: 2px;
}

.action-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
}

.action-name-en {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.action-card-btns {
  display: flex;
  gap: 4px;
}

.action-functions {
  background: #fafafa;
  border-radius: 6px;
  padding: 10px;
}

.functions-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.functions-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.fn-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.action-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 8px;
  border-top: 1px dashed var(--border-color);
}

.action-fn-count {
  font-size: 12px;
  color: var(--text-secondary);
}
</style>
