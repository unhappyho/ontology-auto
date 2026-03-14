import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 消息类型
export interface CopilotMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: number
}

// 建议卡片类型
export interface SuggestionCard {
  id: string
  type: 'table' | 'entity' | 'relation' | 'summary'
  title: string
  description: string
  content: string
  stats?: Record<string, number | string>
  accepted?: boolean
  actionLabel?: string
}

// 步骤建议内容配置
const STEP_SUGGESTIONS: Record<number, SuggestionCard[]> = {
  // 步骤1：数据源配置建议
  1: [
    {
      id: 's1-1',
      type: 'table',
      title: '推荐表结构',
      description: '基于CRM业务场景，推荐以下核心表结构',
      content: 't_user_main (用户主表)\nt_order_flow (订单流水)\nt_product_catalog (产品目录)\nt_contract_info (合同信息)\nt_complaint_record (投诉记录)',
      actionLabel: '采纳建议'
    },
    {
      id: 's1-2',
      type: 'table',
      title: '关联表补充',
      description: '建议补充以下关联表以完善数据链路',
      content: 't_user_address (用户地址)\nt_order_item (订单明细)\nt_product_category (产品分类)',
      actionLabel: '添加表'
    }
  ],
  // 步骤2：实体识别完成建议
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
      actionLabel: '查看详情'
    },
    {
      id: 's2-2',
      type: 'entity',
      title: '新增实体建议',
      description: '根据数据特征，发现可提取的新实体类型',
      content: '建议新增实体类型：\n- 地址位置（从用户地址提取）\n- 产品分类（从产品目录提取）\n- 订单状态（从订单流水提取）',
      actionLabel: '采纳建议'
    }
  ],
  // 步骤3：关联推断建议
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
      actionLabel: '采纳全部'
    },
    {
      id: 's3-2',
      type: 'relation',
      title: '潜在关联',
      description: '发现以下潜在的跨域关联',
      content: '建议新增关联：\n- 投诉 → 订单（投诉关联订单）\n- 合同 → 产品（合同包含产品）\n- 用户 → 地址（用户默认地址）',
      actionLabel: '添加关联'
    }
  ],
  // 步骤4：入库确认建议
  4: [
    {
      id: 's4-1',
      type: 'summary',
      title: '本体摘要',
      description: '本体构建完成，确认以下内容',
      content: '本体规模：\n- 实体：1,284个\n- 关系：3,671条\n- 属性：368个\n\n存储位置：\nNeo4j: neo4j://产品知识本体/v2.1',
      stats: {
        '实体数量': 1284,
        '关系数量': 3671,
        '属性数量': 368,
        '数据表': 5
      },
      actionLabel: '确认入库'
    },
    {
      id: 's4-2',
      type: 'summary',
      title: '优化建议',
      description: '可进一步优化本体质量',
      content: '优化建议：\n1. 建议为"产品"实体补充图片属性\n2. "订单"实体可增加时间维度分析\n3. 考虑增加"用户画像"实体标签\n\n预计提升检索准确率：15%',
      actionLabel: '应用优化'
    }
  ]
}

// 步骤欢迎消息
const STEP_WELCOME_MESSAGES: Record<number, string> = {
  1: '你好！已进入数据源配置步骤。我可以帮你分析数据表结构，推荐合适的采集范围。',
  2: '实体识别已完成！我发现你的数据中包含丰富的业务实体。让我为你总结识别结果。',
  3: '关联构建阶段已就绪。基于已识别的实体，我可以帮你推断它们之间的关联关系。',
  4: '知识融合入库前最后的确认。我来帮你汇总本体构建的整体情况。'
}

export const useCopilotStore = defineStore('copilot', () => {
  // 面板可见性
  const visible = ref(false)
  const minimized = ref(false)

  // 消息列表
  const messages = ref<CopilotMessage[]>([])

  // 当前步骤ID
  const currentStepId = ref(0)

  // 建议列表
  const suggestions = ref<SuggestionCard[]>([])

  // 是否有新建议
  const hasNewSuggestions = ref(false)

  // 计算当前步骤的建议
  const currentStepSuggestions = computed(() => {
    return STEP_SUGGESTIONS[currentStepId.value] || []
  })

  // 计算当前步骤的欢迎消息
  const currentStepWelcome = computed(() => {
    return STEP_WELCOME_MESSAGES[currentStepId.value] || ''
  })

  // 面板操作
  function openPanel() {
    visible.value = true
    minimized.value = false
  }

  function closePanel() {
    visible.value = false
  }

  function minimizePanel() {
    minimized.value = true
    visible.value = false
  }

  function togglePanel() {
    if (visible.value) {
      minimizePanel()
    } else {
      openPanel()
    }
  }

  // 消息操作
  function addMessage(role: 'user' | 'assistant', content: string) {
    messages.value.push({
      role,
      content,
      timestamp: Date.now()
    })
  }

  function clearMessages() {
    messages.value = []
  }

  // 步骤上下文
  function setStepContext(stepId: number) {
    currentStepId.value = stepId
    // 重置建议状态
    suggestions.value = STEP_SUGGESTIONS[stepId] || []
    hasNewSuggestions.value = true

    // 添加欢迎消息（如果当前步骤有对应消息）
    if (STEP_WELCOME_MESSAGES[stepId]) {
      // 检查是否已存在最近的用户消息
      const lastMsg = messages.value[messages.value.length - 1]
      if (!lastMsg || lastMsg.role !== 'assistant') {
        addMessage('assistant', STEP_WELCOME_MESSAGES[stepId])
      }
    }
  }

  function clearStepContext() {
    currentStepId.value = 0
    suggestions.value = []
    hasNewSuggestions.value = false
  }

  // 建议操作
  function acceptSuggestion(suggestionId: string) {
    const suggestion = suggestions.value.find(s => s.id === suggestionId)
    if (suggestion) {
      suggestion.accepted = true
      addMessage('assistant', `已采纳建议：${suggestion.title}`)
    }
  }

  function acceptAllSuggestions() {
    suggestions.value.forEach(s => {
      s.accepted = true
    })
    addMessage('assistant', '已采纳所有建议')
  }

  function dismissSuggestion(suggestionId: string) {
    const index = suggestions.value.findIndex(s => s.id === suggestionId)
    if (index !== -1) {
      suggestions.value.splice(index, 1)
    }
  }

  function markSuggestionsSeen() {
    hasNewSuggestions.value = false
  }

  // 获取建议的统计信息
  function getSuggestionStats(suggestionId: string) {
    const suggestion = suggestions.value.find(s => s.id === suggestionId)
    return suggestion?.stats || null
  }

  return {
    // 状态
    visible,
    minimized,
    messages,
    currentStepId,
    suggestions,
    hasNewSuggestions,
    // 计算属性
    currentStepSuggestions,
    currentStepWelcome,
    // 面板操作
    openPanel,
    closePanel,
    minimizePanel,
    togglePanel,
    // 消息操作
    addMessage,
    clearMessages,
    // 步骤上下文
    setStepContext,
    clearStepContext,
    // 建议操作
    acceptSuggestion,
    acceptAllSuggestions,
    dismissSuggestion,
    markSuggestionsSeen,
    getSuggestionStats
  }
})
