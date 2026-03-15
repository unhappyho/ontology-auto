<template>
  <div class="entity-extract-panel">
    <div class="entity-extract-header">
      <div class="entity-extract-title">
        <AppstoreOutlined style="color: #722ED1;" />
        <span>{{ ontologyName }}</span>
        <span class="title-suffix">已识别实体</span>
        <a-button type="primary" ghost size="small" class="ai-btn" @click="handleAIExtract">
          <RobotOutlined />
          AI 提取
        </a-button>
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
        <span class="divider"></span>
        <a-checkbox v-model:checked="selectAll" @change="handleSelectAll">全选</a-checkbox>
        <a-button
          v-if="selectedEntities.length > 0"
          type="text"
          danger
          size="small"
          @click="handleBatchDeleteEntities"
        >
          <DeleteOutlined />
          删除选中 ({{ selectedEntities.length }})
        </a-button>
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
        :default-expanded="index === 0"
        :is-selected="selectedEntities.includes(entity.id)"
        @select="handleEntitySelect"
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
import { ref, computed } from 'vue'
import {
  AppstoreOutlined,
  LeftOutlined,
  RightOutlined,
  DeleteOutlined,
  RobotOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import EntityCard from './EntityCard.vue'
import { useOntologyStore, useCopilotStore } from '@/stores'
import { ENTITY_COLORS } from '@/constants'

const ontologyStore = useOntologyStore()
const copilotStore = useCopilotStore()

const ontologyName = computed(() => ontologyStore.currentOntology?.label ?? '未选择')
const total = computed(() => ontologyStore.currentOntology?.total ?? 0)
const newCnt = computed(() => ontologyStore.currentOntology?.newCnt ?? 0)
const existCnt = computed(() => ontologyStore.currentOntology?.existCnt ?? 0)
const entities = computed(() => ontologyStore.currentEntities)
const domainLabel = computed(() => ontologyStore.getLeafLabel(ontologyStore.currentOntologyId))
const showReextractAnimation = computed(() => ontologyStore.showReextractAnimation)

// 选中的实体
const selectedEntities = ref<string[]>([])

// 全选状态
const selectAll = computed({
  get: () => selectedEntities.value.length === entities.value.length && entities.value.length > 0,
  set: (val: boolean) => {
    if (val) {
      selectedEntities.value = entities.value.map(e => e.id)
    } else {
      selectedEntities.value = []
    }
  }
})

function getEntityColor(index: number): string {
  return ENTITY_COLORS[index % ENTITY_COLORS.length]
}

function handleEntitySelect(entityId: string, checked: boolean) {
  if (checked) {
    if (!selectedEntities.value.includes(entityId)) {
      selectedEntities.value.push(entityId)
    }
  } else {
    const index = selectedEntities.value.indexOf(entityId)
    if (index > -1) {
      selectedEntities.value.splice(index, 1)
    }
  }
}

function handleSelectAll(e: any) {
  const checked = e.target.checked
  if (checked) {
    selectedEntities.value = entities.value.map(e => e.id)
  } else {
    selectedEntities.value = []
  }
}

function handleBatchDeleteEntities() {
  const count = selectedEntities.value.length
  ontologyStore.batchDeleteEntities(selectedEntities.value)
  message.success(`已删除 ${count} 个实体`)
  selectedEntities.value = []
}

// AI 实体提取
function handleAIExtract() {
  // 打开 AI 助手面板
  copilotStore.openPanel()
  // 设置当前步骤上下文
  copilotStore.setStepContext(2)
  // 添加提取消息
  copilotStore.addMessage('assistant', '正在分析数据表结构，提取实体信息...')

  // 模拟 AI 分析过程
  setTimeout(() => {
    copilotStore.addMessage('assistant', '实体提取完成！发现以下实体类型：\n\n1. 用户 (User) - 5个属性\n2. 订单 (Order) - 8个属性\n3. 产品 (Product) - 6个属性\n4. 合同 (Contract) - 7个属性\n5. 投诉 (Complaint) - 4个属性\n\n是否需要查看详情？')
    // 显示建议卡片
    copilotStore.suggestions = [
      {
        id: 'step2-ai-1',
        type: 'entity',
        title: '识别统计',
        description: '已完成实体识别，发现以下实体类型',
        content: '实体类型：5种\n实体总数：1,284个\n属性字段：368个',
        stats: {
          '用户实体': 456,
          '订单实体': 523,
          '产品实体': 187,
          '合同实体': 89,
          '投诉实体': 29
        },
        actionLabel: '查看详情'
      },
      {
        id: 'step2-ai-2',
        type: 'entity',
        title: '新增实体建议',
        description: '根据数据特征，发现可提取的新实体类型',
        content: '建议新增实体类型：\n- 地址位置（从用户地址提取）\n- 产品分类（从产品目录提取）\n- 订单状态（从订单流水提取）',
        actionLabel: '采纳建议'
      }
    ]
  }, 1500)
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

.ai-btn {
  margin-left: 10px;
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
