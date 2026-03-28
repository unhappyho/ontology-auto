<!-- src/components/task/EntityLogicFunctions.vue -->
<template>
  <div class="functions-tab">
    <!-- AI 识别中遮罩 -->
    <div v-if="isLoading" class="ai-loading-overlay">
      <div class="loading-inner">
        <div class="loading-robot">
          <RobotOutlined class="robot-icon" />
        </div>
        <div class="loading-title">AI 函数识别中</div>
        <div class="loading-desc">{{ loadingSteps[loadingStepIdx] }}</div>
        <a-progress :percent="loadingProgress" status="active" :show-info="false" class="loading-bar" />
      </div>
    </div>

    <!-- 左侧：函数列表 -->
    <div class="fn-list-panel">
      <div class="panel-header">
        <span class="panel-title">函数列表 ({{ functions.length }})</span>
        <a-button size="small" :loading="reidentifyLoading" @click="handleReidentify">
          <template #icon><SyncOutlined /></template>
          重新识别
        </a-button>
      </div>
      <div class="fn-tree">
        <div v-for="group in groupedFunctions" :key="group.fileName" class="fn-group">
          <div
            class="fn-group-header"
            @click="toggleGroup(group.fileName)"
          >
            <RightOutlined :class="['group-arrow', { expanded: openGroups.has(group.fileName) }]" />
            <FileTextOutlined class="file-icon" />
            <span class="group-name">{{ group.fileName }}</span>
            <span class="group-badge">{{ group.items.length }}</span>
          </div>
          <transition name="group-expand">
            <div v-show="openGroups.has(group.fileName)" class="fn-items">
              <div
                v-for="fn in group.items"
                :key="fn.id"
                class="fn-item"
                :class="{ selected: selectedId === fn.id }"
                @click="selectedId = fn.id"
              >
                <span class="method-badge" :style="{ background: methodColor(fn.method) }">{{ fn.method }}</span>
                <div class="fn-item-info">
                  <div class="fn-item-name">{{ fn.name }}</div>
                  <div class="fn-item-code">{{ fn.code }}</div>
                </div>
                <DeleteOutlined class="fn-delete" @click.stop="$emit('delete:function', fn.id)" />
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <!-- 右侧：函数详情 -->
    <div class="fn-detail-panel">
      <template v-if="selectedFn">
        <div class="detail-header">
          <div class="detail-title-wrap">
            <span class="detail-title">函数识别</span>
            <span class="detail-subtitle">基于上传的接口文档智能提取的函数列表，请确认或修改识别结果</span>
          </div>
          <div class="detail-actions">
            <span class="confirm-stat">已确认 <b>{{ confirmedCount }}</b> / {{ functions.length }} 个函数</span>
            <a-button type="primary" @click="$emit('confirm')">确认并继续</a-button>
          </div>
        </div>

        <div class="detail-scroll">
          <!-- 基本信息 -->
          <div class="form-section">
            <div class="section-title">基本信息</div>
            <div class="form-grid-2">
              <a-form-item label="函数编码" required>
                <a-input v-model:value="selectedFn.code" />
              </a-form-item>
              <a-form-item label="函数名称" required>
                <a-input v-model:value="selectedFn.name" />
              </a-form-item>
            </div>
            <a-form-item label="函数描述">
              <a-textarea v-model:value="selectedFn.description" :rows="2" />
            </a-form-item>
          </div>

          <!-- 请求配置 -->
          <div class="form-section">
            <div class="section-title">请求配置</div>
            <div class="url-row">
              <a-form-item label="服务器URL" required class="url-base">
                <a-input v-model:value="selectedFn.serverUrl" />
              </a-form-item>
              <a-form-item label="接口路径" required class="url-path">
                <a-input v-model:value="selectedFn.path" />
              </a-form-item>
            </div>
            <div class="form-grid-2">
              <a-form-item label="请求方式" required>
                <a-select v-model:value="selectedFn.method" :options="methodOptions" />
              </a-form-item>
              <a-form-item label="Body类型" required>
                <a-select v-model:value="selectedFn.bodyType" :options="bodyTypeOptions" />
              </a-form-item>
            </div>
          </div>

          <!-- Headers -->
          <div class="form-section">
            <div class="section-header-row">
              <span class="section-title">Header</span>
              <a-button size="small" type="dashed" @click="addHeader">+ 新增</a-button>
            </div>
            <a-table
              :data-source="selectedFn.headers"
              :columns="headerColumns"
              :pagination="false"
              size="small"
              row-key="id"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'key'">
                  <a-input v-model:value="record.key" size="small" />
                </template>
                <template v-else-if="column.key === 'value'">
                  <a-input v-model:value="record.value" size="small" />
                </template>
                <template v-else-if="column.key === 'description'">
                  <a-input v-model:value="record.description" size="small" />
                </template>
                <template v-else-if="column.key === 'action'">
                  <a-button type="link" danger size="small" @click="removeHeader(record.id)">
                    <DeleteOutlined />
                  </a-button>
                </template>
              </template>
            </a-table>
          </div>

          <!-- 输入参数 -->
          <div class="form-section">
            <div class="section-header-row">
              <span class="section-title">输入参数 {{ selectedFn.inputParams.length }} 项</span>
              <a-button size="small" type="dashed" @click="addInputParam">+ 新增</a-button>
            </div>
            <a-table
              :data-source="selectedFn.inputParams"
              :columns="inputParamColumns"
              :pagination="false"
              size="small"
              row-key="id"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'name'">
                  <a-input v-model:value="record.name" size="small" />
                </template>
                <template v-else-if="column.key === 'description'">
                  <a-input v-model:value="record.description" size="small" />
                </template>
                <template v-else-if="column.key === 'type'">
                  <a-select v-model:value="record.type" :options="paramTypeOptions" size="small" style="width:120px" />
                </template>
                <template v-else-if="column.key === 'passMethod'">
                  <a-select v-model:value="record.passMethod" :options="passMethodOptions" size="small" style="width:90px" />
                </template>
                <template v-else-if="column.key === 'defaultValue'">
                  <a-input v-model:value="record.defaultValue" size="small" placeholder="默认值" />
                </template>
                <template v-else-if="column.key === 'required'">
                  <a-checkbox v-model:checked="record.required" />
                </template>
                <template v-else-if="column.key === 'action'">
                  <a-button type="link" danger size="small" @click="removeInputParam(record.id)">
                    <DeleteOutlined />
                  </a-button>
                </template>
              </template>
            </a-table>
          </div>

          <!-- 输出参数 -->
          <div class="form-section">
            <div class="section-header-row">
              <span class="section-title">输出参数 {{ selectedFn.outputParams.length }} 项</span>
              <a-button size="small" type="dashed" @click="addOutputParam">+ 新增</a-button>
            </div>
            <a-table
              :data-source="selectedFn.outputParams"
              :columns="outputParamColumns"
              :pagination="false"
              size="small"
              row-key="id"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'name'">
                  <a-input v-model:value="record.name" size="small" />
                </template>
                <template v-else-if="column.key === 'description'">
                  <a-input v-model:value="record.description" size="small" />
                </template>
                <template v-else-if="column.key === 'type'">
                  <a-select v-model:value="record.type" :options="paramTypeOptions" size="small" style="width:120px" />
                </template>
                <template v-else-if="column.key === 'required'">
                  <a-checkbox v-model:checked="record.required" />
                </template>
                <template v-else-if="column.key === 'action'">
                  <a-button type="link" danger size="small" @click="removeOutputParam(record.id)">
                    <DeleteOutlined />
                  </a-button>
                </template>
              </template>
            </a-table>
          </div>
        </div>
      </template>
      <div v-else class="detail-empty">
        <FileTextOutlined class="empty-icon" />
        <span>请从左侧选择一个函数</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  RobotOutlined, SyncOutlined, FileTextOutlined, RightOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import type { FunctionDef } from '@/types/entityLogic'
