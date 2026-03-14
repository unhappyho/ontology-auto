<template>
  <a-modal
    v-model:open="visible"
    title="预计影响的企业列表"
    :width="600"
    :footer="null"
  >
    <div class="impact-list">
      <a-table
        :columns="columns"
        :data-source="entities"
        :pagination="{ pageSize: 10 }"
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <span class="entity-name">{{ record.name }}</span>
          </template>
          <template v-else-if="column.key === 'type'">
            <a-tag :color="record.color">{{ record.type }}</a-tag>
          </template>
        </template>
      </a-table>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)

const columns = [
  { title: '企业名称', dataIndex: 'name', key: 'name' },
  { title: '类型', dataIndex: 'type', key: 'type' },
  { title: '注册资本', dataIndex: 'capital', key: 'capital' }
]

// 模拟数据
const entities = ref([
  { key: '1', name: 'xx科技有限公司', type: '企业', capital: '500万元', color: '#00B42A' },
  { key: '2', name: 'xx贸易有限公司', type: '企业', capital: '100万元', color: '#00B42A' },
  { key: '3', name: 'xx信息咨询有限公司', type: '企业', capital: '80万元', color: '#00B42A' },
  { key: '4', name: 'xx企业管理中心', type: '企业', capital: '60万元', color: '#00B42A' },
  { key: '5', name: 'xx投资合伙企业', type: '企业', capital: '200万元', color: '#00B42A' }
])

function open() {
  visible.value = true
}

function close() {
  visible.value = false
}

defineExpose({ open, close })
</script>

<style scoped>
.impact-list {
  max-height: 400px;
  overflow-y: auto;
}

.entity-name {
  font-weight: 500;
}
</style>
