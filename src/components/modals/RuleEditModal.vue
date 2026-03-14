<template>
  <a-modal
    v-model:open="visible"
    title="编辑规则"
    :width="600"
    @ok="handleSave"
    @cancel="handleClose"
  >
    <div class="edit-form">
      <div class="form-item">
        <label>规则名称</label>
        <a-input v-model:value="editData.name" placeholder="请输入规则名称" />
      </div>

      <div class="form-item">
        <label>条件 (当)</label>
        <a-input v-model:value="editData.condition" placeholder="请输入条件" />
      </div>

      <div class="form-item">
        <label>结果 (则)</label>
        <a-input v-model:value="editData.result" placeholder="请输入结果" />
      </div>

      <div class="form-item">
        <label>预计影响</label>
        <a-input v-model:value="editData.impact" placeholder="如: 8 个企业" />
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface RuleData {
  name: string
  condition: string
  result: string
  impact: string
}

const visible = ref(false)
const editData = ref<RuleData>({
  name: '',
  condition: '',
  result: '',
  impact: ''
})

let currentRule: any = null

function open(rule: any) {
  currentRule = rule
  editData.value = {
    name: rule.name,
    condition: rule.condition,
    result: rule.result,
    impact: rule.impact
  }
  visible.value = true
}

function handleClose() {
  visible.value = false
  currentRule = null
}

function handleSave() {
  if (currentRule) {
    currentRule.name = editData.value.name
    currentRule.condition = editData.value.condition
    currentRule.result = editData.value.result
    currentRule.impact = editData.value.impact
  }
  handleClose()
}

defineExpose({ open })
</script>

<style scoped>
.edit-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-item label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-main);
}
</style>
