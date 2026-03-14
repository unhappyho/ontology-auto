<template>
  <a-modal
    v-model:open="visible"
    :closable="false"
    :footer="null"
    :width="460"
    :maskClosable="false"
    @cancel="handleDismiss"
  >
    <div class="progress-header-row">
      <div class="progress-icon">
        <SettingOutlined :spin="!isComplete" />
      </div>
      <div>
        <div class="progress-title">{{ isReextract ? '实体重新识别中' : '实体识别中' }}</div>
        <div class="progress-subtitle">过程较长，可退出等待后台继续执行</div>
      </div>
    </div>

    <div class="progress-section">
      <div class="progress-header">
        <span class="progress-label">{{ progressLabel }}</span>
        <span class="progress-percent">{{ progressPercent }}%</span>
      </div>
      <div class="progress-bar-track">
        <div class="progress-bar-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
      <div class="progress-stage">
        <component :is="isComplete ? CheckCircleOutlined : LoadingOutlined" :spin="!isComplete" />
        <span>{{ progressStage }}</span>
      </div>
    </div>

    <div class="progress-hint">
      <InfoCircleOutlined style="color: var(--primary-color); margin-top: 1px; flex-shrink: 0;" />
      <div>识别任务将在后台持续运行，您可先关闭此窗口，完成后系统自动刷新结果。</div>
    </div>

    <div class="progress-footer">
      <a-button @click="handleDismiss">
        <ExportOutlined />
        退出等待，后台运行
      </a-button>
      <a-button v-if="isComplete" type="primary" @click="handleClose">
        <CheckOutlined />
        识别完成，查看结果
      </a-button>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import {
  SettingOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  InfoCircleOutlined,
  ExportOutlined,
  CheckOutlined
} from '@ant-design/icons-vue'
import { useUIStore, useOntologyStore } from '@/stores'

const uiStore = useUIStore()
const ontologyStore = useOntologyStore()

const visible = computed(() => uiStore.reextractProgressModalVisible)
const isReextract = computed(() => uiStore.isReextract)

const progressPercent = ref(0)
const progressLabel = ref('初始化...')
const progressStage = ref('初始化识别任务...')
const isComplete = ref(false)

const stages = [
  { pct: 15, label: '扫描数据表结构...', stage: '扫描 8 张数据表...' },
  { pct: 30, label: '解析字段类型...', stage: '分析字段语义特征...' },
  { pct: 50, label: '大模型推断中...', stage: '调用 DeepSeek R1.0...' },
  { pct: 68, label: '实体去重...', stage: '与知识库比对...' },
  { pct: 82, label: '生成映射...', stage: '构建字段属性关联...' },
  { pct: 95, label: '最终验证...', stage: '校验识别结果...' },
  { pct: 100, label: '识别完成！', stage: '共识别 5 个实体，3 新发现' }
]

let timer: ReturnType<typeof setInterval> | null = null
let stageIndex = 0

watch(visible, (val) => {
  if (val) {
    startProgress()
  } else {
    stopProgress()
  }
})

function startProgress() {
  stageIndex = 0
  isComplete.value = false
  progressPercent.value = 0
  progressLabel.value = '初始化...'
  progressStage.value = '初始化识别任务...'

  ontologyStore.startRecognition()

  timer = setInterval(() => {
    if (stageIndex >= stages.length) {
      stopProgress()
      isComplete.value = true
      ontologyStore.stopRecognition()
      return
    }
    const stage = stages[stageIndex]
    progressPercent.value = stage.pct
    progressLabel.value = stage.label
    progressStage.value = stage.stage
    stageIndex++
  }, 900)
}

function stopProgress() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function handleDismiss() {
  uiStore.closeReextractProgressModal()
}

function handleClose() {
  uiStore.closeReextractProgressModal()
}

onUnmounted(() => {
  stopProgress()
})
</script>

<style scoped>
.progress-header-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.progress-icon {
  width: 40px;
  height: 40px;
  background: #F0F5FF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 17px;
  color: var(--primary-color);
}

.progress-title {
  font-size: 14px;
  font-weight: 600;
}

.progress-subtitle {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.progress-section {
  margin-top: 14px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 13px;
}

.progress-label {
  color: var(--text-regular);
  font-weight: 500;
}

.progress-percent {
  color: var(--primary-color);
  font-weight: 600;
}

.progress-bar-track {
  width: 100%;
  height: 7px;
  background: #F2F3F5;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, #165DFF, #722ED1);
  transition: width 0.4s ease;
}

.progress-stage {
  margin-top: 7px;
  font-size: 12px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 5px;
}

.progress-hint {
  margin-top: 12px;
  padding: 9px 12px;
  background: #F0F5FF;
  border-radius: 6px;
  font-size: 12px;
  color: var(--text-regular);
  display: flex;
  align-items: flex-start;
  gap: 7px;
}

.progress-footer {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
