<template>
  <a-modal
    :open="visible"
    title="来源表关联关系"
    :width="700"
    :footer="null"
    @cancel="emit('update:visible', false)"
  >
    <div class="er-canvas-wrapper">
      <svg class="er-svg" :width="svgWidth" :height="svgHeight">
        <!-- 箭头 marker -->
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#91caff" />
          </marker>
        </defs>
        <!-- 连线 -->
        <g v-for="edge in computedEdges" :key="edge.id">
          <polyline
            :points="edge.points"
            fill="none"
            stroke="#91caff"
            stroke-width="1.5"
            marker-end="url(#arrow)"
          />
          <text
            :x="edge.labelX"
            :y="edge.labelY"
            class="er-edge-label"
            text-anchor="middle"
          >{{ edge.label }}</text>
        </g>
      </svg>
      <!-- 节点（绝对定位覆盖在 SVG 上） -->
      <div
        v-for="node in computedNodes"
        :key="node.id"
        class="er-node"
        :class="node.isPrimary ? 'er-node-primary' : 'er-node-sub'"
        :style="{ left: node.x + 'px', top: node.y + 'px' }"
      >
        <div class="er-node-table">{{ node.source.table }}</div>
        <div class="er-node-db">{{ node.source.database }}</div>
      </div>
    </div>
    <div v-if="!graph.nodes.length" class="er-empty">暂无来源表数据</div>
  </a-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EntityTableGraph } from '@/types'

const props = defineProps<{
  visible: boolean
  graph: EntityTableGraph
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const NODE_W = 140
const NODE_H = 56
const CANVAS_H = 320
const PRIMARY_X = 60
const SUB_X = 420
const SVG_W = 640

const svgWidth = SVG_W
const svgHeight = CANVAS_H

// 计算节点坐标
const computedNodes = computed(() => {
  const nodes = props.graph.nodes
  if (!nodes.length) return []

  const primaryNode = nodes[0]
  const subNodes = nodes.slice(1)

  const result = []

  // 主表：垂直居中
  const primaryY = CANVAS_H / 2 - NODE_H / 2
  result.push({
    id: primaryNode.id,
    source: primaryNode.source,
    isPrimary: true,
    x: PRIMARY_X,
    y: primaryY
  })

  // 子表：均匀分布
  const subCount = subNodes.length
  subNodes.forEach((node, idx) => {
    const spacing = CANVAS_H / (subCount + 1)
    const y = spacing * (idx + 1) - NODE_H / 2
    result.push({
      id: node.id,
      source: node.source,
      isPrimary: false,
      x: SUB_X,
      y
    })
  })

  return result
})

// 计算边的折线坐标和标签
const computedEdges = computed(() => {
  const nodeMap = new Map(computedNodes.value.map(n => [n.id, n]))

  const result: { id: string; points: string; labelX: number; labelY: number; label: string }[] = []
  for (const edge of props.graph.edges) {
    const src = nodeMap.get(edge.sourceNodeId)
    const tgt = nodeMap.get(edge.targetNodeId)
    if (!src || !tgt) continue

    const x1 = src.x + NODE_W
    const y1 = src.y + NODE_H / 2
    const x2 = tgt.x
    const y2 = tgt.y + NODE_H / 2
    const mx = (x1 + x2) / 2

    const label = [edge.relationType, edge.joinKey].filter(Boolean).join(' · ') || ''

    result.push({
      id: edge.id,
      points: `${x1},${y1} ${mx},${y1} ${mx},${y2} ${x2},${y2}`,
      labelX: mx,
      labelY: Math.min(y1, y2) - 6,
      label
    })
  }
  return result
})
</script>

<style scoped>
.er-canvas-wrapper {
  position: relative;
  height: 320px;
  overflow: hidden;
}

.er-svg {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}

.er-node {
  position: absolute;
  width: 140px;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid;
  cursor: default;
}

.er-node-primary {
  background: #e6f4ff;
  border-color: #1677ff;
}

.er-node-sub {
  background: #fafafa;
  border-color: #d9d9d9;
}

.er-node-table {
  font-size: 13px;
  font-weight: 600;
  color: #262626;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.er-node-db {
  font-size: 11px;
  color: #8c8c8c;
  margin-top: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.er-edge-label {
  font-size: 11px;
  fill: #595959;
}

.er-empty {
  text-align: center;
  color: #8c8c8c;
  padding: 40px 0;
  font-size: 13px;
}
</style>
