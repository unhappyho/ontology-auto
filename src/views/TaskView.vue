<template>
  <div class="task-view">
    <TopBar />

    <!-- 主体内容区 -->
    <div class="task-main" :class="{ 'with-copilot': copilotStore.visible }">
      <!-- 步骤内容 -->
      <div class="task-content">
        <!-- 步骤1: 本体数据采集 -->
        <div v-if="currentStep === 1" class="workspace-container active">
          <StepForm v-if="viewMode === 'form'" :key="'form'" />
          <FlowCanvas v-else :key="'canvas'" />
        </div>

        <!-- 步骤2: 实体数据提取 -->
        <div v-if="currentStep === 2" class="workspace-container active step2-workspace">
          <div class="step-page-wrap">
            <div class="step2-content">
              <OntologyTree />
              <EntityList />
            </div>
            <div class="step-page-footer">
              <div class="footer-left">
                <InfoCircleOutlined />
                步骤 2 / 5
              </div>
              <a-button @click="goToStep(1)">
                <ArrowLeftOutlined />
                上一步
              </a-button>
              <a-button type="default">
                <SaveOutlined />
                保存
              </a-button>
              <a-button type="primary" @click="goToStep(3)">
                下一步：关联构建
                <ArrowRightOutlined />
              </a-button>
            </div>
          </div>
        </div>

        <!-- 步骤3: 关联构建 -->
        <div v-if="currentStep === 3" class="workspace-container active step3-workspace">
          <div class="step-page-wrap">
            <div class="step3-content">
              <OntologyTree />
              <RelationList />
            </div>
            <div class="step-page-footer">
              <div class="footer-left">
                <InfoCircleOutlined />
                步骤 3 / 5
              </div>
              <a-button @click="goToStep(2)">
                <ArrowLeftOutlined />
                上一步
              </a-button>
              <a-button type="default">
                <SaveOutlined />
                保存
              </a-button>
              <a-button type="primary" @click="goToStep(4)">
                下一步：规则识别
                <ArrowRightOutlined />
              </a-button>
            </div>
          </div>
        </div>

        <!-- 步骤4: 规则识别 -->
        <div v-if="currentStep === 4" class="workspace-container active step4-workspace">
          <div class="step-page-wrap">
            <RuleDefinition />
            <div class="step-page-footer">
              <div class="footer-left">
                <InfoCircleOutlined />
                步骤 4 / 5
              </div>
              <a-button @click="goToStep(3)">
                <ArrowLeftOutlined />
                上一步
              </a-button>
              <a-button type="default">
                <SaveOutlined />
                保存
              </a-button>
              <a-button type="primary" @click="goToStep(5)">
                下一步：动作识别
                <ArrowRightOutlined />
              </a-button>
            </div>
          </div>
        </div>

        <!-- 步骤5: 动作识别 -->
        <div v-if="currentStep === 5" class="workspace-container active step5-workspace">
          <div class="step-page-wrap">
            <ActionDefinition />
            <div class="step-page-footer">
              <div class="footer-left">
                <InfoCircleOutlined />
                步骤 5 / 5
              </div>
              <a-button @click="goToStep(4)">
                <ArrowLeftOutlined />
                上一步
              </a-button>
              <a-button type="default">
                <SaveOutlined />
                保存
              </a-button>
              <a-button type="primary" style="background: var(--success-color); border-color: var(--success-color);" @click="handleComplete">
                <CheckOutlined />
                完成并提交
              </a-button>
            </div>
          </div>
        </div>
      </div>

      <!-- AI 助手面板（右侧并排） -->
      <AICopilotPanel v-if="copilotStore.visible" />
    </div>

    <!-- 模态框 -->
    <IdeModal />
    <SqlModal />
    <FieldModal />
    <ReextractConfirmModal />
    <ProgressModal />
    <MoveDomainModal />
    <EntityTableModal />
    <TermLinkModal />
    <FieldMappingModal />
    <RelationModal />
    <ImpactEntityList ref="impactEntityListRef" />
    <RuleEditModal ref="ruleEditModalRef" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  InfoCircleOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  SaveOutlined,
  CheckOutlined
} from '@ant-design/icons-vue'
import TopBar from '@/components/task/TopBar.vue'
import StepForm from '@/components/task/StepForm.vue'
import FlowCanvas from '@/components/canvas/FlowCanvas.vue'
import OntologyTree from '@/components/ontology/OntologyTree.vue'
import EntityList from '@/components/ontology/EntityList.vue'
import RelationList from '@/components/ontology/RelationList.vue'
import RuleDefinition from '@/components/task/RuleDefinition.vue'
import ActionDefinition from '@/components/task/ActionDefinition.vue'
import IdeModal from '@/components/modals/IdeModal.vue'
import SqlModal from '@/components/modals/SqlModal.vue'
import FieldModal from '@/components/modals/FieldModal.vue'
import ReextractConfirmModal from '@/components/modals/ReextractConfirmModal.vue'
import ProgressModal from '@/components/modals/ProgressModal.vue'
import MoveDomainModal from '@/components/modals/MoveDomainModal.vue'
import EntityTableModal from '@/components/modals/EntityTableModal.vue'
import TermLinkModal from '@/components/modals/TermLinkModal.vue'
import FieldMappingModal from '@/components/modals/FieldMappingModal.vue'
import RelationModal from '@/components/modals/RelationModal.vue'
import ImpactEntityList from '@/components/modals/ImpactEntityList.vue'
import RuleEditModal from '@/components/modals/RuleEditModal.vue'
import AICopilotPanel from '@/components/copilot/AICopilotPanel.vue'
import { useTaskStore, useUIStore, useOntologyStore, useCopilotStore } from '@/stores'

