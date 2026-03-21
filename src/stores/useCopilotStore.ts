import { defineStore } from 'pinia'
import { ref } from 'vue'

// 消息类型
export type MessageType = 'text' | 'thinking' | 'card-group'

// 思考状态
export type ThinkingStatus = 'streaming' | 'completed'

export interface CopilotMessage {
  id: string
  role: 'user' | 'assistant'
  type: MessageType
  content: string
  cards?: SuggestionCard[]
  thinkingSteps?: string[]  // 保留兼容旧版
  timestamp: number
  // 流式思考相关字段
  thinkingContent?: string
  thinkingStatus?: ThinkingStatus
  thinkingCollapsed?: boolean
}

// 建议卡片类型
export interface SuggestionCard {
  id: string
  type: 'table' | 'entity' | 'relation' | 'summary'
  title: string
  description: string
  content: string
  stats?: Record<string, number | string>
  accepted: boolean
  dismissed?: boolean
  action?: 'addEntity' | 'addRelation' | 'addTable' | 'applyRule'
  reidentifyAction?: string
}

// 各步骤 AI 深度思考步骤
const STEP_THINKING_STEPS: Record<number, string[]> = {
  1: [
    '正在扫描可用数据源列表...',
    '分析表结构与字段语义...',
    '匹配业务场景推荐策略...',
    '生成最优配置建议...'
  ],
  2: [
    '遍历原始数据特征...',
    '识别命名实体边界...',
    '合并同义实体候选...',
    '统计实体分布与置信度...'
  ],
  3: [
    '构建实体共现矩阵...',
    '推断隐式关联关系...',
    '验证关系合理性...',
    '发现跨域潜在关联...'
  ],
  4: [
    '提取条件-结论规则模式...',
    '推导派生属性逻辑...',
    '验证规则一致性...',
    '量化规则覆盖度...'
  ],
  5: [
    '识别用户行为序列...',
    '归纳动作模式类型...',
    '分析行为路径转化率...',
    '建议优化动作触发条件...'
  ]
}

export const GENERIC_THINKING_STEPS = [
  '理解问题意图...',
  '检索相关上下文...',
  '整合分析结果...'
]

// 各步骤 AI 分析完成后的文字说明
const STEP_ANALYSIS_TEXTS: Record<number, string> = {
  1: '数据采集分析完成！推荐采集项为「逻辑模型」，数据源为 CRM 核心业务库 (MySQL)。已识别 8 张核心业务表，包含用户、订单、产品等主题域数据。',
  2: '实体提取完成！发现用户、订单、产品、合同、投诉 5 种实体类型，共 1,284 个实体，368 个属性字段。同时发现可提取的新实体类型建议。',
  3: '关联构建完成！基于已识别实体，推断出主要关联关系，并发现潜在的跨域关联，可进一步丰富知识图谱。',
  4: '规则识别完成！发现派生关系规则 3 条、动态分类规则 5 条、事理传导规则 2 条，请确认并采纳。',
  5: '动作识别完成！发现登录/登出、订单创建/支付、产品浏览/收藏、投诉提交/处理 4 类典型动作，并识别出 3 条典型行为路径。'
}

