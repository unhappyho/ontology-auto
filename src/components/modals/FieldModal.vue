<template>
  <a-modal
    v-model:open="visible"
    :title="'字段元数据预览'"
    :width="580"
    :footer="null"
    @cancel="handleClose"
  >
    <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px;">
      目标表：<b>{{ tableName }}</b>
    </p>
    <div class="field-table-wrapper">
      <a-table
        :columns="columns"
        :data-source="fieldData"
        :pagination="false"
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'isPk'">
            <KeyOutlined v-if="record.isPk" style="color: #FA8C16;" />
            <span v-else>否</span>
          </template>
        </template>
      </a-table>
    </div>
    <template #footer>
      <a-button type="primary" @click="handleClose">关闭</a-button>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { KeyOutlined } from '@ant-design/icons-vue'
import { useUIStore } from '@/stores'

const uiStore = useUIStore()

const visible = computed(() => uiStore.fieldModalVisible)
const tableName = computed(() => uiStore.fieldTableName)

const columns = [
  { title: '字段物理名', dataIndex: 'name', key: 'name', width: '35%' },
  { title: '数据类型', dataIndex: 'type', key: 'type', width: '20%' },
  { title: '主键', dataIndex: 'isPk', key: 'isPk', width: '15%' },
  { title: '字段说明', dataIndex: 'comment', key: 'comment' }
]

const fieldData = [
  { name: 'user_id', type: 'VARCHAR(32)', isPk: true, comment: '用户唯一标识' },
  { name: 'user_name', type: 'VARCHAR(64)', isPk: false, comment: '用户真实姓名' },
  { name: 'phone_number', type: 'VARCHAR(20)', isPk: false, comment: '联系手机号(脱敏)' },
  { name: 'status', type: 'INT(2)', isPk: false, comment: '状态 1:正常 0:注销' },
  { name: 'create_time', type: 'DATETIME', isPk: false, comment: '记录创建时间' }
]

function handleClose() {
  uiStore.closeFieldModal()
}
</script>

<style scoped>
.field-table-wrapper {
  max-height: 280px;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}
</style>
