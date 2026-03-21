<template>
  <div class="business-rules">
    <!-- 左侧面板 -->
    <div class="left-panel">
      <div class="panel-section">
        <div class="section-header">
          <BarChartOutlined />
          <span>规则统计</span>
        </div>
        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-number">{{ rules.length }}</div>
            <div class="stat-label">总规则数</div>
          </div>
          <div class="stat-card stat-card--confirmed">
            <div class="stat-number">{{ confirmedCount }}</div>
            <div class="stat-label">已确认</div>
          </div>
          <div class="stat-card stat-card--pending">
            <div class="stat-number">{{ rules.length - confirmedCount }}</div>
            <div class="stat-label">待确认</div>
          </div>
        </div>
      </div>

      <a-divider />

      <div class="panel-section">
        <div class="section-header">
          <ThunderboltOutlined />
          <span>可用动作</span>
        </div>
        <div class="action-list">
          <div
            v-for="action in availableActions"
            :key="action.id"
            class="action-item"
          >
            <div class="action-dot"></div>
            <div class="action-info">
              <div class="action-name">{{ action.nameCn }}</div>
              <div class="action-fn-count">包含 {{ action.fnCount }} 个函数</div>
            </div>
            <ThunderboltOutlined class="action-right-icon" />
          </div>
        </div>
        <div class="action-tip">
          <InfoCircleOutlined />
          <span>在步骤4「实体逻辑」中定义动作</span>
        </div>
      </div>
    </div>

    <!-- 右侧面板 -->
    <div class="right-panel">
      <div class="panel-header">
        <div class="header-left">
          <RobotOutlined class="ai-icon" />
          <span>AI 推荐业务规则</span>
        </div>
        <a-button type="primary" :loading="isAnalyzing" @click="handleAIAnalyze">
          <BulbOutlined v-if="!isAnalyzing" />
          {{ isAnalyzing ? 'AI分析中...' : '重新分析' }}
        </a-button>
      </div>

      <!-- Loading -->
      <div v-if="isAnalyzing" class="ai-loading">
        <a-spin size="large" />
        <div class="loading-text">AI正在分析实体属性与动作，生成业务规则推荐...</div>
        <a-progress :percent="analyzeProgress" status="active" />
      </div>

      <!-- 规则推荐列表 -->
      <div v-else class="ai-recommendations">
        <div v-for="(rule, index) in rules" :key="index" class="rule-card">
          <div class="rule-header">
            <div class="rule-icon">
              <FileProtectOutlined />
            </div>
            <div class="rule-title">{{ rule.name }}</div>
            <a-tag v-if="rule.isNew" color="green" class="rule-new-tag">AI推荐</a-tag>
            <a-button type="link" size="small" class="rule-edit-btn" @click="editRule(rule)">
              <EditOutlined />
              编辑
            </a-button>
          </div>

          <!-- 条件行 -->
          <div class="rule-condition">
            <span class="cond-label">当</span>
            <div class="cond-expression">
              <span class="cond-entity">{{ rule.entityName }}</span>
              <span class="cond-sep">的</span>
              <span class="cond-attr">{{ rule.attribute }}</span>
              <span class="cond-op">{{ rule.operator }}</span>
              <span class="cond-value">{{ rule.value }}</span>
            </div>
          </div>

          <!-- 动作行 -->
          <div class="rule-action">
            <span class="action-label">则</span>
            <div class="action-expression">
              <span class="action-verb">执行动作</span>
              <span class="action-name-highlight">
                <ThunderboltOutlined />
                {{ rule.actionName }}
              </span>
            </div>
          </div>

          <!-- 影响信息 -->
          <div class="rule-impact">
            <InfoCircleOutlined class="impact-icon" />
            <span class="impact-label">预计影响:</span>
            <span class="impact-value clickable" @click="handleShowImpact(rule)">{{ rule.impact }}</span>
          </div>

          <!-- 确认 -->
          <div class="rule-confirm">
            <a-checkbox v-model:checked="rule.confirmed">确认规则</a-checkbox>
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="panel-footer">
          <div class="footer-info">
            已确认 <span class="confirmed-count">{{ confirmedCount }}</span> / {{ rules.length }} 条规则
          </div>
          <div class="footer-buttons">
            <a-button @click="handleAdjust">调整</a-button>
            <a-button type="primary" :disabled="confirmedCount === 0" @click="handleConfirmAll">
              确认全部
            </a-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑规则弹窗 -->
    <a-modal
      v-model:open="showEditModal"
      title="编辑业务规则"
      @ok="handleSaveRule"
      @cancel="showEditModal = false"
    >
      <a-form layout="vertical" v-if="editingRule">
        <a-form-item label="规则名称">
          <a-input v-model:value="editingRule.name" />
        </a-form-item>
        <a-form-item label="触发实体">
          <a-input v-model:value="editingRule.entityName" />
        </a-form-item>
        <a-form-item label="属性">
          <a-input v-model:value="editingRule.attribute" />
        </a-form-item>
        <a-form-item label="运算符">
          <a-select v-model:value="editingRule.operator">
            <a-select-option value="=">=（等于）</a-select-option>
            <a-select-option value=">">&gt;（大于）</a-select-option>
            <a-select-option value="<">&lt;（小于）</a-select-option>
            <a-select-option value=">=">&gt;=（大于等于）</a-select-option>
            <a-select-option value="<=">&lt;=（小于等于）</a-select-option>
            <a-select-option value="!=">!=（不等于）</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="条件值">
          <a-input v-model:value="editingRule.value" />
        </a-form-item>
        <a-form-item label="执行动作">
          <a-select v-model:value="editingRule.actionName">
            <a-select-option v-for="a in availableActions" :key="a.id" :value="a.nameCn">
              {{ a.nameCn }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  ThunderboltOutlined,
  RobotOutlined,
  BulbOutlined,
  InfoCircleOutlined,
  BarChartOutlined,
  FileProtectOutlined,
  EditOutlined
} from '@ant-design/icons-vue'
import { useCopilotStore } from '@/stores'

