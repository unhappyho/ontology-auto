<!-- src/components/task/EntityLogicAssociations.vue -->
<template>
  <div class="associations-tab">
    <!-- AI 识别中遮罩 -->
    <div v-if="isLoading" class="ai-loading-overlay">
      <div class="loading-inner">
        <div class="loading-robot"><RobotOutlined class="robot-icon" /></div>
        <div class="loading-title">AI 关联推理中</div>
        <div class="loading-desc">{{ loadingSteps[loadingStepIdx] }}</div>
        <a-progress :percent="loadingProgress" status="active" :show-info="false" class="loading-bar" />
      </div>
    </div>

    <!-- 主内容 -->
    <div class="assoc-header">
      <div class="header-info">
        <div class="header-title">本体和动作关联识别</div>
        <div class="header-subtitle">通过智能匹配推荐的本体与动作关联关系，请确认或修改</div>
      </div>
      <div class="header-actions">
        <a-button @click="$emit('back')">上一步</a-button>
        <a-button :loading="reidentifyLoading" @click="handleReidentify">
          <SyncOutlined v-if="!reidentifyLoading" /> 重新识别
        </a-button>
        <a-button type="primary" @click="handleComplete">完成</a-button>
      </div>
    </div>

    <div class="assoc-body">
      <div class="list-toolbar">
        <span class="list-title">关联列表 <b>{{ associations.length }}</b> 条</span>
        <a-button @click="showAddRow = !showAddRow">
          <PlusOutlined /> 添加关联
        </a-button>
      </div>

      <!-- 关联列表 -->
      <div class="assoc-list">
        <div v-for="assoc in enrichedAssociations" :key="assoc.id" class="assoc-row">
          <div class="assoc-action">
            <div class="assoc-action-name">{{ assoc.actionName }}</div>
            <div class="assoc-action-code">{{ assoc.actionCode }}</div>
          </div>
          <div class="assoc-link">
            <LinkOutlined />
          </div>
          <div class="assoc-ontology">
            <div class="assoc-onto-name">{{ assoc.ontologyName }}</div>
            <div class="assoc-onto-path">{{ assoc.ontologyPath }}</div>
          </div>
          <div class="assoc-confidence">
            <a-progress
              :percent="Math.round(assoc.confidence * 100)"
              :stroke-color="confidenceColor(assoc.confidence)"
              size="small"
              style="width: 140px"
            />
            <span class="confidence-pct">{{ Math.round(assoc.confidence * 100) }}%</span>
          </div>
          <a-button type="text" danger size="small" @click="$emit('delete:association', assoc.id)">
            <DeleteOutlined />
          </a-button>
        </div>

        <a-empty v-if="associations.length === 0" description="暂无关联数据" />
      </div>

      <!-- 手动新增行 -->
      <div v-if="showAddRow" class="add-assoc-row">
        <a-select
          v-model:value="newActionId"
          :options="actionOptions"
          show-search
          placeholder="搜索并选择动作"
          style="width: 220px"
          :filter-option="filterOption"
        />
        <ArrowRightOutlined class="add-arrow" />
        <a-select
          v-model:value="newOntologyId"
          :options="ontologyOptions"
          show-search
          placeholder="搜索并选择本体"
          style="width: 220px"
          :filter-option="filterOption"
        />
        <span class="manual-label">手动关联</span>
        <a-button type="primary" size="small" :disabled="!newActionId || !newOntologyId" @click="handleAddAssociation">
          确定
        </a-button>
        <a-button size="small" @click="cancelAdd">取消</a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  RobotOutlined, SyncOutlined, PlusOutlined, LinkOutlined,
  DeleteOutlined, ArrowRightOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { OntologyAssociation, ActionDef, OntologyItem } from '@/types/entityLogic'

const props = defineProps<{
  associations: OntologyAssociation[]
  actions: ActionDef[]
  ontologies: OntologyItem[]
  isLoading: boolean
  loadingProgress: number
}>()

const emit = defineEmits<{
  back: []
  reidentify: []
  complete: []
  'add:association': [assoc: Omit<OntologyAssociation, 'id'>]
  'delete:association': [id: string]
}>()

const loadingSteps = [
  '构建本体-动作推理上下文...',
  '大模型推理关联关系...',
  '按置信度阈值筛选结果...'
]
const loadingStepIdx = computed(() => {
  if (props.loadingProgress < 33) return 0
  if (props.loadingProgress < 66) return 1
  return 2
})

const reidentifyLoading = ref(false)
const showAddRow = ref(false)
const newActionId = ref<string | null>(null)
const newOntologyId = ref<string | null>(null)

