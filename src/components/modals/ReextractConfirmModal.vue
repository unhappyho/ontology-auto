<template>
  <a-modal
    v-model:open="visible"
    :closable="false"
    :footer="null"
    :width="440"
    @cancel="handleCancel"
  >
    <div class="confirm-header">
      <div class="confirm-icon">
        <ReloadOutlined />
      </div>
      <h3>确认重新识别实体？</h3>
    </div>
    <p class="confirm-desc">
      将按当前<strong>采集范围配置</strong>重新抽取实体，此操作将<strong class="danger">清除当前已识别的全部实体数据</strong>。
    </p>
    <div class="confirm-footer">
      <a-button @click="handleCancel">取消</a-button>
      <a-button type="primary" danger @click="handleConfirm">
        <ReloadOutlined />
        确认重新识别
      </a-button>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ReloadOutlined } from '@ant-design/icons-vue'
import { useUIStore } from '@/stores'

const uiStore = useUIStore()

const visible = computed(() => uiStore.reextractConfirmModalVisible)

function handleCancel() {
  uiStore.closeReextractConfirmModal()
}

function handleConfirm() {
  uiStore.closeReextractConfirmModal()
  // 重新识别
  uiStore.openReextractProgressModal(true)
}
</script>

<style scoped>
.confirm-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.confirm-icon {
  width: 40px;
  height: 40px;
  background: #FFF7E6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 17px;
  color: var(--warning-color);
}

.confirm-header h3 {
  margin: 0;
  font-size: 15px;
}

.confirm-desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.8;
}

.confirm-desc strong {
  color: var(--text-main);
}

.confirm-desc strong.danger {
  color: var(--danger-color);
}

.confirm-footer {
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
