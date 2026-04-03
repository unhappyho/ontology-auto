<template>
  <div class="relation-canvas">
    <!-- 工具栏 -->
    <div class="canvas-toolbar">
      <a-button size="small" class="toolbar-btn" @click="resetView">
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
        @wheel.prevent="handleWheel"
      >
        <!-- SVG层：背景点阵 + 边 -->
        <svg class="edges-layer">
          <defs>
            <!-- 背景点阵 -->
            <pattern id="dot-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="rgba(0,0,0,0.06)" />
            </pattern>
            <!-- 边发光滤镜 -->
            <filter id="edge-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <!-- 箭头 -->
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#91caff" />
            </marker>
            <!-- 每条边的渐变色 -->
            <linearGradient
              v-for="edge in edges"
              :key="`grad-${edge.id}`"
              :id="`grad-${edge.id}`"
              gradientUnits="userSpaceOnUse"
              :x1="getNodeCenter(edge.source).x"
              :y1="getNodeCenter(edge.source).y"
              :x2="getNodeCenter(edge.target).x"
              :y2="getNodeCenter(edge.target).y"
            >
              <stop offset="0%"   :stop-color="getNodeColor(edge.source)" stop-opacity="0.9" />
              <stop offset="100%" :stop-color="getNodeColor(edge.target)" stop-opacity="0.9" />
            </linearGradient>
          </defs>

          <!-- 背景点阵 -->
          <rect width="3000" height="3000" x="-1500" y="-1500" fill="url(#dot-grid)" />

          <!-- 边 -->
          <g v-for="edge in edges" :key="edge.id">
            <path
              :d="getBezierPath(getNodeCenter(edge.source), getNodeCenter(edge.target))"
              :stroke="`url(#grad-${edge.id})`"
              stroke-width="2"
              fill="none"
              marker-end="url(#arrowhead)"
              filter="url(#edge-glow)"
              class="edge-path"
            />
            <!-- 边标签 -->
            <text
              :x="getMidPoint(getNodeCenter(edge.source), getNodeCenter(edge.target)).x"
              :y="getMidPoint(getNodeCenter(edge.source), getNodeCenter(edge.target)).y - 6"
              class="edge-label"
              text-anchor="middle"
            >{{ edge.label }}</text>
          </g>
        </svg>

        <!-- 节点 -->
        <div
          v-for="(node, idx) in nodes"
          :key="node.id"
          class="graph-node"
          :class="{ 'is-selected': selectedNode?.id === node.id, 'is-dragging': draggingNode?.id === node.id }"
          :style="getNodeStyle(node, idx)"
          @mousedown.stop="startDragNode($event, node)"
          @click.stop="selectNode(node)"
        >
          <div class="node-ring" :style="{ borderColor: node.color, boxShadow: `0 0 16px ${node.color}66` }"></div>
          <div class="node-ring node-ring-pulse" :style="{ borderColor: node.color }"></div>
          <div class="node-circle" :style="{ background: `radial-gradient(circle at 35% 35%, ${node.color}cc, ${node.color}44)`, boxShadow: `0 0 20px ${node.color}55` }">
            <UserOutlined v-if="node.type === 'person'" />
            <BankOutlined v-else-if="node.type === 'company'" />
            <MoneyCollectOutlined v-else-if="node.type === 'money'" />
            <AlertOutlined v-else-if="node.type === 'event'" />
            <AuditOutlined v-else-if="node.type === 'doc'" />
            <FileTextOutlined v-else />
          </div>
          <div class="node-label">{{ node.label }}</div>
          <div class="node-type-badge" :style="{ color: node.color, borderColor: `${node.color}55`, background: `${node.color}18` }">{{ node.typeLabel }}</div>
        </div>
      </div>
    </div>

    <!-- 节点详情面板 -->
    <Transition name="slide-right">
      <div v-if="selectedNode" class="node-detail-panel">
        <div class="panel-header">
          <div class="panel-title">
            <div class="panel-dot" :style="{ background: selectedNode.color, boxShadow: `0 0 8px ${selectedNode.color}` }"></div>
            实体详情
          </div>
          <a-button type="text" size="small" class="close-btn" @click="selectedNode = null">
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
            <div class="detail-value mono">{{ selectedNode.id }}</div>
          </div>
          <div class="detail-item">
            <label>实体类型</label>
            <span class="type-tag" :style="{ color: selectedNode.color, borderColor: `${selectedNode.color}55`, background: `${selectedNode.color}18` }">
              {{ selectedNode.typeLabel }}
            </span>
          </div>
          <div class="panel-divider">属性信息</div>
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
  AimOutlined,
  UserOutlined,
  BankOutlined,
  MoneyCollectOutlined,
  FileTextOutlined,
  AlertOutlined,
  AuditOutlined,
  CloseOutlined
} from '@ant-design/icons-vue'

