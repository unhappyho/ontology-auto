<template>
  <div class="relation-canvas">
    <!-- 工具栏 -->
    <div class="canvas-toolbar">
      <a-button type="primary" size="small" @click="handleAIInfer">
        <BulbOutlined />
        AI推断
      </a-button>
      <a-button size="small" @click="resetView">
        <AimOutlined />
        重置视图
      </a-button>
    </div>

    <!-- 画布区域 -->
    <div class="canvas-wrapper">
      <div
        class="canvas-container"
        ref="canvasRef"
        :style="canvasStyle"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
        @wheel="handleWheel"
      >
        <!-- SVG边 -->
        <svg class="edges-layer">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#86909C" />
            </marker>
          </defs>
          <g v-for="edge in edges" :key="edge.id">
            <line
              :x1="getNodeCenter(edge.source).x"
              :y1="getNodeCenter(edge.source).y"
              :x2="getNodeCenter(edge.target).x"
              :y2="getNodeCenter(edge.target).y"
              stroke="#C4C7CC"
              stroke-width="2"
              marker-end="url(#arrowhead)"
              class="edge-line"
            />
            <rect
              :x="(getNodeCenter(edge.source).x + getNodeCenter(edge.target).x) / 2 - 30"
              :y="(getNodeCenter(edge.source).y + getNodeCenter(edge.target).y) / 2 - 10"
              width="60"
              height="20"
              rx="4"
              fill="white"
              stroke="#E5E6EB"
              class="edge-label-bg"
            />
            <text
              :x="(getNodeCenter(edge.source).x + getNodeCenter(edge.target).x) / 2"
              :y="(getNodeCenter(edge.source).y + getNodeCenter(edge.target).y) / 2 + 4"
              class="edge-label"
              text-anchor="middle"
            >
              {{ edge.label }}
            </text>
          </g>
        </svg>

        <!-- 节点 -->
        <div
          v-for="node in nodes"
          :key="node.id"
          class="graph-node"
          :class="{ 'is-selected': selectedNode?.id === node.id, 'is-dragging': draggingNode?.id === node.id }"
          :style="getNodeStyle(node)"
          @mousedown.stop="startDragNode($event, node)"
          @click.stop="selectNode(node)"
        >
          <div class="node-icon" :style="{ background: node.color }">
            <UserOutlined v-if="node.type === 'person'" />
            <BankOutlined v-else-if="node.type === 'company'" />
            <MoneyCollectOutlined v-else-if="node.type === 'money'" />
            <FileTextOutlined v-else />
          </div>
          <div class="node-info">
            <div class="node-name">{{ node.label }}</div>
            <div class="node-type">{{ node.typeLabel }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 节点详情面板 -->
    <Transition name="slide-right">
      <div v-if="selectedNode" class="node-detail-panel">
        <div class="panel-header">
          <span>实体详情</span>
          <a-button type="text" size="small" @click="selectedNode = null">
            <CloseOutlined />
          </a-button>
        </div>
        <div class="panel-body">
          <div class="detail-item">
            <label>实体名称</label>
            <div class="detail-value primary">{{ selectedNode.label }}</div>
          </div>
          <div class="detail-item">
            <label>实体ID</label>
            <div class="detail-value">{{ selectedNode.id }}</div>
          </div>
          <div class="detail-item">
            <label>实体类型</label>
            <a-tag :color="selectedNode.color">{{ selectedNode.typeLabel }}</a-tag>
          </div>

          <a-divider>属性信息</a-divider>

          <div class="detail-item" v-for="(value, key) in selectedNode.attributes" :key="key">
            <label>{{ key }}</label>
            <div class="detail-value">{{ value }}</div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  BulbOutlined,
  AimOutlined,
  UserOutlined,
  BankOutlined,
  MoneyCollectOutlined,
  FileTextOutlined,
  CloseOutlined
} from '@ant-design/icons-vue'

interface GraphNode {
  id: string
  label: string
  type: 'person' | 'company' | 'money'
  typeLabel: string
  color: string
  x: number
  y: number
  attributes: Record<string, string>
}

