<!-- src/components/task/EntityLogicActions.vue -->
<template>
  <div class="actions-tab">
    <!-- AI 识别中遮罩 -->
    <div v-if="isLoading" class="ai-loading-overlay">
      <div class="loading-inner">
        <div class="loading-robot">
          <RobotOutlined class="robot-icon" />
        </div>
        <div class="loading-title">AI 动作识别中</div>
        <div class="loading-desc">{{ loadingSteps[loadingStepIdx] }}</div>
        <a-progress :percent="loadingProgress" status="active" :show-info="false" class="loading-bar" />
      </div>
    </div>

    <!-- 左侧：动作列表 -->
    <div class="action-list-panel">
      <div class="panel-header">
        <span class="panel-title">动作列表 ({{ actions.length }})</span>
        <a-button size="small" type="dashed" @click="$emit('add:action')">
          <PlusOutlined /> 新建
        </a-button>
      </div>
      <div class="action-tree">
        <div v-for="group in groupedActions" :key="group.category" class="action-group">
          <div class="action-group-header" @click="toggleGroup(group.category)">
            <RightOutlined :class="['group-arrow', { expanded: openGroups.has(group.category) }]" />
            <FolderOutlined class="folder-icon" />
            <span class="group-name">{{ group.category }}</span>
            <span class="group-badge">{{ group.items.length }}</span>
          </div>
          <transition name="group-expand">
            <div v-show="openGroups.has(group.category)" class="action-items">
              <div
                v-for="act in group.items"
                :key="act.id"
                class="action-item"
                :class="{ selected: selectedId === act.id }"
                @click="selectedId = act.id"
              >
                <FileTextOutlined class="act-icon" />
                <div class="act-info">
                  <div class="act-name">{{ act.name }}</div>
                  <div class="act-code">{{ act.code }}</div>
                </div>
                <a-tag color="green" class="type-tag">原子</a-tag>
                <DeleteOutlined class="act-delete" @click.stop="$emit('delete:action', act.id)" />
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <!-- 右侧：动作详情 -->
    <div class="action-detail-panel">
      <template v-if="selectedAction">
        <div class="detail-header">
          <div class="detail-title-wrap">
            <span class="detail-title">动作识别</span>
            <span class="detail-subtitle">1、基于已识别的函数自动封装为原子动作 2、基于已识别的函数智能匹配系统已定义的动作 请确认或修改</span>
          </div>
          <div class="detail-actions">
            <a-button @click="$emit('back')">上一步</a-button>
            <a-button :loading="reidentifyLoading" @click="handleReidentify">
              <SyncOutlined v-if="!reidentifyLoading" /> 重新识别
            </a-button>
            <a-button type="primary" @click="$emit('confirm')">确认并继续</a-button>
          </div>
        </div>

        <div class="detail-scroll">
          <!-- 基本信息 -->
          <div class="form-section">
            <div class="section-title">基本信息</div>
            <div class="form-grid-2">
              <a-form-item label="动作编码" required>
                <a-input v-model:value="selectedAction.code" />
              </a-form-item>
              <a-form-item label="动作名称" required>
                <a-input v-model:value="selectedAction.name" />
              </a-form-item>
            </div>
            <a-form-item label="动作描述" required>
              <a-textarea v-model:value="selectedAction.description" :rows="2" />
            </a-form-item>
            <div class="form-grid-2">
              <a-form-item label="动作类型" required>
                <a-tooltip title="复合动作功能即将上线" :trigger="['hover']">
                  <a-select
                    v-model:value="selectedAction.type"
                    :options="actionTypeOptions"
                  />
                </a-tooltip>
              </a-form-item>
              <a-form-item label="目标函数" required>
                <a-select
                  v-model:value="selectedAction.targetFunctionId"
                  :options="functionOptions"
                  show-search
                  :filter-option="filterFunctionOption"
                  placeholder="选择目标函数"
                />
              </a-form-item>
            </div>
          </div>

          <!-- 原子动作提示 -->
          <a-alert
            v-if="selectedAction.type === '原子动作'"
            type="info"
            show-icon
            message="原子动作 — 参数由目标函数定义"
            description="输入/输出参数已从目标函数自动读取。原子动作不需要额外配置。"
            class="info-alert"
          />

          <!-- 输入参数（只读，来自函数） -->
          <div class="form-section" v-if="targetFunction">
            <div class="section-header-row">
              <span class="section-title">输入参数 {{ targetFunction.inputParams.length }} 项</span>
              <span class="from-fn-label"><LinkOutlined /> 来自函数</span>
              <a-button size="small" @click="matchAllParams">
                <ThunderboltOutlined /> 全部匹配
              </a-button>
            </div>
            <a-table
              :data-source="targetFunction.inputParams"
              :columns="inputParamColumns"
              :pagination="false"
              size="small"
              row-key="id"
              :row-class-name="(record: Param) => isMatching(record.id) ? 'row-matching' : ''"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'associatedTermId'">
                  <a-select
                    v-model:value="record.associatedTermId"
                    :options="termOptions"
                    size="small"
                    style="width: 140px"
                    placeholder="选择关联术语"
                    allow-clear
                  />
                </template>
                <template v-else-if="column.key === 'matchAction'">
                  <a-tooltip title="重新匹配术语">
                    <a-button
                      type="text"
                      size="small"
                      :loading="isMatching(record.id)"
                      @click="matchSingleParam(record)"
                    >
                      <ThunderboltOutlined v-if="!isMatching(record.id)" style="color: #722ed1" />
                    </a-button>
                  </a-tooltip>
                </template>
              </template>
            </a-table>
          </div>

          <!-- 输出参数（只读，来自函数） -->
          <div class="form-section" v-if="targetFunction">
            <div class="section-header-row">
              <span class="section-title">输出参数 {{ targetFunction.outputParams.length }} 项</span>
              <span class="from-fn-label"><LinkOutlined /> 来自函数</span>
              <a-button size="small" @click="matchAllParams">
                <ThunderboltOutlined /> 全部匹配
              </a-button>
            </div>
            <a-table
              :data-source="targetFunction.outputParams"
              :columns="outputParamColumns"
              :pagination="false"
              size="small"
              row-key="id"
              :row-class-name="(record: Param) => isMatching(record.id) ? 'row-matching' : ''"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'associatedTermId'">
                  <a-select
                    v-model:value="record.associatedTermId"
                    :options="termOptions"
                    size="small"
                    style="width: 140px"
                    placeholder="选择关联术语"
                    allow-clear
                  />
                </template>
                <template v-else-if="column.key === 'matchAction'">
                  <a-tooltip title="重新匹配术语">
                    <a-button
                      type="text"
                      size="small"
                      :loading="isMatching(record.id)"
                      @click="matchSingleParam(record)"
                    >
                      <ThunderboltOutlined v-if="!isMatching(record.id)" style="color: #722ed1" />
                    </a-button>
                  </a-tooltip>
                </template>
              </template>
            </a-table>
          </div>
        </div>
      </template>
      <div v-else class="detail-empty">
        <ThunderboltOutlined class="empty-icon" />
        <span>请从左侧选择一个动作</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  RobotOutlined, SyncOutlined, PlusOutlined, FolderOutlined,
  FileTextOutlined, DeleteOutlined, ThunderboltOutlined,
  LinkOutlined, RightOutlined
} from '@ant-design/icons-vue'
import type { ActionDef, FunctionDef, Param } from '@/types/entityLogic'