interface GraphNode {
  id: string
  label: string
  type: 'person' | 'company' | 'money' | 'event' | 'doc'
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

const NODE_SIZE = 80

// 示例数据：工商信息场景
const sampleNodes: GraphNode[] = [
  {
    id: 'ent_001', label: '张三', type: 'person', typeLabel: '自然人', color: '#4D9EFF',
    x: 150, y: 160,
    attributes: { '证件类型': '身份证', '证件号': '310***********1234' }
  },
  {
    id: 'ent_002', label: '李四', type: 'person', typeLabel: '自然人', color: '#4D9EFF',
    x: 480, y: 100,
    attributes: { '证件类型': '身份证', '证件号': '320***********5678' }
  },
  {
    id: 'ent_003', label: '王五', type: 'person', typeLabel: '自然人', color: '#4D9EFF',
    x: 680, y: 310,
    attributes: { '证件类型': '身份证', '证件号': '330***********9012' }
  },
  {
    id: 'ent_004', label: 'xx科技有限公司', type: 'company', typeLabel: '企业', color: '#00E5B0',
    x: 310, y: 300,
    attributes: { '统一社会信用代码': '91**************12', '注册资本': '500万元', '成立日期': '2018-03-15' }
  },
  {
    id: 'ent_005', label: 'xx贸易有限公司', type: 'company', typeLabel: '企业', color: '#00E5B0',
    x: 540, y: 420,
    attributes: { '统一社会信用代码': '91**************34', '注册资本': '100万元', '成立日期': '2019-05-10' }
  },
  {
    id: 'ent_006', label: '500万元', type: 'money', typeLabel: '出资额', color: '#FFB347',
    x: 110, y: 350,
    attributes: { '金额': '500万元', '出资方式': '货币' }
  },
  {
    id: 'ent_007', label: '100万元', type: 'money', typeLabel: '出资额', color: '#FFB347',
    x: 400, y: 200,
    attributes: { '金额': '100万元', '出资方式': '货币' }
  },
  {
    id: 'ent_008', label: 'xx投资控股集团', type: 'company', typeLabel: '企业', color: '#00E5B0',
    x: 120, y: 530,
    attributes: { '统一社会信用代码': '91**************56', '注册资本': '5000万元', '成立日期': '2015-06-20' }
  },
  {
    id: 'ent_009', label: '赵六', type: 'person', typeLabel: '自然人', color: '#4D9EFF',
    x: 730, y: 150,
    attributes: { '证件类型': '身份证', '证件号': '340***********3456' }
  },
  {
    id: 'ent_010', label: '1000万元', type: 'money', typeLabel: '出资额', color: '#FFB347',
    x: 670, y: 510,
    attributes: { '金额': '1000万元', '出资方式': '实物' }
  },
  {
    id: 'ent_011', label: '股权转让协议', type: 'doc', typeLabel: '文书', color: '#22D3EE',
    x: 240, y: 530,
    attributes: { '文书编号': 'GQ-2022-0318', '签署日期': '2022-03-18', '状态': '已生效' }
  },
  {
    id: 'ent_012', label: '工商变更记录', type: 'doc', typeLabel: '文书', color: '#22D3EE',
    x: 490, y: 590,
    attributes: { '变更事项': '股东变更', '登记日期': '2022-04-01', '状态': '已备案' }
  },
  {
    id: 'ent_013', label: '虚假注资事件', type: 'event', typeLabel: '事件', color: '#A855F7',
    x: 370, y: 450,
    attributes: { '案件类型': '经济犯罪', '涉案金额': '500万元', '状态': '调查中' }
  }
]

const sampleEdges: GraphEdge[] = [
  { id: 'edge_001', source: 'ent_001', target: 'ent_004', label: '创建' },
  { id: 'edge_002', source: 'ent_001', target: 'ent_006', label: '认缴' },
  { id: 'edge_003', source: 'ent_002', target: 'ent_004', label: '控股' },
  { id: 'edge_004', source: 'ent_002', target: 'ent_007', label: '认缴' },
  { id: 'edge_005', source: 'ent_002', target: 'ent_005', label: '创建' },
  { id: 'edge_006', source: 'ent_003', target: 'ent_002', label: '举报' },
  { id: 'edge_007', source: 'ent_003', target: 'ent_005', label: '控股' },
  { id: 'edge_008', source: 'ent_008', target: 'ent_004', label: '母公司' },
  { id: 'edge_009', source: 'ent_009', target: 'ent_008', label: '法定代表人' },
  { id: 'edge_010', source: 'ent_009', target: 'ent_010', label: '认缴' },
  { id: 'edge_011', source: 'ent_010', target: 'ent_004', label: '出资至' },
  { id: 'edge_012', source: 'ent_001', target: 'ent_011', label: '签署' },
  { id: 'edge_013', source: 'ent_011', target: 'ent_004', label: '标的企业' },
  { id: 'edge_014', source: 'ent_006', target: 'ent_013', label: '关联' }
]

const nodes = ref<GraphNode[]>([...sampleNodes])
const edges = ref<GraphEdge[]>([...sampleEdges])

const selectedNode = ref<GraphNode | null>(null)
const draggingNode = ref<GraphNode | null>(null)
const canvasRef = ref<HTMLElement>()

const isDraggingCanvas = ref(false)
const canvasOffset = ref({ x: 0, y: 0 })
const canvasScale = ref(0.85)
const lastMousePos = ref({ x: 0, y: 0 })

const canvasStyle = computed(() => ({
  transform: `translate(${canvasOffset.value.x}px, ${canvasOffset.value.y}px) scale(${canvasScale.value})`,
  transformOrigin: 'center center'
}))

function getNodeStyle(node: GraphNode, idx: number) {
  return {
    left: `${node.x}px`,
    top: `${node.y}px`,
    animationDelay: `${(idx * 0.6) % 4}s`
  }
}

function getNodeCenter(nodeId: string) {
  const node = nodes.value.find(n => n.id === nodeId)
  if (!node) return { x: 0, y: 0 }
  return { x: node.x + NODE_SIZE / 2, y: node.y + NODE_SIZE / 2 }
}

function getNodeColor(nodeId: string): string {
  const node = nodes.value.find(n => n.id === nodeId)
  return node?.color ?? '#4D9EFF'
}

function getBezierPath(src: { x: number; y: number }, tgt: { x: number; y: number }): string {
  const mx = (src.x + tgt.x) / 2
  const my = (src.y + tgt.y) / 2
  const dx = tgt.y - src.y
  const dy = src.x - tgt.x
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const cx = mx + (dx / len) * 48
  const cy = my + (dy / len) * 48
  return `M ${src.x} ${src.y} Q ${cx} ${cy} ${tgt.x} ${tgt.y}`
}

function getMidPoint(src: { x: number; y: number }, tgt: { x: number; y: number }) {
  const mx = (src.x + tgt.x) / 2
  const my = (src.y + tgt.y) / 2
  const dx = tgt.y - src.y
  const dy = src.x - tgt.x
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  return {
    x: mx + (dx / len) * 48,
    y: my + (dy / len) * 48
  }
}

function selectNode(node: GraphNode) {
  selectedNode.value = node
}

function startDragNode(_event: MouseEvent, node: GraphNode) {
  draggingNode.value = node
}

function handleMouseDown(event: MouseEvent) {
  if (!draggingNode.value) {
    isDraggingCanvas.value = true
    lastMousePos.value = { x: event.clientX, y: event.clientY }
  }
}

function handleMouseMove(event: MouseEvent) {
  if (draggingNode.value && canvasRef.value) {
    const rect = canvasRef.value.getBoundingClientRect()
    draggingNode.value.x = event.clientX - rect.left - NODE_SIZE / 2
    draggingNode.value.y = event.clientY - rect.top - NODE_SIZE / 2
  } else if (isDraggingCanvas.value) {
    const dx = event.clientX - lastMousePos.value.x
    const dy = event.clientY - lastMousePos.value.y
    canvasOffset.value = { x: canvasOffset.value.x + dx, y: canvasOffset.value.y + dy }
    lastMousePos.value = { x: event.clientX, y: event.clientY }
  }
}

function handleMouseUp() {
  draggingNode.value = null
  isDraggingCanvas.value = false
}

function handleWheel(event: WheelEvent) {
  const delta = event.deltaY > 0 ? -0.1 : 0.1
  canvasScale.value = Math.min(Math.max(canvasScale.value + delta, 0.3), 2.5)
}

function resetView() {
  nodes.value = sampleNodes.map(n => ({ ...n }))
  edges.value = [...sampleEdges]
  selectedNode.value = null
  canvasOffset.value = { x: 0, y: 0 }
  canvasScale.value = 0.85
}
</script>

<style scoped>
/* ===== 画布整体 ===== */
.relation-canvas {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  position: relative;
  overflow: hidden;
}

/* ===== 工具栏 ===== */
.canvas-toolbar {
  display: flex;
  gap: 8px;
  padding: 10px 16px;
  background: #ffffff;
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;
  z-index: 10;
}

.toolbar-btn {
  border-color: var(--border-color, #d9d9d9) !important;
  color: #595959 !important;
  background: #ffffff !important;
  font-size: 12px;
}

.toolbar-btn:hover {
  border-color: #1677ff !important;
  color: #1677ff !important;
  background: #e6f4ff !important;
}

/* ===== 画布容器 ===== */
.canvas-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.canvas-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 560px;
  cursor: grab;
}

.canvas-container:active {
  cursor: grabbing;
}

/* ===== SVG边层 ===== */
.edges-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: visible;
}