const copilotStore = useCopilotStore()

const isAnalyzing = ref(false)
const analyzeProgress = ref(0)
const showEditModal = ref(false)
const editingRule = ref<BusinessRule | null>(null)

interface BusinessRule {
  id: string
  name: string
  entityName: string
  attribute: string
  operator: string
  value: string
  actionId: string
  actionName: string
  impact: string
  confirmed: boolean
  isNew: boolean
}

// 可用动作列表（来自步骤4定义的动作）
const availableActions = ref([
  { id: 'a1', nameCn: '用户风险处理', fnCount: 2 },
  { id: 'a2', nameCn: '订单数据同步', fnCount: 2 },
  { id: 'a3', nameCn: '计费结算', fnCount: 1 }
])

// AI 推荐的业务规则（Mock数据）
const rules = ref<BusinessRule[]>([
  {
    id: 'r1',
    name: '高风险用户规则',
    entityName: 'User',
    attribute: '风险评分',
    operator: '>',
    value: '80',
    actionId: 'a1',
    actionName: '用户风险处理',
    impact: '12 个用户',
    confirmed: true,
    isNew: true
  },
  {
    id: 'r2',
    name: '订单超时同步规则',
    entityName: 'Order',
    attribute: '超时时长',
    operator: '>=',
    value: '24h',
    actionId: 'a2',
    actionName: '订单数据同步',
    impact: '36 个订单',
    confirmed: true,
    isNew: true
  },
  {
    id: 'r3',
    name: '大额认缴计费规则',
    entityName: 'BillingRecord',
    attribute: '认缴金额',
    operator: '>',
    value: '100万',
    actionId: 'a3',
    actionName: '计费结算',
    impact: '8 条记录',
    confirmed: false,
    isNew: true
  },
  {
    id: 'r4',
    name: '用户状态异常处理',
    entityName: 'User',
    attribute: '账户状态',
    operator: '=',
    value: '异常',
    actionId: 'a1',
    actionName: '用户风险处理',
    impact: '5 个用户',
    confirmed: false,
    isNew: true
  }
])

const confirmedCount = computed(() =>
  rules.value.filter(r => r.confirmed).length
)

