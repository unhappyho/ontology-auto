<template>
  <div class="action-definition">
    <!-- 左侧面板 -->
    <div class="left-panel">
      <div class="panel-section">
        <div class="section-header">
          <ThunderboltOutlined />
          <span>识别到的动作</span>
        </div>

        <div class="action-categories">
          <div v-for="category in actionCategories" :key="category.name" class="action-category">
            <div class="category-header">
              <span class="category-name">{{ category.name }}</span>
              <a-badge :count="category.total" :number-style="{ backgroundColor: category.color + '20', color: category.color }" />
            </div>
            <div class="action-list">
              <div v-for="action in category.actions" :key="action.label" class="action-item">
                <div class="action-info">
                  <span class="action-label">{{ action.label }}</span>
                  <span class="action-count">{{ action.count }}条</span>
                </div>
                <a-checkbox v-model:checked="action.enabled" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <a-divider />

      <div class="panel-section">
        <div class="section-header">
          <DatabaseOutlined />
          <span>标准化物化</span>
        </div>
        <div class="standard-list">
          <div v-for="item in standardItems" :key="item.label" class="standard-item">
            <a-checkbox v-model:checked="item.enabled">
              <span class="standard-label">{{ item.label }}</span>
            </a-checkbox>
            <span class="standard-desc">{{ item.desc }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧面板 -->
    <div class="right-panel">
      <div class="panel-header">
        <div class="header-left">
          <RobotOutlined class="ai-icon" />
          <span>AI推荐配置</span>
        </div>
        <a-button type="primary" :loading="isAnalyzing" @click="handleAIAnalyze">
          <BulbOutlined v-if="!isAnalyzing" />
          {{ isAnalyzing ? 'AI分析中...' : '重新分析' }}
        </a-button>
      </div>

      <!-- AI Loading -->
      <div v-if="isAnalyzing" class="ai-loading">
        <a-spin size="large" />
        <div class="loading-text">AI正在分析动作数据，生成推荐规则...</div>
        <a-progress :percent="analyzeProgress" status="active" />
      </div>

      <!-- AI推荐配置 -->
      <div v-else class="ai-recommendations">
        <div v-for="(rec, index) in recommendations" :key="index" class="recommendation-card">
          <div class="rec-header">
            <div class="rec-icon">
              <ThunderboltOutlined />
            </div>
            <div class="rec-title">{{ rec.name }}</div>
          </div>

          <div class="rec-condition">
            <span class="condition-label">当</span>
            <span class="condition-text">{{ rec.condition }}</span>
          </div>

          <div v-if="rec.condition2" class="rec-condition">
            <span class="condition-label">且</span>
            <span class="condition-text">{{ rec.condition2 }}</span>
          </div>

          <div class="rec-result">
            <span class="result-label">则</span>
            <span class="result-text">{{ rec.result }}</span>
          </div>

          <div v-if="rec.action" class="rec-action">
            <span class="action-label">同时</span>
            <span class="action-text">{{ rec.action }}</span>
          </div>

          <div class="rec-impact">
            <span class="impact-label">预计触发:</span>
            <span class="impact-value">{{ rec.impact }}</span>
          </div>

          <div class="rec-actions">
            <a-checkbox v-model:checked="rec.confirmed">确认</a-checkbox>
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="panel-footer">
          <div class="footer-info">
            已确认 <span class="confirmed-count">{{ confirmedCount }}</span> / {{ recommendations.length }} 条规则
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ThunderboltOutlined,
  DatabaseOutlined,
  RobotOutlined,
  BulbOutlined
} from '@ant-design/icons-vue'
import { useCopilotStore } from '@/stores'

const copilotStore = useCopilotStore()

const isAnalyzing = ref(false)
const analyzeProgress = ref(0)

const actionCategories = ref([
  {
    name: '司法动作',
    color: '#F53F3F',
    total: 10,
    actions: [
      { label: '举报', count: 3, enabled: true },
      { label: '限制', count: 2, enabled: true },
      { label: '申请', count: 5, enabled: true }
    ]
  },
  {
    name: '经营动作',
    color: '#00B42A',
    total: 26,
    actions: [
      { label: '开设', count: 8, enabled: true },
      { label: '控股', count: 6, enabled: true },
      { label: '认缴', count: 12, enabled: true }
    ]
  }
])

const standardItems = ref([
  { label: '手机号', desc: '标准类型std.PhoneNum', enabled: true },
  { label: '身份证号', desc: '标准类型std.IDCard', enabled: true },
  { label: '银行账号', desc: '标准类型std.BankAccount', enabled: true },
  { label: '邮箱地址', desc: '标准类型std.Email', enabled: false }
])

