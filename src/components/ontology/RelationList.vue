<template>
  <div class="relation-panel">
    <!-- 分类切换 + 视图切换 -->
    <div class="relation-header">
      <div class="header-left">
        <div class="category-tabs">
          <div
            :class="['tab-item', { active: category === 'entity' }]"
            @click="handleCategoryChange('entity')"
          >
            实体类型关系
          </div>
          <div
            :class="['tab-item', { active: category === 'event' }]"
            @click="handleCategoryChange('event')"
          >
            事件类型关系
          </div>
        </div>
      </div>
      <div class="header-right">
        <a-button type="primary" ghost size="small" :loading="isInferring" @click="handleAIInfer">
          <RobotOutlined v-if="!isInferring" />
          {{ isInferring ? '推断中...' : 'AI 推断' }}
        </a-button>
        <div class="view-tabs">
          <div
            :class="['tab-item', { active: viewMode === 'canvas' }]"
            @click="handleViewModeChange('canvas')"
          >
            <AppstoreOutlined />
            画布视图
          </div>
          <div
            :class="['tab-item', { active: viewMode === 'table' }]"
            @click="handleViewModeChange('table')"
          >
            <UnorderedListOutlined />
            列表视图
          </div>
        </div>
      </div>
    </div>

    <!-- 内容区 -->
    <div class="relation-content">
      <a-spin :spinning="isInferring" tip="AI 正在推断关联关系..." class="relation-spin">
        <RelationCanvas v-if="viewMode === 'canvas'" />
        <RelationTable v-else />
      </a-spin>
    </div>

    <!-- 底部统计 -->
    <div class="relation-footer">
      <span class="stat-item">
        <LinkOutlined style="color: var(--success-color);" />
        有关联 {{ linkedCount }} 个节点
      </span>
      <span class="stat-divider">|</span>
      <span class="stat-item">
        <DisconnectOutlined style="color: var(--text-secondary);" />
        无关联 {{ unlinkedCount }} 个节点
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  AppstoreOutlined,
  UnorderedListOutlined,
  LinkOutlined,
  DisconnectOutlined,
  RobotOutlined
} from '@ant-design/icons-vue'
import RelationCanvas from './RelationCanvas.vue'
import RelationTable from './RelationTable.vue'
import { useOntologyStore, useCopilotStore } from '@/stores'
import type { RelationCategory } from '@/types'

const ontologyStore = useOntologyStore()
const copilotStore = useCopilotStore()

const category = computed(() => ontologyStore.relationCategory)
const viewMode = computed(() => ontologyStore.relationViewMode)
const linkedCount = computed(() => ontologyStore.linkedEntityCount)
const unlinkedCount = computed(() => ontologyStore.unlinkedEntityCount)

const isInferring = ref(false)

function triggerInferAnimation() {
  isInferring.value = true
  setTimeout(() => { isInferring.value = false }, 1800)
}

function handleAIInfer() {
  triggerInferAnimation()
  copilotStore.triggerAIAnalysis(3)
}

watch(
  () => copilotStore.reidentifyAction,
  (action) => {
    if (action === 'reextract-relations') {
      triggerInferAnimation()
    }
  }
)

function handleCategoryChange(cat: RelationCategory) {
  ontologyStore.switchRelationCategory(cat)
}

function handleViewModeChange(mode: 'canvas' | 'table') {
  ontologyStore.switchRelationViewMode(mode)
}
</script>

<style scoped>
.relation-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  background: var(--bg-white);
  border-radius: 8px;
}

.relation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-tabs {
  display: flex;
  gap: 4px;
}

.view-tabs {
  display: flex;
  align-items: center;
  gap: 4px;
}

.tab-item {
  padding: 5px 12px;
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.tab-item:hover {
  background: #F5F5F5;
  color: var(--text-main);
}

.tab-item.active {
  background: #F0F5FF;
  color: var(--primary-color);
  font-weight: 500;
}

.relation-content {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.relation-spin {
  height: 100%;
}

.relation-spin :deep(.ant-spin-container) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.relation-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 8px 14px;
  border-top: 1px solid var(--border-color);
  background: #FAFAFA;
  font-size: 11px;
  flex-shrink: 0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary);
}

.stat-divider {
  color: var(--border-color);
}
</style>
