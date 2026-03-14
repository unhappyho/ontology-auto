<template>
  <div class="canvas-workspace">
    <!-- 算子面板 -->
    <div class="components-panel">
      <div class="panel-header">可用算子</div>
      <div class="panel-body">
        <div v-for="stepId in stepIds" :key="stepId" class="comp-group">
          <div class="comp-group-title">
            <component :is="getStepIcon(stepId)" :style="{ color: getStepColor(stepId) }" />
            步骤 {{ stepId }}
          </div>
          <div
            v-for="op in getOperatorsByStep(stepId)"
            :key="op.type"
            class="comp-item"
            draggable="true"
            @dragstart="handleDragStart($event, op)"
          >
            <div class="comp-icon" :style="{ background: getStepColor(stepId) }">
              <component :is="getIcon(op.icon)" />
            </div>
            <div class="comp-text">{{ op.name }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 画布区域 -->
    <div
      class="canvas-area"
      @dragover.prevent
      @drop="handleDrop"
    >
      <svg class="svg-layer">
        <g ref="edgesContainer">
          <path
            v-for="edge in edges"
            :key="edge.id"
            class="connection-line"
            :d="getEdgePath(edge)"
            @click="handleDeleteEdge(edge.id)"
          />
        </g>
        <path
          v-if="isConnecting"
          class="connection-line temp-line"
          :d="tempLinePath"
        />
      </svg>

      <div class="nodes-container">
        <CanvasNode
          v-for="node in nodes"
          :key="node.id"
          :node="node"
          @select="handleSelectNode"
          @drag="handleNodeDrag"
          @connect-start="handleConnectStart"
          @connect-end="handleConnectEnd"
          @delete="handleDeleteNode"
          @rename="handleRename"
        />
      </div>
    </div>

    <!-- 配置抽屉 -->
    <ConfigDrawer
      v-if="configNodeId"
      :node-id="configNodeId"
      @close="configNodeId = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  DatabaseOutlined,
  FilePdfOutlined,
  CodeOutlined,
  BulbOutlined,
  LinkOutlined,
  CloudServerOutlined,
  AppstoreOutlined
} from '@ant-design/icons-vue'
import CanvasNode from './CanvasNode.vue'
import ConfigDrawer from './ConfigDrawer.vue'
import { useCanvasStore, useUIStore } from '@/stores'
import { OPERATORS, STEPS } from '@/constants'
import type { CanvasEdge, Operator } from '@/types'

const canvasStore = useCanvasStore()
const uiStore = useUIStore()

const nodes = computed(() => canvasStore.nodes)
const edges = computed(() => canvasStore.edges)
const isConnecting = computed(() => canvasStore.isConnecting)
const currentStepId = computed(() => canvasStore.currentStepId)

const configNodeId = ref<string | null>(null)
const tempLinePath = ref('')
const tempLineStart = ref<{ x: number; y: number } | null>(null)

const stepIds = computed(() => {
  const ids = new Set(OPERATORS.filter(op => op.step <= currentStepId.value).map(op => op.step))
  return Array.from(ids).sort()
})

const iconMap: Record<string, any> = {
  DatabaseOutlined,
  FilePdfOutlined,
  CodeOutlined,
  BulbOutlined,
  LinkOutlined,
  CloudServerOutlined,
  AppstoreOutlined
}

function getIcon(iconName: string) {
  return iconMap[iconName] || DatabaseOutlined
}

function getStepIcon(stepId: number) {
  const step = STEPS.find(s => s.id === stepId)
  return step ? getIcon(step.icon) : DatabaseOutlined
}

function getStepColor(stepId: number): string {
  const step = STEPS.find(s => s.id === stepId)
  return step?.color.replace('var(--', '').replace(')', '') || '#165DFF'
}

function getOperatorsByStep(stepId: number) {
  return OPERATORS.filter(op => op.step === stepId && op.step <= currentStepId.value)
}

