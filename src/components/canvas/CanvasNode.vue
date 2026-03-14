<template>
  <div
    :class="['canvas-node', { selected: isSelected }]"
    :style="{ left: node.x + 'px', top: node.y + 'px' }"
    @mousedown="handleMouseDown"
    @click.stop="handleClick"
  >
    <div class="node-actions">
      <EditOutlined class="action-icon edit" @click.stop="$emit('rename', node.id)" />
      <DeleteOutlined class="action-icon delete" @click.stop="$emit('delete', node.id)" />
    </div>

    <div
      class="port in"
      @mousedown.stop="handlePortMouseDown(null)"
      @mouseup.stop="handlePortMouseUp(node.id)"
    ></div>

    <div class="node-color-bar" :style="{ background: node.color }"></div>

    <div class="node-content">
      <div class="node-header">
        <component :is="getIcon(node.icon)" :style="{ color: node.color, fontSize: '12px' }" />
        <div class="node-title">{{ node.name }}</div>
      </div>
      <div class="node-desc">步骤 {{ node.step }}</div>
    </div>

    <div
      class="port out"
      @mousedown.stop="handlePortMouseDown(node.id)"
      @mouseup.stop="handlePortMouseUp(null)"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import {
  DatabaseOutlined,
  FilePdfOutlined,
  CodeOutlined,
  BulbOutlined,
  LinkOutlined,
  CloudServerOutlined,
  AppstoreOutlined
} from '@ant-design/icons-vue'
import { useCanvasStore } from '@/stores'
import type { CanvasNode } from '@/types'

interface Props {
  node: CanvasNode
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [nodeId: string]
  drag: [nodeId: string, x: number, y: number]
  'connect-start': [sourceId: string, startX: number, startY: number]
  'connect-end': [targetId: string]
  delete: [nodeId: string]
  rename: [nodeId: string]
}>()

const canvasStore = useCanvasStore()

const isSelected = computed(() => canvasStore.selectedNodeId === props.node.id)

const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })

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

function handleClick() {
  if (!isDragging.value) {
    emit('select', props.node.id)
  }
}

function handleMouseDown(event: MouseEvent) {
  if (event.button !== 0) return

  isDragging.value = false
  const nodeEl = event.currentTarget as HTMLElement
  const rect = nodeEl.getBoundingClientRect()

  dragOffset.value = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

function handleMouseMove(event: MouseEvent) {
  isDragging.value = true

  const canvasArea = document.querySelector('.canvas-area')
  if (!canvasArea) return

  const rect = canvasArea.getBoundingClientRect()
  const x = event.clientX - rect.left - dragOffset.value.x
  const y = event.clientY - rect.top - dragOffset.value.y

  emit('drag', props.node.id, x, y)
}

function handleMouseUp() {
  isDragging.value = false
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

function handlePortMouseDown(sourceId: string | null) {
  if (sourceId) {
    // 开始连线
    const nodeEl = document.getElementById(props.node.id) || document.querySelector(`.canvas-node[style*="left: ${props.node.x}px"]`)
    if (nodeEl) {
      const port = nodeEl.querySelector('.port.out')
      if (port) {
        const rect = port.getBoundingClientRect()
        emit('connect-start', sourceId, rect.left + rect.width / 2, rect.top + rect.height / 2)
      }
    }
  }
}

function handlePortMouseUp(targetId: string | null) {
  if (targetId) {
    emit('connect-end', targetId)
  }
}
</script>

<style scoped>
.canvas-node {
  position: absolute;
  width: 190px;
  background: var(--bg-white);
  border-radius: 6px;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04);
  z-index: 2;
  display: flex;
  align-items: stretch;
  user-select: none;
  cursor: move;
}

.canvas-node.selected {
  border-color: var(--active-step-color);
  z-index: 3;
}

.canvas-node:hover .node-actions {
  display: flex;
}

.node-actions {
  display: none;
  position: absolute;
  top: -11px;
  right: -8px;
  background: var(--bg-white);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 2px 5px;
  gap: 5px;
  z-index: 4;
}

.action-icon {
  cursor: pointer;
  font-size: 11px;
  color: var(--text-secondary);
  transition: color 0.2s;
}

.action-icon.edit:hover {
  color: var(--primary-color);
}

.action-icon.delete:hover {
  color: var(--danger-color);
}

.node-color-bar {
  width: 5px;
  border-radius: 6px 0 0 6px;
}

.node-content {
  padding: 10px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.node-header {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 3px;
}

.node-title {
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.node-desc {
  font-size: 11px;
  color: var(--text-secondary);
}

.port {
  width: 10px;
  height: 10px;
  background: #fff;
  border: 2px solid #A1B0CC;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 5;
  cursor: crosshair;
  transition: all 0.2s;
}

.port:hover {
  border-color: var(--active-step-color);
  transform: translateY(-50%) scale(1.3);
}

.port.in {
  left: -5px;
}

.port.out {
  right: -5px;
}
</style>
