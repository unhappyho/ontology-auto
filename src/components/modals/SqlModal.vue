<template>
  <a-modal
    v-model:open="visible"
    :title="'数据过滤条件配置'"
    :width="500"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 10px;">
      目标表：<b style="color: var(--primary-color);">{{ tableName }}</b>
    </p>
    <textarea
      v-model="sqlContent"
      class="sql-editor-box"
      spellcheck="false"
    ></textarea>
    <template #footer>
      <a-button style="margin-right: auto; color: var(--primary-color); border: none;">
        <PlayCircleOutlined />
        运行校验
      </a-button>
      <a-button @click="handleCancel">取消</a-button>
      <a-button type="primary" @click="handleOk">保存</a-button>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { PlayCircleOutlined } from '@ant-design/icons-vue'
import { useUIStore } from '@/stores'

const uiStore = useUIStore()

const visible = computed(() => uiStore.sqlModalVisible)
const tableName = computed(() => uiStore.sqlTableName)

const sqlContent = ref('')

watch(visible, (val) => {
  if (val && tableName.value) {
    sqlContent.value = `SELECT *\nFROM ${tableName.value}\nWHERE status = 'ACTIVE'\nLIMIT 500;`
  }
})

function handleCancel() {
  uiStore.closeSqlModal()
}

function handleOk() {
  uiStore.closeSqlModal()
}
</script>

<style scoped>
.sql-editor-box {
  background: #1E1E1E;
  color: #D4D4D4;
  padding: 14px;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  height: 180px;
  border: none;
  width: 100%;
  resize: none;
  outline: none;
  line-height: 1.5;
}
</style>
