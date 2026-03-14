import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CanvasNode, CanvasEdge, Operator } from '@/types'
import { OPERATORS, STEPS } from '@/constants'

export const useCanvasStore = defineStore('canvas', () => {
  // 节点数据
  const nodes = ref<CanvasNode[]>([])
  // 边数据
  const edges = ref<CanvasEdge[]>([])

  // ID 计数器
  const idCounter = ref(1)

  // 选中的节点
  const selectedNodeId = ref<string | null>(null)

  // 正在拖拽的算子类型
  const draggedOpType = ref<string | null>(null)

  // 正在拖拽的节点 ID
  const draggingNodeId = ref<string | null>(null)

  // 连线状态
  const isConnecting = ref(false)
  const connectSourceNode = ref<string | null>(null)

  // 当前步骤 ID（从 taskStore 获取）
  const currentStepId = ref(1)

  // 当前步骤颜色
  const activeStepColor = computed(() => {
    const step = STEPS.find(s => s.id === currentStepId.value)
    return step?.color || 'var(--color-step1)'
  })

  // 可用的算子（当前步骤及之前的）
  const availableOperators = computed(() => {
    return OPERATORS.filter(op => op.step <= currentStepId.value)
  })

  // 添加节点
  function addNode(operator: Operator, x: number, y: number): CanvasNode {
    const step = STEPS.find(s => s.id === operator.step)
    const node: CanvasNode = {
      id: `node_${idCounter.value++}`,
      type: operator.type,
      step: operator.step,
      name: operator.name,
      icon: operator.icon,
      color: step?.color || 'var(--color-step1)',
      x,
      y
    }
    nodes.value.push(node)
    return node
  }

  // 删除节点
  function deleteNode(nodeId: string) {
    nodes.value = nodes.value.filter(n => n.id !== nodeId)
    edges.value = edges.value.filter(e => e.sourceNode !== nodeId && e.targetNode !== nodeId)
    if (selectedNodeId.value === nodeId) {
      selectedNodeId.value = null
    }
  }

  // 更新节点位置
  function updateNodePosition(nodeId: string, x: number, y: number) {
    const node = nodes.value.find(n => n.id === nodeId)
    if (node) {
      node.x = x
      node.y = y
    }
  }

  // 重命名节点
  function renameNode(nodeId: string, newName: string) {
    const node = nodes.value.find(n => n.id === nodeId)
    if (node) {
      node.name = newName
    }
  }

  // 添加边
  function addEdge(sourceId: string, targetId: string): CanvasEdge | null {
    // 检查是否已存在
    const exists = edges.value.some(e => e.sourceNode === sourceId && e.targetNode === targetId)
    if (exists || sourceId === targetId) {
      return null
    }
    const edge: CanvasEdge = {
      id: `edge_${Date.now()}`,
      sourceNode: sourceId,
      targetNode: targetId
    }
    edges.value.push(edge)
    return edge
  }

  // 删除边
  function deleteEdge(edgeId: string) {
    edges.value = edges.value.filter(e => e.id !== edgeId)
  }

  // 清空画布
  function clearCanvas() {
    nodes.value = []
    edges.value = []
    selectedNodeId.value = null
  }

  // 设置选中的节点
  function setSelectedNode(nodeId: string | null) {
    selectedNodeId.value = nodeId
  }

  // 设置拖拽的算子类型
  function setDraggedOpType(type: string | null) {
    draggedOpType.value = type
  }

  // 设置拖拽中的节点
  function setDraggingNode(nodeId: string | null) {
    draggingNodeId.value = nodeId
  }

  // 开始连线
  function startConnect(sourceId: string) {
    isConnecting.value = true
    connectSourceNode.value = sourceId
  }

  // 结束连线
  function endConnect(targetId: string): CanvasEdge | null {
    let edge = null
    if (isConnecting.value && connectSourceNode.value && connectSourceNode.value !== targetId) {
      edge = addEdge(connectSourceNode.value, targetId)
    }
    cancelConnect()
    return edge
  }

  // 取消连线
  function cancelConnect() {
    isConnecting.value = false
    connectSourceNode.value = null
  }

  // 获取算子信息
  function getOperatorInfo(type: string): Operator | undefined {
    return OPERATORS.find(op => op.type === type)
  }

  return {
    nodes,
    edges,
    idCounter,
    selectedNodeId,
    draggedOpType,
    draggingNodeId,
    isConnecting,
    connectSourceNode,
    currentStepId,
    activeStepColor,
    availableOperators,
    addNode,
    deleteNode,
    updateNodePosition,
    renameNode,
    addEdge,
    deleteEdge,
    clearCanvas,
    setSelectedNode,
    setDraggedOpType,
    setDraggingNode,
    startConnect,
    endConnect,
    cancelConnect,
    getOperatorInfo
  }
})