const recommendations = ref([
  {
    name: '可疑交易监控',
    condition: '交易金额 > 10万元',
    condition2: '收款方为高风险账户',
    result: '创建"可疑交易报告"',
    action: '发送预警邮件',
    impact: '15 次/月',
    confirmed: true
  },
  {
    name: '风险传导规则',
    condition: 'A控股B 且 B触发风险',
    condition2: null,
    result: '自动标记A为关联风险',
    action: null,
    impact: '32 个企业',
    confirmed: true
  },
  {
    name: '出资异常监控',
    condition: '认缴金额 > 500万元',
    condition2: '30日内未实缴',
    result: '标记为"出资异常"',
    action: '触发尽职调查',
    impact: '8 个企业',
    confirmed: false
  },
  {
    name: '任职风险关联',
    condition: '高管所在企业触发风险',
    condition2: null,
    result: '标记高管为"关联风险"',
    action: null,
    impact: '15 人',
    confirmed: false
  }
])

const confirmedCount = computed(() => {
  return recommendations.value.filter(r => r.confirmed).length
})

function handleAIAnalyze() {
  // 打开 AI 助手面板
  copilotStore.openPanel()
  // 设置当前步骤上下文
  copilotStore.setStepContext(5)
  // 添加分析消息
  copilotStore.addMessage('assistant', '正在分析用户行为数据，识别动作模式...')

  // 本地分析动画
  isAnalyzing.value = true
  analyzeProgress.value = 0

  const interval = setInterval(() => {
    analyzeProgress.value += 10
    if (analyzeProgress.value >= 100) {
      clearInterval(interval)
      isAnalyzing.value = false

      // AI 分析完成消息
      copilotStore.addMessage('assistant', '动作识别完成！发现以下动作类型：\n\n1. 登录/登出事件\n2. 订单创建/支付事件\n3. 产品浏览/收藏事件\n4. 投诉提交/处理事件\n\n典型路径：\n1. 浏览 → 收藏 → 购买\n2. 登录 → 浏览 → 搜索 → 购买\n3. 投诉 → 处理 → 评价\n\n是否需要查看详情？')
      // 显示建议卡片
      copilotStore.suggestions = [
        {
          id: 'step5-ai-1',
          type: 'summary',
          title: '动作类型识别',
          description: '已完成动作类型识别，发现以下动作模式',
          content: '识别结果：\n- 用户登录/登出 (登录事件)\n- 订单创建/支付 (交易事件)\n- 产品浏览/收藏 (浏览事件)\n- 投诉提交/处理 (服务事件)',
          stats: {
            '登录事件': 456,
            '交易事件': 523,
            '浏览事件': 187,
            '服务事件': 89
          },
          actionLabel: '查看详情'
        },
        {
          id: 'step5-ai-2',
          type: 'summary',
          title: '动作序列分析',
          description: '基于用户行为序列，发现以下典型路径',
          content: '典型路径：\n1. 浏览 → 收藏 → 购买\n2. 登录 → 浏览 → 搜索 → 购买\n3. 投诉 → 处理 → 评价\n\n建议：为"浏览→购买"路径优化转化率',
          actionLabel: '采纳建议'
        }
      ]
    }
  }, 200)
}

function handleAdjust() {
  // 调整逻辑
}

function handleConfirmAll() {
  recommendations.value.forEach(r => {
    r.confirmed = true
  })
}
</script>

<style scoped>
.action-definition {
  display: flex;
  height: 100%;
  background: var(--bg-body);
}

/* 左侧面板 */
.left-panel {
  width: 340px;
  background: var(--bg-white);
  border-right: 1px solid var(--border-color);
  padding: 20px;
  overflow-y: auto;
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
  margin-bottom: 16px;
}

.section-header :deep(.anticon) {
  color: var(--primary-color);
}

.action-categories {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.action-category {
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
}

.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.category-name {
  font-weight: 600;
  font-size: 13px;
  color: var(--text-main);
}

.action-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background: var(--bg-white);
  border-radius: 6px;
}

.action-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-label {
  font-size: 13px;
  color: var(--text-main);
}

.action-count {
  font-size: 11px;
  color: var(--text-secondary);
  background: var(--bg-body);
  padding: 2px 6px;
  border-radius: 8px;
}

/* 标准化物化 */
.standard-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.standard-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.standard-label {
  font-size: 13px;
  color: var(--text-main);
}

.standard-desc {
  font-size: 11px;
  color: var(--text-secondary);
  margin-left: 24px;
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
  color: #722ED1;
}

/* AI Loading */
.ai-loading {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.loading-text {
  color: var(--text-secondary);
}

/* AI推荐配置 */
.ai-recommendations {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.recommendation-card {
  background: var(--bg-white);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
}

.rec-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.rec-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff1f0;
  border-radius: 50%;
  color: #f53f3f;
}

.rec-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
}

.rec-condition,
.rec-result,
.rec-action {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
  padding: 8px 10px;
  background: #fafafa;
  border-radius: 6px;
}

.condition-label,
.result-label,
.action-label {
  flex-shrink: 0;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.condition-label {
  background: #e6f7ff;
  color: #1890ff;
}

.result-label {
  background: #f6ffed;
  color: #52c41a;
}

.action-label {
  background: #fff7e6;
  color: #fa8c16;
}

.condition-text,
.result-text,
.action-text {
  font-size: 13px;
  color: var(--text-main);
}

.rec-impact {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed var(--border-color);
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

.rec-actions {
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