const props = defineProps<{
  actions: ActionDef[]
  functions: FunctionDef[]
  isLoading: boolean
  loadingProgress: number
}>()

const emit = defineEmits<{
  confirm: []
  back: []
  reidentify: []
  'add:action': []
  'delete:action': [id: string]
  'update:action': [action: ActionDef]
}>()

const loadingSteps = [
  '语义匹配已有动作...',
  '自动封装未匹配函数为原子动作...',
  '关联参数与术语库...'
]
const loadingStepIdx = computed(() => {
  if (props.loadingProgress < 33) return 0
  if (props.loadingProgress < 66) return 1
  return 2
})

const reidentifyLoading = ref(false)
function handleReidentify() {
  reidentifyLoading.value = true
  emit('reidentify')
  setTimeout(() => { reidentifyLoading.value = false }, 1800)
}

// ---- 术语自动匹配 ----
const TERM_MATCH_MAP: Record<string, string> = {
  'customer_id':    'term-cust-id',
  'customer_name':  'term-cust-name',
  'customer_phone': 'term-phone',
  'customer_email': 'term-email',
  'order_id':       'term-order-id',
  'order_amount':   'term-amount',
  'order_status':   'term-order-status',
  'product_id':     'term-prod-id',
  'product_name':   'term-prod-name',
  'product_price':  'term-amount',
  'status':         'term-order-status',
  'amount':         'term-amount',
}

