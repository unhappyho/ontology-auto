<template>
  <div class="rule-definition">
    <!-- 左侧面板 -->
    <div class="left-panel">
      <div class="panel-section">
        <div class="section-header">
          <FolderOutlined />
          <span>识别到的规则</span>
        </div>
        <div class="rule-types">
          <div
            v-for="ruleType in ruleTypes"
            :key="ruleType.name"
            class="rule-type-item"
            :class="{ active: selectedRuleType === ruleType.name }"
            @click="selectedRuleType = ruleType.name"
          >
            <div class="rule-type-header">
              <span class="rule-type-name">{{ ruleType.name }}</span>
              <a-badge :count="ruleType.count" :number-style="{ backgroundColor: '#e6f7ff', color: '#1890ff' }" />
            </div>
            <div class="rule-type-desc">{{ ruleType.desc }}</div>
          </div>
        </div>
      </div>

      <a-divider />

      <div class="panel-section">
        <div class="section-header">
          <AimOutlined />
          <span>动作要素库</span>
        </div>
        <div class="action-tags">
          <div v-for="action in actionElements" :key="action" class="action-tag">
            <ThunderboltOutlined />
            {{ action }}
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧面板：AI推荐配置 -->
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

      <!-- AI分析Loading -->
      <div v-if="isAnalyzing" class="ai-loading">
        <a-spin size="large" />
        <div class="loading-text">AI正在分析关联数据，生成推荐规则...</div>
        <a-progress :percent="analyzeProgress" status="active" />
      </div>

      <!-- AI推荐配置列表 -->
      <div v-else class="ai-recommendations">
        <div v-for="(rec, index) in recommendations" :key="index" class="recommendation-card">
          <div class="rec-header">
            <div class="rec-icon">
              <BulbOutlined />
            </div>
            <div class="rec-title">{{ rec.name }}</div>
            <a-button type="link" size="small" class="rec-edit-btn" @click="handleEditRule(rec)">
              <EditOutlined />
              编辑
            </a-button>
          </div>

          <div class="rec-condition">
            <span class="condition-label">当</span>
            <span class="condition-text" v-html="highlightAttributes(rec.condition)"></span>
          </div>

          <div class="rec-result">
            <span class="result-label">则</span>
            <span class="result-text">{{ rec.result }}</span>
          </div>

          <div class="rec-impact">
            <span class="impact-label">预计影响:</span>
            <span class="impact-value clickable" @click="handleShowImpact(rec)">{{ rec.impact }}</span>
          </div>

          <div class="rec-actions">
            <a-checkbox v-model:checked="rec.confirmed">确认</a-checkbox>
          </div>
        </div>

        <!-- 底部操作按钮 -->
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
  FolderOutlined,
  AimOutlined,
  RobotOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  EditOutlined
} from '@ant-design/icons-vue'

const selectedRuleType = ref('派生关系')
const isAnalyzing = ref(false)
const analyzeProgress = ref(0)

const ruleTypes = [
  { name: '派生关系', count: 3, desc: '从基础关系推导出新关系' },
  { name: '动态分类', count: 5, desc: '根据条件动态归类到概念' },
  { name: '事理传导', count: 2, desc: '事件因果或顺承推理' }
]

const actionElements = ['创建', '认缴', '控股', '限制', '举报', '申请', '开设', '出资']

const recommendations = ref([
  {
    name: '高风险公司规则',
    condition: '注册资本 > 50万',
    result: '标记为"高风险公司"',
    impact: '12 个企业',
    confirmed: true
  },
  {
    name: '控股关系规则',
    condition: 'A控股B 且 B风险等级=高',
    result: 'A也标记为"关联风险"',
    impact: '8 个企业',
    confirmed: true
  },
  {
    name: '认缴出资规则',
    condition: '自然人认缴出资 > 100万元',
    result: '标记为"主要出资人"',
    impact: '23 个自然人',
    confirmed: false
  },
  {
    name: '任职关系规则',
    condition: '自然人担任企业高管',
    result: '建立"担任高管"关联',
    impact: '45 个关系',
    confirmed: false
  }
])

const confirmedCount = computed(() => {
  return recommendations.value.filter(r => r.confirmed).length
})

function handleAIAnalyze() {
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
  recommendations.value.forEach(r => {
    r.confirmed = true
  })
}

// 高亮属性（将属性名转换为带颜色的HTML）
function highlightAttributes(condition: string): string {
  // 属性到物理字段的映射
  const attrMap: Record<string, string> = {
    '注册资本': 'Registered_Capital',
    '风险等级': 'Risk_Level',
    '控股比例': 'Shareholding_Ratio',
    '认缴出资': 'Contributed_Capital',
    '自然人': 'Natural_Person'
  }

  let result = condition
  for (const [attr, field] of Object.entries(attrMap)) {
    // 替换属性名为带颜色的格式
    const regex = new RegExp(attr, 'g')
    result = result.replace(regex, `<span class="attr-highlight">${attr}(${field})</span>`)
  }
  return result
}

// 处理点击影响数量
function handleShowImpact(rec: any) {
  // 触发全局事件或通过emit通知父组件显示影响列表
  // 这里使用window事件机制
  window.dispatchEvent(new CustomEvent('show-impact-entity-list', { detail: rec }))
}

// 处理编辑规则
function handleEditRule(rec: any) {
  window.dispatchEvent(new CustomEvent('edit-rule', { detail: rec }))
}
</script>

<style scoped>
.rule-definition {
  display: flex;
  height: 100%;
  background: var(--bg-body);
}

/* 左侧面板 */
.left-panel {
  width: 320px;
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

.rule-types {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rule-type-item {
  padding: 12px;
  background: #fafafa;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.rule-type-item:hover {
  background: var(--primary-light);
  border-color: var(--primary-color);
}

.rule-type-item.active {
  background: var(--primary-light);
  border-color: var(--primary-color);
}

.rule-type-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.rule-type-name {
  font-weight: 500;
  color: var(--text-main);
}

.rule-type-desc {
  font-size: 12px;
  color: var(--text-secondary);
}

.action-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.action-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #f0f5ff;
  border: 1px solid #d6e4ff;
  border-radius: 16px;
  font-size: 13px;
  color: var(--primary-color);
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
  background: #fff7e6;
  border-radius: 50%;
  color: #fa8c16;
}

.rec-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
}

.rec-condition,
.rec-result {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
  padding: 8px 10px;
  background: #fafafa;
  border-radius: 6px;
}

.condition-label,
.result-label {
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

.condition-text,
.result-text {
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

.impact-value.clickable {
  cursor: pointer;
  text-decoration: underline;
}

.impact-value.clickable:hover {
  color: #0d47a1;
}

/* 属性高亮样式 */
:deep(.attr-highlight) {
  color: #165DFF;
  font-weight: 500;
  background: #E6F4FF;
  padding: 1px 4px;
  border-radius: 3px;
}

/* 编辑按钮 */
.rec-edit-btn {
  margin-left: auto;
  font-size: 12px;
  color: var(--text-secondary);
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
