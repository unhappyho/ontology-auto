<template>
  <div class="stepper-nav">
    <div
      v-for="step in steps"
      :key="step.id"
      :class="['step-pill', { active: step.id === currentStep, done: step.id < currentStep }]"
      @click="handleStepClick(step.id)"
    >
      <div class="step-num">
        <CheckOutlined v-if="step.id < currentStep" style="font-size: 9px;" />
        <span v-else>{{ step.id }}</span>
      </div>
      {{ step.name }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CheckOutlined } from '@ant-design/icons-vue'
import { STEPS } from '@/constants'
import { useTaskStore } from '@/stores'

const taskStore = useTaskStore()

const steps = STEPS
const currentStep = computed(() => taskStore.currentStepId)

function handleStepClick(stepId: number) {
  taskStore.switchStep(stepId)
}
</script>

<style scoped>
.stepper-nav {
  display: flex;
  align-items: center;
  gap: 2px;
  background: var(--bg-body);
  padding: 3px 6px;
  border-radius: 20px;
}

.step-pill {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: var(--text-regular);
  padding: 4px 10px 4px 4px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.step-pill:hover {
  background: #E5E6EB;
}

.step-num {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--border-color);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  flex-shrink: 0;
}

.step-pill.active {
  background: var(--bg-white);
  color: var(--active-step-color);
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
}

.step-pill.active .step-num {
  background: var(--active-step-color);
}

.step-pill.done .step-num {
  background: var(--success-color);
}
</style>