function matchTerm(paramName: string): string | undefined {
  if (TERM_MATCH_MAP[paramName]) return TERM_MATCH_MAP[paramName]
  for (const [key, termId] of Object.entries(TERM_MATCH_MAP)) {
    if (paramName.includes(key) || key.includes(paramName)) return termId
  }
  return undefined
}

const matchingParamIds = ref<Set<string>>(new Set())

function isMatching(paramId: string): boolean {
  return matchingParamIds.value.has(paramId)
}

function matchSingleParam(param: Param) {
  if (matchingParamIds.value.has(param.id)) return
  matchingParamIds.value.add(param.id)
  // 触发响应性更新
  matchingParamIds.value = new Set(matchingParamIds.value)
  setTimeout(() => {
    param.associatedTermId = matchTerm(param.name)
    matchingParamIds.value.delete(param.id)
    matchingParamIds.value = new Set(matchingParamIds.value)
  }, 600)
}

function matchAllParams() {
  const fn = targetFunction.value
  if (!fn) return
  ;[...fn.inputParams, ...fn.outputParams].forEach(matchSingleParam)
}

// ---- 分组 ----
const openGroups = ref<Set<string>>(new Set())
const selectedId = ref<string | null>(null)

const groupedActions = computed(() => {
  const map = new Map<string, { category: string; items: ActionDef[] }>()
  for (const act of props.actions) {
    const cat = act.category || '其他'
    if (!map.has(cat)) map.set(cat, { category: cat, items: [] })
    map.get(cat)!.items.push(act)
  }
  return Array.from(map.values())
})

watch(() => props.actions, (acts) => {
  acts.forEach(a => openGroups.value.add(a.category || '其他'))
  if (!selectedId.value && acts.length > 0) selectedId.value = acts[0].id
}, { immediate: true })

function toggleGroup(category: string) {
  if (openGroups.value.has(category)) {
    openGroups.value.delete(category)
  } else {
    openGroups.value.add(category)
  }
}

const selectedAction = computed(() =>
  props.actions.find(a => a.id === selectedId.value) || null
)

const targetFunction = computed(() => {
  if (!selectedAction.value) return null
  return props.functions.find(f => f.id === selectedAction.value!.targetFunctionId) || null
})

// 切换 targetFunction 时自动预填充未填的参数术语
watch(targetFunction, (fn) => {
  if (!fn) return
  ;[...fn.inputParams, ...fn.outputParams].forEach(p => {
    if (!p.associatedTermId) {
      p.associatedTermId = matchTerm(p.name)
    }
  })
}, { immediate: true })

// ---- 选项 ----
const actionTypeOptions = [
  { label: '原子动作', value: '原子动作' },
  { label: '复合动作（即将上线）', value: '复合动作', disabled: true }
]

const functionOptions = computed(() =>
  props.functions.map(f => ({ label: `${f.name} (${f.code})`, value: f.id }))
)

function filterFunctionOption(input: string, option: { label: string }) {
  return option.label.toLowerCase().includes(input.toLowerCase())
}

// Mock 术语选项
const termOptions = [
  { label: '客户ID', value: 'term-cust-id' },
  { label: '客户名称', value: 'term-cust-name' },
  { label: '手机号', value: 'term-phone' },
  { label: '邮箱', value: 'term-email' },
  { label: '订单编号', value: 'term-order-id' },
  { label: '订单金额', value: 'term-amount' },
  { label: '订单状态', value: 'term-order-status' },
  { label: '产品ID', value: 'term-prod-id' },
  { label: '产品名称', value: 'term-prod-name' }
]

const inputParamColumns = [
  { title: '参数名称', dataIndex: 'name', width: 130 },
  { title: '参数描述', dataIndex: 'description' },
  { title: '类型', dataIndex: 'type', width: 100 },
  { title: '必填', dataIndex: 'required', width: 60, customRender: ({ text }: { text: boolean }) => text ? '✓' : '' },
  { title: '传入方法', dataIndex: 'passMethod', width: 90 },
  { title: '关联术语', key: 'associatedTermId', width: 160 },
  { title: '', key: 'matchAction', width: 44 }
]