function handleReidentify() {
  reidentifyLoading.value = true
  emit('reidentify')
  setTimeout(() => { reidentifyLoading.value = false }, 2200)
}

function handleComplete() {
  message.success('本体与动作关联已确认')
  emit('complete')
}

// ---- 富化数据 ----
const enrichedAssociations = computed(() =>
  props.associations.map(assoc => {
    const action = props.actions.find(a => a.id === assoc.actionId)
    const onto = props.ontologies.find(o => o.id === assoc.ontologyId)
    return {
      ...assoc,
      actionName: action?.name || assoc.actionId,
      actionCode: action?.code || '',
      ontologyName: onto?.name || assoc.ontologyId,
      ontologyPath: onto ? `${onto.category}${onto.subCategory ? ' / ' + onto.subCategory : ''}` : ''
    }
  })
)

function confidenceColor(confidence: number): string {
  if (confidence >= 0.9) return '#52c41a'
  if (confidence >= 0.7) return '#1677ff'
  return '#fa8c16'
}

// ---- 新增 ----
const actionOptions = computed(() =>
  props.actions.map(a => ({ label: `${a.name} (${a.code})`, value: a.id }))
)
const ontologyOptions = computed(() =>
  props.ontologies.map(o => ({
    label: `${o.name} (${o.category}${o.subCategory ? '/' + o.subCategory : ''})`,
    value: o.id
  }))
)
function filterOption(input: string, option: { label: string }) {
  return option.label.toLowerCase().includes(input.toLowerCase())
}

function handleAddAssociation() {
  if (!newActionId.value || !newOntologyId.value) return
  emit('add:association', {
    actionId: newActionId.value,
    ontologyId: newOntologyId.value,
    confidence: 1.0
  })
  cancelAdd()
}
function cancelAdd() {
  showAddRow.value = false
  newActionId.value = null
  newOntologyId.value = null
}
</script>

<style scoped>
.associations-tab {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: var(--bg-body);
}

.ai-loading-overlay {
  position: absolute; inset: 0;
  background: rgba(255, 255, 255, 0.92);
  display: flex; align-items: center; justify-content: center;
  z-index: 100; backdrop-filter: blur(2px);
}
.loading-inner { display: flex; flex-direction: column; align-items: center; gap: 16px; width: 320px; }
.loading-robot {
  width: 64px; height: 64px; border-radius: 50%;
  background: linear-gradient(135deg, #722ed1, #531dab);
  display: flex; align-items: center; justify-content: center;
}
.robot-icon { font-size: 32px; color: #fff; animation: pulse 1.5s infinite; }
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(0.92); }
}
.loading-title { font-size: 16px; font-weight: 600; color: var(--text-main); }
.loading-desc { font-size: 13px; color: var(--text-secondary); text-align: center; }
.loading-bar { width: 100%; }

.assoc-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px 20px;
  background: var(--bg-white);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}
.header-title { font-size: 16px; font-weight: 600; color: var(--text-main); margin-bottom: 4px; }
.header-subtitle { font-size: 12px; color: var(--text-secondary); }
.header-actions { display: flex; gap: 8px; flex-shrink: 0; }

.assoc-body { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 16px; }

.list-toolbar {
  display: flex; align-items: center; justify-content: space-between;
}
.list-title { font-size: 14px; color: var(--text-secondary); }
.list-title b { color: var(--primary-color); }

.assoc-list {
  background: var(--bg-white);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}
.assoc-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border-color);
  transition: background 0.15s;
}
.assoc-row:last-child { border-bottom: none; }
.assoc-row:hover { background: var(--bg-body); }
.assoc-action { width: 180px; flex-shrink: 0; }
.assoc-action-name { font-size: 14px; font-weight: 500; color: var(--text-main); }
.assoc-action-code { font-size: 12px; color: var(--text-secondary); }
.assoc-link { color: var(--primary-color); font-size: 18px; flex-shrink: 0; }
.assoc-ontology { flex: 1; min-width: 0; }
.assoc-onto-name { font-size: 14px; font-weight: 500; color: var(--text-main); }
.assoc-onto-path { font-size: 12px; color: var(--text-secondary); }
.assoc-confidence { display: flex; align-items: center; gap: 8px; width: 200px; flex-shrink: 0; }
.confidence-pct { font-size: 13px; font-weight: 500; color: var(--text-main); width: 40px; }

.add-assoc-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: var(--bg-white);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}
.add-arrow { color: var(--text-secondary); font-size: 14px; }
.manual-label { font-size: 12px; color: var(--text-secondary); white-space: nowrap; }
</style>
