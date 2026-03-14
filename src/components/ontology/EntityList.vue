<template>
  <div class="entity-extract-panel">
    <div class="entity-extract-header">
      <div class="entity-extract-title">
        <AppstoreOutlined style="color: #722ED1;" />
        <span>{{ ontologyName }}</span>
        <span class="title-suffix">已识别实体</span>
      </div>
      <div class="entity-extract-stats">
        <span class="stat-num total">{{ total }}</span>
        <span>个</span>
        <span class="divider"></span>
        <span class="stat-num new-found">{{ newCnt }}</span>
        <span>新发现</span>
        <span class="divider"></span>
        <span class="stat-num existing">{{ existCnt }}</span>
        <span>已入库</span>
      </div>
    </div>

    <div class="entity-list-body">
      <EntityCard
        v-for="(entity, index) in entities"
        :key="entity.id"
        :entity="entity"
        :color="getEntityColor(index)"
        :domain-label="domainLabel"
        :reextract-animation="showReextractAnimation"
      />
    </div>

    <div class="entity-pagination">
      <div class="pagination-info">共 {{ total }} 个实体</div>
      <div class="pagination">
        <div class="page-item"><LeftOutlined /></div>
        <div class="page-item active">1</div>
        <div class="page-item"><RightOutlined /></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  AppstoreOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons-vue'
import EntityCard from './EntityCard.vue'
import { useOntologyStore } from '@/stores'
import { ENTITY_COLORS } from '@/constants'

const ontologyStore = useOntologyStore()

const ontologyName = computed(() => ontologyStore.currentOntology?.label ?? '未选择')
const total = computed(() => ontologyStore.currentOntology?.total ?? 0)
const newCnt = computed(() => ontologyStore.currentOntology?.newCnt ?? 0)
const existCnt = computed(() => ontologyStore.currentOntology?.existCnt ?? 0)
const entities = computed(() => ontologyStore.currentEntities)
const domainLabel = computed(() => ontologyStore.getLeafLabel(ontologyStore.currentOntologyId))
const showReextractAnimation = computed(() => ontologyStore.showReextractAnimation)

function getEntityColor(index: number): string {
  return ENTITY_COLORS[index % ENTITY_COLORS.length]
}
</script>

<style scoped>
.entity-extract-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  position: relative;
}

.entity-extract-header {
  padding: 10px 14px;
  background: var(--bg-white);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.entity-extract-title {
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 7px;
}

.title-suffix {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: normal;
}

.entity-extract-stats {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: var(--text-secondary);
}

.stat-num {
  font-weight: 700;
  font-size: 14px;
}

.stat-num.total {
  color: var(--text-main);
}

.stat-num.new-found {
  color: #722ED1;
}

.stat-num.existing {
  color: var(--success-color);
}

.divider {
  width: 1px;
  height: 11px;
  background: var(--border-color);
  display: inline-block;
}

.entity-list-body {
  flex: 1;
  overflow-y: auto;
  padding: 10px 14px;
}

.entity-pagination {
  padding: 7px 14px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-white);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.pagination-info {
  font-size: 11px;
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