const outputParamColumns = [
  { title: '参数名称', dataIndex: 'name', width: 130 },
  { title: '参数描述', dataIndex: 'description' },
  { title: '类型', dataIndex: 'type', width: 100 },
  { title: '必填', dataIndex: 'required', width: 60, customRender: ({ text }: { text: boolean }) => text ? '✓' : '' },
  { title: '关联术语', key: 'associatedTermId', width: 160 },
  { title: '', key: 'matchAction', width: 44 }
]
</script>

<style scoped>
.actions-tab {
  display: flex;
  height: 100%;
  position: relative;
  overflow: hidden;
}

/* 复用 loading overlay 样式 */
.ai-loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(2px);
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

/* 左侧 */
.action-list-panel {
  width: 240px; flex-shrink: 0; background: var(--bg-white);
  border-right: 1px solid var(--border-color); display: flex; flex-direction: column; overflow: hidden;
}
.panel-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 14px; border-bottom: 1px solid var(--border-color); flex-shrink: 0;
}
.panel-title { font-size: 13px; font-weight: 600; color: var(--text-main); }
.action-tree { flex: 1; overflow-y: auto; padding: 8px 0; }
.action-group-header {
  display: flex; align-items: center; gap: 6px; padding: 6px 12px;
  cursor: pointer; font-size: 12px; color: var(--text-secondary); user-select: none;
}
.action-group-header:hover { background: var(--bg-body); }
.group-arrow { font-size: 10px; transition: transform 0.2s; flex-shrink: 0; }
.group-arrow.expanded { transform: rotate(90deg); }
.folder-icon { color: #fa8c16; font-size: 13px; flex-shrink: 0; }
.group-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.group-badge {
  background: #fff7e6; color: #fa8c16;
  border-radius: 10px; padding: 0 6px; font-size: 11px;
}
.action-items { padding: 0 0 4px 20px; }
.action-item {
  display: flex; align-items: center; gap: 8px; padding: 6px 10px 6px 6px;
  border-radius: 6px; cursor: pointer; margin-bottom: 2px; transition: background 0.15s;
}
.action-item:hover { background: var(--bg-body); }
.action-item.selected { background: var(--primary-light); }
.act-icon { color: var(--text-secondary); font-size: 13px; flex-shrink: 0; }
.act-info { flex: 1; min-width: 0; }
.act-name { font-size: 12px; color: var(--text-main); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.act-code { font-size: 11px; color: var(--text-secondary); }
.type-tag { font-size: 10px; flex-shrink: 0; }
.act-delete { color: var(--text-secondary); font-size: 12px; opacity: 0; transition: opacity 0.15s; }
.action-item:hover .act-delete { opacity: 1; }
.act-delete:hover { color: #ff4d4f; }

.group-expand-enter-active, .group-expand-leave-active { transition: all 0.2s ease; overflow: hidden; }
.group-expand-enter-from, .group-expand-leave-to { opacity: 0; max-height: 0; }
.group-expand-enter-to, .group-expand-leave-from { max-height: 500px; }

/* 右侧详情 */
.action-detail-panel {
  flex: 1; display: flex; flex-direction: column;
  overflow: hidden; background: var(--bg-body);
}
.detail-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 14px 20px; background: var(--bg-white); border-bottom: 1px solid var(--border-color); flex-shrink: 0;
}
.detail-title-wrap { display: flex; flex-direction: column; gap: 3px; }
.detail-title { font-size: 15px; font-weight: 600; color: var(--text-main); }
.detail-subtitle { font-size: 12px; color: var(--text-secondary); max-width: 500px; }
.detail-actions { display: flex; gap: 8px; flex-shrink: 0; }
.detail-scroll { flex: 1; overflow-y: auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 16px; }
.form-section { background: var(--bg-white); border-radius: 8px; padding: 16px; }
.section-title { font-size: 13px; font-weight: 600; color: var(--text-main); }
.section-header-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.section-header-row .section-title { flex: 1; }
.from-fn-label { font-size: 11px; color: var(--primary-color); display: flex; align-items: center; gap: 4px; }
.form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.info-alert { margin: 0 0 4px; }
.detail-empty {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 12px; color: var(--text-secondary); font-size: 14px;
}
.empty-icon { font-size: 40px; color: #d9d9d9; }

/* 行级术语匹配动效 */
:deep(.row-matching td) {
  background: rgba(114, 46, 209, 0.06) !important;
  transition: background 0.3s;
}
</style>