function handleDragStart(event: DragEvent, operator: Operator) {
  canvasStore.setDraggedOpType(operator.type)
  event.dataTransfer?.setData('operatorType', operator.type)
}

function handleDrop(event: DragEvent) {
  const operatorType = event.dataTransfer?.getData('operatorType') || canvasStore.draggedOpType
  if (!operatorType) return

  const operator = OPERATORS.find(op => op.type === operatorType)
  if (!operator) return

  const canvasArea = event.currentTarget as HTMLElement
  const rect = canvasArea.getBoundingClientRect()
  const x = event.clientX - rect.left - 95
  const y = event.clientY - rect.top - 28

  canvasStore.addNode(operator, x, y)
  canvasStore.setDraggedOpType(null)
}

function handleSelectNode(nodeId: string) {
  canvasStore.setSelectedNode(nodeId)
  configNodeId.value = nodeId
}

function handleNodeDrag(nodeId: string, x: number, y: number) {
  canvasStore.updateNodePosition(nodeId, x, y)
}

function handleConnectStart(sourceId: string, startX: number, startY: number) {
  canvasStore.startConnect(sourceId)
  tempLineStart.value = { x: startX, y: startY }
}

function handleConnectEnd(targetId: string) {
  canvasStore.endConnect(targetId)
  tempLineStart.value = null
  tempLinePath.value = ''
}

function handleDeleteNode(nodeId: string) {
  canvasStore.deleteNode(nodeId)
  if (configNodeId.value === nodeId) {
    configNodeId.value = null
  }
}

function handleRename(nodeId: string) {
  uiStore.openRenameModal(nodeId)
}

function handleDeleteEdge(edgeId: string) {
  canvasStore.deleteEdge(edgeId)
}

function getEdgePath(edge: CanvasEdge): string {
  const sourceNode = nodes.value.find(n => n.id === edge.sourceNode)
  const targetNode = nodes.value.find(n => n.id === edge.targetNode)

  if (!sourceNode || !targetNode) return ''

  const x1 = sourceNode.x + 190 // 右侧端口
  const y1 = sourceNode.y + 28
  const x2 = targetNode.x // 左侧端口
  const y2 = targetNode.y + 28

  return createBezier(x1, y1, x2, y2)
}

function createBezier(x1: number, y1: number, x2: number, y2: number): string {
  const offset = Math.max(Math.abs(x2 - x1) / 2, 60)
  return `M ${x1} ${y1} C ${x1 + offset} ${y1}, ${x2 - offset} ${y2}, ${x2} ${y2}`
}
</script>

<style scoped>
.canvas-workspace {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
  min-height: 0;
}

.components-panel {
  width: 220px;
  background: var(--bg-white);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  z-index: 5;
}

.panel-header {
  padding: 14px;
  border-bottom: 1px solid var(--border-color);
  font-weight: 600;
  font-size: 14px;
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.comp-group {
  margin-bottom: 14px;
}

.comp-group-title {
  font-size: 11px;
  color: var(--text-secondary);
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.comp-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  margin-bottom: 6px;
  cursor: grab;
  background: var(--bg-white);
  transition: border-color 0.2s;
}

.comp-item:hover {
  border-color: var(--active-step-color);
}

.comp-icon {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: white;
  flex-shrink: 0;
}

.comp-text {
  font-size: 12px;
}

.canvas-area {
  flex: 1;
  position: relative;
  overflow: hidden;
  background-color: #F8F9FA;
  background-image: radial-gradient(#D1D5DB 1px, transparent 1px);
  background-size: 20px 20px;
}

.svg-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.connection-line {
  fill: none;
  stroke: #A1B0CC;
  stroke-width: 2px;
  pointer-events: stroke;
  cursor: pointer;
  transition: stroke-width 0.2s, stroke 0.2s;
}

.connection-line:hover {
  stroke: var(--danger-color);
  stroke-width: 4px;
}

.temp-line {
  stroke: var(--active-step-color);
  stroke-dasharray: 5, 5;
  pointer-events: none;
}

.nodes-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