const router = useRouter()
const taskStore = useTaskStore()
const uiStore = useUIStore()
const ontologyStore = useOntologyStore()
const copilotStore = useCopilotStore()

// Modal refs
const impactEntityListRef = ref()
const ruleEditModalRef = ref()

const currentStep = computed(() => taskStore.currentStepId)
const viewMode = computed(() => uiStore.viewMode)

function goToStep(stepId: number) {
  taskStore.switchStep(stepId)
}

function handleComplete() {
  router.push('/')
}

// 当切换到步骤2时，触发 AI 识别动画（显示进度弹窗）
watch(currentStep, (newStep) => {
  if (newStep === 2) {
    // 检查是否需要显示识别动画
    // 首次进入显示动画，切换数据库后显示重新抽取动画，返回时不显示
    const needAnimation = !taskStore.step2FirstLoaded ||
      (taskStore.lastSelectedOntology && taskStore.lastSelectedOntology !== ontologyStore.currentOntologyId)

    if (needAnimation) {
      // 打开进度弹窗
      const isReextract = taskStore.step2FirstLoaded && taskStore.lastSelectedOntology !== ontologyStore.currentOntologyId
      uiStore.openReextractProgressModal(isReextract)

      // 如果是切换数据库，触发动画效果
      if (taskStore.step2FirstLoaded && taskStore.lastSelectedOntology !== ontologyStore.currentOntologyId) {
        ontologyStore.triggerReextractAnimation()
      }

      // 标记步骤2已首次加载
      taskStore.markStep2FirstLoaded()
    }

    // 更新当前选择的本体
    taskStore.setLastSelectedOntology(ontologyStore.currentOntologyId)
  }
})

onMounted(() => {
  // 初始化设置
  document.documentElement.style.setProperty('--active-step-color', `var(--color-step${currentStep.value})`)

  // 监听显示影响企业列表事件
  window.addEventListener('show-impact-entity-list', () => {
    if (impactEntityListRef.value) {
      impactEntityListRef.value.open()
    }
  })

  // 监听编辑规则事件
  window.addEventListener('edit-rule', (event: Event) => {
    const customEvent = event as CustomEvent
    if (ruleEditModalRef.value) {
      ruleEditModalRef.value.open(customEvent.detail)
    }
  })
})

watch(currentStep, (newStep) => {
  document.documentElement.style.setProperty('--active-step-color', `var(--color-step${newStep})`)
})
</script>

<style scoped>
.task-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg-body);
}

/* 任务主体布局 - 包含内容和 AI 面板 */
.task-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.task-main.with-copilot .task-content {
  flex: 1;
  min-width: 0;
}

.task-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.workspace-container {
  display: none;
  flex: 1;
  overflow: hidden;
  position: relative;
  min-height: 0;
}

.workspace-container.active {
  display: flex;
}

.step2-workspace {
  flex-direction: column;
}

.step3-workspace {
  flex-direction: column;
}

.step4-workspace,
.step5-workspace {
  flex-direction: column;
}

.step4-workspace .step-page-wrap > :deep(.rule-definition),
.step4-workspace .step-page-wrap > :deep(.action-definition),
.step5-workspace .step-page-wrap > :deep(.rule-definition),
.step5-workspace .step-page-wrap > :deep(.action-definition) {
  flex: 1;
  min-height: 0;
}

.step-page-wrap {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.step2-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}

.step3-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}

.step-page-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 0;
}

.step-page-footer {
  flex-shrink: 0;
  background: var(--bg-white);
  border-top: 1px solid var(--border-color);
  padding: 12px 24px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
}

.footer-left {
  margin-right: auto;
  font-size: 13px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-placeholder {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  gap: 14px;
  color: var(--text-secondary);
}

.placeholder-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-regular);
}

.placeholder-desc {
  font-size: 13px;
}
</style>