import { HTTP_METHOD_COLORS, PARAM_TYPES, PASS_METHODS, HTTP_METHODS, BODY_TYPES } from '@/types/entityLogic'

const props = defineProps<{
  functions: FunctionDef[]
  isLoading: boolean
  loadingProgress: number
}>()

const emit = defineEmits<{
  confirm: []
  reidentify: []
  'update:function': [fn: FunctionDef]
  'delete:function': [id: string]
}>()

// ---- 加载动画 ----
const loadingSteps = [
  '解析接口文档结构与参数...',
  '提取函数定义并验证规范...',
  '匹配参数类型与传入方式...'
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

// ---- 分组 ----
const openGroups = ref<Set<string>>(new Set())
const selectedId = ref<string | null>(null)

const groupedFunctions = computed(() => {
  const map = new Map<string, { fileName: string; items: FunctionDef[] }>()
  for (const fn of props.functions) {
    if (!map.has(fn.fileName)) {
      map.set(fn.fileName, { fileName: fn.fileName, items: [] })
    }
    map.get(fn.fileName)!.items.push(fn)
  }
  return Array.from(map.values())
})

// 默认展开所有分组
watch(() => props.functions, (fns) => {
  fns.forEach(fn => openGroups.value.add(fn.fileName))
  if (!selectedId.value && fns.length > 0) selectedId.value = fns[0].id
}, { immediate: true })

function toggleGroup(fileName: string) {
  if (openGroups.value.has(fileName)) {
    openGroups.value.delete(fileName)
  } else {
    openGroups.value.add(fileName)
  }
}

const selectedFn = computed(() =>
  props.functions.find(f => f.id === selectedId.value) || null
)

const confirmedCount = computed(() => props.functions.length) // mock: 全部已确认

// ---- 颜色 ----
function methodColor(method: string): string {
  return HTTP_METHOD_COLORS[method] || '#999'
}

// ---- 表格列 ----
const headerColumns = [
  { title: 'KEY', key: 'key', width: 160 },
  { title: 'VALUE', key: 'value', width: 200 },
  { title: '参数描述', key: 'description' },
  { title: '操作', key: 'action', width: 60 }
]

const inputParamColumns = [
  { title: '参数名称', key: 'name', width: 130 },
  { title: '参数描述', key: 'description' },
  { title: '参数类型', key: 'type', width: 130 },
  { title: '传入方法', key: 'passMethod', width: 100 },
  { title: '默认值', key: 'defaultValue', width: 100 },
  { title: '必填', key: 'required', width: 60 },
  { title: '操作', key: 'action', width: 60 }
]

const outputParamColumns = [
  { title: '参数名称', key: 'name', width: 130 },
  { title: '参数描述', key: 'description' },
  { title: '参数类型', key: 'type', width: 130 },
  { title: '必填', key: 'required', width: 60 },
  { title: '操作', key: 'action', width: 60 }
]

// ---- 选项 ----
const methodOptions = HTTP_METHODS.map(m => ({ label: m, value: m }))
const bodyTypeOptions = BODY_TYPES.map(t => ({ label: t, value: t }))
const paramTypeOptions = PARAM_TYPES.map(t => ({ label: t, value: t }))
const passMethodOptions = PASS_METHODS.map(m => ({ label: m, value: m }))

// ---- 增删操作 ----
function addHeader() {
  if (!selectedFn.value) return
  selectedFn.value.headers.push({
    id: `h-${Date.now()}`, key: '', value: '', description: ''
  })
}
function removeHeader(id: string) {
  if (!selectedFn.value) return
  selectedFn.value.headers = selectedFn.value.headers.filter(h => h.id !== id)
}
function addInputParam() {
  if (!selectedFn.value) return
  selectedFn.value.inputParams.push({
    id: `ip-${Date.now()}`, name: '', description: '', type: 'String',
    passMethod: 'Body', required: false
  })
}
function removeInputParam(id: string) {
  if (!selectedFn.value) return
  selectedFn.value.inputParams = selectedFn.value.inputParams.filter(p => p.id !== id)
}
function addOutputParam() {
  if (!selectedFn.value) return
  selectedFn.value.outputParams.push({
    id: `op-${Date.now()}`, name: '', description: '', type: 'String', required: false
  })
}
function removeOutputParam(id: string) {
  if (!selectedFn.value) return
  selectedFn.value.outputParams = selectedFn.value.outputParams.filter(p => p.id !== id)
}
</script>

<style scoped>
.functions-tab {
  display: flex;
  height: 100%;
  position: relative;
  overflow: hidden;
}

/* AI 识别遮罩 */
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
.loading-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 320px;
}
.loading-robot {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #722ed1, #531dab);
  display: flex;
  align-items: center;
  justify-content: center;
}
.robot-icon {
  font-size: 32px;
  color: #fff;
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(0.92); }
}
.loading-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
}
.loading-desc {
  font-size: 13px;
  color: var(--text-secondary);
  text-align: center;
}
.loading-bar { width: 100%; }

