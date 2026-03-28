<!-- src/components/task/EntityLogic.vue -->
<template>
  <div class="entity-logic">
    <!-- Tab 栏 -->
    <div class="tab-bar">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        <component :is="tab.icon" />
        <span>{{ tab.label }}</span>
        <span class="tab-count" :class="{ active: activeTab === tab.key }">{{ tab.count }}</span>
      </div>
    </div>

    <!-- Tab 内容区 -->
    <div class="tab-content">
      <EntityLogicFunctions
        v-show="activeTab === 'function'"
        :functions="functions"
        :is-loading="isFunctionLoading"
        :loading-progress="functionProgress"
        @confirm="onFunctionsConfirmed"
        @reidentify="triggerFunctionReidentify"
        @delete:function="deleteFunction"
      />
      <EntityLogicActions
        v-show="activeTab === 'action'"
        :actions="actions"
        :functions="functions"
        :is-loading="isActionLoading"
        :loading-progress="actionProgress"
        @confirm="onActionsConfirmed"
        @back="activeTab = 'function'"
        @reidentify="triggerActionReidentify"
        @add:action="addAction"
        @delete:action="deleteAction"
      />
      <EntityLogicAssociations
        v-show="activeTab === 'association'"
        :associations="associations"
        :actions="actions"
        :ontologies="ontologies"
        :is-loading="isAssociationLoading"
        :loading-progress="associationProgress"
        @back="activeTab = 'action'"
        @reidentify="triggerAssociationReidentify"
        @complete="onComplete"
        @add:association="addAssociation"
        @delete:association="deleteAssociation"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { CodeOutlined, ThunderboltOutlined, LinkOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import EntityLogicFunctions from './EntityLogicFunctions.vue'
import EntityLogicActions from './EntityLogicActions.vue'
import EntityLogicAssociations from './EntityLogicAssociations.vue'
import { useCopilotStore } from '@/stores'
import type { FunctionDef, ActionDef, OntologyItem, OntologyAssociation } from '@/types/entityLogic'

const copilotStore = useCopilotStore()

// ---- Tab 配置 ----
const activeTab = ref<'function' | 'action' | 'association'>('function')

// ---- 数据（Mock，来自参考源码 mockData.ts） ----
const functions = ref<FunctionDef[]>([
  {
    id: 'func-001', code: 'CUST_001', name: '根据客户ID查询客户',
    description: '根据客户ID查询客户详细信息', documentName: '客户管理接口文档',
    fileName: 'customer_api_v1.0.json', serverUrl: 'https://api.example.com',
    path: '/api/v1/customers/{customer_id}', method: 'POST', bodyType: 'raw',
    headers: [
      { id: 'h1', key: 'Content-Type', value: 'application/json', description: '内容类型' },
      { id: 'h2', key: 'Authorization', value: 'Bearer {{token}}', description: '认证令牌' }
    ],
    inputParams: [
      { id: 'ip1', name: 'customer_id', description: '客户ID', type: 'String', passMethod: 'Body', required: true },
      { id: 'ip2', name: 'include_detail', description: '是否包含详情', type: 'Boolean', passMethod: 'Body', required: false }
    ],
    outputParams: [
      { id: 'op1', name: 'customer_name', description: '客户名称', type: 'String', required: true },
      { id: 'op2', name: 'customer_phone', description: '客户手机号', type: 'String', required: false },
      { id: 'op3', name: 'customer_email', description: '客户邮箱', type: 'String', required: false }
    ]
  },
  {
    id: 'func-002', code: 'ORD_001', name: '查询订单列表',
    description: '根据条件查询订单列表信息', documentName: '订单管理接口文档',
    fileName: 'order_api_v2.3.yaml', serverUrl: 'https://api.example.com',
    path: '/api/v1/orders', method: 'GET', bodyType: 'raw',
    headers: [
      { id: 'h3', key: 'Authorization', value: 'Bearer {{token}}', description: '认证令牌' }
    ],
    inputParams: [
      { id: 'ip3', name: 'page', description: '页码', type: 'Integer', passMethod: 'Query', required: false, defaultValue: '1' },
      { id: 'ip4', name: 'page_size', description: '每页数量', type: 'Integer', passMethod: 'Query', required: false, defaultValue: '20' },
      { id: 'ip5', name: 'status', description: '订单状态', type: 'String', passMethod: 'Query', required: false }
    ],
    outputParams: [
      { id: 'op4', name: 'order_id', description: '订单编号', type: 'String', required: true },
      { id: 'op5', name: 'order_amount', description: '订单金额', type: 'Number', required: true },
      { id: 'op6', name: 'order_status', description: '订单状态', type: 'String', required: true },
      { id: 'op7', name: 'created_at', description: '创建时间', type: 'String', required: true }
    ]
  },
  {
    id: 'func-003', code: 'PROD_001', name: '查询产品详情',
    description: '根据产品ID查询产品详细信息', documentName: '产品管理接口文档',
    fileName: 'product_api_v1.5.json', serverUrl: 'https://api.example.com',
    path: '/api/v1/products/{product_id}', method: 'GET', bodyType: 'raw',
    headers: [],
    inputParams: [
      { id: 'ip6', name: 'product_id', description: '产品ID', type: 'String', passMethod: 'Path', required: true }
    ],
    outputParams: [
      { id: 'op8', name: 'product_name', description: '产品名称', type: 'String', required: true },
      { id: 'op9', name: 'product_price', description: '产品价格', type: 'Number', required: true },
      { id: 'op10', name: 'product_desc', description: '产品描述', type: 'String', required: false }
    ]
  },
  {
    id: 'func-004', code: 'CUST_002', name: '更新客户信息',
    description: '根据客户ID更新客户信息', documentName: '客户管理接口文档',
    fileName: 'customer_api_v1.0.json', serverUrl: 'https://api.example.com',
    path: '/api/v1/customers/{customer_id}', method: 'PUT', bodyType: 'raw',
    headers: [
      { id: 'h4', key: 'Content-Type', value: 'application/json', description: '内容类型' },
      { id: 'h5', key: 'Authorization', value: 'Bearer {{token}}', description: '认证令牌' }
    ],
    inputParams: [
      { id: 'ip7', name: 'customer_id', description: '客户ID', type: 'String', passMethod: 'Path', required: true },
      { id: 'ip8', name: 'customer_name', description: '客户名称', type: 'String', passMethod: 'Body', required: false },
      { id: 'ip9', name: 'customer_phone', description: '客户手机号', type: 'String', passMethod: 'Body', required: false }
    ],
    outputParams: [
      { id: 'op11', name: 'success', description: '是否成功', type: 'Boolean', required: true },
      { id: 'op12', name: 'message', description: '返回消息', type: 'String', required: false }
    ]
  },
  {
    id: 'func-005', code: 'ORD_002', name: '创建订单',
    description: '创建新的订单', documentName: '订单管理接口文档',
    fileName: 'order_api_v2.3.yaml', serverUrl: 'https://api.example.com',
    path: '/api/v1/orders', method: 'POST', bodyType: 'raw',
    headers: [
      { id: 'h6', key: 'Content-Type', value: 'application/json', description: '内容类型' },
      { id: 'h7', key: 'Authorization', value: 'Bearer {{token}}', description: '认证令牌' }
    ],
    inputParams: [
      { id: 'ip10', name: 'customer_id', description: '客户ID', type: 'String', passMethod: 'Body', required: true },
      { id: 'ip11', name: 'product_id', description: '产品ID', type: 'String', passMethod: 'Body', required: true },
      { id: 'ip12', name: 'quantity', description: '数量', type: 'Integer', passMethod: 'Body', required: true }
    ],
    outputParams: [
      { id: 'op13', name: 'order_id', description: '订单编号', type: 'String', required: true },
      { id: 'op14', name: 'order_amount', description: '订单金额', type: 'Number', required: true }
    ]
  }
])

const actions = ref<ActionDef[]>([
  { id: 'act-001', code: 'ACT_001', name: '查询客户信息', description: '根据客户ID查询客户详细信息', type: '原子动作', targetFunctionId: 'func-001', category: '客户管理' },
  { id: 'act-002', code: 'ACT_002', name: '查询订单列表', description: '根据条件查询订单列表信息', type: '原子动作', targetFunctionId: 'func-002', category: '订单管理' },
  { id: 'act-003', code: 'ACT_003', name: '查询产品详情', description: '根据产品ID查询产品详细信息', type: '原子动作', targetFunctionId: 'func-003', category: '产品管理' },
  { id: 'act-004', code: 'ACT_004', name: '更新客户信息', description: '根据客户ID更新客户信息', type: '原子动作', targetFunctionId: 'func-004', category: '客户管理' },
  { id: 'act-005', code: 'ACT_005', name: '创建订单', description: '创建新的订单', type: '原子动作', targetFunctionId: 'func-005', category: '订单管理' }
])

const ontologies = ref<OntologyItem[]>([
  {
    id: 'ont-001', name: '客户', description: '客户实体', category: 'CRM', subCategory: '基础数据',
    attributes: [
      { id: 'attr-001', name: '客户ID', description: '客户唯一标识', type: 'String' },
      { id: 'attr-002', name: '客户名称', description: '客户姓名', type: 'String' },
      { id: 'attr-003', name: '手机号', description: '客户手机号码', type: 'String' },
      { id: 'attr-004', name: '邮箱', description: '客户电子邮箱', type: 'String' }
    ]
  },
  {
    id: 'ont-002', name: '订单', description: '订单实体', category: 'CRM', subCategory: '交易数据',
    attributes: [
      { id: 'attr-005', name: '订单编号', description: '订单唯一标识', type: 'String' },
      { id: 'attr-006', name: '订单金额', description: '订单总金额', type: 'Number' },
      { id: 'attr-007', name: '订单状态', description: '当前订单状态', type: 'String' },
      { id: 'attr-008', name: '创建时间', description: '订单创建时间', type: 'String' }
    ]
  },
  {
    id: 'ont-003', name: '产品', description: '产品实体', category: '产品管理', subCategory: '基础数据',
    attributes: [
      { id: 'attr-009', name: '产品ID', description: '产品唯一标识', type: 'String' },
      { id: 'attr-010', name: '产品名称', description: '产品名称', type: 'String' },
      { id: 'attr-011', name: '产品价格', description: '产品价格', type: 'Number' },
      { id: 'attr-012', name: '产品描述', description: '产品详细描述', type: 'String' }
    ]
  }
])

const associations = ref<OntologyAssociation[]>([
  { id: 'assoc-001', actionId: 'act-001', ontologyId: 'ont-001', confidence: 0.95 },
  { id: 'assoc-002', actionId: 'act-002', ontologyId: 'ont-002', confidence: 0.88 },
  { id: 'assoc-003', actionId: 'act-003', ontologyId: 'ont-003', confidence: 0.92 },
  { id: 'assoc-004', actionId: 'act-002', ontologyId: 'ont-001', confidence: 0.72 },
  { id: 'assoc-005', actionId: 'act-001', ontologyId: 'ont-001', confidence: 1.00 }
])

// ---- Tab 配置 ----
const tabs = computed(() => [
  { key: 'function' as const, label: '函数', icon: CodeOutlined, count: functions.value.length },
  { key: 'action' as const, label: '动作', icon: ThunderboltOutlined, count: actions.value.length },
  { key: 'association' as const, label: '本体和动作关联', icon: LinkOutlined, count: associations.value.length }
])

// ---- AI Loading 状态 ----
const isFunctionLoading = ref(false)
const isActionLoading = ref(false)
const isAssociationLoading = ref(false)
const functionProgress = ref(0)
const actionProgress = ref(0)
const associationProgress = ref(0)

function runLoadingAnimation(
  progressRef: { value: number },
  loadingRef: { value: boolean },
  duration: number,
  onDone?: () => void
) {
  progressRef.value = 0
  loadingRef.value = true
  const steps = 20
  const interval = duration / steps
  let step = 0
  const timer = setInterval(() => {
    step++
    progressRef.value = Math.min(Math.round((step / steps) * 100), 100)
    if (step >= steps) {
      clearInterval(timer)
      loadingRef.value = false
      onDone?.()
    }
  }, interval)
}

// ---- AI 识别触发 ----
function triggerFunctionReidentify() {
  activeTab.value = 'function'
  runLoadingAnimation(functionProgress, isFunctionLoading, 1500)
  copilotStore.triggerAIAnalysis(4)
}

function triggerActionReidentify() {
  activeTab.value = 'action'
  runLoadingAnimation(actionProgress, isActionLoading, 1200)
}

function triggerAssociationReidentify() {
  activeTab.value = 'association'
  runLoadingAnimation(associationProgress, isAssociationLoading, 2000)
}

// ---- 步骤间流转 ----
function onFunctionsConfirmed() {
  activeTab.value = 'action'
  runLoadingAnimation(actionProgress, isActionLoading, 1200)
}

function onActionsConfirmed() {
  activeTab.value = 'association'
  runLoadingAnimation(associationProgress, isAssociationLoading, 2000)
}

function onComplete() {
  message.success('本体和动作关联已确认，可继续完成步骤')
}

// ---- CRUD ----
function deleteFunction(id: string) {
  functions.value = functions.value.filter(f => f.id !== id)
}

function addAction() {
  const newId = `act-${Date.now()}`
  actions.value.push({
    id: newId, code: `ACT_00${actions.value.length + 1}`,
    name: '新建动作', description: '',
    type: '原子动作', targetFunctionId: functions.value[0]?.id || '',
    category: '其他'
  })
}

function deleteAction(id: string) {
  actions.value = actions.value.filter(a => a.id !== id)
}

function addAssociation(assoc: Omit<OntologyAssociation, 'id'>) {
  associations.value.push({ ...assoc, id: `assoc-${Date.now()}` })
}

function deleteAssociation(id: string) {
  associations.value = associations.value.filter(a => a.id !== id)
}

// ---- 副驾 reidentify 联动 ----
watch(() => copilotStore.reidentifyAction, (action) => {
  if (action === 'reidentify-functions') triggerFunctionReidentify()
  if (action === 'reidentify-actions') triggerActionReidentify()
  if (action === 'reidentify-associations') triggerAssociationReidentify()
})

// ---- 进入 Step 4 自动触发函数识别 ----
onMounted(() => {
  runLoadingAnimation(functionProgress, isFunctionLoading, 1500)
})
</script>

<style scoped>
.entity-logic {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-body);
  overflow: hidden;
}

/* Tab 栏 */
.tab-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 20px 0;
  background: var(--bg-white);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}
.tab-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  cursor: pointer;
  border-radius: 8px 8px 0 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  user-select: none;
}
.tab-item:hover {
  color: var(--primary-color);
  background: var(--primary-light);
}
.tab-item.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
  background: var(--primary-light);
}
.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 18px;
  padding: 0 5px;
  background: var(--primary-light);
  color: var(--primary-color);
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}
.tab-item.active .tab-count {
  background: var(--primary-color);
  color: #fff;
}

/* Tab 内容区 */
.tab-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}
.tab-content > * {
  position: absolute;
  inset: 0;
}
</style>
