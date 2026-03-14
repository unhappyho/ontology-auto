<template>
  <div class="action-recognition">
    <!-- 左侧：动作标注 -->
    <div class="action-panel">
      <div class="panel-header">
        <h3>动作标注</h3>
      </div>
      <div class="panel-body">
        <div class="action-categories">
          <div
            v-for="category in actionCategories"
            :key="category.name"
            class="action-category"
          >
            <div class="category-header">
              <span class="category-name">{{ category.name }}</span>
              <span class="category-count">{{ category.count }}</span>
            </div>
            <div class="action-list">
              <div
                v-for="action in category.actions"
                :key="action.label"
                class="action-item"
                :class="{ active: selectedActions.includes(action.label), [action.level]: true }"
                @click="toggleAction(action.label)"
              >
                <span class="action-icon">
                  <ThunderboltOutlined v-if="action.label === '举报'" />
                  <StopOutlined v-else-if="action.label === '限制'" />
                  <FileSearchOutlined v-else-if="action.label === '申请'" />
                  <PlusCircleOutlined v-else-if="action.label === '开设'" />
                  <ControlOutlined v-else-if="action.label === '控股'" />
                  <FileTextOutlined v-else />
                </span>
                <span class="action-label">{{ action.label }}</span>
                <span class="action-count">{{ action.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧：动作标注示例 -->
    <div class="content-panel">
      <div class="content-header">
        <div class="header-title">
          <ThunderboltOutlined />
          <span>动作标注示例</span>
        </div>
        <div class="header-actions">
          <a-radio-group v-model:value="viewMode" size="small">
            <a-radio-button value="list">列表</a-radio-button>
            <a-radio-button value="card">卡片</a-radio-button>
          </a-radio-group>
          <a-button type="primary" size="small">
            <RobotOutlined />
            AI智能标注
          </a-button>
        </div>
      </div>

      <div class="action-examples">
        <div v-for="item in actionExamples" :key="item.id" class="example-card">
          <div class="example-header">
            <div class="source-text">{{ item.text }}</div>
            <a-tag :color="getActionColor(item.action)">{{ item.action }}</a-tag>
          </div>
          <div class="example-body">
            <div class="participant-info">
              <div class="participant">
                <span class="participant-label">发起方:</span>
                <a-tag :color="item.sourceTypeColor">{{ item.source }}</a-tag>
              </div>
              <ArrowRightOutlined class="arrow-icon" />
              <div class="participant">
                <span class="participant-label">接收方:</span>
                <a-tag :color="item.targetTypeColor">{{ item.target }}</a-tag>
              </div>
            </div>
            <div v-if="item.amount" class="amount-info">
              <span class="amount-label">涉及金额:</span>
              <span class="amount-value">{{ item.amount }}</span>
            </div>
            <div v-if="item.time" class="time-info">
              <span class="time-label">时间:</span>
              <span class="time-value">{{ item.time }}</span>
            </div>
          </div>
          <div class="example-footer">
            <a-button type="text" size="small">
              <EditOutlined />
              编辑
            </a-button>
            <a-button type="text" size="small">
              <DeleteOutlined />
              删除
            </a-button>
            <a-button type="primary" size="small">
              <CheckOutlined />
              确认
            </a-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  ThunderboltOutlined,
  StopOutlined,
  FileSearchOutlined,
  PlusCircleOutlined,
  ControlOutlined,
  FileTextOutlined,
  RobotOutlined,
  ArrowRightOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined
} from '@ant-design/icons-vue'

const viewMode = ref('card')
const selectedActions = ref<string[]>([])

const actionCategories = [
  {
    name: '司法动作',
    count: 3,
    actions: [
      { label: '举报', count: 1, level: 'high' },
      { label: '限制', count: 1, level: 'high' },
      { label: '申请', count: 2, level: 'medium' }
    ]
  },
  {
    name: '经营动作',
    count: 2,
    actions: [
      { label: '开设', count: 1, level: 'medium' },
      { label: '控股', count: 1, level: 'medium' }
    ]
  }
]

const actionExamples = [
  {
    id: 1,
    text: '张三举报了李四',
    action: '举报',
    source: '张三',
    sourceTypeColor: '#165DFF',
    target: '李四',
    targetTypeColor: '#165DFF',
    time: '2024-08-15'
  },
  {
    id: 2,
    text: '李四被限制高消费',
    action: '限制',
    source: '法院',
    sourceTypeColor: '#F53F3F',
    target: '李四',
    targetTypeColor: '#165DFF',
    time: '2024-09-20'
  },
  {
    id: 3,
    text: '王五申请了强制执行',
    action: '申请',
    source: '王五',
    sourceTypeColor: '#165DFF',
    target: '李四',
    targetTypeColor: '#165DFF',
    time: '2024-10-05'
  },
  {
    id: 4,
    text: '张三开设了 xx科技有限公司',
    action: '开设',
    source: '张三',
    sourceTypeColor: '#165DFF',
    target: 'xx科技有限公司',
    targetTypeColor: '#00B42A',
    time: '2024-03-15'
  },
  {
    id: 5,
    text: '李四控股了 xx科技有限公司',
    action: '控股',
    source: '李四',
    sourceTypeColor: '#165DFF',
    target: 'xx科技有限公司',
    targetTypeColor: '#00B42A',
    amount: '60%',
    time: '2024-03-20'
  }
]

function toggleAction(label: string) {
  const index = selectedActions.value.indexOf(label)
  if (index === -1) {
    selectedActions.value.push(label)
  } else {
    selectedActions.value.splice(index, 1)
  }
}

function getActionColor(action: string): string {
  const colors: Record<string, string> = {
    '举报': '#F53F3F',
    '限制': '#FF7D00',
    '申请': '#722ED1',
    '开设': '#00B42A',
    '控股': '#165DFF'
  }
  return colors[action] || '#999'
}
</script>

<style scoped>
.action-recognition {
  display: flex;
  height: 100%;
  background: var(--bg-body);
}

/* 左侧动作面板 */
.action-panel {
  width: 260px;
  background: var(--bg-white);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.panel-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}

.panel-header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-main);
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.action-categories {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.category-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.category-count {
  font-size: 11px;
  color: var(--text-secondary);
  background: var(--bg-body);
  padding: 2px 8px;
  border-radius: 10px;
}

.action-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #fafafa;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-item:hover {
  background: var(--primary-light);
  border-color: var(--primary-color);
}