.edge-path {
  pointer-events: stroke;
  cursor: pointer;
  transition: stroke-width 0.2s;
}

.edge-path:hover {
  stroke-width: 3.5 !important;
}

.edge-label {
  font-size: 11px;
  fill: #595959;
  pointer-events: none;
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* ===== 节点 ===== */
.graph-node {
  position: absolute;
  width: 80px;
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  animation: float 5s ease-in-out infinite;
  z-index: 5;
}

.graph-node.is-dragging {
  z-index: 20;
  cursor: grabbing;
  animation: none;
}

/* 外圈光环 */
.node-ring {
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2px solid;
  opacity: 0.6;
  pointer-events: none;
  transition: opacity 0.3s, transform 0.3s;
}

/* 脉冲外环 */
.node-ring-pulse {
  width: 96px;
  height: 96px;
  left: -8px;
  top: -8px;
  opacity: 0;
  border-width: 1.5px;
}

.graph-node:hover .node-ring-pulse {
  animation: pulse-ring 1.8s ease-out infinite;
}

.graph-node.is-selected .node-ring {
  opacity: 1;
}

.graph-node.is-selected .node-ring-pulse {
  animation: pulse-ring 1.2s ease-out infinite;
}

/* 内圆 */
.node-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: rgba(255, 255, 255, 0.95);
  position: relative;
  z-index: 1;
  transition: transform 0.25s, box-shadow 0.25s;
}

