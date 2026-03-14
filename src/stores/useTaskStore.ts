import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Task, WorkspaceConfig } from '@/types'

export const useTaskStore = defineStore('task', () => {
  // 任务列表数据
  const tasks = ref<Task[]>([
    {
      id: 't1',
      name: 'CRM_USER_MAIN_DB',
      dataSourceType: '结构化 MySQL',
      dataSourceIcon: 'DatabaseOutlined',
      dataSourceColor: 'var(--primary-color)',
      collectMode: '批量全量',
      status: 'success',
      statusText: '同步成功',
      lastCollectTime: '2024-10-25 04:00'
    },
    {
      id: 't2',
      name: '5G_PLAN_BROCHURE_PDF',
      dataSourceType: '非结构化 PDF',
      dataSourceIcon: 'FilePdfOutlined',
      dataSourceColor: '#722ED1',
      collectMode: '批量',
      status: 'processing',
      statusText: '提取中',
      lastCollectTime: '2024-10-25 15:30'
    },
    {
      id: 't3',
      name: 'KAFKA_SIGNAL_REALTIME',
      dataSourceType: '实时 Kafka',
      dataSourceIcon: 'BoltOutlined',
      dataSourceColor: '#FA8C16',
      collectMode: '实时',
      status: 'listening',
      statusText: '监听中',
      lastCollectTime: '—'
    },
    {
      id: 't4',
      name: 'T_BASE_STATION_GEOS',
      dataSourceType: '结构化 MySQL',
      dataSourceIcon: 'DatabaseOutlined',
      dataSourceColor: 'var(--primary-color)',
      collectMode: '批量',
      status: 'success',
      statusText: '成功',
      lastCollectTime: '2024-10-24 10:00'
    },
    {
      id: 't5',
      name: 'LOG_FAILURE_RECORDS',
      dataSourceType: '结构化 CSV',
      dataSourceIcon: 'ExclamationCircleOutlined',
      dataSourceColor: 'var(--danger-color)',
      collectMode: '增量',
      status: 'error',
      statusText: '同步异常',
      lastCollectTime: '2024-10-25 00:00'
    },
    {
      id: 't6',
      name: 'PRODUCT_CATALOG_ERP',
      dataSourceType: '结构化 Oracle',
      dataSourceIcon: 'AppstoreAddOutlined',
      dataSourceColor: '#14C9C9',
      collectMode: '批量全量',
      status: 'success',
      statusText: '同步成功',
      lastCollectTime: '2024-10-23 02:00'
    },
    {
      id: 't7',
      name: 'BILLING_DETAIL_PG',
      dataSourceType: '结构化 PostgreSQL',
      dataSourceIcon: 'AccountBookOutlined',
      dataSourceColor: '#00B42A',
      collectMode: '增量',
      status: 'processing',
      statusText: '同步中',
      lastCollectTime: '2024-10-25 18:00'
    },
    {
      id: 't8',
      name: 'COMPLAINT_WORKORDER_DB',
      dataSourceType: '结构化 MySQL',
      dataSourceIcon: 'CustomerServiceOutlined',
      dataSourceColor: '#F53F3F',
      collectMode: '增量',
      status: 'success',
      statusText: '成功',
      lastCollectTime: '2024-10-25 06:00'
    },
    {
      id: 't9',
      name: 'NETWORK_SLICE_CONFIG',
      dataSourceType: '结构化 PostgreSQL',
      dataSourceIcon: 'ApiOutlined',
      dataSourceColor: '#722ED1',
      collectMode: '批量',
      status: 'pending',
      statusText: '待执行',
      lastCollectTime: '—'
    }
  ])

  // 空间配置
  const workspaceConfig = ref<WorkspaceConfig>({
    name: '产品知识本体',
    model: '通义千问32B · DeepSeek R1',
    vectorDb: 'Milvus 192.168.1.10:19530',
    graphDb: 'Neo4j 5.x — 192.168.1.20',
    members: 'admin, 张工, 李工, 王工...',
    graphStorage: 'neo4j://产品知识本体/v2.1',
    entityCount: 1284,
    relationCount: 3671,
    connected: true
  })

  // 当前任务
  const currentTask = ref<Task | null>(null)
  const taskName = ref('新建采集任务')

  // 当前步骤
  const currentStepId = ref(1)

  // 步骤1表单数据
  const dataType = ref<'struct' | 'unstruct'>('struct')
  const collectItem = ref<'physical' | 'logical' | 'model' | 'script' | 'offline'>('physical')
  const collectMode = ref<'full' | 'incremental'>('full')
  const dataSource = ref('CRM 核心业务库 (MySQL 8.0) — 192.168.1.10:3306')
  const scriptConfigured = ref(false)
  const scriptName = ref('')

  // 离线开发相关状态
  const offlineTaskConfigured = ref(false)
  const offlineTaskName = ref('')
  const offlineSchedulerCompleted = ref(false)

  // 步骤2实体提取状态
  const step2FirstLoaded = ref(false) // 是否首次加载步骤2
  const lastSelectedOntology = ref('') // 上次选择的本体ID（用于检测数据库切换）

  // 选中的表
  const selectedTables = ref<string[]>(['t_user_main', 't_order_flow', 't_product_catalog', 't_contract_info', 't_complaint_record'])

  function setCurrentTask(task: Task | null) {
    currentTask.value = task
    taskName.value = task?.name || '新建采集任务'
  }

  function switchStep(stepId: number) {
    // 记录离开步骤2时的本体选择状态
    if (currentStepId.value === 2) {
      // Step 2 is being left, store current ontology
    }
    currentStepId.value = stepId
  }

  // 记录当前选择的本体ID（用于检测切换数据库）
  function setLastSelectedOntology(ontologyId: string) {
    lastSelectedOntology.value = ontologyId
  }

  // 标记步骤2已首次加载
  function markStep2FirstLoaded() {
    step2FirstLoaded.value = true
  }

  // 检查是否需要重新抽取（数据库是否切换）
  function checkNeedReextract(newOntologyId: string): boolean {
    if (!step2FirstLoaded.value) {
      // 首次加载，需要显示识别动画
      return true
    }
    if (lastSelectedOntology.value && lastSelectedOntology.value !== newOntologyId) {
      // 切换了数据库，需要显示重新抽取动画
      return true
    }
    return false
  }

  function updateDataType(type: 'struct' | 'unstruct') {
    dataType.value = type
  }

  function updateCollectItem(item: 'physical' | 'logical' | 'model' | 'script' | 'offline') {
    collectItem.value = item
    if (item === 'script') {
      scriptConfigured.value = false
    }
  }

  function updateCollectMode(mode: 'full' | 'incremental') {
    collectMode.value = mode
  }

  function setScriptConfigured(configured: boolean, name?: string) {
    scriptConfigured.value = configured
    scriptName.value = name || ''
  }

  function setOfflineTaskConfigured(configured: boolean, name?: string) {
    offlineTaskConfigured.value = configured
    offlineTaskName.value = name || ''
  }

  function setOfflineSchedulerCompleted(completed: boolean) {
    offlineSchedulerCompleted.value = completed
  }

  return {
    tasks,
    workspaceConfig,
    currentTask,
    taskName,
    currentStepId,
    dataType,
    collectItem,
    collectMode,
    dataSource,
    scriptConfigured,
    scriptName,
    selectedTables,
    offlineTaskConfigured,
    offlineTaskName,
    offlineSchedulerCompleted,
    step2FirstLoaded,
    lastSelectedOntology,
    setCurrentTask,
    switchStep,
    updateDataType,
    updateCollectItem,
    updateCollectMode,
    setScriptConfigured,
    setOfflineTaskConfigured,
    setOfflineSchedulerCompleted,
    setLastSelectedOntology,
    markStep2FirstLoaded,
    checkNeedReextract
  }
})
