<template>
  <div class="rule-recognition">
    <!-- 左侧：动作要素标注 -->
    <div class="annotation-panel">
      <div class="panel-header">
        <h3>动作要素标注</h3>
      </div>
      <div class="panel-body">
        <div class="annotation-section">
          <div class="section-title">主体要素</div>
          <div class="tags-list">
            <div
              v-for="tag in subjectTags"
              :key="tag.label"
              class="entity-tag"
              :class="{ active: selectedTags.includes(tag.label) }"
              @click="toggleTag(tag.label)"
            >
              <span class="tag-dot" :style="{ background: tag.color }"></span>
              {{ tag.label }}
              <span class="tag-count">{{ tag.count }}</span>
            </div>
          </div>
        </div>

        <div class="annotation-section">
          <div class="section-title">客体要素</div>
          <div class="tags-list">
            <div
              v-for="tag in objectTags"
              :key="tag.label"
              class="entity-tag"
              :class="{ active: selectedTags.includes(tag.label) }"
              @click="toggleTag(tag.label)"
            >
              <span class="tag-dot" :style="{ background: tag.color }"></span>
              {{ tag.label }}
              <span class="tag-count">{{ tag.count }}</span>
            </div>
          </div>
        </div>

        <div class="annotation-section">
          <div class="section-title">数值要素</div>
          <div class="tags-list">
            <div
              v-for="tag in valueTags"
              :key="tag.label"
              class="entity-tag"
              :class="{ active: selectedTags.includes(tag.label) }"
              @click="toggleTag(tag.label)"
            >
              <span class="tag-dot" :style="{ background: tag.color }"></span>
              {{ tag.label }}
              <span class="tag-count">{{ tag.count }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧：规则标注示例 -->
    <div class="content-panel">
      <div class="content-header">
        <div class="header-title">
          <FileTextOutlined />
          <span>规则标注示例</span>
        </div>
        <div class="header-actions">
          <a-button type="primary" size="small">
            <PlusOutlined />
            批量智能标注
          </a-button>
        </div>
      </div>

      <div class="annotation-list">
        <div v-for="item in ruleExamples" :key="item.id" class="annotation-card">
          <div class="card-original">
            <span class="original-text">{{ item.text }}</span>
          </div>
          <div class="card-annotations">
            <div
              v-for="ann in item.annotations"
              :key="ann.text"
              class="annotation-chip"
              :style="{ borderColor: ann.color, background: ann.color + '20' }"
            >
              <span class="chip-type">{{ ann.type }}</span>
              <span class="chip-text">{{ ann.text }}</span>
              <span class="chip-role">{{ ann.role }}</span>
            </div>
          </div>
          <div class="card-actions">
            <a-button type="text" size="small">
              <EditOutlined />
              编辑
            </a-button>
            <a-button type="text" size="small" status="success">
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
  FileTextOutlined,
  PlusOutlined,
  EditOutlined,
  CheckOutlined
} from '@ant-design/icons-vue'

const selectedTags = ref<string[]>([])

const subjectTags = [
  { label: '自然人', color: '#165DFF', count: 3 },
  { label: '企业', color: '#00B42A', count: 2 },
  { label: '社会组织', color: '#722ED1', count: 1 }
]

const objectTags = [
  { label: '企业', color: '#00B42A', count: 4 },
  { label: '股份', color: '#FA8C16', count: 2 },
  { label: '资产', color: '#F53F3F', count: 1 }
]

const valueTags = [
  { label: '金额', color: '#FA8C16', count: 3 },
  { label: '比例', color: '#14C9C9', count: 1 }
]

const ruleExamples = [
  {
    id: 1,
    text: '张三创建了 xx科技有限公司',
    annotations: [
      { text: '张三', type: '自然人', role: '主体', color: '#165DFF' },
      { text: '创建', type: '动作', role: '关系', color: '#722ED1' },
      { text: 'xx科技有限公司', type: '企业', role: '客体', color: '#00B42A' }
    ]
  },
  {
    id: 2,
    text: 'xx科技有限公司认缴了 500万元',
    annotations: [
      { text: 'xx科技有限公司', type: '企业', role: '主体', color: '#00B42A' },
      { text: '认缴', type: '动作', role: '关系', color: '#722ED1' },
      { text: '500万元', type: '金额', role: '数值', color: '#FA8C16' }
    ]
  },
  {
    id: 3,
    text: 'xx科技认缴了 500万元',
    annotations: [
      { text: 'xx科技', type: '企业', role: '主体', color: '#00B42A' },
      { text: '认缴', type: '动作', role: '关系', color: '#722ED1' },
      { text: '500万元', type: '金额', role: '数值', color: '#FA8C16' }
    ]
  },
  {
    id: 4,
    text: '张三认缴了 100万元',
    annotations: [
      { text: '张三', type: '自然人', role: '主体', color: '#165DFF' },
      { text: '认缴', type: '动作', role: '关系', color: '#722ED1' },
      { text: '100万元', type: '金额', role: '数值', color: '#FA8C16' }
    ]
  },
  {
    id: 5,
    text: '李四控股了 xx科技有限公司',
    annotations: [
      { text: '李四', type: '自然人', role: '主体', color: '#165DFF' },
      { text: '控股', type: '动作', role: '关系', color: '#722ED1' },
      { text: 'xx科技有限公司', type: '企业', role: '客体', color: '#00B42A' }
    ]
  }
]

function toggleTag(label: string) {
  const index = selectedTags.value.indexOf(label)
  if (index === -1) {
    selectedTags.value.push(label)
  } else {
    selectedTags.value.splice(index, 1)
  }
}
</script>

<style scoped>
.rule-recognition {
  display: flex;
  height: 100%;
  background: var(--bg-body);
}

/* 左侧标注面板 */
.annotation-panel {
  width: 280px;
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

.annotation-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tags-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.entity-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #fafafa;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.entity-tag:hover {
  background: var(--primary-light);
  border-color: var(--primary-color);
}

.entity-tag.active {
  background: var(--primary-light);
  border-color: var(--primary-color);
}

.tag-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.tag-count {
  margin-left: auto;
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
  color: var(--primary-color);
}

.annotation-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.annotation-card {
  background: var(--bg-white);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
}

.card-original {
  margin-bottom: 12px;
}

.original-text {
  font-size: 15px;
  color: var(--text-main);
  line-height: 1.6;
}

.card-annotations {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
  margin-bottom: 12px;
}

.annotation-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: 1px solid;
  border-radius: 16px;
  font-size: 13px;
}

.chip-type {
  font-size: 11px;
  padding: 1px 6px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
}

.chip-text {
  font-weight: 500;
}

.chip-role {
  font-size: 11px;
  opacity: 0.7;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