interface GraphEdge {
  id: string
  source: string
  target: string
  label: string
}

// 示例数据：工商信息场景 - 基于本体概念
const sampleNodes: GraphNode[] = [
  {
    id: 'ent_001',
    label: '张三',
    type: 'person',
    typeLabel: '自然人',
    color: '#165DFF',
    x: 150,
    y: 200,
    attributes: {
      '证件类型': '身份证',
      '证件号': '310***********1234'
    }
  },
  {
    id: 'ent_002',
    label: '李四',
    type: 'person',
    typeLabel: '自然人',
    color: '#165DFF',
    x: 450,
    y: 150,
    attributes: {
      '证件类型': '身份证',
      '证件号': '320***********5678'
    }
  },
  {
    id: 'ent_003',
    label: '王五',
    type: 'person',
    typeLabel: '自然人',
    color: '#165DFF',
    x: 600,
    y: 350,
    attributes: {
      '证件类型': '身份证',
      '证件号': '330***********9012'
    }
  },
  {
    id: 'ent_004',
    label: 'xx科技有限公司',
    type: 'company',
    typeLabel: '企业',
    color: '#00B42A',
    x: 300,
    y: 350,
    attributes: {
      '统一社会信用代码': '91**************12',
      '注册资本': '500万元',
      '成立日期': '2018-03-15'
    }
  },
  {
    id: 'ent_005',
    label: 'xx贸易有限公司',
    type: 'company',
    typeLabel: '企业',
    color: '#00B42A',
    x: 500,
    y: 450,
    attributes: {
      '统一社会信用代码': '91**************34',
      '注册资本': '100万元',
      '成立日期': '2019-05-10'
    }
  },
  {
    id: 'ent_006',
    label: '500万元',
    type: 'money',
    typeLabel: '出资额',
    color: '#FA8C16',
    x: 200,
    y: 400,
    attributes: {
      '金额': '500万元',
      '出资方式': '货币'
    }
  },
  {
    id: 'ent_007',
    label: '100万元',
    type: 'money',
    typeLabel: '出资额',
    color: '#FA8C16',
    x: 400,
    y: 280,
    attributes: {
      '金额': '100万元',
      '出资方式': '货币'
    }
  }
]

const sampleEdges: GraphEdge[] = [
  { id: 'edge_001', source: 'ent_001', target: 'ent_004', label: '创建' },
  { id: 'edge_002', source: 'ent_001', target: 'ent_006', label: '认缴' },
  { id: 'edge_003', source: 'ent_002', target: 'ent_004', label: '控股' },
  { id: 'edge_004', source: 'ent_002', target: 'ent_007', label: '认缴' },
  { id: 'edge_005', source: 'ent_002', target: 'ent_005', label: '创建' },
  { id: 'edge_006', source: 'ent_003', target: 'ent_002', label: '举报' },
  { id: 'edge_007', source: 'ent_003', target: 'ent_005', label: '控股' }
]

const nodes = ref<GraphNode[]>([...sampleNodes])
const edges = ref<GraphEdge[]>([...sampleEdges])

const selectedNode = ref<GraphNode | null>(null)
const draggingNode = ref<GraphNode | null>(null)
const canvasRef = ref<HTMLElement>()

// 画布拖拽和缩放状态
const isDraggingCanvas = ref(false)
const canvasOffset = ref({ x: 0, y: 0 })
const canvasScale = ref(1)
const lastMousePos = ref({ x: 0, y: 0 })

// 计算画布样式
const canvasStyle = computed(() => ({
  transform: `translate(${canvasOffset.value.x}px, ${canvasOffset.value.y}px) scale(${canvasScale.value})`,
  transformOrigin: 'center center'
}))

function getNodeStyle(node: GraphNode) {
  return {
    left: `${node.x}px`,
    top: `${node.y}px`
  }
}

function getNodeCenter(nodeId: string) {
  const node = nodes.value.find(n => n.id === nodeId)
  if (!node) return { x: 0, y: 0 }
  // 节点中心偏移（节点宽度100，高度50）
  return { x: node.x + 50, y: node.y + 25 }
}

