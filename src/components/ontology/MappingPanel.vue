<template>
  <div class="mapping-panel">
    <div class="mapping-panel-header">
      <div class="mapping-panel-title">
        <ThunderboltOutlined style="color: #722ED1;" />
        AI 智能映射
      </div>
      <div class="view-toggle">
        <div :class="['view-toggle-btn', { active: viewMode === 'line' }]" @click="switchView('line')">
          <ApartmentOutlined />
          连线
        </div>
        <div :class="['view-toggle-btn', { active: viewMode === 'table' }]" @click="switchView('table')">
          <TableOutlined />
          表格
        </div>
      </div>
    </div>

    <!-- 连线视图 -->
    <div v-if="viewMode === 'line'" class="mapping-canvas" ref="canvasRef">
      <div class="mapping-col" ref="leftColRef">
        <div class="mapping-col-title">物理字段</div>
        <div
          v-for="(field, index) in mapping.fields"
          :key="'f' + index"
          :class="['mapping-field-item', { active: linkedFieldIndexes.has(index) }]"
        >
          {{ field.name }}
          <span class="field-type">{{ field.type }}</span>
        </div>
      </div>
      <div class="mapping-svg-mid" ref="svgMidRef">
        <svg ref="svgRef" overflow="visible">
          <path
            v-for="(link, index) in mapping.links"
            :key="index"
            :d="getLinePath(link)"
            :stroke="getLineColor(link.confidence)"
            stroke-width="1.5"
            :stroke-opacity="0.75"
            fill="none"
          />
        </svg>
      </div>
      <div class="mapping-col" ref="rightColRef">
        <div class="mapping-col-title">实体属性</div>
        <div
          v-for="(attr, index) in mapping.attrs"
          :key="'a' + index"
          :class="['mapping-field-item', { active: linkedAttrIndexes.has(index) }]"
        >
          {{ attr.name }}
          <span class="field-type">{{ attr.entity }}</span>
        </div>
      </div>

      <!-- 映射识别遮罩 -->
      <div v-if="isMappingRecognizing" class="mapping-recognizing-overlay">
        <div class="ai-scan-anim">
          <div class="ai-scan-ring"></div>
          <div class="ai-scan-ring"></div>
          <div class="ai-scan-ring"></div>
          <ThunderboltOutlined class="ai-scan-icon" />
        </div>
        <div class="mapping-recognition-title">AI 重新识别中</div>
        <span class="ai-dots"><span></span><span></span><span></span></span>
      </div>
    </div>

    <!-- 表格视图 -->
    <div v-else class="mapping-table-view">
      <table class="mapping-tbl">
        <thead>
          <tr>
            <th width="30%">物理字段</th>
            <th width="8%" style="text-align: center;"></th>
            <th width="30%">实体属性</th>
            <th>置信度</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(link, index) in mapping.links" :key="index">
            <td>
              {{ mapping.fields[link.fieldIndex]?.name }}
              <br>
              <span class="field-type-text">{{ mapping.fields[link.fieldIndex]?.type }}</span>
            </td>
            <td class="mapped-arrow">
              <ArrowRightOutlined />
            </td>
            <td>
              {{ mapping.attrs[link.attrIndex]?.name }}
              <br>
              <span class="field-type-text">{{ mapping.attrs[link.attrIndex]?.entity }}</span>
            </td>
            <td>
              <span :class="['conf-badge', getConfClass(link.confidence)]">
                {{ getConfText(link.confidence) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mapping-pagination">
      <span>共 {{ mapping.links.length }} 条映射关系</span>
      <div class="pagination">
        <div class="page-item"><LeftOutlined /></div>
        <div class="page-item active">1</div>
        <div class="page-item"><RightOutlined /></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch, nextTick } from 'vue'
import {
  ThunderboltOutlined,
  ApartmentOutlined,
  TableOutlined,
  ArrowRightOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons-vue'
import { useOntologyStore } from '@/stores'
import type { MappingLink } from '@/types'

const ontologyStore = useOntologyStore()

const viewMode = computed(() => ontologyStore.mappingViewMode)
const mapping = computed(() => ontologyStore.currentMapping)
const isMappingRecognizing = computed(() => ontologyStore.isMappingRecognizing)

const leftColRef = ref<HTMLElement | null>(null)
const rightColRef = ref<HTMLElement | null>(null)
const svgMidRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLElement | null>(null)

const linePositions = ref<Array<{ x1: number; y1: number; x2: number; y2: number }>>([])

const linkedFieldIndexes = computed(() => {
  return new Set(mapping.value.links.map(l => l.fieldIndex))
})

const linkedAttrIndexes = computed(() => {
  return new Set(mapping.value.links.map(l => l.attrIndex))
})

function switchView(mode: 'line' | 'table') {
  ontologyStore.switchMappingView(mode)
  if (mode === 'line') {
    nextTick(() => calculateLines())
  }
}

function calculateLines() {
  if (!leftColRef.value || !rightColRef.value || !svgMidRef.value) return

  const leftItems = leftColRef.value.querySelectorAll('.mapping-field-item')
  const rightItems = rightColRef.value.querySelectorAll('.mapping-field-item')
  const svgRect = svgMidRef.value.getBoundingClientRect()

  const newPositions: Array<{ x1: number; y1: number; x2: number; y2: number }> = []

  mapping.value.links.forEach(link => {
    const leftEl = leftItems[link.fieldIndex]
    const rightEl = rightItems[link.attrIndex]



    if (leftEl && rightEl) {
      const leftRect = leftEl.getBoundingClientRect()
      const rightRect = rightEl.getBoundingClientRect()

      newPositions.push({
        x1: leftRect.right - svgRect.left,
        y1: leftRect.top + leftRect.height / 2 - svgRect.top,
        x2: rightRect.left - svgRect.left,
        y2: rightRect.top + rightRect.height / 2 - svgRect.top
      })
    }
  })

  linePositions.value = newPositions
}

function getLinePath(link: MappingLink): string {
  const index = mapping.value.links.indexOf(link)
  if (index < 0 || index >= linePositions.value.length) return ''

  const pos = linePositions.value[index]
  const midX = (pos.x1 + pos.x2) / 2

  return `M ${pos.x1} ${pos.y1} C ${midX} ${pos.y1}, ${midX} ${pos.y2}, ${pos.x2} ${pos.y2}`
}

function getLineColor(conf: 'high' | 'mid' | 'low'): string {
  switch (conf) {
    case 'high': return '#00B42A'
    case 'mid': return '#FF7D00'
    case 'low': return '#F53F3F'
    default: return '#A1B0CC'
  }
}

function getConfClass(conf: 'High' | 'Mid' | 'Low' | 'high' | 'mid' | 'low'): string {
  const normalizedConf = conf.toLowerCase() as 'high' | 'mid' | 'low'
  switch (normalizedConf) {
    case 'high': return 'conf-high'
    case 'mid': return 'conf-mid'
    case 'low': return 'conf-low'
    default: return ''
  }
}

function getConfText(conf: 'High' | 'Mid' | 'Low' | 'high' | 'mid' | 'low'): string {
  const normalizedConf = conf.toLowerCase() as 'high' | 'mid' | 'low'
  switch (normalizedConf) {
    case 'high': return '高'
    case 'mid': return '中'
    case 'low': return '低'
    default: return '-'
  }
}

onMounted(() => {
  if (viewMode.value === 'line') {
    setTimeout(() => calculateLines(), 100)
  }
})

watch(() => ontologyStore.currentOntologyId, () => {
  if (viewMode.value === 'line') {
    setTimeout(() => calculateLines(), 100)
  }
})
</script>

<style scoped>
.mapping-panel {
  width: 380px;
  background: var(--bg-white);
  border-left: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.mapping-panel-header {
  padding: 10px 12px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.mapping-panel-title {
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.view-toggle {
  display: flex;
  background: #F2F3F5;
  border-radius: 4px;
  padding: 2px;
}

.view-toggle-btn {
  padding: 3px 9px;
  font-size: 11px;
  border-radius: 3px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 3px;
}

.view-toggle-btn.active {
  background: var(--bg-white);
  color: var(--primary-color);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.mapping-canvas {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

.mapping-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 6px 0;
  overflow-y: auto;
}

.mapping-col-title {
  padding: 3px 10px 7px;
  font-size: 10px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.mapping-field-item {
  padding: 6px 10px;
  margin: 2px 4px;
  background: #FAFAFA;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}

.mapping-field-item:hover {
  border-color: var(--active-step-color);
  background: var(--primary-light);
}

.mapping-field-item.active {
  border-color: var(--active-step-color);
  background: var(--primary-light);
  color: var(--active-step-color);
  font-weight: 500;
}

.field-type {
  display: block;
  font-size: 10px;
  color: var(--text-secondary);
  margin-top: 1px;
}

.mapping-field-item.active .field-type {
  color: var(--active-step-color);
  opacity: 0.7;
}

.mapping-svg-mid {
  width: 52px;
  flex-shrink: 0;
  position: relative;
  overflow: visible;
}

.mapping-svg-mid svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.mapping-table-view {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.mapping-tbl {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
  box-shadow: 0 0 0 1px var(--border-color);
  border-radius: 5px;
  overflow: hidden;
  border-style: hidden;
}

.mapping-tbl th {
  background: #FAFAFA;
  padding: 7px 9px;
  font-size: 10px;
  color: var(--text-secondary);
  font-weight: 500;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.mapping-tbl td {
  padding: 7px 9px;
  border-bottom: 1px solid var(--border-color);
}

.mapping-tbl tbody tr:hover {
  background: #F7F8FA;
}

.field-type-text {
  font-size: 10px;
  color: var(--text-secondary);
}

.mapped-arrow {
  color: var(--active-step-color);
  text-align: center;
}

.conf-badge {
  display: inline-block;
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 10px;
}

.conf-high {
  background: #E8FFEA;
  color: var(--success-color);
}

.conf-mid {
  background: #FFF7E6;
  color: var(--warning-color);
}

.conf-low {
  background: #FFECE8;
  color: var(--danger-color);
}

.mapping-pagination {
  padding: 5px 10px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  font-size: 11px;
  color: var(--text-secondary);
  background: var(--bg-white);
}

.pagination {
  display: flex;
  gap: 6px;
}

.page-item {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  background: var(--bg-white);
  font-size: 12px;
}

.page-item.active {
  background-color: var(--primary-light);
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.page-item:hover:not(.active) {
  background-color: #f2f3f5;
}

.mapping-recognizing-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 30;
  gap: 8px;
}

.ai-scan-anim {
  width: 56px;
  height: 56px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-scan-ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid transparent;
}

.ai-scan-ring:nth-child(1) {
  width: 56px;
  height: 56px;
  border-top-color: #722ED1;
  animation: spin 1s linear infinite;
}

.ai-scan-ring:nth-child(2) {
  width: 38px;
  height: 38px;
  border-top-color: #165DFF;
  animation: spin 0.7s linear infinite reverse;
}

.ai-scan-ring:nth-child(3) {
  width: 22px;
  height: 22px;
  border-top-color: #14C9C9;
  animation: spin 0.5s linear infinite;
}

.ai-scan-icon {
  font-size: 12px;
  color: #722ED1;
  z-index: 1;
}

.mapping-recognition-title {
  font-size: 12px;
  font-weight: 600;
  color: #722ED1;
}

.ai-dots span {
  display: inline-block;
  width: 5px;
  height: 5px;
  background: #722ED1;
  border-radius: 50%;
  margin: 0 2px;
  animation: dotBounce 1.2s infinite;
}

.ai-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.ai-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes dotBounce {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.4;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