.action-item.active {
  background: var(--primary-light);
  border-color: var(--primary-color);
}

.action-item.high {
  border-left: 3px solid #F53F3F;
}

.action-item.medium {
  border-left: 3px solid #FA8C16;
}

.action-icon {
  font-size: 16px;
  color: var(--text-secondary);
}

.action-label {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-main);
}

.action-count {
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--bg-white);
  padding: 2px 8px;
  border-radius: 10px;
}

/* 右侧内容面板 */
.content-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: var(--bg-white);
  border-bottom: 1px solid var(--border-color);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-main);
}

.header-title :deep(.anticon) {
  color: #F53F3F;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-examples {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.example-card {
  background: var(--bg-white);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
}

.example-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: #fafafa;
  border-bottom: 1px solid var(--border-color);
}

.source-text {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-main);
}

.example-body {
  padding: 16px;
}

.participant-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.participant {
  display: flex;
  align-items: center;
  gap: 8px;
}

.participant-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.arrow-icon {
  color: var(--text-secondary);
}

.amount-info,
.time-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  font-size: 13px;
}

.amount-label,
.time-label {
  color: var(--text-secondary);
}

.amount-value {
  color: #FA8C16;
  font-weight: 500;
}

.time-value {
  color: var(--text-regular);
}

.example-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
  background: #fafafa;
}
</style>