// 步骤建议卡片配置
const STEP_SUGGESTIONS: Record<number, Omit<SuggestionCard, 'accepted' | 'dismissed'>[]> = {
  1: [
    {
      id: 's1-1',
      type: 'summary',
      title: '基础配置规则',
      description: '推荐采集项与采集数据源配置',
      content: '采集项建议：\n- 采集类型：逻辑模型\n- 数据格式：结构化数据\n- 采集粒度：表级别\n\n推荐数据源：\n- CRM 核心业务库 (MySQL)\n  主机：crm-db.internal:3306\n  数据库：crm_production',
      stats: {
        '推荐采集项': '逻辑模型',
        '数据格式': '结构化',
        '数据源数量': 1
      },
      action: 'applyRule',
      reidentifyAction: 'reextract-tables'
    },
    {
      id: 's1-2',
      type: 'table',
      title: '采集范围',
      description: '推荐采集的表列表（含表名与表编码）',
      content: '用户主表 (t_user_main)\n订单流水表 (t_order_flow)\n产品目录表 (t_product_catalog)\n合同信息表 (t_contract_info)\n投诉记录表 (t_complaint_record)\n用户地址表 (t_user_address)\n订单明细表 (t_order_item)\n产品分类表 (t_product_category)',
      stats: {
        '推荐表数量': 8,
        '核心主题域': 5
      },
      action: 'addTable',
      reidentifyAction: 'reextract-tables'
    }
  ],
  2: [
    {
      id: 's2-1',
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
      action: 'addEntity',
      reidentifyAction: 'reextract-entities'
    },
    {
      id: 's2-2',
      type: 'entity',
      title: '新增实体建议',
      description: '根据数据特征，发现可提取的新实体类型',
      content: '建议新增实体类型：\n- 地址位置（从用户地址提取）\n- 产品分类（从产品目录提取）\n- 订单状态（从订单流水提取）',
      action: 'addEntity',
      reidentifyAction: 'reextract-entities'
    }
  ],
  3: [
    {
      id: 's3-1',
      type: 'relation',
      title: '推荐关联',
      description: '基于数据特征，智能推断以下关联关系',
      content: '已推断关系：\n- 用户 → 订单 (1:n)\n- 订单 → 产品 (n:m)\n- 用户 → 合同 (1:n)\n- 用户 → 投诉 (1:n)\n- 产品 → 产品分类 (n:1)',
      stats: {
        '用户-订单': 523,
        '订单-产品': 1,
        '用户-合同': 89,
        '用户-投诉': 29
      },
      action: 'addRelation',
      reidentifyAction: 'reextract-relations'
    },
    {
      id: 's3-2',
      type: 'relation',
      title: '潜在关联',
      description: '发现以下潜在的跨域关联',
      content: '建议新增关联：\n- 投诉 → 订单（投诉关联订单）\n- 合同 → 产品（合同包含产品）\n- 用户 → 地址（用户默认地址）',
      action: 'addRelation',
      reidentifyAction: 'reextract-relations'
    }
  ],
  4: [
    {
      id: 's4-1',
      type: 'summary',
      title: '派生关系规则',
      description: '从基础关系推导出新关系',
      content: '已识别派生关系规则：\n\n1. 用户累计消费金额 = SUM(订单.金额)\n2. 客户等级 = IF(累计消费>10000,VIP,普通)\n3. 订单利润率 = (订单.金额-成本)/成本*100%',
      stats: {
        '派生规则': 3,
        '用户属性': 5,
        '订单属性': 8
      },
      action: 'applyRule',
      reidentifyAction: 'reextract-rules'
    },
    {
      id: 's4-2',
      type: 'summary',
      title: '动态分类规则',
      description: '根据条件动态归类到概念',
      content: '已识别动态分类规则：\n\n1. 高价值客户：累计消费>10000\n2. 活跃用户：30天内有登录\n3. 流失风险：60天未登录\n4. 潜在客户：注册但未消费\n5. 投诉用户：存在未处理投诉',
      stats: {
        '分类规则': 5,
        '高价值客户': 128,
        '活跃用户': 856
      },
      action: 'applyRule',
      reidentifyAction: 'reextract-rules'
    }
  ],
  5: [
    {
      id: 's5-1',
      type: 'summary',
      title: '动作类型识别',
      description: '已完成动作类型识别，发现以下动作模式',
      content: '识别结果：\n- 用户登录/登出 (登录事件)\n- 订单创建/支付 (交易事件)\n- 产品浏览/收藏 (浏览事件)\n- 投诉提交/处理 (服务事件)',
      stats: {
        '登录事件': 456,
        '交易事件': 523,
        '浏览事件': 187,
        '服务事件': 89
      },
      action: 'applyRule',
      reidentifyAction: 'reextract-actions'
    },
    {
      id: 's5-2',
      type: 'summary',
      title: '动作序列分析',
      description: '基于用户行为序列，发现以下典型路径',
      content: '典型路径：\n1. 浏览 → 收藏 → 购买\n2. 登录 → 浏览 → 搜索 → 购买\n3. 投诉 → 处理 → 评价\n\n建议：为"浏览→购买"路径优化转化率',
      action: 'applyRule',
      reidentifyAction: 'reextract-actions'
    }
  ]
}

let msgIdCounter = 0
function genMsgId(): string {
  return `msg-${Date.now()}-${++msgIdCounter}`
}