/* 左侧函数列表 */
.fn-list-panel {
  width: 240px;
  flex-shrink: 0;
  background: var(--bg-white);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}
.panel-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
}
.fn-tree {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}
.fn-group-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 12px;
  color: var(--text-secondary);
  user-select: none;
}
.fn-group-header:hover { background: var(--bg-body); }
.group-arrow {
  font-size: 10px;
  transition: transform 0.2s;
  flex-shrink: 0;
}
.group-arrow.expanded { transform: rotate(90deg); }
.file-icon { color: var(--primary-color); font-size: 13px; flex-shrink: 0; }
.group-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.group-badge {
  background: var(--primary-light);
  color: var(--primary-color);
  border-radius: 10px;
  padding: 0 6px;
  font-size: 11px;
}
.fn-items { padding: 0 0 4px 20px; }
.fn-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px 6px 6px;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 2px;
  transition: background 0.15s;
}
.fn-item:hover { background: var(--bg-body); }
.fn-item.selected { background: var(--primary-light); }
.method-badge {
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  padding: 1px 5px;
  border-radius: 4px;
  flex-shrink: 0;
}
.fn-item-info { flex: 1; min-width: 0; }
.fn-item-name { font-size: 12px; color: var(--text-main); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fn-item-code { font-size: 11px; color: var(--text-secondary); }
.fn-delete { color: var(--text-secondary); font-size: 12px; opacity: 0; transition: opacity 0.15s; }
.fn-item:hover .fn-delete { opacity: 1; }
.fn-delete:hover { color: #ff4d4f; }

/* 展开动画 */
.group-expand-enter-active, .group-expand-leave-active { transition: all 0.2s ease; overflow: hidden; }
.group-expand-enter-from, .group-expand-leave-to { opacity: 0; max-height: 0; }
.group-expand-enter-to, .group-expand-leave-from { max-height: 500px; }

/* 右侧详情 */
.fn-detail-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg-body);
}
.detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 14px 20px;
  background: var(--bg-white);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}
.detail-title-wrap { display: flex; flex-direction: column; gap: 3px; }
.detail-title { font-size: 15px; font-weight: 600; color: var(--text-main); }
.detail-subtitle { font-size: 12px; color: var(--text-secondary); }
.detail-actions { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.confirm-stat { font-size: 12px; color: var(--text-secondary); }
.confirm-stat b { color: var(--primary-color); }
.detail-scroll { flex: 1; overflow-y: auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 16px; }
.form-section { background: var(--bg-white); border-radius: 8px; padding: 16px; }
.section-title { font-size: 13px; font-weight: 600; color: var(--text-main); margin-bottom: 12px; display: block; }
.section-header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.url-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.detail-empty {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px; color: var(--text-secondary); font-size: 14px;
}
.empty-icon { font-size: 40px; color: #d9d9d9; }
</style>