function handleAIAnalyze() {
  copilotStore.triggerAIAnalysis(5)
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

function handleAdjust() {
  // 调整逻辑
}

function handleConfirmAll() {
  rules.value.forEach(r => {
    r.confirmed = true
  })
}

function editRule(rule: BusinessRule) {
  editingRule.value = { ...rule }
  showEditModal.value = true
}

function handleSaveRule() {
  if (editingRule.value) {
    const idx = rules.value.findIndex(r => r.id === editingRule.value!.id)
    if (idx !== -1) {
      rules.value[idx] = { ...editingRule.value }
    }
  }
  showEditModal.value = false
  editingRule.value = null
}

function handleShowImpact(rule: BusinessRule) {
  window.dispatchEvent(new CustomEvent('show-impact-entity-list', { detail: rule }))
}

// 监听副驾重新识别
watch(
  () => copilotStore.reidentifyAction,
  (action) => {
    if (action === 'reextract-rules') {
      handleAIAnalyze()
    }
  }
)
</script>

<style scoped>
.business-rules {
  display: flex;
  height: 100%;
  background: var(--bg-body);
}

/* 左侧面板 */
.left-panel {
  width: 300px;
  background: var(--bg-white);
  border-right: 1px solid var(--border-color);
  padding: 20px;
  overflow-y: auto;
  flex-shrink: 0;
}

.panel-section {
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 14px;
}

.section-header :deep(.anticon) {
  color: var(--primary-color);
}

/* 统计卡片 */
.stats-row {
  display: flex;
  gap: 10px;
}

.stat-card {
  flex: 1;
  padding: 12px 8px;
  background: #fafafa;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  text-align: center;
}

.stat-card--confirmed {
  background: #f6ffed;
  border-color: #b7eb8f;
}

.stat-card--pending {
  background: #fff7e6;
  border-color: #ffd591;
}

.stat-number {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1;
}

.stat-card--confirmed .stat-number {
  color: #52c41a;
}

.stat-card--pending .stat-number {
  color: #fa8c16;
}

.stat-label {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 4px;
}

/* 动作列表 */
.action-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #f0f5ff;
  border: 1px solid #d6e4ff;
  border-radius: 8px;
}

.action-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #1677ff;
  flex-shrink: 0;
}

.action-info {
  flex: 1;
  min-width: 0;
}

.action-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-main);
}

.action-fn-count {
  font-size: 11px;
  color: var(--text-secondary);
}

.action-right-icon {
  color: #fa8c16;
  font-size: 14px;
}

.action-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary);
  padding: 8px;
  background: #fafafa;
  border-radius: 6px;
}

.action-tip :deep(.anticon) {
  color: #1677ff;
}

/* 右侧面板 */
.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
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

/* Loading */
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

/* 推荐列表 */
.ai-recommendations {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 规则卡片 */
.rule-card {
  background: var(--bg-white);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  transition: border-color 0.2s;
}

.rule-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.rule-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e6f7ff;
  border-radius: 50%;
  color: #1677ff;
  font-size: 14px;
  flex-shrink: 0;
}

.rule-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
  flex: 1;
}

.rule-new-tag {
  flex-shrink: 0;
}

.rule-edit-btn {
  font-size: 12px;
  color: var(--text-secondary);
  padding: 0;
}

/* 条件行 */
.rule-condition,
.rule-action {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  margin-bottom: 8px;
}

.rule-condition {
  background: #e6f4ff;
}

.rule-action {
  background: #f6ffed;
}

.cond-label {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  background: #1677ff;
  color: #fff;
  border-radius: 4px;
}

.action-label {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  background: #52c41a;
  color: #fff;
  border-radius: 4px;
}

.cond-expression {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.cond-entity {
  font-weight: 600;
  color: #1677ff;
  font-size: 13px;
  padding: 1px 6px;
  background: #bae0ff;
  border-radius: 4px;
}

.cond-sep {
  font-size: 12px;
  color: var(--text-secondary);
}

.cond-attr {
  font-weight: 500;
  color: #722ed1;
  font-size: 13px;
  padding: 1px 6px;
  background: #efdbff;
  border-radius: 4px;
}

.cond-op {
  font-size: 13px;
  font-weight: 600;
  color: #fa8c16;
}

.cond-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
  padding: 1px 6px;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 4px;
}

.action-expression {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-verb {
  font-size: 13px;
  color: var(--text-secondary);
}

.action-name-highlight {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  color: #52c41a;
  font-size: 13px;
  padding: 1px 8px;
  background: #d9f7be;
  border-radius: 4px;
}

/* 影响行 */
.rule-impact {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed var(--border-color);
}

.impact-icon {
  color: var(--text-secondary);
  font-size: 13px;
}

.impact-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.impact-value {
  font-size: 13px;
  font-weight: 500;
  color: var(--primary-color);
}

.impact-value.clickable {
  cursor: pointer;
  text-decoration: underline;
}

.impact-value.clickable:hover {
  color: #0d47a1;
}

/* 确认行 */
.rule-confirm {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

/* 底部操作 */
.panel-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
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

.footer-buttons {
  display: flex;
  gap: 12px;
}
</style>
