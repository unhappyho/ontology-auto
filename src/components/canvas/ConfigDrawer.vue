<template>
  <div :class="['config-drawer', { open: true }]">
    <div class="drawer-header">
      <span>算子配置</span>
      <CloseOutlined class="close-drawer" @click="$emit('close')" />
    </div>
    <div class="drawer-body">
      <div class="form-group">
        <label>节点名称</label>
        <input class="form-input" :value="nodeName" readonly style="background: #f7f8fa;" />
      </div>
      <div class="form-group">
        <label>算子类型</label>
        <input class="form-input" :value="nodeType" readonly style="background: #f7f8fa;" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CloseOutlined } from '@ant-design/icons-vue'
import { useCanvasStore } from '@/stores'
import { OPERATORS } from '@/constants'

interface Props {
  nodeId: string
}

const props = defineProps<Props>()

defineEmits<{
  close: []
}>()

const canvasStore = useCanvasStore()

const node = computed(() => canvasStore.nodes.find(n => n.id === props.nodeId))

const nodeName = computed(() => node.value?.name || '')

const nodeType = computed(() => {
  if (!node.value) return ''
  const operator = OPERATORS.find(op => op.type === node.value?.type)
  return operator?.name || ''
})
</script>

<style scoped>
.config-drawer {
  position: absolute;
  top: 0;
  right: -300px;
  width: 300px;
  height: 100%;
  background: var(--bg-white);
  border-left: 1px solid var(--border-color);
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.05);
  z-index: 20;
  transition: right 0.3s;
  display: flex;
  flex-direction: column;
}

.config-drawer.open {
  right: 0;
}

.drawer-header {
  padding: 14px 18px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 14px;
}

.close-drawer {
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 15px;
}

.close-drawer:hover {
  color: var(--danger-color);
}

.drawer-body {
  padding: 18px;
  flex: 1;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 14px;
}

.form-group label {
  display: block;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.form-input {
  width: 100%;
  padding: 7px 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 13px;
  outline: none;
}
</style>