function selectNode(node: GraphNode) {
  selectedNode.value = node
}

function startDragNode(_event: MouseEvent, node: GraphNode) {
  draggingNode.value = node
}

function handleMouseDown(event: MouseEvent) {
  // 如果没有拖拽节点，则开始拖拽画布
  if (!draggingNode.value) {
    isDraggingCanvas.value = true
    lastMousePos.value = { x: event.clientX, y: event.clientY }
  }
}

function handleMouseMove(event: MouseEvent) {
  if (draggingNode.value && canvasRef.value) {
    const rect = canvasRef.value.getBoundingClientRect()
    draggingNode.value.x = event.clientX - rect.left - 50
    draggingNode.value.y = event.clientY - rect.top - 25
  } else if (isDraggingCanvas.value) {
    // 拖拽画布
    const dx = event.clientX - lastMousePos.value.x
    const dy = event.clientY - lastMousePos.value.y
    canvasOffset.value = {
      x: canvasOffset.value.x + dx,
      y: canvasOffset.value.y + dy
    }
    lastMousePos.value = { x: event.clientX, y: event.clientY }
  }
}

function handleMouseUp() {
  draggingNode.value = null
  isDraggingCanvas.value = false
}

// 鼠标滚轮缩放
function handleWheel(event: WheelEvent) {
  event.preventDefault()
  const delta = event.deltaY > 0 ? -0.1 : 0.1
  const newScale = Math.min(Math.max(canvasScale.value + delta, 0.5), 2)
  canvasScale.value = newScale
}

function resetView() {
  nodes.value = [...sampleNodes]
  edges.value = [...sampleEdges]
  selectedNode.value = null
  canvasOffset.value = { x: 0, y: 0 }
  canvasScale.value = 1
}

function handleAIInfer() {
  // AI推断
}
</script>

<style scoped>
.relation-canvas {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #F5F7FA;
  position: relative;
}

.canvas-toolbar {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #E5E6EB;
}

.canvas-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.canvas-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
  cursor: grab;
}

.canvas-container:active {
  cursor: grabbing;
}

/* 边层 */
.edges-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.edge-line {
  pointer-events: stroke;
  cursor: pointer;
}

.edge-line:hover {
  stroke: #165DFF;
  stroke-width: 3;
}

.edge-label-bg {
  pointer-events: none;
}

.edge-label {
  font-size: 12px;
  fill: #4E5969;
  pointer-events: none;
}

/* 节点 */
.graph-node {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: white;
  border: 2px solid #E5E6EB;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  z-index: 5;
  min-width: 100px;
}

.graph-node:hover {
  border-color: #165DFF;
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.15);
}

.graph-node.is-selected {
  border-color: #165DFF;
  box-shadow: 0 4px 16px rgba(22, 93, 255, 0.25);
}

.graph-node.is-dragging {
  z-index: 10;
  cursor: grabbing;
}

.node-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: white;
  flex-shrink: 0;
}

.node-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.node-name {
  font-size: 14px;
  font-weight: 500;
  color: #1D2129;
  white-space: nowrap;
}

.node-type {
  font-size: 12px;
  color: #86909C;
}

/* 详情面板 */
.node-detail-panel {
  position: absolute;
  right: 0;
  top: 0;
  width: 280px;
  height: 100%;
  background: white;
  border-left: 1px solid #E5E6EB;
  z-index: 100;
  display: flex;
  flex-direction: column;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.06);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #E5E6EB;
  font-weight: 500;
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.panel-body :deep(.ant-divider) {
  margin: 12px 0;
}

.detail-item {
  margin-bottom: 12px;
}

.detail-item label {
  display: block;
  font-size: 12px;
  color: #86909C;
  margin-bottom: 4px;
}

.detail-value {
  font-size: 14px;
  color: #4E5969;
}

.detail-value.primary {
  font-size: 16px;
  font-weight: 600;
  color: #1D2129;
}

/* Transition */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
