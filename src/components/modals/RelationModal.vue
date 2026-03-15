<template>
  <a-modal
    v-model:open="visible"
    :title="isEdit ? '编辑关联' : '添加关联'"
    @ok="handleSubmit"
    @cancel="handleCancel"
    :width="520"
  >
    <a-form
      :model="formState"
      layout="vertical"
      class="relation-form"
    >
      <a-form-item label="源实体" required>
        <a-select
          v-model:value="formState.sourceEntityId"
          placeholder="选择源实体"
          @change="handleSourceChange"
        >
          <a-select-option v-for="entity in entities" :key="entity.id" :value="entity.id">
            {{ entity.nameCn || entity.name }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="关系名称" required>
        <a-input-group compact>
          <a-input
            v-model:value="formState.relationName"
            placeholder="英文名"
            style="width: 40%"
          />
          <a-input
            v-model:value="formState.relationNameCn"
            placeholder="中文名"
            style="width: 60%"
          />
        </a-input-group>
      </a-form-item>

      <a-form-item label="目标实体" required>
        <a-select
          v-model:value="formState.targetEntityId"
          placeholder="选择目标实体"
        >
          <a-select-option v-for="entity in entities" :key="entity.id" :value="entity.id">
            {{ entity.nameCn || entity.name }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="关系类型">
            <a-select v-model:value="formState.relationType" placeholder="选择关系类型">
              <a-select-option value="1:1">一对一 (1:1)</a-select-option>
              <a-select-option value="1:N">一对多 (1:N)</a-select-option>
              <a-select-option value="N:N">多对多 (N:N)</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="必填">
            <a-switch v-model:checked="formState.isRequired" />
            <span class="switch-hint">是否为必填关系</span>
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item label="术语关联（可选）" v-if="!isEdit">
        <a-select
          v-model:value="formState.termId"
          placeholder="选择关联术语"
          allowClear
          @change="handleTermChange"
        >
          <a-select-option v-for="term in relationTerms" :key="term.id" :value="term.id">
            {{ term.name }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="新发现">
        <a-switch v-model:checked="formState.isNew" />
        <span class="switch-hint">标记为新发现的关联关系</span>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useUIStore, useOntologyStore } from '@/stores'
import type { Entity } from '@/types'

const uiStore = useUIStore()
const ontologyStore = useOntologyStore()

const visible = computed(() => uiStore.relationModalVisible)
const modalData = computed(() => uiStore.relationModalData)

const isEdit = computed(() => modalData.value?.mode === 'edit')

interface FormState {
  sourceEntityId: string
  sourceEntityName: string
  targetEntityId: string
  targetEntityName: string
  relationName: string
  relationNameCn: string
  relationType?: '1:1' | '1:N' | 'N:N'
  isRequired?: boolean
  termId?: string
  termName?: string
  isNew: boolean
}

const formState = ref<FormState>({
  sourceEntityId: '',
  sourceEntityName: '',
  targetEntityId: '',
  targetEntityName: '',
  relationName: '',
  relationNameCn: '',
  relationType: undefined,
  isRequired: undefined,
  termId: undefined,
  termName: undefined,
  isNew: false
})

const entities = computed<Entity[]>(() => ontologyStore.currentEntities)
const category = computed(() => ontologyStore.relationCategory)

// 预定义的关系术语
const relationTerms = computed(() => {
  const categoryValue = category.value
  if (categoryValue === 'event') {
    return [
      { id: 'term_201', name: '购买' },
      { id: 'term_202', name: '点击' },
      { id: 'term_203', name: '浏览' },
      { id: 'term_204', name: '收藏' },
      { id: 'term_205', name: '分享' },
      { id: 'term_206', name: '评论' }
    ]
  }
  return [
    { id: 'term_101', name: '归属关系' },
    { id: 'term_102', name: '关联关系' },
    { id: 'term_103', name: '包含关系' },
    { id: 'term_104', name: '依赖关系' },
    { id: 'term_105', name: '引用关系' },
    { id: 'term_106', name: '拥有关系' },
    { id: 'term_107', name: '属于关系' }
  ]
})

watch(visible, (val) => {
  if (val && modalData.value) {
    formState.value = {
      sourceEntityId: modalData.value.sourceEntityId,
      sourceEntityName: modalData.value.sourceEntityName,
      targetEntityId: modalData.value.targetEntityId,
      targetEntityName: modalData.value.targetEntityName,
      relationName: modalData.value.relationName,
      relationNameCn: modalData.value.relationNameCn,
      relationType: modalData.value.relationType,
      isRequired: modalData.value.isRequired,
      termId: modalData.value.termId,
      termName: modalData.value.termName,
      isNew: false
    }
  }
})

function handleSourceChange(value: string) {
  const entity = entities.value.find(e => e.id === value)
  if (entity) {
    formState.value.sourceEntityName = entity.nameCn || entity.name
  }
}

function handleTermChange(value: string) {
  const term = relationTerms.value.find(t => t.id === value)
  if (term) {
    formState.value.termName = term.name
  } else {
    formState.value.termName = undefined
  }
}

function handleSubmit() {
  const entity = entities.value.find(e => e.id === formState.value.targetEntityId)
  if (entity) {
    formState.value.targetEntityName = entity.nameCn || entity.name
  }

  if (isEdit.value && modalData.value?.id) {
    // 编辑模式
    ontologyStore.updateRelation(modalData.value.id, {
      sourceEntityId: formState.value.sourceEntityId,
      sourceEntityName: formState.value.sourceEntityName,
      targetEntityId: formState.value.targetEntityId,
      targetEntityName: formState.value.targetEntityName,
      relationName: formState.value.relationName,
      relationNameCn: formState.value.relationNameCn,
      relationType: formState.value.relationType,
      isRequired: formState.value.isRequired,
      termId: formState.value.termId,
      termName: formState.value.termName,
      isNew: formState.value.isNew
    })
  } else {
    // 添加模式
    ontologyStore.addRelation({
      relationCategory: category.value,
      sourceEntityId: formState.value.sourceEntityId,
      sourceEntityName: formState.value.sourceEntityName,
      targetEntityId: formState.value.targetEntityId,
      targetEntityName: formState.value.targetEntityName,
      relationName: formState.value.relationName,
      relationNameCn: formState.value.relationNameCn,
      relationType: formState.value.relationType,
      isRequired: formState.value.isRequired,
      termId: formState.value.termId,
      termName: formState.value.termName,
      isNew: formState.value.isNew
    })
  }

  handleCancel()
}

function handleCancel() {
  uiStore.closeRelationModal()
}
</script>

<style scoped>
.relation-form {
  padding: 10px 0;
}

.switch-hint {
  margin-left: 10px;
  font-size: 12px;
  color: var(--text-secondary);
}
</style>