export const useCopilotStore = defineStore('copilot', () => {
  // 面板可见性
  const visible = ref(false)

  // 消息列表
  const messages = ref<CopilotMessage[]>([])

  // 当前步骤ID（用于头部步骤标签）
  const currentStepId = ref(0)

  // 是否有新建议（用于悬浮球角标）
  const hasNewSuggestions = ref(false)

  // 重新识别动作通知（供各组件 watch）
  const reidentifyAction = ref<string | null>(null)

  // 面板操作
  function openPanel() {
    visible.value = true
    hasNewSuggestions.value = false
  }

  function closePanel() {
    visible.value = false
  }

  function togglePanel() {
    if (visible.value) {
      closePanel()
    } else {
      openPanel()
    }
  }

  // 消息操作
  function addMessage(role: 'user' | 'assistant', content: string) {
    messages.value.push({
      id: genMsgId(),
      role,
      type: 'text',
      content,
      timestamp: Date.now()
    })
  }

  function clearMessages() {
    messages.value = []
  }

  // 添加 thinking 消息，返回消息ID
  function addThinkingMessage(steps?: string[]): string {
    const id = genMsgId()
    messages.value.push({
      id,
      role: 'assistant',
      type: 'thinking',
      content: '',
      thinkingSteps: steps,
      thinkingContent: steps ? steps.join('\n') : '',
      thinkingStatus: 'streaming',
      thinkingCollapsed: false,
      timestamp: Date.now()
    })
    return id
  }

  // 开始思考消息（流式版本）
  function startThinkingMessage(): string {
    const id = genMsgId()
    messages.value.push({
      id,
      role: 'assistant',
      type: 'thinking',
      content: '',
      thinkingContent: '',
      thinkingStatus: 'streaming',
      thinkingCollapsed: false,
      timestamp: Date.now()
    })
    return id
  }

  // 追加思考内容（流式输出）
  function appendThinkingContent(msgId: string, chunk: string): void {
    const msg = messages.value.find(m => m.id === msgId)
    if (msg && msg.type === 'thinking') {
      msg.thinkingContent = (msg.thinkingContent || '') + chunk
    }
  }

  // 完成思考（状态改为 completed，自动折叠）
  function completeThinking(msgId: string, summaryText?: string): void {
    const msg = messages.value.find(m => m.id === msgId)
    if (msg && msg.type === 'thinking') {
      msg.thinkingStatus = 'completed'
      msg.thinkingCollapsed = true
      if (summaryText) {
        msg.content = summaryText
      }
    }
  }

  // 切换思考内容折叠状态
  function toggleThinkingCollapsed(msgId: string): void {
    const msg = messages.value.find(m => m.id === msgId)
    // 只检查 thinkingStatus，不限制 type（因为 resolveThinkingToCards 后 type 可能变为 text）
    if (msg && msg.thinkingStatus === 'completed') {
      msg.thinkingCollapsed = !msg.thinkingCollapsed
    }
  }

  // 将 thinking 消息升级为包含文字和卡片（不再改变类型）
  function resolveThinkingToCards(msgId: string, text: string, cards: SuggestionCard[]) {
    const msg = messages.value.find(m => m.id === msgId)
    if (msg) {
      // 直接在原消息上追加 content 和 cards，不改变 type
      msg.content = text
      msg.cards = cards
      // 保持 thinkingStatus 为 completed，thinkingCollapsed 为 true
    }
    if (cards.length > 0) {
      hasNewSuggestions.value = true
    }
  }

  // 采纳消息中的某张卡片
  function acceptCardInMessage(msgId: string, cardId: string) {
    const msg = messages.value.find(m => m.id === msgId)
    if (!msg?.cards) return
    const card = msg.cards.find(c => c.id === cardId)
    if (card) {
      card.accepted = true
      addMessage('assistant', `已采纳「${card.title}」，相关数据已更新。`)
    }
  }

  // 忽略消息中的某张卡片
  function dismissCardInMessage(msgId: string, cardId: string) {
    const msg = messages.value.find(m => m.id === msgId)
    if (!msg?.cards) return
    const card = msg.cards.find(c => c.id === cardId)
    if (card) {
      card.dismissed = true
    }
  }

  // 触发重新识别（通知左侧页面组件）
  function triggerReidentify(action: string) {
    reidentifyAction.value = action
    setTimeout(() => {
      reidentifyAction.value = null
    }, 100)
  }

  // 统一的 AI 分析触发入口（流式版本）
  function triggerAIAnalysis(stepId: number) {
    currentStepId.value = stepId
    openPanel()
    const thinkingMsgId = startThinkingMessage()

    // 模拟流式输出
    const steps = STEP_THINKING_STEPS[stepId] || GENERIC_THINKING_STEPS
    let stepIndex = 0
    let charIndex = 0

    const streamInterval = setInterval(() => {
      if (stepIndex >= steps.length) {
        clearInterval(streamInterval)
        completeThinking(thinkingMsgId, '思考完成')

        setTimeout(() => {
          const text = STEP_ANALYSIS_TEXTS[stepId] || 'AI 分析完成。'
          const cards: SuggestionCard[] = (STEP_SUGGESTIONS[stepId] || []).map(s => ({
            ...s,
            accepted: false,
            dismissed: false
          }))
          resolveThinkingToCards(thinkingMsgId, text, cards)
        }, 300)
        return
      }

      const currentStep = steps[stepIndex]
      if (charIndex < currentStep.length) {
        appendThinkingContent(thinkingMsgId, currentStep[charIndex])
        charIndex++
      } else {
        appendThinkingContent(thinkingMsgId, '\n')
        stepIndex++
        charIndex = 0
      }
    }, 30)
  }

  // 清除步骤上下文（路由离开时调用）
  function clearStepContext() {
    currentStepId.value = 0
    hasNewSuggestions.value = false
  }

  return {
    // 状态
    visible,
    messages,
    currentStepId,
    hasNewSuggestions,
    reidentifyAction,
    // 面板操作
    openPanel,
    closePanel,
    togglePanel,
    // 消息操作
    addMessage,
    clearMessages,
    // thinking 消息管理（流式）
    addThinkingMessage,
    startThinkingMessage,
    appendThinkingContent,
    completeThinking,
    toggleThinkingCollapsed,
    resolveThinkingToCards,
    // 卡片操作
    acceptCardInMessage,
    dismissCardInMessage,
    // 重新识别
    triggerReidentify,
    // AI 分析统一入口
    triggerAIAnalysis,
    // 步骤上下文
    clearStepContext
  }
})
