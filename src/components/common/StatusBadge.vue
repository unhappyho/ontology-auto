<template>
  <span :class="['status-badge', statusClass]">
    <component :is="iconComponent" v-if="iconComponent" :spin="spinning" />
    <slot>{{ text }}</slot>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  CheckCircleOutlined,
  SyncOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined as WaveSquareOutlined
} from '@ant-design/icons-vue'

interface Props {
  status: 'success' | 'processing' | 'error' | 'pending' | 'listening'
  text?: string
}

const props = defineProps<Props>()

const statusClass = computed(() => props.status)

const spinning = computed(() => props.status === 'processing')

const iconComponent = computed(() => {
  switch (props.status) {
    case 'success':
      return CheckCircleOutlined
    case 'processing':
      return SyncOutlined
    case 'error':
      return ExclamationCircleOutlined
    case 'pending':
      return ClockCircleOutlined
    case 'listening':
      return WaveSquareOutlined
    default:
      return null
  }
})
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  background-color: #F2F3F5;
  color: var(--text-regular);
}

.status-badge.success {
  background-color: #E8FFEA;
  color: var(--success-color);
}

.status-badge.processing {
  background-color: var(--primary-light);
  color: var(--primary-color);
}

.status-badge.error {
  background-color: #FFECE8;
  color: var(--danger-color);
}

.status-badge.pending {
  background-color: #F2F3F5;
  color: var(--text-secondary);
}

.status-badge.listening {
  background-color: #E8FFEA;
  color: var(--success-color);
}
</style>