.graph-node:hover .node-circle {
  transform: scale(1.1);
}

.graph-node.is-selected .node-circle {
  transform: scale(1.12);
}

/* 节点标签 */
.node-label {
  position: absolute;
  bottom: -22px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  font-size: 12px;
  font-weight: 600;
  color: #262626;
  pointer-events: none;
  letter-spacing: 0.3px;
}

/* 类型徽标 */
.node-type-badge {
  position: absolute;
  bottom: -38px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 8px;
  border: 1px solid;
  pointer-events: none;
  letter-spacing: 0.3px;
}

/* ===== 动画 ===== */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-5px); }
}

@keyframes pulse-ring {
  0%   { transform: scale(1);    opacity: 0.7; }
  100% { transform: scale(1.6);  opacity: 0;   }
}

/* ===== 详情面板 ===== */
.node-detail-panel {
  position: absolute;
  right: 0;
  top: 0;
  width: 264px;
  height: 100%;
  background: rgba(255, 255, 255, 0.96);
  border-left: 1px solid #e8e8e8;
  z-index: 100;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.08);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #262626;
  letter-spacing: 0.5px;
}

.panel-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.close-btn {
  color: #8c8c8c !important;
}

.close-btn:hover {
  color: #262626 !important;
  background: #f5f5f5 !important;
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.panel-body::-webkit-scrollbar {
  width: 4px;
}

.panel-body::-webkit-scrollbar-track {
  background: transparent;
}

.panel-body::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 2px;
}

.detail-item {
  margin-bottom: 14px;
}

.detail-item label {
  display: block;
  font-size: 11px;
  color: #8c8c8c;
  margin-bottom: 4px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.detail-value {
  font-size: 13px;
  color: #262626;
}

.detail-value.primary {
  font-size: 16px;
  font-weight: 700;
  color: #141414;
}

.detail-value.mono {
  font-size: 12px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  color: #1677ff;
}

.type-tag {
  font-size: 11px;
  padding: 2px 10px;
  border-radius: 10px;
  border: 1px solid;
  font-weight: 500;
}

.panel-divider {
  font-size: 11px;
  color: #8c8c8c;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin: 16px 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #f0f0f0;
}

/* ===== Transition ===== */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
